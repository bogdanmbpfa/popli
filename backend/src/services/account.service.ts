import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { eq, inArray } from 'drizzle-orm';

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
} from '@database';
import {
  AccountChangePasswordDTO,
  AccountDTO,
  AccountProfileDTO,
  AccountRequestEmailUpdateDTO,
  AccountUpdateEmailDTO,
  AccountUpdateProfileDTO,
  AccountVerifyEmailDTO,
  FileDTO,
} from '@resources';
import {
  EmailUtilityService,
  generateRandomNumericString,
  processImage,
  StorageUtility,
} from '@utilities';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly emailUtilityService: EmailUtilityService,
    private readonly storageUtility: StorageUtility,
  ) {}

  async getAccount(id: string): Promise<AccountDTO> {
    const account = await db.query.userModel.findFirst({
      where: eq(userModel.id, id),
    });

    if (!account) {
      throw new NotFoundException(
        this.configService.get('errorMessage.accountNotFound'),
      );
    }

    return {
      id: account.id,
      email: account.email,
      emailConfirmedAt: account.emailConfirmedAt
        ? account.emailConfirmedAt.toISOString()
        : null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    } as AccountDTO;
  }

  async requestEmailVerify(account: AccountDTO): Promise<void> {
    if (account.emailConfirmedAt) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailAlreadyConfirmed'),
      );
    }

    const code = generateRandomNumericString(6);

    await db
      .update(userModel)
      .set({
        emailConfirmationCode: code,
        emailConfirmationCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      })
      .where(eq(userModel.id, account.id));

    await this.emailUtilityService.sendEmail(
      account.email,
      this.configService.get('brevo.templates.emailVerification') as number,
      { code },
    );
  }

  async verifyEmail(
    account: AccountDTO,
    dto: AccountVerifyEmailDTO,
  ): Promise<void> {
    if (account.emailConfirmedAt) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailAlreadyConfirmed'),
      );
    }

    if (dto.code !== account.emailConfirmationCode) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCode'),
      );
    }

    if (
      account.emailConfirmationCodeExpiresAt &&
      new Date(account.emailConfirmationCodeExpiresAt).getTime() <
        new Date().getTime()
    ) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailConfirmationCodeExpired'),
      );
    }

    await db
      .update(userModel)
      .set({
        emailConfirmationCode: null,
        emailConfirmationCodeExpiresAt: null,
        emailConfirmedAt: new Date(),
      })
      .where(eq(userModel.id, account.id));
  }

  async uploadProfileImage(account: AccountDTO, dto: FileDTO): Promise<void> {
    if (!dto.buffer || !dto.mimetype || !dto.size || !dto.originalname) {
      throw new BadRequestException(
        this.configService.get('errorMessage.fileRequired'),
      );
    }

    let image: Buffer;

    try {
      image = await processImage(dto.buffer, { width: 44, height: 44 });
    } catch (error) {
      this.logger.error('Error processing image', error);

      throw new BadRequestException(
        this.configService.get('errorMessage.fileRequired'),
      );
    }

    const imageUrl = await this.storageUtility.upload(
      image,
      randomBytes(20).toString('hex'),
      'image/webp',
      'profile-images',
    );

    await db
      .update(profileModel)
      .set({ profileImage: imageUrl })
      .where(eq(profileModel.userId, account.id));
  }

  async uploadCoverImage(account: AccountDTO, dto: FileDTO): Promise<void> {
    if (!dto.buffer || !dto.mimetype || !dto.size || !dto.originalname) {
      throw new BadRequestException(
        this.configService.get('errorMessage.fileRequired'),
      );
    }

    let image: Buffer;

    try {
      image = await processImage(dto.buffer, { width: 432, height: 240 });
    } catch (error) {
      this.logger.error('Error processing image', error);

      throw new BadRequestException(
        this.configService.get('errorMessage.fileRequired'),
      );
    }

    const imageUrl = await this.storageUtility.upload(
      image,
      randomBytes(20).toString('hex'),
      'image/webp',
      'cover-images',
    );

    await db
      .update(profileModel)
      .set({ coverImage: imageUrl })
      .where(eq(profileModel.userId, account.id));
  }

  async changePassword(
    id: string,
    dto: AccountChangePasswordDTO,
  ): Promise<void> {
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    const account = await db.query.userModel.findFirst({
      where: eq(userModel.id, id),
    });

    if (!account) {
      throw new NotFoundException(
        this.configService.get('errorMessage.accountNotFound'),
      );
    }

    const isPasswordValid = await verify(dto.currentPassword, account.password);

    if (!isPasswordValid) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    const isSamePassword = await verify(dto.newPassword, account.password);

    if (isSamePassword) {
      throw new BadRequestException(
        this.configService.get('errorMessage.passwordSameAsCurrent'),
      );
    }

    await db
      .update(userModel)
      .set({ password: await hash(dto.newPassword) })
      .where(eq(userModel.id, id));
  }

  async checkHandle(handle: string): Promise<void> {
    const profile = await db.query.profileModel.findFirst({
      where: eq(profileModel.handle, handle),
    });

    if (profile) {
      throw new BadRequestException(
        this.configService.get('errorMessage.handleAlreadyExists'),
      );
    }
  }

  async checkEmail(email: string): Promise<void> {
    const account = await db.query.userModel.findFirst({
      where: eq(userModel.email, email),
    });

    if (account) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailAlreadyExists'),
      );
    }
  }

  async updateProfile(
    account: AccountDTO,
    dto: AccountUpdateProfileDTO,
  ): Promise<void> {
    await db
      .update(profileModel)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.handle && { handle: dto.handle }),
        ...(dto.handleColor && { handleColor: dto.handleColor }),
        ...(dto.bio && { bio: dto.bio }),
        ...(dto.bioColor && { bioColor: dto.bioColor }),
      })
      .where(eq(profileModel.userId, account.id));
  }

  async requestEmailUpdate(
    account: AccountDTO,
    dto: AccountRequestEmailUpdateDTO,
  ): Promise<void> {
    if (!dto.email) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailRequired'),
      );
    }

    const accountWithSameEmail = await db.query.userModel.findFirst({
      where: eq(userModel.email, dto.email),
    });

    if (accountWithSameEmail) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailAlreadyExists'),
      );
    }

    const code = generateRandomNumericString(6);

    await db
      .update(userModel)
      .set({
        emailConfirmationCode: code,
        emailConfirmationCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      })
      .where(eq(userModel.id, account.id));

    await this.emailUtilityService.sendEmail(
      dto.email,
      this.configService.get('brevo.templates.emailUpdate') as number,
      { code },
    );
  }

  async updateEmail(
    account: AccountDTO,
    dto: AccountUpdateEmailDTO,
  ): Promise<void> {
    if (account.email === dto.email) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailSameAsCurrent'),
      );
    }

    if (dto.code !== account.emailConfirmationCode) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCode'),
      );
    }

    if (
      account.emailConfirmationCodeExpiresAt &&
      new Date(account.emailConfirmationCodeExpiresAt).getTime() <
        new Date().getTime()
    ) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailConfirmationCodeExpired'),
      );
    }

    await db
      .update(userModel)
      .set({
        email: dto.email,
        emailConfirmedAt: new Date(),
        emailConfirmationCode: null,
        emailConfirmationCodeExpiresAt: null,
      })
      .where(eq(userModel.id, account.id));
  }

  async deleteAccount(account: AccountDTO): Promise<void> {
    const now = new Date();
    const anonymizedToken = randomBytes(12).toString('hex');
    const anonymizedEmail = `deleted+${account.id}@popli.invalid`;
    const anonymizedPassword = await hash(
      `deleted-account-${account.id}-${randomBytes(16).toString('hex')}`,
    );
    const anonymizedIp = '0.0.0.0';
    const anonymizedText = '[deleted]';

    const profile = await db.query.profileModel.findFirst({
      where: eq(profileModel.userId, account.id),
    });
    const links = await db.query.linkModel.findMany({
      where: eq(linkModel.userId, account.id),
    });
    const qrCodes = await db.query.qrCodeModel.findMany({
      where: eq(qrCodeModel.userId, account.id),
    });
    const shortUrls = await db.query.shortUrlModel.findMany({
      where: eq(shortUrlModel.userId, account.id),
    });

    const imageKeys = [
      profile?.profileImage,
      profile?.coverImage,
      ...links.map((link) => link.backgroundImage),
      ...qrCodes.map((qrCode) => qrCode.imageUrl),
    ].filter((key): key is string => Boolean(key));

    for (const imageKey of imageKeys) {
      try {
        await this.storageUtility.delete(imageKey);
      } catch (error) {
        this.logger.warn(
          `Failed deleting image from storage: ${imageKey}`,
          error,
        );
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .update(userModel)
        .set({
          email: anonymizedEmail,
          password: anonymizedPassword,
          emailConfirmationCode: null,
          emailConfirmationCodeExpiresAt: null,
          emailConfirmedAt: null,
          passwordResetCode: null,
          passwordResetCodeExpiresAt: null,
          jwtSecret: randomBytes(20).toString('hex'),
          refreshTokenSecret: randomBytes(20).toString('hex'),
          deletedAt: now,
        })
        .where(eq(userModel.id, account.id));

      await tx
        .delete(authSessionModel)
        .where(eq(authSessionModel.userId, account.id));

      await tx
        .update(profileModel)
        .set({
          handle: null,
          name: anonymizedText,
          profileImage: null,
          coverImage: null,
          handleColor: null,
          bio: null,
          bioColor: null,
          deletedAt: now,
        })
        .where(eq(profileModel.userId, account.id));

      await tx
        .update(linkModel)
        .set({
          url: `https://deleted.popli.invalid/${anonymizedToken}`,
          title: anonymizedText,
          backgroundImage: null,
          titleColors: [],
          backgroundColors: [],
          deletedAt: now,
        })
        .where(eq(linkModel.userId, account.id));

      await tx
        .update(qrCodeModel)
        .set({
          title: anonymizedText,
          imageUrl: null,
          options: {},
          deletedAt: now,
        })
        .where(eq(qrCodeModel.userId, account.id));

      await tx
        .update(shortUrlModel)
        .set({
          url: `https://deleted.popli.invalid/${anonymizedToken}`,
          alias: null,
          title: anonymizedText,
          isActive: false,
          deletedAt: now,
        })
        .where(eq(shortUrlModel.userId, account.id));

      await tx
        .update(profileAccessModel)
        .set({
          ipAddress: anonymizedIp,
          country: anonymizedText,
          countryCode: 'XX',
          deviceType: null,
          browser: null,
          userAgent: anonymizedText,
          os: null,
          referrer: null,
        })
        .where(eq(profileAccessModel.userId, account.id));

      await tx
        .update(qrCodeScanModel)
        .set({
          ipAddress: anonymizedIp,
          deletedAt: now,
        })
        .where(eq(qrCodeScanModel.userId, account.id));

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
  }

  async getProfile(id: string): Promise<AccountProfileDTO> {
    const profile = await db.query.profileModel.findFirst({
      where: eq(profileModel.userId, id),
      with: {
        user: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        this.configService.get('errorMessage.accountNotFound'),
      );
    }

    let profileImageUrl: string | null = null;

    if (profile.profileImage) {
      profileImageUrl = await this.storageUtility.getUrl(profile.profileImage);
    }

    let coverImageUrl: string | null = null;

    if (profile.coverImage) {
      coverImageUrl = await this.storageUtility.getUrl(profile.coverImage);
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
  }
}
