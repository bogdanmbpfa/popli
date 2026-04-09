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

	useHead({
		title: 'Popli.one - Pop your links',
		meta: [{ name: 'description', content: 'Popli.one - Pop your links' }],
		link: [{ rel: 'canonical', href: 'https://popli.one' }],
	});

	useSeoMeta({
		title: 'Popli.one - Pop your links',
		description: 'Popli.one - Pop your links',
		applicationName: 'Popli.one',
		ogTitle: 'Popli.one - Pop your links',
		ogDescription: 'Popli.one - Pop your links',
		twitterCard: 'summary_large_image',
		twitterTitle: 'Popli.one - Pop your links',
		twitterDescription: 'Popli.one - Pop your links',
		twitterImage: 'https://popli.one/logo.png',
	});

	configure({
		validateOnInput: false,
		validateOnModelUpdate: false,
		validateOnBlur: false,
		validateOnChange: true,
	});
</script>
