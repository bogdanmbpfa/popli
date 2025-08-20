import { UAParser } from '@ua-parser-js/pro-business';
import { Axios } from 'axios';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { DateTime } from 'luxon';
import randomstring from 'randomstring';

import {
  UrlShortUrlCreate,
  UrlShortUrlCreateType,
  UrlShortUrl,
  UrlShortUrlType,
  ErrorResponseType,
  ErrorResponse,
  UrlShortUrlCodeType,
  UrlShortUrlCode,
  UrlShortUrlCodeResponseType,
  UrlIpApiResponseType,
  UrlShortUrlIdType,
  UrlShortUrlId,
  UrlShortUrlUpdateType,
  UrlShortUrlUpdate,
  UrlShortUrlDailyClicksType,
  UrlShortUrlCountryClicksType,
  UrlShortUrlCountryClicks,
} from '@resources';
import { db, shortUrlClickModel, shortUrlModel, userModel } from '@database';
import { authenticate } from '@middlewares';
import config from '@config';
import { and, asc, count, desc, eq, or, SQL, sql } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';
import { logger } from '@server';

export default function (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any,
) {
  fastify.post<{
    Body: UrlShortUrlCreateType;
    Reply: UrlShortUrlType | ErrorResponseType;
  }>(
    '/short-url',
    {
      preHandler: [authenticate],
      schema: {
        body: UrlShortUrlCreate,
        response: {
          200: UrlShortUrl,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id as string),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { url, alias, title } = request.body;

      if (alias) {
        const existingAlias = await db.query.shortUrlModel.findFirst({
          where: eq(shortUrlModel.alias, alias),
        });

        if (existingAlias) {
          return reply
            .code(400)
            .send({ message: config.errorMessage.aliasAlreadyExists });
        }
      }

      let shortCode = randomstring.generate({
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
          shortCode = randomstring.generate({
            length: 8,
            charset: 'alphanumeric',
          });
        }
      }

      await db.insert(shortUrlModel).values({
        userId: account.id,
        url,
        shortCode,
        alias: alias || null,
        title,
      });

      return reply.send();
    },
  );

  fastify.get<{
    Reply: UrlShortUrlType[] | ErrorResponseType;
  }>(
    '/short-url',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: Type.Array(UrlShortUrl),
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id as string),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const shortUrls = await db.query.shortUrlModel.findMany({
        where: eq(shortUrlModel.userId, account.id),
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
            (visitor) =>
              visitor.date === new Date().toISOString().split('T')[0],
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
            shortCodeUrl: `${config.webappUrl}/s/${shortUrl.shortCode}`,
            alias: shortUrl.alias,
            aliasUrl: shortUrl.alias
              ? `${config.webappUrl}/s/${shortUrl.alias}`
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

      return reply.send(analytics);
    },
  );

  fastify.get<{
    Params: UrlShortUrlCodeType;
    Reply: UrlShortUrlCodeResponseType | ErrorResponseType;
  }>(
    '/short-url/:shortCode',
    {
      schema: {
        params: UrlShortUrlCode,
      },
    },
    async (request, reply) => {
      const { shortCode } = request.params;

      const shortUrl = await db.query.shortUrlModel.findFirst({
        where: or(
          eq(shortUrlModel.shortCode, shortCode),
          eq(shortUrlModel.alias, shortCode),
        ),
      });

      if (!shortUrl) {
        return reply
          .code(404)
          .send({ message: config.errorMessage.shortUrlNotFound });
      }

      const axios = new Axios({
        baseURL: config.ipApi.baseUrl,
      });

      let ipData: UrlIpApiResponseType;

      try {
        const { data } = await axios.get<UrlIpApiResponseType>(
          // `/api/json/${request.ip}`,
          `/api/json/82.78.167.157`,
          {
            transformResponse: (data) => {
              return JSON.parse(data);
            },
          },
        );

        ipData = data;
      } catch (error) {
        logger.error(error, 'Error getting IP dat a');

        return reply.code(500).send({ message: config.errorMessage.ipProxy });
      }

      if (ipData.isProxy) {
        return reply.code(403).send({ message: config.errorMessage.ipProxy });
      }
      const clickedAt = new Date();

      const result = new UAParser(request.headers['user-agent']).getResult();

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
        referrer: request.headers['referer'] || null,
        clickedAt,
      });

      return reply.send({ url: shortUrl.url });
    },
  );

  fastify.delete<{
    Params: UrlShortUrlIdType;
    Reply: ErrorResponseType;
  }>(
    '/short-url/:id',
    {
      preHandler: [authenticate],
      schema: {
        params: UrlShortUrlId,
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { id } = request.params;

      const shortUrl = await db.query.shortUrlModel.findFirst({
        where: and(
          eq(shortUrlModel.id, id),
          eq(shortUrlModel.userId, requestUser.id),
        ),
        with: {
          clicks: true,
        },
      });

      if (!shortUrl) {
        return reply
          .code(404)
          .send({ message: config.errorMessage.shortUrlNotFound });
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(shortUrlClickModel)
          .where(eq(shortUrlClickModel.shortUrlId, shortUrl.id));
        await tx.delete(shortUrlModel).where(eq(shortUrlModel.id, id));
      });

      return reply.send();
    },
  );

  fastify.patch<{
    Params: UrlShortUrlIdType;
    Reply: ErrorResponseType;
  }>(
    '/short-url/:id/toggle',
    {
      preHandler: [authenticate],
      schema: {
        params: UrlShortUrlId,
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { id } = request.params;

      const shortUrl = await db.query.shortUrlModel.findFirst({
        where: and(
          eq(shortUrlModel.id, id),
          eq(shortUrlModel.userId, requestUser.id),
        ),
      });

      if (!shortUrl) {
        return reply
          .code(404)
          .send({ message: config.errorMessage.shortUrlNotFound });
      }

      await db
        .update(shortUrlModel)
        .set({
          isActive: !shortUrl.isActive,
        })
        .where(eq(shortUrlModel.id, id));

      return reply.send();
    },
  );

  fastify.patch<{
    Body: UrlShortUrlUpdateType;
    Reply: ErrorResponseType;
  }>(
    '/short-url',
    {
      preHandler: [authenticate],
      schema: {
        body: UrlShortUrlUpdate,
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { id, url, alias, title } = request.body;

      const shortUrl = await db.query.shortUrlModel.findFirst({
        where: and(
          eq(shortUrlModel.id, id),
          eq(shortUrlModel.userId, requestUser.id),
        ),
      });

      if (!shortUrl) {
        return reply
          .code(404)
          .send({ message: config.errorMessage.shortUrlNotFound });
      }

      if (alias) {
        const existingAlias = await db.query.shortUrlModel.findFirst({
          where: eq(shortUrlModel.alias, alias),
        });

        if (existingAlias) {
          return reply
            .code(400)
            .send({ message: config.errorMessage.aliasAlreadyExists });
        }
      }

      await db
        .update(shortUrlModel)
        .set({
          ...(url ? { url } : {}),
          ...(alias ? { alias } : {}),
          ...(title ? { title } : {}),
        })
        .where(eq(shortUrlModel.id, id));

      return reply.send();
    },
  );

  fastify.get<{
    Params: UrlShortUrlIdType;
    Reply: UrlShortUrlDailyClicksType | ErrorResponseType;
  }>(
    '/short-url/:id/daily-clicks',
    {
      preHandler: [authenticate],
      schema: {
        params: UrlShortUrlId,
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { id } = request.params;

      const shortUrl = await db.query.shortUrlModel.findFirst({
        where: and(
          eq(shortUrlModel.id, id),
          eq(shortUrlModel.userId, requestUser.id),
        ),
      });

      if (!shortUrl) {
        return reply
          .code(404)
          .send({ message: config.errorMessage.shortUrlNotFound });
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

      return reply.send(dailyClicks);
    },
  );

  fastify.get<{
    Params: UrlShortUrlIdType;
    Reply: UrlShortUrlCountryClicksType[] | ErrorResponseType;
  }>(
    '/short-url/:id/country-clicks',
    {
      preHandler: [authenticate],
      schema: {
        params: UrlShortUrlId,
        response: {
          200: Type.Array(UrlShortUrlCountryClicks),
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { id } = request.params;

      const shortUrl = await db.query.shortUrlModel.findFirst({
        where: and(
          eq(shortUrlModel.id, id),
          eq(shortUrlModel.userId, requestUser.id),
        ),
      });

      if (!shortUrl) {
        return reply
          .code(404)
          .send({ message: config.errorMessage.shortUrlNotFound });
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

      return reply.send(countryClicks);
    },
  );

  return done();
}
