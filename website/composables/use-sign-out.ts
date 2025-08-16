export default function() {
  const { public: { cookies } } = useRuntimeConfig();

  const tokenCookie = useCookie(cookies.auth.name);

  tokenCookie.value = undefined;
}
