import { and, eq } from 'drizzle-orm';
import { decodeJwt } from 'jose';

import { authSessionModel, db } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { cookies },
  } = useRuntimeConfig();

  const token = getCookie(event, cookies.auth.name);
  const refreshToken = getCookie(event, cookies.auth.refreshTokenName);

  if (!token || !refreshToken) return;

  const tokenPayload = decodeJwt(token);
  const refreshTokenPayload = decodeJwt(refreshToken);

  const userId = (tokenPayload.id || refreshTokenPayload.id) as string;

  const ipAddress = getClientIp(event);

  const session = await db.query.authSessionModel.findFirst({
    where: and(
      eq(authSessionModel.userId, userId),
      eq(authSessionModel.ipAddress, ipAddress),
    ),
  });

  if (session) {
    await db
      .delete(authSessionModel)
      .where(eq(authSessionModel.id, session.id));
  }

  deleteCookie(event, cookies.auth.name);
  deleteCookie(event, cookies.auth.refreshTokenName);
});
