import type { NuxtError } from '#app';

import type { EApiEndpoint } from '~~/enums';
import type { IApiError, IApiFailure, IApiSuccess } from '~~/interfaces';
import { apiEndpoints, type TApiEndpoint } from '~~/server/endpoints';

export default async function <T, U extends keyof typeof EApiEndpoint>(
  key: U,
  body?: T,
  query?: Record<string, unknown>,
  params?: Record<string, unknown>,
): Promise<IApiSuccess<TApiEndpoint[U]> | IApiFailure> {
  const {
    public: { cookies },
  } = useRuntimeConfig();
  const refreshToken = useCookie(cookies.auth.refreshTokenName);

  const endpoint = apiEndpoints[key];

  const requestBody = body as Record<string, unknown>;
  const requestHeaders = useRequestHeaders();

  try {
    const form = new FormData();

    for (const property of Object.keys(requestBody)) {
      if (!property || !requestBody[property]) {
        continue;
      }

      if (property === 'id') {
        continue;
      }

      if (endpoint.filenames && endpoint.filenames.includes(property)) {
        form.append(
          property,
          requestBody[property] as File,
          (requestBody[property] as File).name,
        );

        continue;
      }

      if (endpoint.dates && endpoint.dates.includes(property)) {
        form.append(
          property,
          new Date(requestBody[property] as string).toISOString(),
        );

        continue;
      }

      if (
        (endpoint.stringArrays && endpoint.stringArrays.includes(property)) ||
        (endpoint.objectArrays && endpoint.objectArrays.includes(property)) ||
        (endpoint.objects && endpoint.objects.includes(property))
      ) {
        form.append(
          property,
          JSON.stringify(requestBody[property] as string[]),
        );

        continue;
      }

      form.append(property, requestBody[property] as string);
    }
    const response = await $fetch<TApiEndpoint[U]>('/api/multipart', {
      method: 'POST',
      headers: requestHeaders,
      query: { key, params, ...query },
      body: form,
    });

    return { data: response } as IApiSuccess<TApiEndpoint[U]>;
  } catch (error) {
    const errorResponse = error as NuxtError<IApiError>;

    if (errorResponse.data?.message === 'TOKEN_EXPIRED' && refreshToken.value) {
      try {
        await useRefreshToken(requestHeaders);

        return await useApiMultipart(key, body, query, params);
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
}
