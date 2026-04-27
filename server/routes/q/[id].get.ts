import { UAParser } from '@ua-parser-js/pro-business';
import { and, eq, isNull } from 'drizzle-orm';
import type { H3Event } from 'h3';

import { EQRCodeDataType } from '~~/enums';
import { db, qrCodeModel, qrCodeScanModel } from '~~/server/database';

async function getQrCodeData(
  event: H3Event,
  dataType: EQRCodeDataType,
  options: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
): Promise<string | void> {
  const data = options.data as string;

  switch (dataType) {
    case EQRCodeDataType.URL:
      return sendRedirect(event, data, 302);
    case EQRCodeDataType.EMAIL:
      return sendRedirect(event, `mailto:${data}`, 302);
    case EQRCodeDataType.PHONE:
      return sendRedirect(event, `tel:${data}`, 302);
    case EQRCodeDataType.TEXT:
    default:
      setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8');
      return `<html><body><pre>${data
        .replaceAll('\n', '<br />')
        .replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;')}</pre></body></html>`;
  }
}

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const qrCodeId = getRouterParam(event, 'id');

  if (!qrCodeId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const qrCode = await db.query.qrCodeModel.findFirst({
    where: and(
      eq(qrCodeModel.id, qrCodeId),
      isNull(qrCodeModel.deletedAt),
    ),
  });

  if (!qrCode) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.qrCodeNotFound,
    });
  }

  const ip = getClientIp(event);
  const ipData = await fetchIpData(ip);

  const uaHeader =
    getRequestHeader(event, 'user-agent') ??
    event.node.req.headers['user-agent'] ??
    '';
  const result = new UAParser(uaHeader).getResult();

  await db.insert(qrCodeScanModel).values({
    qrCodeId: qrCode.id,
    userId: qrCode.userId,
    ipAddress: ipData.ipAddress,
    country: ipData.countryName,
    countryCode: ipData.countryCode,
    userAgent: result.ua,
    deviceType: result.device.type,
    browser: result.browser.name,
    os: result.os.name,
    referrer: getRequestHeader(event, 'referer') ?? null,
    scannedAt: new Date(),
  });

  return getQrCodeData(
    event,
    qrCode.dataType as EQRCodeDataType,
    qrCode.options as Record<string, unknown>,
  );
});
