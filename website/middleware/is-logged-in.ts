export default defineNuxtRouteMiddleware(async (to, from) => {
	const {
		public: { cookies },
	} = useRuntimeConfig();

	const middlewareCookie = useCookie(cookies.auth.name);

	if (!middlewareCookie?.value) {
		return navigateTo('/login');
	}
});
