import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { and, asc, count, eq, isNull, SQL, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';

import {
  db,
  profileAccessModel,
  profileModel,
  linkClickModel,
  linkModel,
} from '@database';
import {
  EJobName,
  ELinkType,
  EProfileClickType,
  EQueueName,
  ProfileDTO,
  ProfileDailyClickDTO,
  ProfileDailyClicksDTO,
  ProfileTotalClicksDTO,
} from '@resources';
import { StorageUtility } from '@utilities';

@Injectable()
export class ProfileService {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageUtility: StorageUtility,
    @InjectQueue(EQueueName.CLICK) private readonly clickQueue: Queue,
  ) {}

  async getProfile(handle: string): Promise<ProfileDTO> {
    const profile = await db.query.profileModel.findFirst({
      where: and(
        eq(profileModel.handle, handle),
        isNull(profileModel.deletedAt),
      ),
    });

    if (!profile) {
      throw new NotFoundException(
        this.configService.get('errorMessage.profileNotFound'),
      );
    }

    let profileImageUrl: string | null = null;

    if (profile.profileImage) {
      profileImageUrl = await this.storageUtility.getUrl(profile.profileImage);
    }

    let coverImageUrl: string | null = null;

    if (profile.coverImage) {
      coverImageUrl = await this.storageUtility.getUrl(profile.coverImage);
    }

    const links = await db.query.linkModel.findMany({
      where: and(
        eq(linkModel.userId, profile.userId),
        isNull(linkModel.deletedAt),
      ),
      orderBy: [asc(linkModel.position)],
    });

    const linkDtos = await Promise.all(
      links.map(async (link) => {
        let backgroundImageUrl: string | null = null;

        if (link.backgroundImage) {
          backgroundImageUrl = await this.storageUtility.getUrl(
            link.backgroundImage,
          );
        }

        return {
          id: link.id,
          type: link.type,
          platform: link.platform,
          url: link.url,
          title: link.title,
          backgroundImage: backgroundImageUrl,
          titleColors: link.titleColors as string[] | null,
          backgroundColors: link.backgroundColors as string[] | null,
          position: link.position,
        };
      }),
    );

    return {
      name: profile.name,
      handle: profile.handle,
      handleColor: profile.handleColor,
      profileImage: profileImageUrl,
      coverImage: coverImageUrl,
      bio: profile.bio,
      bioColor: profile.bioColor,
      primaryLinks: linkDtos.filter((link) => link.type === ELinkType.PRIMARY),
      secondaryLinks: linkDtos.filter(
        (link) => link.type === ELinkType.SECONDARY,
      ),
    };
  }

  async registerProfileAccess(
    handle: string,
    ipAddress: string,
    requestUserAgent: string,
    requestReferrer?: string,
  ): Promise<void> {
    await this.clickQueue.add(EJobName.CLICK_PROFILE, {
      handle,
      ipAddress,
      requestUserAgent,
      requestReferrer,
    });
  }

  async getDailyClicks(userId: string): Promise<ProfileDailyClicksDTO> {
    const now = DateTime.now();
    const currentStart = now.minus({ days: 29 }).startOf('day');
    const currentEndExclusive = now.plus({ days: 1 }).startOf('day');
    const previousStart = currentStart.minus({ days: 30 });

    const [
      profileDailyClicks,
      linkDailyClicks,
      [{ clicks: currentProfileAccessClicks }],
      [{ clicks: previousProfileAccessClicks }],
      [{ clicks: currentLinkClicks }],
      [{ clicks: previousLinkClicks }],
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
            sql`${profileAccessModel.accessedAt} >= ${currentStart.toJSDate()} AND ${profileAccessModel.accessedAt} < ${currentEndExclusive.toJSDate()}`,
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
            sql`${linkClickModel.clickedAt} >= ${currentStart.toJSDate()} AND ${linkClickModel.clickedAt} < ${currentEndExclusive.toJSDate()}`,
          ),
        )
        .groupBy(sql`to_char(${linkClickModel.clickedAt}, 'YYYY-MM-DD')`),
      db
        .select({ clicks: count(profileAccessModel.id) })
        .from(profileAccessModel)
        .where(
          and(
            eq(profileAccessModel.userId, userId),
            sql`${profileAccessModel.accessedAt} >= ${currentStart.toJSDate()} AND ${profileAccessModel.accessedAt} < ${currentEndExclusive.toJSDate()}`,
          ),
        ),
      db
        .select({ clicks: count(profileAccessModel.id) })
        .from(profileAccessModel)
        .where(
          and(
            eq(profileAccessModel.userId, userId),
            sql`${profileAccessModel.accessedAt} >= ${previousStart.toJSDate()} AND ${profileAccessModel.accessedAt} < ${currentStart.toJSDate()}`,
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
            sql`${linkClickModel.clickedAt} >= ${currentStart.toJSDate()} AND ${linkClickModel.clickedAt} < ${currentEndExclusive.toJSDate()}`,
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
            sql`${linkClickModel.clickedAt} >= ${previousStart.toJSDate()} AND ${linkClickModel.clickedAt} < ${currentStart.toJSDate()}`,
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

    const dailyClicks: ProfileDailyClickDTO[] = Array.from(
      dailyClicksMap.entries(),
    )
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const currentTotalClicks = currentProfileAccessClicks + currentLinkClicks;
    const previousTotalClicks =
      previousProfileAccessClicks + previousLinkClicks;
    const changePercentage =
      previousTotalClicks === 0
        ? currentTotalClicks > 0
          ? 100
          : 0
        : Number(
            (
              ((currentTotalClicks - previousTotalClicks) /
                previousTotalClicks) *
              100
            ).toFixed(2),
          );

    return {
      dailyClicks,
      changePercentage,
    };
  }

  async getTotalClicks(userId: string): Promise<ProfileTotalClicksDTO> {
    const [
      [{ clicks: profileAccessClicks }],
      [{ clicks: linkClicks }],
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
      db
        .select({
          country: profileAccessModel.country,
          countryCode: profileAccessModel.countryCode,
          clicks: count(profileAccessModel.id),
        })
        .from(profileAccessModel)
        .where(eq(profileAccessModel.userId, userId))
        .groupBy(profileAccessModel.country, profileAccessModel.countryCode),
      db
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
      db
        .select({
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
        .groupBy(linkModel.type, linkModel.platform),
    ]);

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

    const typeClicksMap = new Map<EProfileClickType, number>();

    if (profileAccessClicks > 0) {
      typeClicksMap.set(EProfileClickType.PROFILE_ACCESS, profileAccessClicks);
    }

    for (const item of linkTypeClicks) {
      const typeKey =
        item.type === ELinkType.PRIMARY
          ? (item.platform as unknown as EProfileClickType)
          : EProfileClickType.OTHER;

      typeClicksMap.set(
        typeKey,
        (typeClicksMap.get(typeKey) || 0) + item.clicks,
      );
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
  }

  async getProfileHandles(): Promise<string[]> {
    const handles: string[] = [];

    const profiles = await db.query.profileModel.findMany({
      where: isNull(profileModel.deletedAt),
    });

    await Promise.all(
      profiles.map(async (profile) => {
        if (!profile.handle) return;

        const link = await db.query.linkModel.findFirst({
          where: and(
            eq(linkModel.userId, profile.userId),
            isNull(linkModel.deletedAt),
          ),
        });

        if (link) {
          handles.push(profile.handle);
        }
      }),
    );

    return handles;
  }
}
