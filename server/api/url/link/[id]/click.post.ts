import { UAParser } from '@ua-parser-js/pro-business';
import { and, eq, isNull } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, linkClickModel, linkModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const linkId = getRouterParam(event, 'id');

  if (!linkId) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const link = await db.query.linkModel.findFirst({
    where: and(eq(linkModel.id, linkId), isNull(linkModel.deletedAt)),
  });

  if (!link) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.linkNotFound,
    });
  }

  const ip = getClientIp(event);
  const ipData = await fetchIpData(ip);

  const uaHeader =
    getRequestHeader(event, 'user-agent') ??
    event.node.req.headers['user-agent'] ??
    '';
  const result = new UAParser(uaHeader).getResult();

  await db.insert(linkClickModel).values({
    linkId: link.id,
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

  return '';
});
