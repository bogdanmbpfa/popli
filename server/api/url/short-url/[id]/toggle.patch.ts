import { and, eq } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, shortUrlModel } from '~~/server/database';

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
    ),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.shortUrlNotFound,
    });
  }

  await db
    .update(shortUrlModel)
    .set({
      isActive: !shortUrl.isActive,
    })
    .where(eq(shortUrlModel.id, shortUrlId));
});
