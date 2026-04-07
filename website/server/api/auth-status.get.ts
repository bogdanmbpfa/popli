export default defineEventHandler((event) => {
  const {
    public: { cookies },
  } = useRuntimeConfig();

  const token = getCookie(event, cookies.auth.name);
  const refreshToken = getCookie(event, cookies.auth.refreshTokenName);

  return {
    isAuthenticated: Boolean(token),
    hasRefreshToken: Boolean(refreshToken),
  };
});
