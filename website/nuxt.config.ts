import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
	compatibilityDate: '2025-07-29',

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
		'@nuxtjs/turnstile',
		'@nuxtjs/device',
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
		},
		turnstile: {
			secretKey: '0x4AAAAAABp8G-0uMV00c1MCculpWUjb5vo',
		},
	},

	site: { indexable: true },

	ssr: true,

	turnstile: {
		addValidateEndpoint: true,
		siteKey: '0x4AAAAAABp8G9YAtc_mlZhJ',
	},

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "~/assets/variables.scss" as *; @use "~/assets/mixins.scss" as *;',
				},
			},
		},
		server: {
			hmr: {
				overlay: false,
			},
		},
		optimizeDeps: {
			include: ['vue', 'vue-router'],
		},
	},
});
