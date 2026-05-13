import { and, count, eq, isNull } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage, EPlanType } from '~~/enums';
import { db, shortUrlClickModel, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId, plan } = await isAuthenticated(event);

  if (plan === EPlanType.FREE) {
    return [];
  }

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

  const countryClicks = await db
    .select({
      country: shortUrlClickModel.country,
      countryCode: shortUrlClickModel.countryCode,
      clicks: count(shortUrlClickModel.id),
    })
    .from(shortUrlClickModel)
    .where(
      and(
        eq(shortUrlClickModel.shortUrlId, shortUrl.id),
        isNull(shortUrlClickModel.deletedAt),
      ),
    )
    .groupBy(shortUrlClickModel.country, shortUrlClickModel.countryCode);

  return countryClicks;
});
