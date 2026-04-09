import { EEnvironment } from '~~/enums';

export default defineNitroPlugin((nitroApp) => {
  const {
    public: { nodeEnv },
  } = useRuntimeConfig();

  nitroApp.hooks.hook('site-config:init', ({ siteConfig }) => {
    siteConfig.push({
      indexable: nodeEnv === EEnvironment.PRODUCTION,
      url: 'https://popli.one',
      name: 'Popli.one',
      trailingSlash: false,
      env: nodeEnv,
    });
  });
});
