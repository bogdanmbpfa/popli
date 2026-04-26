interface IPageSeoOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string;
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

  const ogImage = options.ogImage
    ? toAbsoluteUrl(origin, options.ogImage)
    : toAbsoluteUrl(origin, seo.defaultOgImagePath);

  useHead({
    title: options.title,
    meta: options.keywords
      ? [{ name: 'keywords', content: options.keywords }]
      : [],
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
    keywords: options.keywords,
    applicationName: seo.siteName,
    ogTitle: options.title,
    ogDescription: options.description,
    ogUrl: pageUrl,
    ogType: options.ogType ?? 'website',
    ogImage,
    ogSiteName: seo.siteName,
    ogLocale: 'en_US',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: ogImage,
    robots: options.robots,
  });
}
