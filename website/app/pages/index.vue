<template>
	<div class="home">
		<LandingHero />

		<LandingFeatures />

		<LandingPricing />
	</div>
</template>

<script setup lang="ts">
	const { seo } = useAppConfig();

	usePageSeo({
		title: seo.homeTitle,
		description: seo.homeDescription,
		path: '/',
		keywords: seo.homeKeywords,
		ogImage: seo.defaultOgImagePath,
		robots: 'index, follow',
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
