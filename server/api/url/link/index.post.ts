import { and, eq } from 'drizzle-orm';

import { CreateLinkYupSchema, type ICreateLinkYup } from '~~/dtos';
import { db, fileModel, linkModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  let body: ICreateLinkYup;

  try {
    body = await readValidatedBody(event, (body) => CreateLinkYupSchema.validate(body));
  } catch {
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
        if (existingLink.backgroundImageId) {
          const file = await db.query.fileModel.findFirst({
            where: eq(fileModel.id, existingLink.backgroundImageId),
          });

          await deleteFile(file!.path);
          await tx.delete(fileModel).where(eq(fileModel.id, existingLink.backgroundImageId));
        }

        await tx.delete(linkModel).where(eq(linkModel.id, existingLink.id));
      }
    }

    await tx.insert(linkModel).values({
      ...(body.id ? { id: body.id } : {}),
      userId,
      type: body.type,
      platform: body.platform || null,
      url: body.url,
      title: body.title ?? null,
      backgroundImageId: body.backgroundImageId ?? null,
      titleColors: body.titleColors ?? [],
      backgroundColors: body.backgroundColors ?? [],
      position: body.position,
    });
  });
});
