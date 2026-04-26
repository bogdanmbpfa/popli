export default defineNuxtRouteMiddleware(async () => {
  const headers = import.meta.server ? useRequestHeaders() : undefined;

  const isAuthenticated = await $fetch<boolean>('/api/auth/status', {
    headers,
  });

  if (isAuthenticated) {
    return navigateTo('/');
  }
});
