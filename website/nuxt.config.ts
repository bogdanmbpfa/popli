export default defineNuxtConfig({
  app: {
    head: {
      noscript: [
        {
          innerHTML:
            '<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v3.20.0/mapbox-gl.css" />',
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
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  compatibilityDate: 'latest',

  css: ['~/assets/main.scss'],

  devtools: { enabled: true },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'italic'],
    },
    families: [{ name: 'Roboto', provider: 'google' }],
  },

  image: {
    dir: 'assets/images',
  },

  icon: {
    customCollections: [
      {
        prefix: 'popli',
        dir: './app/assets/icon',
      },
    ],
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/robots',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vee-validate/nuxt',
    '@nuxtjs/device',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    [
      '@nuxtjs/google-adsense',
      {
        id: 'ca-pub-4244824823711590',
        onPageLoad: false,
        pageLevelAds: false,
        test: false,
      },
    ],
  ],

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

  robots: {
    allow: ['/', '/about', '/forgot-password', '/sign-in', '/sign-up', '/*$'],
    disallow:['/account', '/account/', '/s', '/s/'],
    blockAiBots: false,
    sitemap: ['/sitemap.xml'],
  },

  runtimeConfig: {
    apiBaseUrl: '',
    public: {
      siteUrl: 'https://popli.one',
      cookies: {
        auth: {
          name: 'POPLI_AUTH_TOKEN',
          refreshTokenName: 'POPLI_AUTH_REFRESH_TOKEN',
          refreshTokenExpires: 60 * 60 * 24, // 1 day
          expires: 60 * 60 * 2, // 2 hours
          httpOnly: true,
        },
      },
      nodeEnv: '',
      mapboxAccessToken: '',
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    urls: ['/', '/about', '/forgot-password', '/sign-in', '/sign-up'],
  },

  ssr: true,

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/variables.scss" as *;',
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
        'yup',
        'lodash/orderBy',
        'lodash/debounce',
        'uuid',
        'luxon',
        'mapbox-gl',
        'qr-code-styling',
        'chart.js',
      ],
    },
  },
});
