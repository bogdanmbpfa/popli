import { EEnvironment } from '~/enums';

export default async function(token: string) {
  const { public: { cookies, nodeEnv } } = useRuntimeConfig();

  const tokenCookie = useCookie(cookies.auth.name, {
    maxAge: cookies.auth.expires,
    secure: nodeEnv === EEnvironment.PRODUCTION,
    sameSite: nodeEnv === EEnvironment.PRODUCTION,
    httpOnly: nodeEnv === EEnvironment.PRODUCTION,
  });

  tokenCookie.value = token;
}
