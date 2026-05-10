import { eq, sql } from 'drizzle-orm';

import { CreateQrCodeYupSchema, type ICreateQrCodeYup } from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage, EPlanType } from '~~/enums';
import { db, qrCodeModel, usageCounterModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages, freePlan: { qrCodeLimit } },
  } = useRuntimeConfig();

  const { id: userId, plan } = await isAuthenticated(event);

  if (plan === EPlanType.FREE) {
    const [result] = await db
      .select({ total: usageCounterModel.qrCodeCount })
      .from(usageCounterModel)
      .where(eq(usageCounterModel.userId, userId));

    if ((result?.total ?? 0) >= qrCodeLimit) {
      throw createError({
        statusCode: EHttpStatusCode.PAYMENT_REQUIRED,
        statusMessage: EHttpStatusMessage.PAYMENT_REQUIRED,
        message: errorMessages.freePlanLimitReached,
      });
    }
  }

  let body: ICreateQrCodeYup;

  try {
    body = await readValidatedBody(event, (body) =>
      CreateQrCodeYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  await db.transaction(async (tx) => {
    await tx.insert(qrCodeModel).values({
      userId,
      title: body.title,
      imageId: body.imageId ?? null,
      dataType: body.type,
      options: body.options,
    });

    await tx
      .insert(usageCounterModel)
      .values({
        userId,
        qrCodeCount: 1,
      })
      .onConflictDoUpdate({
        target: [usageCounterModel.userId],
        set: {
          qrCodeCount: sql`${usageCounterModel.qrCodeCount} + 1`,
          updatedAt: new Date(),
        },
      });
  });
});
