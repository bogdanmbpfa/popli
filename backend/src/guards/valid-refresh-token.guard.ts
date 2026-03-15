import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';
import { and, eq } from 'drizzle-orm';
import { decodeJwt } from 'jose';

import { authSessionModel, db, userModel } from '@database';
import { AccountDTO } from '@resources';
import { JWTUtilityService } from '@utilities';

@Injectable()
export class ValidRefreshTokenGuard implements CanActivate {
  private readonly errorMessage: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtUtilityService: JWTUtilityService,
  ) {
    this.errorMessage =
      this.configService.get('errorMessages.invalidRefreshToken') ||
      'Invalid refresh token';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException(this.errorMessage);
    }

    let userId: string;

    try {
      const payload = decodeJwt(refreshToken);
      userId = payload.id as string;
    } catch {
      throw new UnauthorizedException(this.errorMessage);
    }

    if (!userId) {
      throw new UnauthorizedException(this.errorMessage);
    }

    let session = await db.query.authSessionModel.findFirst({
      where: and(
        eq(authSessionModel.userId, userId),
        eq(authSessionModel.ipAddress, request.ip),
        eq(authSessionModel.userAgent, request.headers['user-agent']),
      ),
    });

    if (!session) {
      [session] = await db
        .insert(authSessionModel)
        .values({
          userId: userId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          refreshToken: await hash(refreshToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        })
        .returning();
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await db
        .delete(authSessionModel)
        .where(eq(authSessionModel.id, session.id));

      throw new UnauthorizedException(this.errorMessage);
    }

    const account = await db.query.userModel.findFirst({
      where: eq(userModel.id, userId),
    });

    if (!account) {
      throw new UnauthorizedException(this.errorMessage);
    }

    try {
      await this.jwtUtilityService.verify(
        refreshToken,
        account.refreshTokenSecret,
      );
    } catch {
      throw new UnauthorizedException(this.errorMessage);
    }

    const isValid = await verify(session.refreshToken, refreshToken);

    if (!isValid) {
      throw new UnauthorizedException(this.errorMessage);
    }

    request.account = {
      id: account.id,
      email: account.email,
      emailConfirmedAt: account.emailConfirmedAt
        ? account.emailConfirmedAt.toISOString()
        : null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
      sessionId: session.id,
    } as AccountDTO;

    return true;
  }
}
