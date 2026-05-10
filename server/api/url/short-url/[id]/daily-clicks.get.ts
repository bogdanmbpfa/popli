import { and, asc, count, eq, sql, type SQL } from 'drizzle-orm';
import { DateTime } from 'luxon';

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
    ),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.shortUrlNotFound,
    });
  }

  const dailyClicks = await db
    .select({
      date: sql`to_char(clicked_at, 'YYYY-MM-DD')` as unknown as SQL<string>,
      clicks: count(shortUrlClickModel.id),
    })
    .from(shortUrlClickModel)
    .where(
      and(
        eq(shortUrlClickModel.shortUrlId, shortUrl.id),
        sql`to_char(clicked_at, 'YYYY-MM-DD') >= ${DateTime.now()
          .minus({ days: 30 })
          .toFormat('yyyy-MM-dd')}`,
      ),
    )
    .groupBy(sql`to_char(clicked_at, 'YYYY-MM-DD')`)
    .orderBy(asc(sql`to_char(clicked_at, 'YYYY-MM-DD')`));

  return dailyClicks;
});
