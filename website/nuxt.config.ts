import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  app: {
    head: {
      noscript: [
        {
          innerHTML: '<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css" />',
        },
      ],
      link: [
        {
          rel: 'preload',
          href: 'https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css',
          as: 'style',
          crossorigin: 'anonymous',
          fetchpriority: 'low',
          onload: 'this.onload = null; this.rel = "stylesheet";',
        },
      ],
    },
    rootAttrs: {
      lang: 'en',
    },
  },
  compatibilityDate: 'latest',

  css: ['primeicons/primeicons.css', '~/assets/main.scss'],

  devtools: { enabled: true },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'italic'],
    },
    families: [{ name: 'Roboto', provider: 'google' }],
  },

  modules: [
    '@primevue/nuxt-module',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/robots',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vee-validate/nuxt',
    '@nuxtjs/device',
  ],

  nitro: {
    preset: 'bun',
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  postcss: {
    plugins: {
      autoprefixer: {},
      cssnano: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
    },
  },

  primevue: {
    autoImport: true,
    components: {
      prefix: 'P',
    },
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    },
    usePrimeVue: true,
  },

  runtimeConfig: {
    apiBaseUrl: '',
    public: {
      cookies: {
        auth: {
          name: 'POPLI_AUTH_TOKEN',
          refreshTokenName: 'POPLI_AUTH_REFRESH_TOKEN',
          refreshTokenExpires: 60 * 60 * 24, // 1 day
          expires: 60 * 60 * 2, // 2 hours
          httpOnly: true,
        },
      },
      images: {
        logo: 'https://storage.googleapis.com/popli-public/logo.png',
      },
      nodeEnv: '',
      mapboxAccessToken: '',
    },
  },

  site: { indexable: true },

  ssr: true,

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/variables.scss" as *; @use "~/assets/mixins.scss" as *;',
        },
      },
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'yup',
        'lodash/orderBy',
        'lodash/debounce',
        'uuid',
        'luxon',
        'mapbox-gl',
        'qr-code-styling',
      ],
    },
  },
});
