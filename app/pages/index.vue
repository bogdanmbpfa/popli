<template>
	<div class="home">
		<LandingHero />

		<LandingFeatures />

		<LandingPricing />

		<div v-if="showAd" class="ad-section">
			<Adsbygoogle
				ad-format="auto"
				ad-slot="1698276428"
				:ad-full-width-responsive="true"
				:ad-style="{ display: 'block', width: '100%' }"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { EPlanType } from '~~/enums';

	const { seo } = useAppConfig();
	const userStore = useUserStore();

	const showAd = computed(
		() => userStore.getUser?.plan !== EPlanType.PRO,
	);

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

		.ad-section {
			width: 100%;
			max-width: 60rem;
			padding: 2rem 1rem;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
