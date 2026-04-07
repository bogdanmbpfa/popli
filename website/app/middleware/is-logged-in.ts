export default defineNuxtRouteMiddleware(async () => {
  const {
    public: { cookies },
  } = useRuntimeConfig();

  const middlewareCookie = useCookie(cookies.auth.name);
  const refreshTokenCookie = useCookie(cookies.auth.refreshTokenName);

  console.log(`Middleware cookie: ${middlewareCookie.value}`);
  console.log(`Refresh token cookie: ${refreshTokenCookie.value}`);

  if (!middlewareCookie.value && !refreshTokenCookie.value) {
    return navigateTo('/sign-in');
  }

  if (!middlewareCookie?.value && refreshTokenCookie?.value) {
    try {
      const headers = useRequestHeaders();
      await useRefreshToken(headers);
    } catch {
      return navigateTo('/sign-in');
    }
  }
});
