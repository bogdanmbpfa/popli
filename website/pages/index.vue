<template>
	<div class="home">
		<LandingHero />

		<LandingFeatures />

		<LandingPricing />
	</div>
</template>

<script setup lang="ts"></script>

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
