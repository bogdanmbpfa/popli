import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { generate as generateRandomString } from 'randomstring';
import sharp from 'sharp';

import { db, userModel } from '@database';
import {
  AccountChangePasswordDTO,
  AccountDTO,
  AccountProfileDTO,
  AccountRequestEmailUpdateDTO,
  AccountUpdateDTO,
  AccountUpdateEmailDTO,
  AccountUpdateProfileDTO,
  AccountVerifyEmailDTO,
  FileDTO,
} from '@resources';
import { EmailUtilityService, StorageUtility } from '@utilities';

@Injectable()
export class AccountService {
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

  async updateAccount(id: string, dto: AccountUpdateDTO): Promise<void> {
    await db
      .update(userModel)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.handle && { handle: dto.handle }),
        ...(dto.bio && { bio: dto.bio }),
      })
      .where(eq(userModel.id, id));
  }

  async requestEmailVerify(account: AccountDTO): Promise<void> {
    if (account.emailConfirmedAt) {
      throw new BadRequestException(
        this.configService.get('errorMessage.emailAlreadyConfirmed'),
      );
    }

    const code = generateRandomString({ length: 6, charset: 'numeric' });

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

    const image = await sharp(dto.buffer)
      .rotate()
      .resize(512, 512, { fit: 'inside' })
      .webp({ quality: 100 })
      .toBuffer();

    const imageUrl = await this.storageUtility.upload(
      image,
      randomBytes(20).toString('hex'),
      dto.mimetype,
      'profile-images',
    );

    await db
      .update(userModel)
      .set({ profileImage: imageUrl })
      .where(eq(userModel.id, account.id));
  }

  async uploadCoverImage(account: AccountDTO, dto: FileDTO): Promise<void> {
    if (!dto.buffer || !dto.mimetype || !dto.size || !dto.originalname) {
      throw new BadRequestException(
        this.configService.get('errorMessage.fileRequired'),
      );
    }

    const image = await sharp(dto.buffer)
      .rotate()
      .resize(1280, 720, { fit: 'inside' })
      .webp({ quality: 100 })
      .toBuffer();

    const imageUrl = await this.storageUtility.upload(
      image,
      randomBytes(20).toString('hex'),
      dto.mimetype,
      'cover-images',
    );

    await db
      .update(userModel)
      .set({ coverImage: imageUrl })
      .where(eq(userModel.id, account.id));
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
    const account = await db.query.userModel.findFirst({
      where: eq(userModel.handle, handle),
    });

    if (account) {
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
      .update(userModel)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.bio && { bio: dto.bio }),
      })
      .where(eq(userModel.id, account.id));
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

    const code = generateRandomString({ length: 6, charset: 'numeric' });

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
    const account = await db.query.userModel.findFirst({
      where: eq(userModel.id, id),
    });

    if (!account) {
      throw new NotFoundException(
        this.configService.get('errorMessage.accountNotFound'),
      );
    }

    let profileImageUrl: string | null = null;

    if (account.profileImage) {
      profileImageUrl = await this.storageUtility.getUrl(account.profileImage);
    }

    let coverImageUrl: string | null = null;

    if (account.coverImage) {
      coverImageUrl = await this.storageUtility.getUrl(account.coverImage);
    }

    return {
      name: account.name,
      handle: account.handle,
      profileImage: profileImageUrl,
      coverImage: coverImageUrl,
      bio: account.bio,
    };
  }
}
