import type { NuxtError } from 'nuxt/app';

import { EApiEndpoint } from '~/../enums';
import type { IApiError } from '~/../interfaces';

import { apiEndpoints } from '../endpoints';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const queryParams = new URLSearchParams(query as Record<string, string>).toString();
	const { key, params, body, headers } = await readBody(event);

	const {
		apiBaseUrl,
		public: { cookies },
	} = useRuntimeConfig();

	if (!key || !Object.values(EApiEndpoint).includes(key as keyof typeof EApiEndpoint)) {
		throw createError({ statusCode: 400, message: 'Invalid endpoint key' });
	}

	const endpoint = apiEndpoints[key as keyof typeof EApiEndpoint];

	if (!endpoint || endpoint.contentType !== 'json') {
		throw createError({ statusCode: 400, message: 'Invalid endpoint' });
	}

	const token = getCookie(event, cookies.auth.name);
	const refreshToken = getCookie(event, cookies.auth.refreshTokenName);

	let endpointPath = endpoint.path;

	if (params) {
		endpointPath = endpointPath.replace(/\{(\w+)\}/g, (_, key) => params[key]);
	}

	if (queryParams) {
		endpointPath += `?${queryParams}`;
	}

	try {
		const response = await $fetch(endpointPath, {
			baseURL: apiBaseUrl,
			method: endpoint.method,
			body: endpoint.method !== 'GET' && !!body ? body : undefined,
			headers: {
				'Content-Type': 'application/json',
				...headers,
				...(endpoint.auth && token ? { Authorization: `Bearer ${token}` } : {}),
				...(endpoint.auth && refreshToken ? { 'X-Refresh-Token': refreshToken } : {}),
			},
			credentials: 'include',
		});

		return response;
	} catch (error) {
		const errorResponse = error as NuxtError<IApiError>;

		throw createError({
			statusCode: errorResponse.statusCode!,
			message: errorResponse.data?.message,
		});
	}
});
