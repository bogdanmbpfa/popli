import { eq } from 'drizzle-orm';

import { EPlanType, EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';
import { getStripeClient } from '~~/server/utils/stripe';

export default defineEventHandler(async (event) => {
  const {
    stripe,
    public: { errorMessages, siteUrl },
  } = useRuntimeConfig();
  const { id: userId, email } = await isAuthenticated(event);

  if (!stripe.proPriceId || !siteUrl) {
    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.billingNotConfigured,
    });
  }

  const stripeClient = getStripeClient();

  if (!stripeClient) {
    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.billingNotConfigured,
    });
  }

  const user = await db.query.userModel.findFirst({
    where: eq(userModel.id, userId),
  });

  if (!user) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.accountNotFound,
    });
  }

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripeClient.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    stripeCustomerId = customer.id;

    await db
      .update(userModel)
      .set({
        stripeCustomerId,
      })
      .where(eq(userModel.id, userId));
  }

  const session = await stripeClient.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [
      {
        price: stripe.proPriceId,
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/account/settings?billing=success`,
    cancel_url: `${siteUrl}/account/settings?billing=cancel`,
    metadata: {
      userId,
      requestedPlan: EPlanType.PRO,
    },
    subscription_data: {
      metadata: {
        userId,
        requestedPlan: EPlanType.PRO,
      },
    },
    allow_promotion_codes: true,
  });

  return { url: session.url! };
});
