import { and, count, desc, eq, isNull, sql, type SQL } from 'drizzle-orm';

import { db, shortUrlClickModel, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { siteUrl },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const shortUrls = await db.query.shortUrlModel.findMany({
    where: and(
      eq(shortUrlModel.userId, userId),
      isNull(shortUrlModel.deletedAt),
    ),
    orderBy: [desc(shortUrlModel.createdAt)],
  });

  const analytics = await Promise.all(
    shortUrls.map(async (shortUrl) => {
      const todayClicksRows = await db
        .select({
          clicks: count(shortUrlClickModel.id),
        })
        .from(shortUrlClickModel)
        .where(
          and(
            eq(shortUrlClickModel.shortUrlId, shortUrl.id),
            isNull(shortUrlClickModel.deletedAt),
            sql`to_char(clicked_at, 'YYYY-MM-DD') = ${
              new Date().toISOString().split('T')[0]
            }`,
          ),
        );
      const todayClicks = todayClicksRows[0]?.clicks ?? 0;

      const dailyUniqueVisitors = await db
        .select({
          date: sql`to_char(clicked_at, 'YYYY-MM-DD')` as unknown as SQL<string>,
          visitors: count(sql`DISTINCT ${shortUrlClickModel.ipAddress}`),
        })
        .from(shortUrlClickModel)
        .where(
          and(
            eq(shortUrlClickModel.shortUrlId, shortUrl.id),
            isNull(shortUrlClickModel.deletedAt),
          ),
        )
        .groupBy(sql`to_char(clicked_at, 'YYYY-MM-DD')`);

      const todayUniqueVisitors = dailyUniqueVisitors.find(
        (visitor) => visitor.date === new Date().toISOString().split('T')[0],
      );

      const totalClicksRows = await db
        .select({ clicks: count(shortUrlClickModel.id) })
        .from(shortUrlClickModel)
        .where(
          and(
            eq(shortUrlClickModel.shortUrlId, shortUrl.id),
            isNull(shortUrlClickModel.deletedAt),
          ),
        );
      const totalClicks = totalClicksRows[0]?.clicks ?? 0;

      const totalUniqueRows = await db
        .select({
          visitors: count(sql`DISTINCT ${shortUrlClickModel.ipAddress}`),
        })
        .from(shortUrlClickModel)
        .where(
          and(
            eq(shortUrlClickModel.shortUrlId, shortUrl.id),
            isNull(shortUrlClickModel.deletedAt),
          ),
        );
      const totalUniqueVisitors = totalUniqueRows[0]?.visitors ?? 0;

      return {
        id: shortUrl.id,
        originalUrl: shortUrl.url,
        shortCodeUrl: `${siteUrl}/s/${shortUrl.shortCode}`,
        alias: shortUrl.alias,
        aliasUrl: shortUrl.alias ? `${siteUrl}/s/${shortUrl.alias}` : null,
        isActive: shortUrl.isActive,
        title: shortUrl.title,
        createdAt: shortUrl.createdAt.toISOString(),
        updatedAt: shortUrl.updatedAt.toISOString(),
        todayClicks,
        dailyUniqueVisitors,
        todayUniqueVisitors: todayUniqueVisitors?.visitors || 0,
        totalClicks,
        totalUniqueVisitors,
      };
    }),
  );

  return analytics;
});
