import { and, eq, isNull } from 'drizzle-orm';

import {
  UrlShortUrlUpdateYupSchema,
  type IUrlShortUrlUpdateYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();
  const { id: userId } = await isAuthenticated(event);

  let body: IUrlShortUrlUpdateYup;

  try {
    body = await readValidatedBody(event, (body) =>
      UrlShortUrlUpdateYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const shortUrl = await db.query.shortUrlModel.findFirst({
    where: and(
      eq(shortUrlModel.id, body.id),
      eq(shortUrlModel.userId, userId),
      isNull(shortUrlModel.deletedAt),
    ),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.shortUrlNotFound,
    });
  }

  if (body.alias) {
    const existingAlias = await db.query.shortUrlModel.findFirst({
      where: and(
        eq(shortUrlModel.alias, body.alias),
        isNull(shortUrlModel.deletedAt),
      ),
    });

    if (existingAlias && existingAlias.id !== body.id) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
        message: errorMessages.aliasAlreadyExists,
      });
    }
  }

  await db
    .update(shortUrlModel)
    .set({
      ...(body.url && { url: body.url }),
      ...(body.alias && { alias: body.alias }),
      ...(body.title && { title: body.title }),
    })
    .where(eq(shortUrlModel.id, body.id));
});
