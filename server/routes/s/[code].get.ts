import { UAParser } from '@ua-parser-js/pro-business';
import { eq, or } from 'drizzle-orm';

import { db, shortUrlClickModel, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const shortUrlCode = getRouterParam(event, 'code');

  if (!shortUrlCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const shortUrl = await db.query.shortUrlModel.findFirst({
    where: or(
      eq(shortUrlModel.shortCode, shortUrlCode),
      eq(shortUrlModel.alias, shortUrlCode),
    ),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.shortUrlNotFound,
    });
  }

  const ip = getClientIp(event);
  const ipData = await fetchIpData(ip);

  const uaHeader =
    getRequestHeader(event, 'user-agent') ??
    event.node.req.headers['user-agent'] ??
    '';
  const result = new UAParser(uaHeader).getResult();

  await db.insert(shortUrlClickModel).values({
    shortUrlId: shortUrl.id,
    ipAddress: ipData.ipAddress,
    country: ipData.countryName,
    countryCode: ipData.countryCode,
    userAgent: result.ua,
    deviceType: result.device.type,
    browser: result.browser.name,
    os: result.os.name,
    referrer: getRequestHeader(event, 'referer') ?? null,
    clickedAt: new Date(),
  });

  return sendRedirect(event, shortUrl.url, 302);
});
