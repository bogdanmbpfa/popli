import { and, eq } from 'drizzle-orm';
import { log } from 'evlog';
import { randomBytes } from 'node:crypto';

import { CreateLinkYupSchema, type ICreateLinkYup } from '~~/dtos';
import { ELinkType } from '~~/enums';
import { db, linkModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const parts = await readMultipartFormData(event);

  if (!parts?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.fileRequired,
    });
  }

  const body = {
    id: undefined as ICreateLinkYup['id'],
    type: ELinkType.PRIMARY,
    platform: undefined as ICreateLinkYup['platform'],
    url: '',
    title: undefined as ICreateLinkYup['title'],
    backgroundImage: undefined as ICreateLinkYup['backgroundImage'],
    titleColors: undefined as ICreateLinkYup['titleColors'],
    backgroundColors: undefined as ICreateLinkYup['backgroundColors'],
    position: 0,
  } satisfies ICreateLinkYup;

  for (const part of parts) {
    if (!part.name || !part.data) {
      continue;
    }

    if (part.name === 'backgroundImage') {
      const buf = Buffer.from(part.data);
      body.backgroundImage = {
        buffer: buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength,
        ),
        mimetype: part.type || 'application/octet-stream',
        size: buf.length,
        originalname: part.filename || 'background',
      };
      continue;
    }

    if (part.name === 'titleColors' || part.name === 'backgroundColors') {
      const raw = part.data.toString();
      body[part.name] = raw ? JSON.parse(raw) : [];
      continue;
    }

    if (part.name === 'position') {
      body[part.name] = Number(part.data.toString());
      continue;
    }

    (body as Record<string, unknown>)[part.name] = part.data.toString();
  }

  const isValid = await CreateLinkYupSchema.isValid(body);

  try {
    await CreateLinkYupSchema.validate(body);
  } catch (error) {
    console.log('validation error', error);
  }

  if (!isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  await db.transaction(async (tx) => {
    if (body.id) {
      const existingLink = await tx.query.linkModel.findFirst({
        where: and(eq(linkModel.userId, userId), eq(linkModel.id, body.id)),
      });

      if (existingLink) {
        if (existingLink.backgroundImage) {
          try {
            await deleteFile(existingLink.backgroundImage);
          } catch (error) {
            log.info({
              message: 'Failed deleting old link background',
              error,
            });
          }
        }

        await tx.delete(linkModel).where(eq(linkModel.id, existingLink.id));
      }
    }

    let backgroundImageUrl: string | null = null;

    if (body.backgroundImage?.buffer) {
      try {
        const image = await processImage(
          Buffer.from(body.backgroundImage.buffer as ArrayBuffer),
          {
            width: 360,
            height: 120,
          },
        );

        backgroundImageUrl = await uploadFile(
          image,
          randomBytes(20).toString('hex'),
          'image/webp',
          'link-background-images',
        );
      } catch (error) {
        log.error({ message: 'Error processing background image', error });

        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: errorMessages.fileRequired,
        });
      }
    }

    await tx.insert(linkModel).values({
      ...(body.id ? { id: body.id } : {}),
      userId,
      type: body.type,
      platform: body.platform || null,
      url: body.url,
      title: body.title ?? null,
      backgroundImage: backgroundImageUrl,
      titleColors: body.titleColors ?? [],
      backgroundColors: body.backgroundColors ?? [],
      position: body.position,
    });
  });
});
