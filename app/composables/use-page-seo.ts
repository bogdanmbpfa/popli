interface IPageSeoOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  robots?: string;
}

export default function (options: IPageSeoOptions) {
  const { seo } = useAppConfig();
  const {
    public: { siteUrl },
  } = useRuntimeConfig();
  const origin = String(siteUrl || 'https://popli.one').replace(/\/$/, '');

  const normalizedPath =
    options.path === '/' || options.path === ''
      ? '/'
      : options.path.startsWith('/')
      ? options.path
      : `/${options.path}`;

  const pageUrl = `${origin}${normalizedPath}`;

  const defaultOgAbs = toAbsoluteUrl(origin, seo.defaultOgImagePath);
  const ogImage = options.ogImage
    ? toAbsoluteUrl(origin, options.ogImage)
    : defaultOgAbs;

  const twitterHandle = seo.twitterSite?.trim();
  const useDefaultOgDimensions =
    ogImage === defaultOgAbs &&
    typeof seo.defaultOgImageWidth === 'number' &&
    typeof seo.defaultOgImageHeight === 'number';

  useHead({
    title: options.title,
    link: [
      {
        rel: 'canonical',
        href: pageUrl,
      },
    ],
  });

  useSeoMeta({
    title: options.title,
    description: options.description,
    applicationName: seo.siteName,
    ogTitle: options.title,
    ogDescription: options.description,
    ogUrl: pageUrl,
    ogType: options.ogType ?? 'website',
    ogImage,
    ...(useDefaultOgDimensions
      ? {
          ogImageWidth: seo.defaultOgImageWidth,
          ogImageHeight: seo.defaultOgImageHeight,
        }
      : {}),
    ogSiteName: seo.siteName,
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: ogImage,
    ...(twitterHandle ? { twitterSite: twitterHandle } : {}),
    robots: options.robots,
  });
}
