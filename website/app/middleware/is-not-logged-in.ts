export default defineNuxtRouteMiddleware(async () => {
  const headers = import.meta.server ? useRequestHeaders() : undefined;

  const { isAuthenticated, hasRefreshToken } = await $fetch<{
    isAuthenticated: boolean;
    hasRefreshToken: boolean;
  }>(
    '/api/auth-status',
    {
      headers,
    },
  );

  if (!isAuthenticated && hasRefreshToken) {
    try {
      await useRefreshToken(headers);
    } catch {}
  }

  if (isAuthenticated) {
    return navigateTo('/');
  }
});
