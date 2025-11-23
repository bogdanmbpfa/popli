import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UAParser } from '@ua-parser-js/pro-business';
import { and, asc, count, desc, eq, or, SQL, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { generate as generateRandomString } from 'randomstring';

import { db, shortUrlClickModel, shortUrlModel } from '@database';
import {
  IUrlIpApiResponse,
  UrlCreateShortUrlDTO,
  UrlShortUrlCodeResponseDTO,
  UrlShortUrlCountryClicksDTO,
  UrlShortUrlDailyClicksDTO,
  UrlShortUrlDTO,
  UrlShortUrlUpdateDTO,
} from '@resources';

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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

    let shortCode = generateRandomString({
      length: 8,
      charset: 'alphanumeric',
    });
    let shortCodeUnique = false;

    while (!shortCodeUnique) {
      const existingShortCode = await db.query.shortUrlModel.findFirst({
        where: eq(shortUrlModel.shortCode, shortCode),
      });

      if (!existingShortCode) {
        shortCodeUnique = true;
      } else {
        shortCode = generateRandomString({
          length: 8,
          charset: 'alphanumeric',
        });
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
  ): Promise<UrlShortUrlCodeResponseDTO> {
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
        `${this.configService.get('ipApi.baseUrl')}/api/json/82.78.167.157`,
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

    return { url: shortUrl.url };
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
}
