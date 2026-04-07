export default defineNuxtRouteMiddleware(async () => {
  const { isAuthenticated } = await $fetch<{ isAuthenticated: boolean }>(
    '/api/auth-status',
  );

  if (isAuthenticated) {
    return navigateTo('/');
  }
});
