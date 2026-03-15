import type { NuxtError } from '#app';

import type { IApiError, IApiFailure, IApiSuccess } from '~~/interfaces';
import type { TApiEndpoint } from '~~/server/endpoints';

const useApiJson = async <T, U extends keyof TApiEndpoint>(
  key: U,
  body?: T,
  query?: Record<string, unknown>,
  params?: Record<string, unknown>,
  headers?: HeadersInit,
): Promise<IApiSuccess<TApiEndpoint[U]> | IApiFailure> => {
  const {
    public: { cookies },
  } = useRuntimeConfig();
  const refreshToken = useCookie(cookies.auth.refreshTokenName);

  const requestHeaders = useRequestHeaders();

  try {
    const response = await $fetch<TApiEndpoint[U]>('/api/json', {
      method: 'POST',
      headers: requestHeaders,
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

    if (errorResponse.data?.message === 'TOKEN_EXPIRED' && refreshToken.value) {
      try {
        await useRefreshToken(requestHeaders);

        return await useApiJson(key, body, query, params, headers);
      } catch {
        return {
          error: {
            code: errorResponse.data?.code,
            message: errorResponse.data?.message,
          },
        } as IApiFailure;
      }
    }

    return {
      error: {
        code: errorResponse.data?.code,
        message: errorResponse.data?.message,
      },
    } as IApiFailure;
  }
};

export default useApiJson;
