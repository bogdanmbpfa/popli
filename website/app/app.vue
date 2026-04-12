<template>
	<div class="wrapper">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>

	<PConfirmDialog class="default" />
	<PDynamicDialog class="default" />
	<PToast class="default" position="top-center" />
</template>

<script setup lang="ts">
	import { configure } from 'vee-validate';

	const { seo } = useAppConfig();

	const route = useRoute();
	const {
		public: { siteUrl },
	} = useRuntimeConfig();

	const siteOrigin = computed(() =>
		String(siteUrl || 'https://popli.one').replace(/\/$/, ''),
	);

	const canonicalHref = computed(() => {
		const raw = route.path;
		const path =
			raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw;
		return `${siteOrigin.value}${path === '' ? '/' : path}`;
	});

	usePageSeo({
		title: seo.siteName,
		description: seo.homeDescription,
		path: '/',
		keywords: seo.homeKeywords,
		ogImage: seo.defaultOgImagePath,
		robots: 'index, follow',
	});

	configure({
		validateOnInput: false,
		validateOnModelUpdate: false,
		validateOnBlur: false,
		validateOnChange: true,
	});
</script>
