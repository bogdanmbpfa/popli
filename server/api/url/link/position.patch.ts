import { and, eq } from 'drizzle-orm';

import { type ILinkPositionYup, LinkPositionYupSchema } from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, linkModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const { links } = await readBody<{ links: ILinkPositionYup[] }>(event);

  for (const link of links) {
    const isValid = await LinkPositionYupSchema.isValid(link);

    if (!isValid) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
        message: errorMessages.validationError,
      });
    }
  }

  try {
    await db.transaction(async (tx) => {
      for (const link of links) {
        const existingLink = await tx.query.linkModel.findFirst({
          where: and(eq(linkModel.id, link.id), eq(linkModel.userId, userId)),
        });

        if (!existingLink) {
          throw createError({
            statusCode: EHttpStatusCode.NOT_FOUND,
            statusMessage: EHttpStatusMessage.NOT_FOUND,
            message: errorMessages.linkNotFound,
          });
        }

        await tx
          .update(linkModel)
          .set({ position: link.position })
          .where(eq(linkModel.id, link.id));
      }
    });
  } catch (error) {
    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});
