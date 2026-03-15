import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

import { db, profileModel, userModel } from '@database';
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
      image = await processImage(dto.buffer, { width: 512, height: 512 });
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
      image = await processImage(dto.buffer, { width: 1280, height: 720 });
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
    await db
      .update(userModel)
      .set({ deletedAt: new Date() })
      .where(eq(userModel.id, account.id));
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
