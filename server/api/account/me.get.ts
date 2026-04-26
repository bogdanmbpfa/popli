import { eq } from 'drizzle-orm';

import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { public: { errorMessages } } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  const account = await db.query.userModel.findFirst({
    where: eq(userModel.id, id),
  });

  if (!account) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.accountNotFound,
    });
  }

  return {
    id: account.id,
    email: account.email,
    emailConfirmedAt: account.emailConfirmedAt
      ? account.emailConfirmedAt.toISOString()
      : null,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
});
