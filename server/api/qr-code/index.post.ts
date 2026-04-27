import { CreateQrCodeYupSchema, type ICreateQrCodeYup } from '~~/dtos';
import { db, qrCodeModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  let body: ICreateQrCodeYup;

  try {
    body = await readValidatedBody(event, (body) => CreateQrCodeYupSchema.validate(body));
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  await db.insert(qrCodeModel).values({
    userId,
    title: body.title,
    imageId: body.imageId ?? null,
    dataType: body.type,
    options: body.options,
  });
});
