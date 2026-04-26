import type { H3Event } from 'h3';

import { EEnvironment } from '~~/enums';

export default function setAuthCookies(
  event: H3Event<EventHandlerRequest>,
  token: string,
  refreshToken: string,
): void {
  const {
    public: { cookies, nodeEnv },
  } = useRuntimeConfig();
  const isProduction = nodeEnv === EEnvironment.PRODUCTION;

  setCookie(event, cookies.auth.name, token, {
    maxAge: cookies.auth.expires,
    httpOnly: cookies.auth.httpOnly,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });

  setCookie(event, cookies.auth.refreshTokenName, refreshToken, {
    maxAge: cookies.auth.refreshTokenExpires,
    httpOnly: cookies.auth.httpOnly,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
}