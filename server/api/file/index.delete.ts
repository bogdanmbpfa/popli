import { eq } from 'drizzle-orm';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, fileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  await isAuthenticated(event);

  const fileIds = await readBody<string[]>(event);

  if (!fileIds || !fileIds.length) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  try {
    await db.transaction(async (tx) => {
      for (const fileId of fileIds) {
        const file = await tx.query.fileModel.findFirst({
          where: eq(fileModel.id, fileId),
        });

        if (file) {
          await deleteFile(file.path);
          await tx.delete(fileModel).where(eq(fileModel.id, fileId));
        }
      }
    });
  } catch (error) {
    log.error({ message: 'Error deleting files', error });

    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});