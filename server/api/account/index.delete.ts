import { eq, inArray } from 'drizzle-orm';
import { log } from 'evlog';

import {
  authSessionModel,
  db,
  linkClickModel,
  linkModel,
  profileAccessModel,
  profileModel,
  qrCodeModel,
  qrCodeScanModel,
  shortUrlClickModel,
  shortUrlModel,
  userModel,
} from '~~/server/database';

const deleted = '[deleted]';

export default defineEventHandler(async (event) => {
  const {
    public: { cookies },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  const now = new Date();
  const anonymizedIp = '0.0.0.0';

  const profile = await db.query.profileModel.findFirst({
    where: eq(profileModel.userId, id),
  });
  const links = await db.query.linkModel.findMany({
    where: eq(linkModel.userId, id),
  });
  const qrCodes = await db.query.qrCodeModel.findMany({
    where: eq(qrCodeModel.userId, id),
  });
  const shortUrls = await db.query.shortUrlModel.findMany({
    where: eq(shortUrlModel.userId, id),
  });

  const imageKeys = [
    profile?.profileImage,
    profile?.coverImage,
    ...links.map((link) => link.backgroundImage),
    ...qrCodes.map((qrCode) => qrCode.imageUrl),
  ].filter((key): key is string => Boolean(key));

  for (const imageKey of imageKeys) {
    try {
      await deleteFile(imageKey);
    } catch (error) {
      log.info({
        message: `Failed deleting image from storage: ${imageKey}`,
        error,
      });
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(userModel)
      .set({
        email: deleted,
        password: deleted,
        emailConfirmationCode: null,
        emailConfirmationCodeExpiresAt: null,
        emailConfirmedAt: null,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
        jwtSecret: deleted,
        refreshTokenSecret: deleted,
        deletedAt: now,
      })
      .where(eq(userModel.id, id));

    await tx.delete(authSessionModel).where(eq(authSessionModel.userId, id));

    await tx
      .update(profileModel)
      .set({
        handle: null,
        name: deleted,
        profileImage: null,
        coverImage: null,
        handleColor: null,
        bio: null,
        bioColor: null,
        deletedAt: now,
      })
      .where(eq(profileModel.userId, id));

    await tx
      .update(linkModel)
      .set({
        url: deleted,
        title: deleted,
        backgroundImage: null,
        titleColors: [],
        backgroundColors: [],
        deletedAt: now,
      })
      .where(eq(linkModel.userId, id));

    await tx
      .update(qrCodeModel)
      .set({
        title: deleted,
        imageUrl: null,
        options: {},
        deletedAt: now,
      })
      .where(eq(qrCodeModel.userId, id));

    await tx
      .update(shortUrlModel)
      .set({
        url: deleted,
        alias: null,
        title: deleted,
        isActive: false,
        deletedAt: now,
      })
      .where(eq(shortUrlModel.userId, id));

    await tx
      .update(profileAccessModel)
      .set({
        ipAddress: anonymizedIp,
      })
      .where(eq(profileAccessModel.userId, id));

    await tx
      .update(qrCodeScanModel)
      .set({
        ipAddress: anonymizedIp,
        deletedAt: now,
      })
      .where(eq(qrCodeScanModel.userId, id));

    if (links.length) {
      await tx
        .update(linkClickModel)
        .set({
          ipAddress: anonymizedIp,
          deletedAt: now,
        })
        .where(
          inArray(
            linkClickModel.linkId,
            links.map((link) => link.id),
          ),
        );
    }

    if (shortUrls.length) {
      await tx
        .update(shortUrlClickModel)
        .set({
          ipAddress: anonymizedIp,
          deletedAt: now,
        })
        .where(
          inArray(
            shortUrlClickModel.shortUrlId,
            shortUrls.map((shortUrl) => shortUrl.id),
          ),
        );
    }
  });

  deleteCookie(event, cookies.auth.name);
  deleteCookie(event, cookies.auth.refreshTokenName);
});
