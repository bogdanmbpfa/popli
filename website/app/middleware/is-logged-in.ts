export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated, hasRefreshToken } = await $fetch<{
    isAuthenticated: boolean;
    hasRefreshToken: boolean;
  }>('/api/auth-status');

  if (!isAuthenticated && !hasRefreshToken) {
    return navigateTo('/sign-in');
  }

  if (!isAuthenticated && hasRefreshToken) {
    try {
      const headers = useRequestHeaders();
      await useRefreshToken(headers);
    } catch {
      return navigateTo('/sign-in');
    }
  }
});
