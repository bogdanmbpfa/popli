import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { eq, or } from 'drizzle-orm';

import { db, userModel } from '@database';
import {
  AuthLoginDTO,
  AuthRegisterDTO,
  AuthRequestPasswordResetDTO,
  AuthResetPasswordDTO,
  AuthResponseDTO,
} from '@resources';
import { EmailUtilityService, JWTUtilityService } from '@utilities';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailUtilityService: EmailUtilityService,
    private readonly jwtUtilityService: JWTUtilityService,
  ) {}

  async register(dto: AuthRegisterDTO): Promise<AuthResponseDTO> {
    const email = dto.email.toLowerCase();
    const handle = dto.handle.toLowerCase();

    const existingUser = await db.query.userModel.findFirst({
      where: or(eq(userModel.email, email), eq(userModel.handle, handle)),
    });

    if (existingUser) {
      throw new BadRequestException(
        this.configService.get('errorMessage.userAlreadyExists'),
      );
    }

    const password = await hash(dto.password);

    const jwtSecret = randomBytes(20).toString('hex').toUpperCase();

    const [{ id }] = await db
      .insert(userModel)
      .values({ email, password, name: dto.name, handle, jwtSecret })
      .returning({ id: userModel.id });

    const jwt = await this.jwtUtilityService.sign(jwtSecret, { id });

    await this.emailUtilityService.sendEmail(
      email,
      this.configService.get('brevo.templates.welcome') as number,
    );

    return { token: jwt };
  }

  async login(dto: AuthLoginDTO): Promise<AuthResponseDTO> {
    const email = dto.email.toLowerCase();

    const account = await db.query.userModel.findFirst({
      where: eq(userModel.email, email),
    });

    if (!account) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    const isPasswordValid = await verify(account.password, dto.password);

    if (!isPasswordValid) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    const jwt = await this.jwtUtilityService.sign(account.jwtSecret, {
      id: account.id,
    });

    return { token: jwt };
  }

  async requestPasswordReset(dto: AuthRequestPasswordResetDTO): Promise<void> {
    const email = dto.email.toLowerCase();

    const account = await db.query.userModel.findFirst({
      where: eq(userModel.email, email),
    });

    if (!account) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    const code = randomBytes(3).toString('hex');
    const jwtSecret = randomBytes(20).toString('hex').toUpperCase();

    await db
      .update(userModel)
      .set({
        passwordResetCode: code,
        passwordResetCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
        jwtSecret,
      })
      .where(eq(userModel.id, account.id));

    await this.emailUtilityService.sendEmail(
      email,
      this.configService.get('brevo.templates.passwordReset') as number,
      { code },
    );
  }

  async resetPassword(dto: AuthResetPasswordDTO): Promise<void> {
    const { email, code, password } = dto;

    const account = await db.query.userModel.findFirst({
      where: eq(userModel.email, email),
    });

    if (!account) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    if (account.passwordResetCode !== code) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCode'),
      );
    }

    if (
      !account.passwordResetCodeExpiresAt ||
      new Date(account.passwordResetCodeExpiresAt).getTime() <
        new Date().getTime()
    ) {
      throw new BadRequestException(
        this.configService.get('errorMessage.passwordResetCodeExpired'),
      );
    }

    const hashedPassword = await hash(password);

    await db
      .update(userModel)
      .set({
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      })
      .where(eq(userModel.id, account.id));
  }
}
