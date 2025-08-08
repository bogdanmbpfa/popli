<template>
	<div class="wrapper">
		<NuxtLayout :key="route.path">
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>

<script setup lang="ts">
	useHead({
		title: 'Popli.one - Pop your links',
		meta: [{ name: 'description', content: 'Popli.one - Pop your links' }],
	});
	const route = useRoute();

	const theme = ref<'light' | 'dark'>('light');

	onMounted(() => {
		if (import.meta.client) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

			theme.value = mediaQuery.matches ? 'dark' : 'light';
		}
	});
</script>
