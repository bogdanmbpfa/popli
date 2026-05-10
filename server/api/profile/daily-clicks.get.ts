import { and, count, eq, isNull, sql, type SQL } from 'drizzle-orm';
import { DateTime } from 'luxon';

import {
  db,
  linkClickModel,
  linkModel,
  profileAccessModel,
} from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { id: userId } = await isAuthenticated(event);

  const now = DateTime.now();
  const currentStart = now.minus({ days: 29 }).startOf('day');
  const currentEndExclusive = now.plus({ days: 1 }).startOf('day');
  const previousStart = currentStart.minus({ days: 30 });

  const [
    profileDailyClicks,
    linkDailyClicks,
    currentProfileAccessRows,
    previousProfileAccessRows,
    currentLinkRows,
    previousLinkRows,
  ] = await Promise.all([
    db
      .select({
        date: sql`to_char(accessed_at, 'YYYY-MM-DD')` as unknown as SQL<string>,
        clicks: count(profileAccessModel.id),
      })
      .from(profileAccessModel)
      .where(
        and(
          eq(profileAccessModel.userId, userId),
          sql`${
            profileAccessModel.accessedAt
          } >= ${currentStart.toJSDate()} AND ${
            profileAccessModel.accessedAt
          } < ${currentEndExclusive.toJSDate()}`,
        ),
      )
      .groupBy(sql`to_char(accessed_at, 'YYYY-MM-DD')`),
    db
      .select({
        date: sql`to_char(${linkClickModel.clickedAt}, 'YYYY-MM-DD')` as unknown as SQL<string>,
        clicks: count(linkClickModel.id),
      })
      .from(linkClickModel)
      .innerJoin(linkModel, eq(linkClickModel.linkId, linkModel.id))
      .where(
        and(
          eq(linkModel.userId, userId),
          isNull(linkModel.deletedAt),
          isNull(linkClickModel.deletedAt),
          sql`${linkClickModel.clickedAt} >= ${currentStart.toJSDate()} AND ${
            linkClickModel.clickedAt
          } < ${currentEndExclusive.toJSDate()}`,
        ),
      )
      .groupBy(sql`to_char(${linkClickModel.clickedAt}, 'YYYY-MM-DD')`),
    db
      .select({ clicks: count(profileAccessModel.id) })
      .from(profileAccessModel)
      .where(
        and(
          eq(profileAccessModel.userId, userId),
          sql`${
            profileAccessModel.accessedAt
          } >= ${currentStart.toJSDate()} AND ${
            profileAccessModel.accessedAt
          } < ${currentEndExclusive.toJSDate()}`,
        ),
      ),
    db
      .select({ clicks: count(profileAccessModel.id) })
      .from(profileAccessModel)
      .where(
        and(
          eq(profileAccessModel.userId, userId),
          sql`${
            profileAccessModel.accessedAt
          } >= ${previousStart.toJSDate()} AND ${
            profileAccessModel.accessedAt
          } < ${currentStart.toJSDate()}`,
        ),
      ),
    db
      .select({ clicks: count(linkClickModel.id) })
      .from(linkClickModel)
      .innerJoin(linkModel, eq(linkClickModel.linkId, linkModel.id))
      .where(
        and(
          eq(linkModel.userId, userId),
          isNull(linkModel.deletedAt),
          isNull(linkClickModel.deletedAt),
          sql`${linkClickModel.clickedAt} >= ${currentStart.toJSDate()} AND ${
            linkClickModel.clickedAt
          } < ${currentEndExclusive.toJSDate()}`,
        ),
      ),
    db
      .select({ clicks: count(linkClickModel.id) })
      .from(linkClickModel)
      .innerJoin(linkModel, eq(linkClickModel.linkId, linkModel.id))
      .where(
        and(
          eq(linkModel.userId, userId),
          isNull(linkModel.deletedAt),
          isNull(linkClickModel.deletedAt),
          sql`${linkClickModel.clickedAt} >= ${previousStart.toJSDate()} AND ${
            linkClickModel.clickedAt
          } < ${currentStart.toJSDate()}`,
        ),
      ),
  ]);

  const dailyClicksMap = new Map<string, number>();

  for (const { date, clicks } of profileDailyClicks) {
    dailyClicksMap.set(date, (dailyClicksMap.get(date) || 0) + clicks);
  }

  for (const { date, clicks } of linkDailyClicks) {
    dailyClicksMap.set(date, (dailyClicksMap.get(date) || 0) + clicks);
  }

  const dailyClicks = Array.from({ length: 30 }, (_, index) => {
    const date = currentStart.plus({ days: index }).toISODate() ?? '';

    return {
      date,
      clicks: dailyClicksMap.get(date) ?? 0,
    };
  });

  const currentProfileAccessClicks = currentProfileAccessRows[0]?.clicks ?? 0;
  const previousProfileAccessClicks = previousProfileAccessRows[0]?.clicks ?? 0;
  const currentLinkClicks = currentLinkRows[0]?.clicks ?? 0;
  const previousLinkClicks = previousLinkRows[0]?.clicks ?? 0;

  const currentTotalClicks = currentProfileAccessClicks + currentLinkClicks;
  const previousTotalClicks = previousProfileAccessClicks + previousLinkClicks;
  const changePercentage =
    previousTotalClicks === 0
      ? currentTotalClicks > 0
        ? 100
        : 0
      : Number(
          (
            ((currentTotalClicks - previousTotalClicks) / previousTotalClicks) *
            100
          ).toFixed(2),
        );

  return {
    dailyClicks,
    changePercentage,
  };
});
