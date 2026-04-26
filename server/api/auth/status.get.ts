import { verify } from 'argon2';
import { and, eq } from 'drizzle-orm';
import { decodeJwt } from 'jose';

import { authSessionModel, db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { cookies },
  } = useRuntimeConfig();

  const token = getCookie(event, cookies.auth.name);
  const refreshToken = getCookie(event, cookies.auth.refreshTokenName);

  if (!token || !refreshToken) {
    deleteCookie(event, cookies.auth.name);
    deleteCookie(event, cookies.auth.refreshTokenName);

    return false;
  }

  const tokenPayload = decodeJwt(token);
  const refreshTokenPayload = decodeJwt(refreshToken);

  if (
    !tokenPayload?.id ||
    !tokenPayload.exp ||
    tokenPayload.exp < Date.now() / 1000
  ) {
    if (
      refreshTokenPayload?.id &&
      refreshTokenPayload.exp &&
      refreshTokenPayload.exp > Date.now() / 1000
    ) {
      const session = await db.query.authSessionModel.findFirst({
        where: and(
          eq(authSessionModel.userId, refreshTokenPayload.id as string),
          eq(authSessionModel.ipAddress, getClientIp(event)),
        ),
      });

      if (!session) {
        deleteCookie(event, cookies.auth.name);
        deleteCookie(event, cookies.auth.refreshTokenName);

        return false;
      }

      const isValid = await verify(session.refreshToken, refreshToken);

      if (!isValid || session.expiresAt.getTime() < Date.now()) {
        deleteCookie(event, cookies.auth.name);
        deleteCookie(event, cookies.auth.refreshTokenName);

        return false;
      }

      const user = await db.query.userModel.findFirst({
        where: eq(userModel.id, session.userId),
      });

      const { token: newToken, refreshToken: newRefreshToken } =
        await generateAuthTokens(
          user!.id,
          user!.jwtSecret,
          user!.refreshTokenSecret,
        );

      setAuthCookies(event, newToken, newRefreshToken);

      return true;
    }

    deleteCookie(event, cookies.auth.name);
    deleteCookie(event, cookies.auth.refreshTokenName);

    return false;
  }

  const user = await db.query.userModel.findFirst({
    where: eq(userModel.id, tokenPayload.id as string),
  });

  if (!user || user.deletedAt) {
    deleteCookie(event, cookies.auth.name);
    deleteCookie(event, cookies.auth.refreshTokenName);

    return false;
  }

  try {
    await verifyJwt(token, user.jwtSecret);
  } catch {
    deleteCookie(event, cookies.auth.name);
    deleteCookie(event, cookies.auth.refreshTokenName);

    return false;
  }

  return true;
});
