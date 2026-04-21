export default defineNuxtRouteMiddleware(async ({}) => {
  const headers = import.meta.server ? useRequestHeaders() : undefined;

  const { isAuthenticated, hasRefreshToken } = await $fetch<{
    isAuthenticated: boolean;
    hasRefreshToken: boolean;
  }>('/api/auth-status', {
    headers,
  });

  if (!isAuthenticated && !hasRefreshToken) {
    return navigateTo('/sign-in');
  }

  if (!isAuthenticated && hasRefreshToken) {
    try {
      await useRefreshToken(headers);
    } catch {
      return navigateTo('/sign-in');
    }
  }
});
