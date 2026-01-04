import { EApiEndpoint } from '~~/enums';
import type { IAuthLoginResponse } from '~~/interfaces';

export default async function () {
	const { token, refreshToken } = await $fetch<IAuthLoginResponse>('/api/json', {
		method: 'POST',
		headers: useRequestHeaders(),
		body: {
			key: EApiEndpoint.AUTH_REFRESH_TOKEN,
		},
	});

	await useSetAuthToken(token, refreshToken);
}
