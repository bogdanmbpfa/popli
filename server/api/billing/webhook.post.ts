import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

import { EHttpStatusCode, EHttpStatusMessage, EPlanType } from '~~/enums';
import {
  billingTransactionModel,
  billingWebhookEventModel,
  db,
  userModel,
} from '~~/server/database';
import { getStripeClient } from '~~/server/utils/stripe';

const toDate = (value?: number | null) => {
  if (!value) {
    return null;
  }

  return new Date(value * 1000);
};

const getInvoiceSubscriptionId = (invoice: Stripe.Invoice) => {
  const subscriptionDetails = invoice.parent?.subscription_details as
    | { subscription?: string | null }
    | undefined;

  return subscriptionDetails?.subscription ?? null;
};

const getSubscriptionPeriodFromInvoice = (invoice: Stripe.Invoice) => {
  const period = invoice.lines.data[0]?.period;

  return {
    start: toDate(period?.start),
    end: toDate(period?.end),
  };
};

const resolveUserId = async (
  stripeCustomerId: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  metadata?: Stripe.Metadata | null,
) => {
  const metadataUserId = metadata?.userId;

  if (metadataUserId) {
    return metadataUserId;
  }

  const customerId =
    typeof stripeCustomerId === 'string'
      ? stripeCustomerId
      : stripeCustomerId?.id;

  if (!customerId) {
    return null;
  }

  const user = await db.query.userModel.findFirst({
    where: eq(userModel.stripeCustomerId, customerId),
  });

  return user?.id ?? null;
};

export default defineEventHandler(async (event) => {
  const {
    stripe,
    public: { errorMessages },
  } = useRuntimeConfig();
  const stripeClient = getStripeClient();

  if (!stripeClient || !stripe.webhookSecret) {
    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.billingNotConfigured,
    });
  }

  const signature = getRequestHeader(event, 'stripe-signature');
  const payload = await readRawBody(event);

  if (!signature || !payload) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      stripe.webhookSecret,
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  await db.transaction(async (tx) => {
    const dedupeInsert = await tx
      .insert(billingWebhookEventModel)
      .values({
        stripeEventId: stripeEvent.id,
        eventType: stripeEvent.type,
        payload,
      })
      .onConflictDoNothing({
        target: [billingWebhookEventModel.stripeEventId],
      })
      .returning({ id: billingWebhookEventModel.id });

    if (!dedupeInsert.length) {
      return;
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const userId = await resolveUserId(session.customer, session.metadata);
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : null;
      const subscription = subscriptionId
        ? await stripeClient.subscriptions.retrieve(subscriptionId)
        : null;
      const subscriptionItem = subscription?.items.data[0];

      if (!userId) {
        return;
      }

      await tx
        .update(userModel)
        .set({
          plan: EPlanType.PRO,
          stripeCustomerId:
            typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId: subscriptionId,
          planStartedAt:
            toDate(subscriptionItem?.current_period_start) || new Date(),
          planEndsAt: toDate(subscriptionItem?.current_period_end),
        })
        .where(eq(userModel.id, userId));
    }

    if (stripeEvent.type === 'invoice.paid') {
      const invoice = stripeEvent.data.object as Stripe.Invoice;
      const userId = await resolveUserId(
        invoice.customer,
        invoice.parent?.subscription_details?.metadata,
      );
      const period = getSubscriptionPeriodFromInvoice(invoice);
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (!userId) {
        return;
      }

      await tx
        .insert(billingTransactionModel)
        .values({
          userId,
          stripeEventId: stripeEvent.id,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: subscriptionId,
          status: invoice.status || 'paid',
          currency: invoice.currency || 'eur',
          amount: invoice.amount_paid,
          periodStart: period.start,
          periodEnd: period.end,
          paidAt: toDate(invoice.status_transitions.paid_at) || new Date(),
        })
        .onConflictDoNothing({
          target: [billingTransactionModel.stripeInvoiceId],
        });

      await tx
        .update(userModel)
        .set({
          plan: EPlanType.PRO,
          stripeSubscriptionId: subscriptionId,
          planStartedAt: period.start || new Date(),
          planEndsAt: period.end,
        })
        .where(eq(userModel.id, userId));
    }

    if (stripeEvent.type === 'invoice.payment_failed') {
      const invoice = stripeEvent.data.object as Stripe.Invoice;
      const userId = await resolveUserId(
        invoice.customer,
        invoice.parent?.subscription_details?.metadata,
      );
      const period = getSubscriptionPeriodFromInvoice(invoice);
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (!userId) {
        return;
      }

      await tx
        .insert(billingTransactionModel)
        .values({
          userId,
          stripeEventId: stripeEvent.id,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: subscriptionId,
          status: invoice.status || 'payment_failed',
          currency: invoice.currency || 'eur',
          amount: invoice.amount_due,
          periodStart: period.start,
          periodEnd: period.end,
          paidAt: null,
        })
        .onConflictDoNothing({
          target: [billingTransactionModel.stripeInvoiceId],
        });
    }

    if (stripeEvent.type === 'customer.subscription.updated') {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      const userId = await resolveUserId(
        subscription.customer,
        subscription.metadata,
      );
      const subscriptionItem = subscription.items.data[0];

      if (!userId) {
        return;
      }

      await tx
        .update(userModel)
        .set({
          plan:
            subscription.status === 'active' ? EPlanType.PRO : EPlanType.FREE,
          stripeCustomerId:
            typeof subscription.customer === 'string'
              ? subscription.customer
              : null,
          stripeSubscriptionId: subscription.id,
          planStartedAt:
            toDate(subscriptionItem?.current_period_start) || new Date(),
          planEndsAt:
            subscription.status === 'active'
              ? toDate(subscriptionItem?.current_period_end)
              : new Date(),
        })
        .where(eq(userModel.id, userId));
    }

    if (stripeEvent.type === 'customer.subscription.deleted') {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      const userId = await resolveUserId(
        subscription.customer,
        subscription.metadata,
      );

      if (!userId) {
        return;
      }

      await tx
        .update(userModel)
        .set({
          plan: EPlanType.FREE,
          stripeSubscriptionId: null,
          planStartedAt: null,
          planEndsAt: null,
        })
        .where(eq(userModel.id, userId));
    }
  });

  return { received: true };
});
