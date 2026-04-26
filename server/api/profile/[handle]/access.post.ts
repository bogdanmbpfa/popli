import { UAParser } from '@ua-parser-js/pro-business';
import { and, eq, isNull } from 'drizzle-orm';

import { db, profileAccessModel, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { public: { errorMessages } } = useRuntimeConfig();

  const handle = getRouterParam(event, 'handle');

  if (!handle) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const profile = await db.query.profileModel.findFirst({
    where: and(eq(profileModel.handle, handle), isNull(profileModel.deletedAt)),
  });

  if (!profile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.profileNotFound,
    });
  }

  const ipAddress = getClientIp(event);
  const ipData = await fetchIpData(ipAddress);

  const uaHeader = getRequestHeader(event, 'user-agent')!;
  const result = new UAParser(uaHeader).getResult();

  await db.insert(profileAccessModel).values({
    userId: profile.userId,
    ipAddress: ipData.ipAddress,
    country: ipData.countryName,
    countryCode: ipData.countryCode,
    userAgent: uaHeader,
    deviceType: result.device.type,
    browser: result.browser.name,
    os: result.os.name,
    referrer: getRequestHeader(event, 'referer') ?? null,
    accessedAt: new Date(),
  });
});
