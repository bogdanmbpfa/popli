import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

import {
  UrlCreateShortUrlYupSchema,
  type IUrlCreateShortUrlYup,
} from '~~/dtos';
import { db, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();
  const { id: userId } = await isAuthenticated(event);

  let body: IUrlCreateShortUrlYup;

  try {
    body = await readValidatedBody(event, (body) =>
      UrlCreateShortUrlYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  if (body.alias) {
    const existingAlias = await db.query.shortUrlModel.findFirst({
      where: eq(shortUrlModel.alias, body.alias),
    });

    if (existingAlias) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
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

  await db.insert(shortUrlModel).values({
    userId,
    url: body.url,
    shortCode,
    alias: body.alias || null,
    title: body.title,
  });
});
