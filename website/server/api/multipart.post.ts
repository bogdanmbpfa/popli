import type { NuxtError } from 'nuxt/app';

import { EApiEndpoint, EEnvironment } from '~/../enums';
import type { IApiError } from '~/../interfaces';

import { apiEndpoints } from '../endpoints';

const CACHE_DURATION = 1000 * 60 * 50; // 50 minutes
let cloudRunIdToken: string | null = null;
let cloudRunIdTokenRetrievedAt: number | null = null;

async function getCloudRunIdToken(audience: string): Promise<string | null> {
  // Cloud Run provides a metadata server for minting identity tokens.
  // This is only available when running on GCP (e.g. Cloud Run).
  if (!process.env.K_SERVICE) return null;
  if (!audience) return null;

  const url =
    'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity' +
    `?audience=${encodeURIComponent(audience)}&format=full`;

  try {
    return await $fetch<string>(url, {
      headers: {
        'Metadata-Flavor': 'Google',
      },
      responseType: 'text',
    });
  } catch {
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const { key, params, ...query } = getQuery(event);
  const queryParams = new URLSearchParams(
    query as Record<string, string>,
  ).toString();
  const body = await readMultipartFormData(event);
  const userAgent =
    getRequestHeader(event, 'user-agent') ?? getHeader(event, 'user-agent');
  const ipAddress =
    getRequestHeader(event, 'x-forwarded-for') ??
    getHeader(event, 'x-forwarded-for');

  const {
    apiBaseUrl,
    public: { cookies, nodeEnv },
  } = useRuntimeConfig();
  const isProduction = nodeEnv === EEnvironment.PRODUCTION;

  if (!body) {
    throw createError({ statusCode: 400, message: 'No body provided' });
  }

  if (
    !key ||
    !Object.values(EApiEndpoint).includes(key as keyof typeof EApiEndpoint)
  ) {
    throw createError({ statusCode: 400, message: 'Invalid endpoint key' });
  }

  const endpoint = apiEndpoints[key as keyof typeof EApiEndpoint];

  if (!endpoint) {
    throw createError({ statusCode: 400, message: 'Invalid endpoint' });
  }

  const token = getCookie(event, cookies.auth.name);
  const refreshToken = getCookie(event, cookies.auth.refreshTokenName);

  let endpointPath = endpoint.path;

  if (params) {
    endpointPath = endpointPath.replace(
      /\{(\w+)\}/g,
      (_, key) =>
        (JSON.parse(params as string) as Record<string, string>)[key]!,
    );
  }

  if (queryParams) {
    endpointPath += `?${queryParams}`;
  }

  try {
    const form = new FormData();

    for (const property of body) {
      if (!property.data) {
        continue;
      }

      if (endpoint.filenames && endpoint.filenames.includes(property.name!)) {
        form.append(
          property.name!,
          new Blob([property.data as unknown as ArrayBuffer], {
            type: property.type,
          }),
          property.filename,
        );

        continue;
      }

      if (
        endpoint.stringArrays &&
        endpoint.stringArrays.includes(property.name!)
      ) {
        const string = property.data.toString();

        const array = string ? JSON.parse(string) : [];

        if (!array.length) {
          continue;
        }

        for (const [index, value] of array.entries()) {
          form.append(`${property.name}[${index}]`, value);
        }

        continue;
      }

      if (
        endpoint.objectArrays &&
        endpoint.objectArrays.includes(property.name!)
      ) {
        const objectArray = JSON.parse(property.data.toString());

        if (!objectArray.length) {
          continue;
        }

        for (const [index, object] of objectArray.entries()) {
          for (const [key, value] of Object.entries(object)) {
            form.append(`${property.name}[${index}][${key}]`, String(value));
          }
        }

        continue;
      }

      if (endpoint.objects && endpoint.objects.includes(property.name!)) {
        const object = JSON.parse(property.data.toString());

        for (const [key, value] of Object.entries(object)) {
          if (value) {
            form.append(`${property.name}[${key}]`, String(value));
          }
        }

        continue;
      }

      if (endpoint.dates && endpoint.dates.includes(property.name!)) {
        form.append(
          property.name!,
          new Date(property.data.toString()).toISOString(),
        );

        continue;
      }

      if (property.data) {
        form.append(property.name!, property.data.toString());
      }
    }

    if (
      nodeEnv !== EEnvironment.LOCAL &&
      (!cloudRunIdToken ||
        Date.now() - cloudRunIdTokenRetrievedAt! > CACHE_DURATION)
    ) {
      cloudRunIdToken = await getCloudRunIdToken(apiBaseUrl);

      if (cloudRunIdToken) {
        cloudRunIdTokenRetrievedAt = Date.now();
      }
    }

    const response = await $fetch<Record<string, unknown>>(endpointPath, {
      baseURL: apiBaseUrl,
      method: endpoint.method,
      body: form,
      headers: {
        ...(endpoint.auth && token
          ? { 'X-User-Authorization': `Bearer ${token}` }
          : {}),
        ...(cloudRunIdToken
          ? { Authorization: `Bearer ${cloudRunIdToken}` }
          : {}),
        ...(endpoint.auth && refreshToken
          ? { 'X-Refresh-Token': refreshToken }
          : {}),
        ...(userAgent ? { 'User-Agent': userAgent } : {}),
        ...(ipAddress ? { 'X-Forwarded-For': ipAddress } : {}),
      },
    });

    if (response.token && response.refreshToken) {
      setCookie(event, cookies.auth.name, response.token as string, {
        maxAge: cookies.auth.expires,
        httpOnly: cookies.auth.httpOnly,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
      });

      setCookie(
        event,
        cookies.auth.refreshTokenName,
        response.refreshToken as string,
        {
          maxAge: cookies.auth.refreshTokenExpires,
          httpOnly: cookies.auth.httpOnly,
          secure: isProduction,
          sameSite: 'lax',
          path: '/',
        },
      );
    }

    return response;
  } catch (error) {
    const errorResponse = error as NuxtError<IApiError>;

    throw createError({
      statusCode: errorResponse.statusCode!,
      message: errorResponse.data?.message,
    });
  }
});
