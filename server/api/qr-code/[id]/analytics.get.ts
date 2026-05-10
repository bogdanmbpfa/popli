import { and, count, eq, gte, isNull, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';

import { EHttpStatusCode, EHttpStatusMessage, EPlanType } from '~~/enums';
import { db, qrCodeModel, qrCodeScanModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId, plan } = await isAuthenticated(event);

  const qrCodeId = getRouterParam(event, 'id');

  if (!qrCodeId) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const qrCode = await db.query.qrCodeModel.findFirst({
    where: and(
      eq(qrCodeModel.id, qrCodeId),
      eq(qrCodeModel.userId, userId),
      isNull(qrCodeModel.deletedAt),
    ),
  });

  if (!qrCode) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.qrCodeNotFound,
    });
  }

  const [
    totalScansResult,
    uniqueCountriesResult,
    countryDistribution,
    dailyScans,
  ] = await Promise.all([
    db
      .select({
        totalScans: count(qrCodeScanModel.id),
      })
      .from(qrCodeScanModel)
      .where(eq(qrCodeScanModel.qrCodeId, qrCodeId)),
    plan === EPlanType.FREE
      ? []
      : db
          .select({
            totalCountries: sql<number>`COUNT(DISTINCT ${qrCodeScanModel.countryCode})`,
          })
          .from(qrCodeScanModel)
          .where(eq(qrCodeScanModel.qrCodeId, qrCodeId)),
    plan === EPlanType.FREE
      ? []
      : db
          .select({
            country: qrCodeScanModel.country,
            countryCode: qrCodeScanModel.countryCode,
            totalScans: count(qrCodeScanModel.id),
          })
          .from(qrCodeScanModel)
          .where(eq(qrCodeScanModel.qrCodeId, qrCodeId))
          .groupBy(qrCodeScanModel.country, qrCodeScanModel.countryCode),
    plan === EPlanType.FREE
      ? []
      : db
          .select({
            date: sql<string>`to_char(scanned_at, 'YYYY-MM-DD')`,
            scans: count(qrCodeScanModel.id),
          })
          .from(qrCodeScanModel)
          .where(
            and(
              eq(qrCodeScanModel.qrCodeId, qrCodeId),
              gte(
                qrCodeScanModel.scannedAt,
                DateTime.now().minus({ days: 30 }).toJSDate(),
              ),
            ),
          )
          .groupBy(sql<string>`to_char(scanned_at, 'YYYY-MM-DD')`),
  ]);

  const totalScans = totalScansResult[0]?.totalScans ?? 0;
  const totalCountries = Number(uniqueCountriesResult[0]?.totalCountries ?? 0);
  const averageScansPerCountry =
    totalCountries > 0 ? totalScans / totalCountries : 0;

  return {
    totalScans,
    totalCountries,
    averageScansPerCountry: Math.round(averageScansPerCountry * 100) / 100,
    countryDistribution: countryDistribution.map((item) => ({
      country: item.country,
      countryCode: item.countryCode,
      totalScans: item.totalScans,
    })),
    dailyScans,
  };
});
