import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UAParser } from '@ua-parser-js/pro-business';
import { Queue } from 'bullmq';
import { and, asc, count, desc, eq, isNull, or, SQL, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { randomBytes } from 'node:crypto';

import {
  db,
  linkClickModel,
  linkModel,
  shortUrlClickModel,
  shortUrlModel,
} from '@database';
import {
  CreateLinkDTO,
  IUrlIpApiResponse,
  LinkDTO,
  UrlLinkCountryClicksDTO,
  UrlLinkDailyClicksDTO,
  UrlCreateShortUrlDTO,
  UrlShortUrlCountryClicksDTO,
  UrlShortUrlDailyClicksDTO,
  UrlShortUrlDTO,
  UrlShortUrlUpdateDTO,
  EQueueName,
  EJobName,
} from '@resources';
import { processImage, StorageUtility } from '@utilities';

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly storageUtility: StorageUtility,
    @InjectQueue(EQueueName.CLICK) private readonly clickQueue: Queue,
  ) {}

  async createShortUrl(
    userId: string,
    createShortUrlDTO: UrlCreateShortUrlDTO,
  ): Promise<void> {
    const { url, alias, title } = createShortUrlDTO;

    if (alias) {
      const existingAlias = await db.query.shortUrlModel.findFirst({
        where: eq(shortUrlModel.alias, alias),
      });

      if (existingAlias) {
        throw new BadRequestException(
          this.configService.get('errorMessage.aliasAlreadyExists'),
        );
      }
    }

    let shortCode = randomBytes(4).toString('hex');
    let shortCodeUnique = false;

    while (!shortCodeUnique) {
      const existingShortCode = await db.query.shortUrlModel.findFirst({
        where: eq(shortUrlModel.shortCode, shortCode),
      });

      if (!existingShortCode) {
        shortCodeUnique = true;
      } else {
        shortCode = randomBytes(4).toString('hex');
      }
    }

    await db.insert(shortUrlModel).values({
      userId,
      url,
      shortCode,
      alias: alias || null,
      title,
    });
  }

  async getShortUrls(userId: string): Promise<UrlShortUrlDTO[]> {
    const shortUrls = await db.query.shortUrlModel.findMany({
      where: eq(shortUrlModel.userId, userId),
      orderBy: [desc(shortUrlModel.createdAt)],
    });

    const analytics = await Promise.all(
      shortUrls.map(async (shortUrl) => {
        const [{ clicks: todayClicks }] = await db
          .select({
            clicks: count(shortUrlClickModel.id),
          })
          .from(shortUrlClickModel)
          .where(
            and(
              eq(shortUrlClickModel.shortUrlId, shortUrl.id),
              sql`to_char(clicked_at, 'YYYY-MM-DD') = ${new Date().toISOString().split('T')[0]}`,
            ),
          );

        const dailyUniqueVisitors = await db
          .select({
            date: sql`to_char(clicked_at, 'YYYY-MM-DD')` as unknown as SQL<string>,
            visitors: count(sql`DISTINCT ${shortUrlClickModel.ipAddress}`),
          })
          .from(shortUrlClickModel)
          .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id))
          .groupBy(sql`to_char(clicked_at, 'YYYY-MM-DD')`);

        const todayUniqueVisitors = dailyUniqueVisitors.find(
          (visitor) => visitor.date === new Date().toISOString().split('T')[0],
        );

        const [{ clicks: totalClicks }] = await db
          .select({ clicks: count(shortUrlClickModel.id) })
          .from(shortUrlClickModel)
          .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id));

        const [{ visitors: totalUniqueVisitors }] = await db
          .select({
            visitors: count(sql`DISTINCT ${shortUrlClickModel.ipAddress}`),
          })
          .from(shortUrlClickModel)
          .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id));

        return {
          id: shortUrl.id,
          originalUrl: shortUrl.url,
          shortCodeUrl: `${this.configService.get('app.websiteUrl')}/s/${shortUrl.shortCode}`,
          alias: shortUrl.alias,
          aliasUrl: shortUrl.alias
            ? `${this.configService.get('app.websiteUrl')}/s/${shortUrl.alias}`
            : null,
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
  }

  async getShortUrl(
    shortCode: string,
    ipAddress: string,
    requestUserAgent: string,
    requestReferrer?: string,
  ): Promise<string> {
    const shortUrl = await db.query.shortUrlModel.findFirst({
      where: or(
        eq(shortUrlModel.shortCode, shortCode),
        eq(shortUrlModel.alias, shortCode),
      ),
    });

    if (!shortUrl) {
      throw new NotFoundException(
        this.configService.get('errorMessage.shortUrlNotFound'),
      );
    }

    let ipData: IUrlIpApiResponse;

    try {
      const { data } = await this.httpService.axiosRef.get<IUrlIpApiResponse>(
        // `${this.configService.get('ipApi.baseUrl')}/api/json/${ipAddress}`,
        `${this.configService.get('ipApi.baseUrl')}/api/json/82.78.167.144`,
        {
          transformResponse: (data) => {
            return JSON.parse(data);
          },
        },
      );

      ipData = data;
    } catch (error) {
      this.logger.error(
        `Error getting IP data for ${ipAddress}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      throw new BadRequestException(
        this.configService.get('errorMessage.ipProxy'),
      );
    }

    if (ipData.isProxy) {
      throw new BadRequestException(
        this.configService.get('errorMessage.ipProxy'),
      );
    }

    const clickedAt = new Date();

    const result = new UAParser(requestUserAgent).getResult();

    const userAgent = result.ua;
    const deviceType = result.device.type;
    const browser = result.browser.name;
    const os = result.os.name;

    await db.insert(shortUrlClickModel).values({
      shortUrlId: shortUrl.id,
      ipAddress: ipData.ipAddress,
      country: ipData.countryName,
      countryCode: ipData.countryCode,
      userAgent: userAgent,
      deviceType: deviceType,
      browser: browser,
      os: os,
      referrer: requestReferrer || null,
      clickedAt,
    });

    return shortUrl.url;
  }

  async deleteShortUrl(userId: string, id: string): Promise<void> {
    const shortUrl = await db.query.shortUrlModel.findFirst({
      where: and(eq(shortUrlModel.id, id), eq(shortUrlModel.userId, userId)),
      with: {
        clicks: true,
      },
    });

    if (!shortUrl) {
      throw new NotFoundException(
        this.configService.get('errorMessage.shortUrlNotFound'),
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(shortUrlClickModel)
        .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id));

      await tx.delete(shortUrlModel).where(eq(shortUrlModel.id, id));
    });
  }

  async toggleShortUrl(userId: string, id: string): Promise<void> {
    const shortUrl = await db.query.shortUrlModel.findFirst({
      where: and(eq(shortUrlModel.id, id), eq(shortUrlModel.userId, userId)),
    });

    if (!shortUrl) {
      throw new NotFoundException(
        this.configService.get('errorMessage.shortUrlNotFound'),
      );
    }

    await db
      .update(shortUrlModel)
      .set({
        isActive: !shortUrl.isActive,
      })
      .where(eq(shortUrlModel.id, id));
  }

  async updateShortUrl(
    userId: string,
    id: string,
    updateShortUrlDTO: UrlShortUrlUpdateDTO,
  ): Promise<void> {
    const shortUrl = await db.query.shortUrlModel.findFirst({
      where: and(eq(shortUrlModel.id, id), eq(shortUrlModel.userId, userId)),
    });

    if (!shortUrl) {
      throw new NotFoundException(
        this.configService.get('errorMessage.shortUrlNotFound'),
      );
    }

    if (updateShortUrlDTO.alias) {
      const existingAlias = await db.query.shortUrlModel.findFirst({
        where: eq(shortUrlModel.alias, updateShortUrlDTO.alias),
      });

      if (existingAlias) {
        throw new BadRequestException(
          this.configService.get('errorMessage.aliasAlreadyExists'),
        );
      }
    }

    await db
      .update(shortUrlModel)
      .set({
        ...(updateShortUrlDTO.url && { url: updateShortUrlDTO.url }),
        ...(updateShortUrlDTO.alias && { alias: updateShortUrlDTO.alias }),
        ...(updateShortUrlDTO.title && { title: updateShortUrlDTO.title }),
      })
      .where(eq(shortUrlModel.id, id));
  }

  async getShortUrlDailyClicks(
    userId: string,
    id: string,
  ): Promise<UrlShortUrlDailyClicksDTO[]> {
    const shortUrl = await db.query.shortUrlModel.findFirst({
      where: and(eq(shortUrlModel.id, id), eq(shortUrlModel.userId, userId)),
    });

    if (!shortUrl) {
      throw new NotFoundException(
        this.configService.get('errorMessage.shortUrlNotFound'),
      );
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
          sql`to_char(clicked_at, 'YYYY-MM-DD') >= ${DateTime.now().minus({ days: 30 }).toFormat('yyyy-MM-dd')}`,
        ),
      )
      .groupBy(sql`to_char(clicked_at, 'YYYY-MM-DD')`)
      .orderBy(asc(sql`to_char(clicked_at, 'YYYY-MM-DD')`));

    return dailyClicks;
  }

  async getShortUrlCountryClicks(
    userId: string,
    id: string,
  ): Promise<UrlShortUrlCountryClicksDTO[]> {
    const shortUrl = await db.query.shortUrlModel.findFirst({
      where: and(eq(shortUrlModel.id, id), eq(shortUrlModel.userId, userId)),
    });

    if (!shortUrl) {
      throw new NotFoundException(
        this.configService.get('errorMessage.shortUrlNotFound'),
      );
    }

    const countryClicks = await db
      .select({
        country: shortUrlClickModel.country,
        countryCode: shortUrlClickModel.countryCode,
        clicks: count(shortUrlClickModel.id),
      })
      .from(shortUrlClickModel)
      .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id))
      .groupBy(shortUrlClickModel.country, shortUrlClickModel.countryCode);

    return countryClicks;
  }

  async getLinkCountryClicks(
    userId: string,
    id: string,
    start?: string,
    end?: string,
  ): Promise<UrlLinkCountryClicksDTO[]> {
    const link = await db.query.linkModel.findFirst({
      where: and(
        eq(linkModel.id, id),
        eq(linkModel.userId, userId),
        isNull(linkModel.deletedAt),
      ),
    });

    if (!link) {
      throw new NotFoundException(
        this.configService.get('errorMessage.linkNotFound'),
      );
    }

    const now = DateTime.now();

    const startDate = start ? DateTime.fromISO(start) : now.startOf('month');
    const endDate = end ? DateTime.fromISO(end) : now;

    if (!startDate.isValid || !endDate.isValid) {
      throw new BadRequestException('Invalid date interval');
    }

    if (endDate < startDate) {
      throw new BadRequestException('Invalid date interval');
    }

    // Inclusive end date: clickedAt in [startDate, endDate]
    const endExclusive = endDate.plus({ milliseconds: 1 });

    const countryClicks = await db
      .select({
        country: linkClickModel.country,
        countryCode: linkClickModel.countryCode,
        clicks: count(linkClickModel.id),
      })
      .from(linkClickModel)
      .where(
        and(
          eq(linkClickModel.linkId, link.id),
          isNull(linkClickModel.deletedAt),
          sql`clicked_at >= ${startDate.toJSDate()} AND clicked_at < ${endExclusive.toJSDate()}`,
        ),
      )
      .groupBy(linkClickModel.country, linkClickModel.countryCode);

    return countryClicks;
  }

  async getLinkDailyClicks(
    userId: string,
    id: string,
    days?: number,
  ): Promise<UrlLinkDailyClicksDTO[]> {
    const link = await db.query.linkModel.findFirst({
      where: and(
        eq(linkModel.id, id),
        eq(linkModel.userId, userId),
        isNull(linkModel.deletedAt),
      ),
    });

    if (!link) {
      throw new NotFoundException(
        this.configService.get('errorMessage.linkNotFound'),
      );
    }

    const parsedDays = days ?? 7;
    const daysCount =
      Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 7;
    const boundedDays = Math.min(daysCount, 90); // safety bound for performance

    const startDate = DateTime.now().minus({ days: boundedDays - 1 });

    const dailyClicks = await db
      .select({
        date: sql`to_char(clicked_at, 'YYYY-MM-DD')` as unknown as SQL<string>,
        clicks: count(linkClickModel.id),
      })
      .from(linkClickModel)
      .where(
        and(
          eq(linkClickModel.linkId, link.id),
          isNull(linkClickModel.deletedAt),
          sql`to_char(clicked_at, 'YYYY-MM-DD') >= ${startDate.toFormat('yyyy-MM-dd')}`,
        ),
      )
      .groupBy(sql`to_char(clicked_at, 'YYYY-MM-DD')`)
      .orderBy(asc(sql`to_char(clicked_at, 'YYYY-MM-DD')`));

    return dailyClicks;
  }

  async getLinks(userId: string): Promise<LinkDTO[]> {
    const links = await db.query.linkModel.findMany({
      where: and(eq(linkModel.userId, userId), isNull(linkModel.deletedAt)),
      orderBy: [asc(linkModel.position)],
    });

    const linksDTO = await Promise.all(
      links.map(async (link) => {
        let backgroundImageUrl: string | null = null;

        if (link.backgroundImage) {
          backgroundImageUrl = await this.storageUtility.getUrl(
            link.backgroundImage,
          );
        }

        return {
          id: link.id,
          userId: link.userId,
          type: link.type,
          platform: link.platform,
          url: link.url,
          title: link.title,
          backgroundImage: backgroundImageUrl,
          titleColors: link.titleColors as string[] | null,
          backgroundColors: link.backgroundColors as string[] | null,
          position: link.position,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
          deletedAt: link.deletedAt?.toISOString() || null,
        };
      }),
    );

    return linksDTO;
  }

  async createLink(userId: string, dto: CreateLinkDTO): Promise<void> {
    await db.transaction(async (tx) => {
      if (dto.id) {
        const existingLink = await tx.query.linkModel.findFirst({
          where: and(eq(linkModel.userId, userId), eq(linkModel.id, dto.id)),
        });

        if (existingLink) {
          if (existingLink.backgroundImage) {
            await this.storageUtility.delete(existingLink.backgroundImage);
          }

          await tx.delete(linkModel).where(eq(linkModel.id, existingLink.id));
        }
      }

      let backgroundImageUrl: string | null = null;

      if (dto.backgroundImage) {
        try {
          const image = await processImage(dto.backgroundImage.buffer, {
            width: 360,
            height: 120,
          });

          backgroundImageUrl = await this.storageUtility.upload(
            image,
            randomBytes(20).toString('hex'),
            'image/webp',
            'link-background-images',
          );
        } catch (error) {
          this.logger.error('Error processing background image', error);
          throw new BadRequestException(
            this.configService.get('errorMessage.fileRequired'),
          );
        }
      }

      await tx.insert(linkModel).values({
        id: dto.id,
        userId,
        type: dto.type,
        platform: dto.platform || null,
        url: dto.url,
        title: dto.title,
        backgroundImage: backgroundImageUrl,
        titleColors: dto.titleColors,
        backgroundColors: dto.backgroundColors,
        position: dto.position,
      });
    });
  }

  async getLinkBackgroundImage(userId: string, id: string): Promise<Buffer> {
    const link = await db.query.linkModel.findFirst({
      where: and(eq(linkModel.id, id), eq(linkModel.userId, userId)),
    });

    if (!link) {
      throw new NotFoundException(
        this.configService.get('errorMessage.linkNotFound'),
      );
    }

    if (!link.backgroundImage) {
      throw new NotFoundException(
        this.configService.get('errorMessage.backgroundImageNotFound'),
      );
    }

    return await this.storageUtility.getBuffer(link.backgroundImage);
  }

  async deleteLink(userId: string, id: string): Promise<void> {
    const link = await db.query.linkModel.findFirst({
      where: and(eq(linkModel.id, id), eq(linkModel.userId, userId)),
    });

    if (link) {
      await db.delete(linkModel).where(eq(linkModel.id, id));
    }
  }

  async clickLink(
    id: string,
    ipAddress: string,
    requestUserAgent: string,
    requestReferrer?: string,
  ): Promise<void> {
    await this.clickQueue.add(EJobName.CLICK_LINK, {
      linkId: id,
      ipAddress,
      requestUserAgent,
      requestReferrer,
    });
  }
}
