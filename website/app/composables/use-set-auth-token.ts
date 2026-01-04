import { EEnvironment } from '~/../enums';

export default async function(token: string, refreshToken: string) {
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
}
