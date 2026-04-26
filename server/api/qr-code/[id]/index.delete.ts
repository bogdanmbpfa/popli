import { and, eq, isNull } from 'drizzle-orm';

import { db, qrCodeModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

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
      eq(qrCodeModel.userId, userId),
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

  await db
    .update(qrCodeModel)
    .set({ deletedAt: new Date() })
    .where(eq(qrCodeModel.id, qrCodeId));
});
