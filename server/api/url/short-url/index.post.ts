import { eq, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

import {
  UrlCreateShortUrlYupSchema,
  type IUrlCreateShortUrlYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage, EPlanType } from '~~/enums';
import { db, shortUrlModel, usageCounterModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages, freePlan: { shortUrlLimit } },
  } = useRuntimeConfig();

  const { id: userId, plan } = await isAuthenticated(event);

  if (plan === EPlanType.FREE) {
    const [result] = await db
      .select({ total: usageCounterModel.shortUrlCount })
      .from(usageCounterModel)
      .where(eq(usageCounterModel.userId, userId));

    if ((result?.total ?? 0) >= shortUrlLimit) {
      throw createError({
        statusCode: EHttpStatusCode.PAYMENT_REQUIRED,
        statusMessage: EHttpStatusMessage.PAYMENT_REQUIRED,
        message: errorMessages.freePlanLimitReached,
      });
    }
  }

  let body: IUrlCreateShortUrlYup;

  try {
    body = await readValidatedBody(event, (body) =>
      UrlCreateShortUrlYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  if (body.alias) {
    const existingAlias = await db.query.shortUrlModel.findFirst({
      where: eq(shortUrlModel.alias, body.alias),
    });

    if (existingAlias) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
        message: errorMessages.aliasAlreadyExists,
      });
    }
  }

  let shortCode = randomBytes(4).toString('hex');
  let shortCodeUnique = false;

  while (!shortCodeUnique) {
    const existingShortCode = await db.query.shortUrlModel.findFirst({
      where: eq(shortUrlModel.shortCode, shortCode),
    });

    if (!existingShortCode) {
      shortCodeUnique = true;
    } else {
      shortCode = randomBytes(4).toString('hex');
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(shortUrlModel).values({
      userId,
      url: body.url,
      shortCode,
      alias: body.alias || null,
      title: body.title,
    });

    await tx
      .insert(usageCounterModel)
      .values({
        userId,
        shortUrlCount: 1,
      })
      .onConflictDoUpdate({
        target: [usageCounterModel.userId],
        set: {
          shortUrlCount: sql`${usageCounterModel.shortUrlCount} + 1`,
          updatedAt: new Date(),
        },
      });
  });
});
