import { log } from 'evlog';
import { randomBytes } from 'node:crypto';

import { CreateQrCodeYupSchema, type ICreateQrCodeYup } from '~~/dtos';
import { EQRCodeDataType } from '~~/enums';
import { db, qrCodeModel } from '~~/server/database';

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
    title: '',
    type: EQRCodeDataType.URL,
    image: undefined as ICreateQrCodeYup['image'],
    options: undefined as ICreateQrCodeYup['options'],
  } satisfies ICreateQrCodeYup;

  for (const part of parts) {
    if (!part.name || !part.data) {
      continue;
    }

    if (part.name === 'image') {
      const buf = Buffer.from(part.data);
      body.image = {
        buffer: buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength,
        ),
        mimetype: part.type || 'application/octet-stream',
        size: buf.length,
        originalname: part.filename || 'image',
      };
      continue;
    }

    if (part.name === 'options') {
      body.options = JSON.parse(part.data.toString());
      continue;
    }

    (body as Record<string, unknown>)[part.name] = part.data.toString();
  }

  const isValid = await CreateQrCodeYupSchema.isValid(body);

  if (!isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.fileRequired,
    });
  }

  let imageUrl: string | null = null;

  if (body.image?.buffer) {
    try {
      const image = await processImage(
        Buffer.from(body.image.buffer as ArrayBuffer),
        {
          width: 32,
          height: 32,
        },
      );

      imageUrl = await uploadFile(
        image,
        randomBytes(20).toString('hex'),
        'image/webp',
        'qr-code-images',
      );
    } catch (error) {
      log.error({ message: 'Error processing QR image', error });

      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.fileRequired,
      });
    }
  }

  await db.insert(qrCodeModel).values({
    userId,
    title: body.title,
    imageUrl: imageUrl ?? null,
    dataType: body.type,
    options: body.options,
  });
});
