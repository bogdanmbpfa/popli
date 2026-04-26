/**
 * 301 redirect from www.<apex> to the canonical origin (runtimeConfig.public.siteUrl).
 * Runs on the Nitro server so crawlers and first hits get a proper redirect.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = config.public?.siteUrl as string | undefined;
  if (!siteUrl) {
    return;
  }

  let canonical: URL;
  try {
    canonical = new URL(siteUrl);
  } catch {
    return;
  }

  const canonicalHost = canonical.hostname.toLowerCase();
  const rawHost =
    getHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim() ||
    getHeader(event, 'host') ||
    '';
  const host = rawHost.split(':')[0]?.toLowerCase() ?? '';

  if (host !== `www.${canonicalHost}`) {
    return;
  }

  const reqUrl = getRequestURL(event);
  const target = new URL(reqUrl.pathname + reqUrl.search, canonical.origin).href;

  return sendRedirect(event, target, 301);
});
