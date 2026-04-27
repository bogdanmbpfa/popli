import { db, fileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { key } = await readBody(event);

  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.fileRequired,
    });
  }

  try {
    const [file] = await db
      .insert(fileModel)
      .values({ path: key })
      .returning({ id: fileModel.id });

    return file!.id;
  } catch (error) {
    log.error({ message: 'Error saving file', error });

    throw createError({
      statusCode: 500,
      statusMessage: 'Error saving file',
      message: errorMessages.internalServerError,
    });
  }
});
