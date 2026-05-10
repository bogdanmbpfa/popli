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
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/logo.png',
        },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },

  compatibilityDate: '2026-02-01',

  css: ['~/assets/main.scss'],

  devtools: { enabled: true },

  evlog: {
    enabled: true,
    env: {
      service: 'popli',
    },
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800, 900],
      styles: ['normal', 'italic'],
    },
    families: [{ name: 'Roboto', provider: 'google' }],
  },

  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en.json',
        name: 'English',
        iso: 'en-US',
      },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    langDir: 'locales/',
    vueI18n: './i18n.config.ts',
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
    'evlog/nuxt',
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
        onPageLoad: true,
        pageLevelAds: false,
        test: process.env.NUXT_PUBLIC_NODE_ENV !== 'production',
      },
    ],
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  nitro: {
    preset: 'node-server',
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

  robots: {
    allow: ['/', '/about', '/forgot-password', '/sign-in', '/sign-up', '/*$'],
    disallow: ['/account', '/account/', '/s', '/s/'],
    blockAiBots: false,
    sitemap: ['/sitemap.xml'],
  },

  runtimeConfig: {
    brevo: {
      apiKey: '',
      templates: {
        welcome: 2,
        passwordReset: 3,
        emailVerification: 6,
        emailUpdate: 5,
      },
    },
    database: {
      url: '',
    },
    stripe: {
      secretKey: '',
      webhookSecret: '',
      proPriceId: '',
    },
    googleCloud: {
      projectId: '',
      storage: {
        serviceAccountEmail: '',
        serviceAccountKey: '',
        bucket: '',
      },
    },
    public: {
      cookies: {
        auth: {
          name: 'xt',
          refreshTokenName: 'xrt',
          refreshTokenExpires: 60 * 60 * 24, // 1 day
          expires: 60 * 60 * 2, // 2 hours
          httpOnly: true,
        },
      },
      freePlan: {
        qrCodeLimit: 3,
        shortUrlLimit: 3,
        featuredLinksLimit: 3,
        secondaryLinksLimit: 3,
      },
      errorMessages: {
        userAlreadyExists: 'USER_ALREADY_EXISTS',
        invalidCredentials: 'INVALID_CREDENTIALS',
        invalidRefreshToken: 'INVALID_REFRESH_TOKEN',
        tokenExpired: 'TOKEN_EXPIRED',
        rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
        passwordResetCodeExpired: 'PASSWORD_RESET_CODE_EXPIRED',
        invalidCode: 'INVALID_CODE',
        accountNotFound: 'ACCOUNT_NOT_FOUND',
        emailConfirmationCodeExpired: 'EMAIL_CONFIRMATION_CODE_EXPIRED',
        unauthorized: 'UNAUTHORIZED',
        emailAlreadyConfirmed: 'EMAIL_ALREADY_CONFIRMED',
        fileRequired: 'FILE_REQUIRED',
        passwordSameAsCurrent: 'PASSWORD_SAME_AS_CURRENT',
        handleAlreadyExists: 'HANDLE_ALREADY_EXISTS',
        emailSameAsCurrent: 'EMAIL_SAME_AS_CURRENT',
        aliasAlreadyExists: 'ALIAS_ALREADY_EXISTS',
        shortUrlNotFound: 'SHORT_URL_NOT_FOUND',
        ipProxy: 'IP_PROXY',
        linkNotFound: 'LINK_NOT_FOUND',
        validationError: 'VALIDATION_ERROR',
        profileNotFound: 'PROFILE_NOT_FOUND',
        emailRequired: 'EMAIL_REQUIRED',
        emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
        internalServerError: 'INTERNAL_SERVER_ERROR',
        qrCodeNotFound: 'QR_CODE_NOT_FOUND',
        backgroundImageNotFound: 'BACKGROUND_IMAGE_NOT_FOUND',
        freePlanLimitReached: 'FREE_PLAN_LIMIT_REACHED',
        paymentRequired: 'PAYMENT_REQUIRED',
        billingNotConfigured: 'BILLING_NOT_CONFIGURED',
        emailNotConfirmed: 'EMAIL_NOT_CONFIRMED',
      },
      mapboxAccessToken: '',
      nodeEnv: '',
      siteUrl: '',
    },
    storage: {
      accessKeyId: '',
      secretAccessKey: '',
      region: '',
      bucket: '',
      endpoint: '',
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    urls: ['/', '/about', '/forgot-password', '/sign-in', '/sign-up'],
  },

  ssr: true,

  typescript: {
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('mapbox-gl')) return 'vendor-mapbox';
            if (id.includes('chart.js')) return 'vendor-chart';
            if (id.includes('qr-code-styling')) return 'vendor-qrcode';
            if (id.includes('vuedraggable') || id.includes('sortablejs')) {
              return 'vendor-draggable';
            }
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/variables.scss" as *;',
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
      ],
    },
  },
});
