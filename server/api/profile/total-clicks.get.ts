import { and, count, eq, isNull } from 'drizzle-orm';

import { EClickType, ELinkType, EPlanType } from '~~/enums';
import {
  db,
  linkClickModel,
  linkModel,
  profileAccessModel,
} from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { id: userId, plan } = await isAuthenticated(event);

  const [
    profileAccessRows,
    linkClicksRows,
    profileCountryClicks,
    linkCountryClicks,
    linkTypeClicks,
  ] = await Promise.all([
    db
      .select({ clicks: count(profileAccessModel.id) })
      .from(profileAccessModel)
      .where(eq(profileAccessModel.userId, userId)),
    db
      .select({ clicks: count(linkClickModel.id) })
      .from(linkClickModel)
      .innerJoin(linkModel, eq(linkClickModel.linkId, linkModel.id))
      .where(
        and(
          eq(linkModel.userId, userId),
          isNull(linkModel.deletedAt),
          isNull(linkClickModel.deletedAt),
        ),
      ),
    plan === EPlanType.FREE ? [] : db
      .select({
        country: profileAccessModel.country,
        countryCode: profileAccessModel.countryCode,
        clicks: count(profileAccessModel.id),
      })
      .from(profileAccessModel)
      .where(eq(profileAccessModel.userId, userId))
      .groupBy(profileAccessModel.country, profileAccessModel.countryCode),
    plan === EPlanType.FREE ? [] : db
      .select({
        country: linkClickModel.country,
        countryCode: linkClickModel.countryCode,
        clicks: count(linkClickModel.id),
      })
      .from(linkClickModel)
      .innerJoin(linkModel, eq(linkClickModel.linkId, linkModel.id))
      .where(
        and(
          eq(linkModel.userId, userId),
          isNull(linkModel.deletedAt),
          isNull(linkClickModel.deletedAt),
        ),
      )
      .groupBy(linkClickModel.country, linkClickModel.countryCode),
    plan === EPlanType.FREE ? [] : db
      .select({
        title: linkModel.title,
        type: linkModel.type,
        platform: linkModel.platform,
        clicks: count(linkClickModel.id),
      })
      .from(linkClickModel)
      .innerJoin(linkModel, eq(linkClickModel.linkId, linkModel.id))
      .where(
        and(
          eq(linkModel.userId, userId),
          isNull(linkModel.deletedAt),
          isNull(linkClickModel.deletedAt),
        ),
      )
      .groupBy(linkModel.type, linkModel.platform, linkModel.title),
  ]);

  const profileAccessClicks = profileAccessRows[0]?.clicks ?? 0;
  const linkClicks = linkClicksRows[0]?.clicks ?? 0;

  const countryClicksMap = new Map<
    string,
    { country: string; countryCode: string; clicks: number }
  >();

  for (const item of [...profileCountryClicks, ...linkCountryClicks]) {
    const key = `${item.countryCode}-${item.country}`;
    const current = countryClicksMap.get(key);

    if (current) {
      current.clicks += item.clicks;
      continue;
    }

    countryClicksMap.set(key, {
      country: item.country,
      countryCode: item.countryCode,
      clicks: item.clicks,
    });
  }

  const typeClicksMap = new Map<EClickType | string, number>();

  if (plan !== EPlanType.FREE && profileAccessClicks > 0) {
    typeClicksMap.set(EClickType.PROFILE_ACCESS, profileAccessClicks);
  }

  for (const item of linkTypeClicks) {
    const typeKey =
      item.type === ELinkType.PRIMARY
        ? (item.platform as unknown as EClickType)
        : item.type === ELinkType.SECONDARY
        ? item.title!
        : EClickType.OTHER;

    typeClicksMap.set(typeKey, (typeClicksMap.get(typeKey) || 0) + item.clicks);
  }

  return {
    totalClicks: profileAccessClicks + linkClicks,
    countryClicks: Array.from(countryClicksMap.values()).sort(
      (a, b) => b.clicks - a.clicks,
    ),
    typeClicks: Array.from(typeClicksMap.entries()).map(([type, clicks]) => ({
      type,
      clicks,
    })),
  };
});
