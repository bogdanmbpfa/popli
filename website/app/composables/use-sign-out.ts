import { EApiEndpoint } from '~~/enums';

export default async function () {
	const {
		public: { cookies },
	} = useRuntimeConfig();

	await useApiJson(EApiEndpoint.AUTH_LOGOUT);

	const tokenCookie = useCookie(cookies.auth.name);
	const refreshTokenCookie = useCookie(cookies.auth.refreshTokenName);

	tokenCookie.value = undefined;
	refreshTokenCookie.value = undefined;
}
