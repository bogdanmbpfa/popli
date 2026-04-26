import { and, eq } from 'drizzle-orm';

import {
  UrlShortUrlUpdateYupSchema,
  type IUrlShortUrlUpdateYup,
} from '~~/dtos';
import { db, shortUrlModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();
  const { id: userId } = await isAuthenticated(event);

  let body: IUrlShortUrlUpdateYup;

  try {
    body = await readValidatedBody(event, (body) => UrlShortUrlUpdateYupSchema.validate(body));
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const shortUrl = await db.query.shortUrlModel.findFirst({
    where: and(eq(shortUrlModel.id, body.id), eq(shortUrlModel.userId, userId)),
  });

  if (!shortUrl) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.shortUrlNotFound,
    });
  }

  if (body.alias) {
    const existingAlias = await db.query.shortUrlModel.findFirst({
      where: eq(shortUrlModel.alias, body.alias),
    });

    if (existingAlias && existingAlias.id !== body.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
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
