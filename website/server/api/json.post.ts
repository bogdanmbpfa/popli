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
  const query = getQuery(event);
  const queryParams = new URLSearchParams(
    query as Record<string, string>,
  ).toString();
  const { key, params, body, headers } = await readBody(event);
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

  if (
    !key ||
    !Object.values(EApiEndpoint).includes(key as keyof typeof EApiEndpoint)
  ) {
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
      body: endpoint.method !== 'GET' && !!body ? body : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(cloudRunIdToken
          ? { Authorization: `Bearer ${cloudRunIdToken}` }
          : {}),
        ...(endpoint.auth && token
          ? { 'X-User-Authorization': `Bearer ${token}` }
          : {}),
        ...(endpoint.auth && refreshToken
          ? { 'X-Refresh-Token': refreshToken }
          : {}),
        ...(userAgent ? { 'User-Agent': userAgent } : {}),
        ...(ipAddress ? { 'X-Forwarded-For': ipAddress } : {}),
      },
      credentials: 'include',
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
