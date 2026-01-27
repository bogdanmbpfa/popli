import { EApiEndpoint, EEnvironment } from '~~/enums';
import type { IAuthLoginResponse } from '~~/interfaces';

export default async function (headers?: HeadersInit) {
	const { public: { cookies, nodeEnv } } = useRuntimeConfig();
	const isProduction = nodeEnv === EEnvironment.PRODUCTION;
	
	const tokenCookie = useCookie(cookies.auth.name, {
		maxAge: cookies.auth.expires,
		secure: isProduction,
		sameSite: isProduction,
		httpOnly: isProduction,
	});

	const refreshTokenCookie = useCookie(cookies.auth.refreshTokenName, {
		maxAge: cookies.auth.refreshTokenExpires,
		secure: isProduction,
		sameSite: isProduction,
		httpOnly: isProduction,
	});
	
	const { token, refreshToken } = await $fetch<IAuthLoginResponse>('/api/json', {
		method: 'POST',
		headers: headers || useRequestHeaders(),
		body: {
			key: EApiEndpoint.AUTH_REFRESH_TOKEN,
		},
	});

	console.log(`UseRefreshToken | token: ${token}`);
	console.log(`UseRefreshToken | refreshToken: ${refreshToken}`);

	tokenCookie.value = token;
	refreshTokenCookie.value = refreshToken;
}