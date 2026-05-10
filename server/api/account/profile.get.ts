import { eq } from 'drizzle-orm';

import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, fileModel, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  const profile = await db.query.profileModel.findFirst({
    where: eq(profileModel.userId, id),
  });

  if (!profile) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.accountNotFound,
    });
  }

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

  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.name,
    handle: profile.handle,
    profileImage: profileImageUrl,
    coverImage: coverImageUrl,
    bio: profile.bio,
    handleColor: profile.handleColor,
    bioColor: profile.bioColor,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    deletedAt: profile.deletedAt ? profile.deletedAt.toISOString() : null,
  };
});
