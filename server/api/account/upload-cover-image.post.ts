import { eq } from 'drizzle-orm';
import { log } from 'evlog';
import { randomBytes } from 'node:crypto';

import { db, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { public: { errorMessages } } = useRuntimeConfig();
  const { id } = await isAuthenticated(event);

  const parts = await readMultipartFormData(event);
  const filePart = parts?.find((p) => p.name === 'file');

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.fileRequired,
    });
  }

  let image: Buffer;

  try {
    image = await processImage(Buffer.from(filePart.data), {
      width: 432,
      height: 240,
    });
  } catch (error) {
    log.error({ message: 'Error processing cover image', error });

    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.fileRequired,
    });
  }

  const imageUrl = await uploadFile(
    image,
    randomBytes(20).toString('hex'),
    'image/webp',
    'cover-images',
  );

  await db
    .update(profileModel)
    .set({ coverImage: imageUrl })
    .where(eq(profileModel.userId, id));
});
