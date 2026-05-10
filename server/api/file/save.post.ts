import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, fileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { key } = await readBody(event);

  if (!key) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
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
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});
