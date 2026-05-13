import { and, eq, isNull } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  const account = await db.query.userModel.findFirst({
    where: and(eq(userModel.id, id), isNull(userModel.deletedAt)),
  });

  if (!account) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.accountNotFound,
    });
  }

  return {
    id: account.id,
    email: account.email,
    plan: account.plan,
    planStartedAt: account.planStartedAt
      ? account.planStartedAt.toISOString()
      : null,
    planEndsAt: account.planEndsAt ? account.planEndsAt.toISOString() : null,
    emailConfirmedAt: account.emailConfirmedAt
      ? account.emailConfirmedAt.toISOString()
      : null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
});
