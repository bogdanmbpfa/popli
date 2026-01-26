import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { eq, or } from 'drizzle-orm';
import type { Request } from 'express';

import { authSessionModel, db, userModel } from '@database';
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

  async register(
    dto: AuthRegisterDTO,
    request: Request,
  ): Promise<AuthResponseDTO> {
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
    const refreshTokenSecret = randomBytes(20).toString('hex').toUpperCase();

    const [{ id }] = await db
      .insert(userModel)
      .values({
        email,
        password,
        name: dto.name,
        handle,
        jwtSecret,
        refreshTokenSecret,
      })
      .returning({ id: userModel.id });

    const { token, refreshToken } = await this.generateAuthTokens(
      id,
      jwtSecret,
      refreshTokenSecret,
    );

    await db.insert(authSessionModel).values({
      userId: id,
      refreshToken: await hash(refreshToken!),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      ipAddress: request.ip!,
      userAgent: request.headers['user-agent']!,
    });

    await this.emailUtilityService.sendEmail(
      email,
      this.configService.get('brevo.templates.welcome') as number,
    );

    return { token, refreshToken };
  }

  async login(dto: AuthLoginDTO, request: Request): Promise<AuthResponseDTO> {
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

    const { token, refreshToken } = await this.generateAuthTokens(
      account.id,
      account.jwtSecret,
      account.refreshTokenSecret,
    );

    await db
      .insert(authSessionModel)
      .values({
        userId: account.id,
        refreshToken: await hash(refreshToken!),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        ipAddress: request.ip!,
        userAgent: request.headers['user-agent']!,
      })
      .onConflictDoUpdate({
        target: [authSessionModel.ipAddress],
        set: {
          refreshToken: await hash(refreshToken!),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        },
      });

    return { token, refreshToken };
  }

  async logout(sessionId: string): Promise<void> {
    await db.delete(authSessionModel).where(eq(authSessionModel.id, sessionId));
  }

  async refreshToken(
    userId: string,
    sessionId: string,
    request: Request,
  ): Promise<AuthResponseDTO> {
    const user = await db.query.userModel.findFirst({
      where: eq(userModel.id, userId),
    });

    if (!user) {
      throw new BadRequestException(
        this.configService.get('errorMessage.invalidCredentials'),
      );
    }

    const { token, refreshToken } = await this.generateAuthTokens(
      userId,
      user.jwtSecret,
      user.refreshTokenSecret,
    );

    await db
      .update(authSessionModel)
      .set({
        refreshToken: await hash(refreshToken!),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        ipAddress: request.ip!,
        userAgent: request.headers['user-agent']!,
      })
      .where(eq(authSessionModel.id, sessionId));

    return { token, refreshToken };
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

  private async generateAuthTokens(
    userId: string,
    jwtSecret: string,
    refreshTokenSecret: string,
  ): Promise<AuthResponseDTO> {
    const [jwt, refreshToken] = await Promise.all([
      this.jwtUtilityService.sign(jwtSecret, { id: userId }, '2h'),
      this.jwtUtilityService.sign(refreshTokenSecret, { id: userId }, '1d'),
    ]);

    return { token: jwt, refreshToken };
  }
}
