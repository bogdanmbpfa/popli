export default defineNuxtRouteMiddleware(async () => {
  const {
    public: { cookies },
  } = useRuntimeConfig();

  const middlewareCookie = useCookie(cookies.auth.name);
  const refreshTokenCookie = useCookie(cookies.auth.refreshTokenName);

  console.log(`IsLoggedInMiddleware | middlewareCookie: ${middlewareCookie.value}`);
  console.log(`IsLoggedInMiddleware | refreshTokenCookie: ${refreshTokenCookie.value}`);

  if (!middlewareCookie.value && !refreshTokenCookie.value) {
    console.log(`IsLoggedInMiddleware | redirecting to sign-in`);
    return navigateTo('/auth/sign-in');
  }

  if (!middlewareCookie?.value && refreshTokenCookie?.value) {
    console.log(`IsLoggedInMiddleware | refreshing token`);
    try {
      const headers = useRequestHeaders();
      await useRefreshToken(headers);
      console.log(`IsLoggedInMiddleware | token refreshed`);
    } catch (error) {
      console.log(`IsLoggedInMiddleware | error refreshing token, redirecting to sign-in`, error);
      return navigateTo('/auth/sign-in');
    }
  }
});
