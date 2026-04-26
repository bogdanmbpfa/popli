import { and, eq } from 'drizzle-orm';

import { db, shortUrlClickModel, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const shortUrlId = getRouterParam(event, 'id');

  if (!shortUrlId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const shortUrl = await db.query.shortUrlModel.findFirst({
    where: and(
      eq(shortUrlModel.id, shortUrlId),
      eq(shortUrlModel.userId, userId),
    ),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.shortUrlNotFound,
    });
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(shortUrlClickModel)
      .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id));

    await tx.delete(shortUrlModel).where(eq(shortUrlModel.id, shortUrlId));
  });
});
