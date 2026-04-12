<template>
	<div />
</template>

<script setup lang="ts">
	import { EApiEndpoint } from '~/../enums';

	definePageMeta({
		layout: 'auth',
	});

	useHead({ title: 'Redirecting…' });
	useSeoMeta({
		robots: 'noindex, nofollow',
		description: 'Short link redirect on Popli.one.',
	});

	onBeforeMount(async () => {
		const {
			params: { shortUrlCode },
		} = useRoute();

		if (!shortUrlCode) return navigateTo('/');

		const { data, error } = await useApiJson(
			EApiEndpoint.URL_SHORT_URL_REDIRECT,
			{},
			{},
			{
				shortUrlCode,
			}
		);

		if (error || !data) return navigateTo('/');

		window.location.href = data;
	});
</script>
