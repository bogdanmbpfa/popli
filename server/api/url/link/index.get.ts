import { and, asc, eq, isNull } from 'drizzle-orm';

import { db, linkModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { id: userId } = await isAuthenticated(event);

  const links = await db.query.linkModel.findMany({
    where: and(eq(linkModel.userId, userId), isNull(linkModel.deletedAt)),
    orderBy: [asc(linkModel.position)],
  });

  const linksDTO = await Promise.all(
    links.map(async (link) => {
      let backgroundImageUrl: string | null = null;

      if (link.backgroundImage) {
        backgroundImageUrl = await getFileUrl(link.backgroundImage);
      }

      return {
        id: link.id,
        userId: link.userId,
        type: link.type,
        platform: link.platform,
        url: link.url,
        title: link.title,
        backgroundImage: backgroundImageUrl,
        titleColors: link.titleColors as string[] | null,
        backgroundColors: link.backgroundColors as string[] | null,
        position: link.position,
        createdAt: link.createdAt.toISOString(),
        updatedAt: link.updatedAt.toISOString(),
        deletedAt: link.deletedAt?.toISOString() || null,
      };
    }),
  );

  return linksDTO;
});
