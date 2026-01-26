export default defineNuxtRouteMiddleware(async () => {
	const {
		public: { cookies },
	} = useRuntimeConfig();

	const middlewareCookie = useCookie(cookies.auth.name);

	if (middlewareCookie && middlewareCookie.value) {
		return navigateTo('/');
	}
});
