import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { decodeJwt } from 'jose';

import { db, userModel } from '@database';
import { AccountDTO } from '@resources';
import { JWTUtilityService } from '@utilities';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly errorMessage: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtUtilityService: JWTUtilityService,
  ) {
    this.errorMessage =
      this.configService.get('errorMessages.unauthorized') || 'Unauthorized';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;

    if (!authorization) {
      throw new UnauthorizedException(this.errorMessage);
    }

    const token: string = (authorization as string).split(' ')[1];

    if (!token) {
      throw new UnauthorizedException(this.errorMessage);
    }

    const payload = decodeJwt(token);

    if (!payload || !payload.id) {
      throw new UnauthorizedException(this.errorMessage);
    }

    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new UnauthorizedException(
        this.configService.get('errorMessages.tokenExpired'),
      );
    }

    const account = await db.query.userModel.findFirst({
      where: eq(userModel.id, payload.id as string),
    });

    if (!account || account.deletedAt) {
      throw new UnauthorizedException(this.errorMessage);
    }

    try {
      await this.jwtUtilityService.verify(token, account.jwtSecret);
    } catch {
      throw new UnauthorizedException(this.errorMessage);
    }

    request.account = {
      id: account.id,
      email: account.email,
      emailConfirmedAt: account.emailConfirmedAt
        ? account.emailConfirmedAt.toISOString()
        : null,
      emailConfirmationCode: account.emailConfirmationCode || null,
      emailConfirmationCodeExpiresAt: account.emailConfirmationCodeExpiresAt
        ? account.emailConfirmationCodeExpiresAt.toISOString()
        : null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    } as AccountDTO;

    return true;
  }
}
