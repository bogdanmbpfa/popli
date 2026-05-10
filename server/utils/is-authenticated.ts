import { hash, verify } from 'argon2';
import { and, eq } from 'drizzle-orm';
import type { H3Event } from 'h3';
import { decodeJwt } from 'jose';

import type { IAccountUser } from '~~/interfaces';

import { authSessionModel, db, type UserModel, userModel } from '../database';

const deleteCookiesAndThrowError = (
  event: H3Event<EventHandlerRequest>,
  tokenName: string,
  refreshTokenName: string,
) => {
  deleteCookie(event, tokenName);
  deleteCookie(event, refreshTokenName);

  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
  });
};

export default async function isAuthenticated(
  event: H3Event<EventHandlerRequest>,
): Promise<IAccountUser> {
  const {
    public: { cookies, errorMessages },
  } = useRuntimeConfig();

  const token = getCookie(event, cookies.auth.name);
  const refreshToken = getCookie(event, cookies.auth.refreshTokenName);

  if (!token && !refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: errorMessages.unauthorized,
    });
  }

  let user: UserModel | null = null;

  const tokenPayload = token ? decodeJwt(token) : null;
  const refreshTokenPayload = refreshToken ? decodeJwt(refreshToken) : null;

  if (!tokenPayload || !tokenPayload.id) {
    if (refreshTokenPayload && refreshTokenPayload.id) {
      user =
        (await db.query.userModel.findFirst({
          where: eq(userModel.id, refreshTokenPayload.id as string),
        })) ?? null;

      if (!user) {
        return deleteCookiesAndThrowError(
          event,
          cookies.auth.name,
          cookies.auth.refreshTokenName,
        );
      }

      try {
        await verifyJwt(refreshToken!, user.refreshTokenSecret);
      } catch {
        return deleteCookiesAndThrowError(
          event,
          cookies.auth.name,
          cookies.auth.refreshTokenName,
        );
      }

      const session = await db.query.authSessionModel.findFirst({
        where: and(
          eq(authSessionModel.userId, user.id),
          eq(authSessionModel.ipAddress, getClientIp(event)),
        ),
      });

      if (!session) {
        return deleteCookiesAndThrowError(
          event,
          cookies.auth.name,
          cookies.auth.refreshTokenName,
        );
      }

      const isValid = await verify(session.refreshToken, refreshToken!);

      if (!isValid || session.expiresAt.getTime() < Date.now()) {
        return deleteCookiesAndThrowError(
          event,
          cookies.auth.name,
          cookies.auth.refreshTokenName,
        );
      }

      const { token: newToken, refreshToken: newRefreshToken } =
        await generateAuthTokens(
          user.id,
          user.jwtSecret,
          user.refreshTokenSecret,
        );

      await db
        .update(authSessionModel)
        .set({
          refreshToken: await hash(newRefreshToken),
          ipAddress: getClientIp(event),
          userAgent: getRequestHeader(event, 'user-agent')!,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        })
        .where(eq(authSessionModel.id, session.id));

      setAuthCookies(event, newToken, newRefreshToken);

      return {
        id: user.id,
        email: user.email,
        plan: user.plan,
        planStartedAt: user.planStartedAt
          ? user.planStartedAt.toISOString()
          : null,
        planEndsAt: user.planEndsAt ? user.planEndsAt.toISOString() : null,
        emailConfirmedAt: user.emailConfirmedAt
          ? user.emailConfirmedAt.toISOString()
          : null,
        emailConfirmationCode: user.emailConfirmationCode || null,
        emailConfirmationCodeExpiresAt: user.emailConfirmationCodeExpiresAt
          ? user.emailConfirmationCodeExpiresAt.toISOString()
          : null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      } satisfies IAccountUser;
    }

    return deleteCookiesAndThrowError(
      event,
      cookies.auth.name,
      cookies.auth.refreshTokenName,
    );
  }

  if (tokenPayload.exp && tokenPayload.exp < Date.now() / 1000) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: errorMessages.tokenExpired,
    });
  }

  user =
    (await db.query.userModel.findFirst({
      where: eq(userModel.id, tokenPayload.id as string),
    })) ?? null;

  if (!user || user.deletedAt) {
    return deleteCookiesAndThrowError(
      event,
      cookies.auth.name,
      cookies.auth.refreshTokenName,
    );
  }

  try {
    await verifyJwt(token!, user.jwtSecret);
  } catch {
    return deleteCookiesAndThrowError(
      event,
      cookies.auth.name,
      cookies.auth.refreshTokenName,
    );
  }

  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStartedAt: user.planStartedAt ? user.planStartedAt.toISOString() : null,
    planEndsAt: user.planEndsAt ? user.planEndsAt.toISOString() : null,
    emailConfirmedAt: user.emailConfirmedAt
      ? user.emailConfirmedAt.toISOString()
      : null,
    emailConfirmationCode: user.emailConfirmationCode || null,
    emailConfirmationCodeExpiresAt: user.emailConfirmationCodeExpiresAt
      ? user.emailConfirmationCodeExpiresAt.toISOString()
      : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  } satisfies IAccountUser;
}
