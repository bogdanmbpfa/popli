<template>
	<div class="wrapper">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>

	<UiDynamicDialog />
	<UiConfirmDialog />
	<UiToast />
</template>

<script setup lang="ts">
	import { configure } from 'vee-validate';

	const { seo } = useAppConfig();

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
