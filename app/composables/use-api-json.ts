import type { NuxtError } from '#app';

import type { IApiError, IApiFailure, IApiSuccess } from '~~/interfaces';
import { apiEndpoints, type TApiEndpoint } from '~~/server/endpoints';

const useApiJson = async <T, U extends keyof TApiEndpoint>(
  key: U,
  body?: T,
  query?: Record<string, unknown>,
  params?: Record<string, unknown>,
): Promise<IApiSuccess<TApiEndpoint[U]> | IApiFailure> => {
  const requestHeaders = useRequestHeaders();

  const endpoint = apiEndpoints[key];

  try {
    let path = endpoint.path;
    
    if (params) {
      path = path.replace(/\{(\w+)\}/g, (_, key) => params?.[key] as string);
    }

    const response = await $fetch<TApiEndpoint[U]>(path, {
      method: endpoint.method,
      headers: requestHeaders,
      query,
      ...(body && Object.keys(body).length ? { body } : null),
    });

    return { data: response } as IApiSuccess<TApiEndpoint[U]>;
  } catch (error) {
    const errorResponse = error as NuxtError<IApiError>;

    return {
      error: {
        statusCode: errorResponse.data?.statusCode,
        message: errorResponse.data?.message,
      },
    } as IApiFailure;
  }
};

export default useApiJson;
