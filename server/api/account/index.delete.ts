import { randomBytes } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import { log } from 'evlog';

import { EPlanType } from '~~/enums';
import {
  authSessionModel,
  db,
  fileModel,
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
import { getStripeClient } from '~~/server/utils/stripe';

const deleted = '[deleted]';

export default defineEventHandler(async (event) => {
  const {
    public: { cookies },
  } = useRuntimeConfig();
  const stripeClient = getStripeClient();

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
    profile?.profileImageId,
    profile?.coverImageId,
    ...links.map((link) => link.backgroundImageId),
    ...qrCodes.map((qrCode) => qrCode.imageId),
  ].filter((key): key is string => Boolean(key));

  await db.transaction(async (tx) => {
    const user = await db.query.userModel.findFirst({
      where: eq(userModel.id, id),
    });

    for (const imageKey of imageKeys) {
      try {
        const file = await tx.query.fileModel.findFirst({
          where: eq(fileModel.id, imageKey),
        });

        if (file) {
          await deleteFile(file.path);
          await tx.delete(fileModel).where(eq(fileModel.id, imageKey));
        }
      } catch (error) {
        log.info({
          message: `Failed deleting image from storage: ${imageKey}`,
          error,
        });
      }
    }

    await tx
      .update(userModel)
      .set({
        email: randomBytes(32).toString('hex'),
        password: randomBytes(32).toString('hex'),
        emailConfirmationCode: null,
        emailConfirmationCodeExpiresAt: null,
        emailConfirmedAt: null,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
        jwtSecret: randomBytes(20).toString('hex'),
        refreshTokenSecret: randomBytes(20).toString('hex'),
        plan: EPlanType.FREE,
        planStartedAt: null,
        planEndsAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        deletedAt: now,
      })
      .where(eq(userModel.id, id));

    await tx.delete(authSessionModel).where(eq(authSessionModel.userId, id));

    await tx
      .update(profileModel)
      .set({
        handle: null,
        name: deleted,
        profileImageId: null,
        coverImageId: null,
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
        backgroundImageId: null,
        titleColors: [],
        backgroundColors: [],
        deletedAt: now,
      })
      .where(eq(linkModel.userId, id));

    await tx
      .update(qrCodeModel)
      .set({
        title: deleted,
        imageId: null,
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

    if (user?.stripeSubscriptionId && stripeClient) {
      try {
        await stripeClient.subscriptions.cancel(user.stripeSubscriptionId, {
          prorate: false,
        });
      } catch (error) {
        log.info({
          message: `Failed cancelling subscription during account deletion: ${user.stripeSubscriptionId}`,
          error,
        });
      }
    }
  });

  deleteCookie(event, cookies.auth.name);
  deleteCookie(event, cookies.auth.refreshTokenName);
});
