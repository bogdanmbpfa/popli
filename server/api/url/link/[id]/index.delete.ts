import { and, eq } from 'drizzle-orm';

import { db, linkModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id: userId } = await isAuthenticated(event);

  const linkId = getRouterParam(event, 'id');

  if (!linkId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const link = await db.query.linkModel.findFirst({
    where: and(eq(linkModel.id, linkId), eq(linkModel.userId, userId)),
  });

  if (!link) return;

  await db.delete(linkModel).where(eq(linkModel.id, linkId));
});
