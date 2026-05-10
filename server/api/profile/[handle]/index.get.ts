import { and, asc, eq, isNull } from 'drizzle-orm';

import {
  EHttpStatusCode,
  EHttpStatusMessage,
  ELinkType,
  EPlanType,
} from '~~/enums';
import {
  db,
  fileModel,
  linkModel,
  profileModel,
  userModel,
} from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const handle = getRouterParam(event, 'handle');

  if (!handle) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const profile = await db.query.profileModel.findFirst({
    where: and(eq(profileModel.handle, handle), isNull(profileModel.deletedAt)),
  });

  if (!profile) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.profileNotFound,
    });
  }

  const owner = await db.query.userModel.findFirst({
    where: and(eq(userModel.id, profile.userId), isNull(userModel.deletedAt)),
    columns: { plan: true },
  });

  const isPro = owner?.plan === EPlanType.PRO;

  let profileImageUrl: string | null = null;

  if (profile.profileImageId) {
    const file = await db.query.fileModel.findFirst({
      where: eq(fileModel.id, profile.profileImageId),
    });

    if (file) {
      profileImageUrl = await getFileUrl(file.path);
    }
  }

  let coverImageUrl: string | null = null;

  if (profile.coverImageId) {
    const file = await db.query.fileModel.findFirst({
      where: eq(fileModel.id, profile.coverImageId),
    });

    if (file) {
      coverImageUrl = await getFileUrl(file.path);
    }
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

      if (link.backgroundImageId) {
        const file = await db.query.fileModel.findFirst({
          where: eq(fileModel.id, link.backgroundImageId),
        });

        if (file) {
          backgroundImageUrl = await getFileUrl(file.path);
        }
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
    isPro,
  };
});
