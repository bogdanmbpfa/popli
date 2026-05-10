import { and, eq, gte, sql } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage, ELinkType } from '~~/enums';
import { db, linkModel, usageCounterModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const linkId = getRouterParam(event, 'id');

  if (!linkId) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  try {
    await db.transaction(async (tx) => {
      const link = await tx.query.linkModel.findFirst({
        where: and(eq(linkModel.id, linkId), eq(linkModel.userId, userId)),
      });

      if (!link) return;

      await tx
        .update(linkModel)
        .set({
          position: sql`${linkModel.position} - 1`,
        })
        .where(
          and(
            eq(linkModel.userId, userId),
            eq(linkModel.type, link.type),
            gte(linkModel.position, link.position),
          ),
        );

      await tx.delete(linkModel).where(eq(linkModel.id, linkId));

      await tx
        .insert(usageCounterModel)
        .values({
          userId,
          primaryLinkCount: -1,
          secondaryLinkCount: -1,
        })
        .onConflictDoUpdate({
          target: [usageCounterModel.userId],
          set: {
            primaryLinkCount:
              link.type === ELinkType.PRIMARY
                ? sql`${usageCounterModel.primaryLinkCount} - 1`
                : usageCounterModel.primaryLinkCount,
            secondaryLinkCount:
              link.type === ELinkType.SECONDARY
                ? sql`${usageCounterModel.secondaryLinkCount} - 1`
                : usageCounterModel.secondaryLinkCount,
          },
        });
    });
  } catch (error) {
    log.error({
      message: `Failed deleting link: ${linkId}`,
      error,
    });

    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});
