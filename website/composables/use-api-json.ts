import type { NuxtError } from '#app';

import type { EApiEndpoint } from '~/enums';
import type { IApiError, IApiFailure, IApiSuccess } from '~/interfaces';
import type { TApiEndpoint } from '~/server/endpoints';

export default async function <T, U extends EApiEndpoint>(
	key: U,
	body?: T,
	query?: Record<string, unknown>,
	params?: Record<string, unknown>,
	headers?: HeadersInit
): Promise<IApiSuccess<TApiEndpoint[U]> | IApiFailure> {
	try {
		const response = await $fetch<TApiEndpoint[U]>('/api/json', {
			method: 'POST',
			headers: useRequestHeaders(),
			body: {
				key,
				params,
				body,
				headers,
			},
			query,
		});

		return { data: response } as IApiSuccess<TApiEndpoint[U]>;
	} catch (error) {
		const errorResponse = error as NuxtError<IApiError>;

		return {
			error: {
				code: errorResponse.data?.code,
				message: errorResponse.data?.message,
			},
		} as IApiFailure;
	}
}
