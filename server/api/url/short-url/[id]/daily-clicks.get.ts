import { and, asc, count, eq, sql, type SQL } from 'drizzle-orm';
import { DateTime } from 'luxon';

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
