import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';

import {
  db,
  fileModel,
  qrCodeModel,
  qrCodeScanModel,
} from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { siteUrl },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const qrCodes = await db.query.qrCodeModel.findMany({
    where: and(eq(qrCodeModel.userId, userId), isNull(qrCodeModel.deletedAt)),
    orderBy: [desc(qrCodeModel.createdAt)],
  });

  const totalScans =
    qrCodes.length === 0
      ? []
      : await db
          .select({
            qrCodeId: qrCodeScanModel.qrCodeId,
            totalScans: count(qrCodeScanModel.id),
          })
          .from(qrCodeScanModel)
          .where(
            and(
              inArray(
                qrCodeScanModel.qrCodeId,
                qrCodes.map((q) => q.id),
              ),
              isNull(qrCodeScanModel.deletedAt),
            ),
          )
          .groupBy(qrCodeScanModel.qrCodeId);

  const totalScansMap = new Map(
    totalScans.map((row) => [row.qrCodeId, row.totalScans]),
  );

  const qrCodesDTO = await Promise.all(
    qrCodes.map(async (qrCode) => {
      let imageUrl: string | null = null;

      if (qrCode.imageId) {
        const file = await db.query.fileModel.findFirst({
          where: eq(fileModel.id, qrCode.imageId),
        });

        if (file) {
          imageUrl = await getFileUrl(file.path);
        }
      }

      return {
        id: qrCode.id,
        userId: qrCode.userId,
        title: qrCode.title,
        url: `${siteUrl}/q/${qrCode.id}`,
        imageUrl,
        dataType: qrCode.dataType,
        options: qrCode.options,
        totalScans: totalScansMap.get(qrCode.id) ?? 0,
        createdAt: qrCode.createdAt.toISOString(),
        updatedAt: qrCode.updatedAt.toISOString(),
        deletedAt: qrCode.deletedAt ? qrCode.deletedAt.toISOString() : null,
      };
    }),
  );

  return qrCodesDTO;
});
