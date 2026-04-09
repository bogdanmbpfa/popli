<template>
	<div class="home">
		<LandingHero />

		<LandingFeatures />

		<LandingPricing />
	</div>
</template>

<script setup lang="ts">
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
});
</script>

<style lang="scss" scoped>
	.home {
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
	}
</style>
