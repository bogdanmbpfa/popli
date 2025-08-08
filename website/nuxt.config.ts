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
		public: {
			images: {
				logo: 'https://storage.googleapis.com/popli-public/logo.png',
			},
		},
	},

	site: { indexable: true },

	ssr: true,

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "@/assets/variables.scss" as *;',
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
