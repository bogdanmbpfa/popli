import { EEnvironment } from '~~/enums';

export default function (token: string, refreshToken: string) {
  const { public: { cookies, nodeEnv } } = useRuntimeConfig();

  const isProduction = nodeEnv === EEnvironment.PRODUCTION;

  const tokenCookie = useCookie(cookies.auth.name, {
    maxAge: cookies.auth.expires,
    secure: isProduction,
    sameSite: isProduction,
    httpOnly: isProduction,
  });

  const refreshTokenCookie = useCookie(cookies.auth.refreshTokenName, {
    maxAge: cookies.auth.refreshTokenExpires,
    secure: isProduction,
    sameSite: isProduction,
    httpOnly: isProduction,
  });

  tokenCookie.value = token;
  refreshTokenCookie.value = refreshToken;

  console.log(`Set token cookie: ${tokenCookie.value}`);
  console.log(`Set refresh token cookie: ${refreshTokenCookie.value}`);
}
