import type { NuxtError } from '#app';

import type { IApiError, IApiFailure, IApiSuccess } from '~~/interfaces';
import { apiEndpoints, type TApiEndpoint } from '~~/server/endpoints';

export default async function <T, U extends keyof TApiEndpoint>(
  key: U,
  body?: T,
  query?: Record<string, unknown>,
  params?: Record<string, unknown>,
): Promise<IApiSuccess<TApiEndpoint[U]> | IApiFailure> {
  const requestHeaders = useRequestHeaders();
  
  const endpoint = apiEndpoints[key];
  const requestBody = body as Record<string, unknown>;

  try {
    const form = new FormData();

    for (const property of Object.keys(requestBody)) {
      if (!property || requestBody[property] === undefined || requestBody[property] === null) {
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
    
    let path = endpoint.path;
    
    if (params) {
      path = path.replace(/\{(\w+)\}/g, (_, key) => params?.[key] as string);
    }

    const response = await $fetch<TApiEndpoint[U]>(path, {
      method: endpoint.method,
      headers: requestHeaders,
      query: query || undefined,
      body: form,
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
