import { and, asc, eq, isNull } from 'drizzle-orm';

import { ELinkType } from '~~/enums';
import { db, linkModel, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const handle = getRouterParam(event, 'handle');

  if (!handle) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const profile = await db.query.profileModel.findFirst({
    where: and(eq(profileModel.handle, handle), isNull(profileModel.deletedAt)),
  });

  if (!profile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.profileNotFound,
    });
  }

  let profileImageUrl: string | null = null;

  if (profile.profileImage) {
    profileImageUrl = await getFileUrl(profile.profileImage);
  }

  let coverImageUrl: string | null = null;

  if (profile.coverImage) {
    coverImageUrl = await getFileUrl(profile.coverImage);
  }

  const links = await db.query.linkModel.findMany({
    where: and(
      eq(linkModel.userId, profile.userId),
      isNull(linkModel.deletedAt),
    ),
    orderBy: [asc(linkModel.position)],
  });

  const linkDtos = await Promise.all(
    links.map(async (link) => {
      let backgroundImageUrl: string | null = null;

      if (link.backgroundImage) {
        backgroundImageUrl = await getFileUrl(link.backgroundImage);
      }

      return {
        id: link.id,
        type: link.type,
        platform: link.platform,
        url: link.url,
        title: link.title,
        backgroundImage: backgroundImageUrl,
        titleColors: link.titleColors as string[] | null,
        backgroundColors: link.backgroundColors as string[] | null,
        position: link.position,
      };
    }),
  );

  return {
    name: profile.name,
    handle: profile.handle,
    handleColor: profile.handleColor,
    profileImage: profileImageUrl,
    coverImage: coverImageUrl,
    bio: profile.bio,
    bioColor: profile.bioColor,
    primaryLinks: linkDtos.filter((link) => link.type === ELinkType.PRIMARY),
    secondaryLinks: linkDtos.filter(
      (link) => link.type === ELinkType.SECONDARY,
    ),
  };
});
