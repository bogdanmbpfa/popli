import type { SitemapUrlInput } from '@nuxtjs/sitemap/utils';
import { EEnvironment } from '~~/enums';

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
    });
  } catch {
    return null;
  }
}

export default defineSitemapEventHandler(async () => {
  const {
    apiBaseUrl,
    public: { nodeEnv },
  } = useRuntimeConfig();

  const handles: string[] = [];

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

    const response = await $fetch<string[]>('/profile/handles', {
      baseURL: apiBaseUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cloudRunIdToken
          ? { Authorization: `Bearer ${cloudRunIdToken}` }
          : {}),
      },
      credentials: 'include',
    });

    handles.push(...response);
  } catch (error) {
    console.error('Failed to fetch handles', error);
  }

  const urls = handles.map((handle) => ({
    loc: `/${handle}`,
  })) satisfies SitemapUrlInput[];

  return urls;
});
