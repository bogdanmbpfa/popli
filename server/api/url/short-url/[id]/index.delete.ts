import { and, eq, isNull } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, shortUrlClickModel, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const shortUrlId = getRouterParam(event, 'id');

  if (!shortUrlId) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const shortUrl = await db.query.shortUrlModel.findFirst({
    where: and(
      eq(shortUrlModel.id, shortUrlId),
      eq(shortUrlModel.userId, userId),
      isNull(shortUrlModel.deletedAt),
    ),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.shortUrlNotFound,
    });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(shortUrlClickModel)
      .set({ deletedAt: new Date() })
      .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id));

    await tx
      .update(shortUrlModel)
      .set({ deletedAt: new Date() })
      .where(eq(shortUrlModel.id, shortUrlId));
  });
});
