import { and, eq, sql } from 'drizzle-orm';

import { CreateLinkYupSchema, type ICreateLinkYup } from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage, ELinkType } from '~~/enums';
import {
  db,
  fileModel,
  linkModel,
  usageCounterModel,
} from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: {
      errorMessages,
      freePlan: { featuredLinksLimit, secondaryLinksLimit },
    },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);
  let body: ICreateLinkYup;

  try {
    body = await readValidatedBody(event, (body) =>
      CreateLinkYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const links = await db.query.linkModel.findMany({
    where: eq(linkModel.userId, userId),
  });
  const primaryLinksCount = links.filter(
    (link) => link.type === ELinkType.PRIMARY,
  ).length;
  const secondaryLinksCount = links.filter(
    (link) => link.type === ELinkType.SECONDARY,
  ).length;

  if (
    !body.id &&
    (primaryLinksCount > featuredLinksLimit ||
      secondaryLinksCount > secondaryLinksLimit)
  ) {
    throw createError({
      statusCode: EHttpStatusCode.PAYMENT_REQUIRED,
      statusMessage: EHttpStatusMessage.PAYMENT_REQUIRED,
      message: errorMessages.freePlanLimitReached,
    });
  }

  try {
    await db.transaction(async (tx) => {
      if (body.id) {
        const existingLink = await tx.query.linkModel.findFirst({
          where: and(eq(linkModel.userId, userId), eq(linkModel.id, body.id)),
        });

        if (existingLink) {
          if (
            body.backgroundImageId &&
            existingLink.backgroundImageId &&
            body.backgroundImageId !== existingLink.backgroundImageId
          ) {
            const file = await db.query.fileModel.findFirst({
              where: eq(fileModel.id, existingLink.backgroundImageId),
            });

            await deleteFile(file!.path);
            await tx
              .delete(fileModel)
              .where(eq(fileModel.id, existingLink.backgroundImageId));
          }

          await tx
            .update(linkModel)
            .set({
              ...(body.platform ? { platform: body.platform } : {}),
              ...(body.title ? { title: body.title } : {}),
              ...(body.url ? { url: body.url } : {}),
              ...(body.backgroundImageId
                ? { backgroundImageId: body.backgroundImageId }
                : {}),
              ...(body.titleColors ? { titleColors: body.titleColors } : {}),
              ...(body.backgroundColors
                ? { backgroundColors: body.backgroundColors }
                : {}),
            })
            .where(eq(linkModel.id, existingLink.id));
        }

        return Promise.resolve();
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

      await tx
        .insert(usageCounterModel)
        .values({
          userId,
          primaryLinkCount: body.type === ELinkType.PRIMARY ? 1 : 0,
          secondaryLinkCount: body.type === ELinkType.SECONDARY ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [usageCounterModel.userId],
          set: {
            primaryLinkCount:
              body.type === ELinkType.PRIMARY
                ? sql`${usageCounterModel.primaryLinkCount} + 1`
                : usageCounterModel.primaryLinkCount,
            secondaryLinkCount:
              body.type === ELinkType.SECONDARY
                ? sql`${usageCounterModel.secondaryLinkCount} + 1`
                : usageCounterModel.secondaryLinkCount,
            updatedAt: new Date(),
          },
        });
    });
  } catch (error) {
    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});
