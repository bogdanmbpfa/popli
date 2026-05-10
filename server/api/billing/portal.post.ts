import { eq } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';
import { getStripeClient } from '~~/server/utils/stripe';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages, siteUrl },
  } = useRuntimeConfig();
  const { id: userId, email } = await isAuthenticated(event);

  const stripeClient = getStripeClient();

  if (!stripeClient || !siteUrl) {
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

  const session = await stripeClient.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${siteUrl}/account/settings`,
  });

  return { url: session.url };
});
