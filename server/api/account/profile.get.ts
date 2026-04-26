import { eq } from 'drizzle-orm';

import { db, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const { public: { errorMessages } } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  const profile = await db.query.profileModel.findFirst({
    where: eq(profileModel.userId, id),
  });

  if (!profile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.accountNotFound,
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
