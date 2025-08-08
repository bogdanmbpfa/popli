<template>
	<div class="hero">
		<div class="background" :class="{ dark: isDarkMode }" />

		<div class="container">
			<div class="heading">
				<h1 class="primary">Pop your links.</h1>
				<h1 class="primary">Share your story.</h1>
			</div>

			<span class="subheading">
				Create beautiful link-in-bio pages, shorten URLs, generate QR codes, and sell digital
				products. Everything you need in one powerful platform.
			</span>

			<div class="cta">
				<PButton
					class="default"
					as="a"
					variant="link"
					href="/signup"
					label="Start for free"
					icon="pi pi-arrow-right"
					icon-pos="right"
					severity="contrast" />
			</div>

			<div class="features">
				<div v-for="feature in features" :key="feature.name" class="feature">
					<Icon :name="feature.icon" size="1.5rem" />

					<span class="name">{{ feature.name }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const globalStore = useGlobalStore();
	
	const features = ref([
		{ icon: 'akar-icons:link-chain', name: 'Link-in-Bio' },
		{ icon: 'charm:lightning-bolt', name: 'Shorten URLs' },
		{ icon: 'ic:outline-qr-code-scanner', name: 'QR Codes' },
		{ icon: 'material-symbols:shopping-bag-outline-sharp', name: 'Digital Products' },
	]);

	const isDarkMode = computed(() => globalStore.getDarkMode);
</script>

<style lang="scss" scoped>
	.hero {
		padding: 4rem;
		display: flex;
		justify-content: center;
		position: relative;

		.background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: -1;
			background-image: linear-gradient(
				to bottom right in oklab,
				var(--color-blue-50) 0%,
				var(--color-purple-50) 50%,
				var(--color-pink-50) 100%
			);

			&.dark {
				background-image: linear-gradient(
					to bottom right in oklab,
					color-mix(in oklab, var(--color-blue-950) 20%, transparent 100%) 0%,
					color-mix(in oklab, var(--color-purple-950) 20%, transparent 100%) 50%,
					color-mix(in oklab, var(--color-pink-950) 20%, transparent 100%) 100%
				);
			}
		}

		.container {
			max-width: 48rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 2rem;

			.heading {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.25rem;
			}

			span.subheading {
				text-align: center;
				font-size: 1.25rem;
				color: var(--muted-foreground);
				max-width: 40rem;
			}

			.features {
				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 2rem;

				.feature {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 0.5rem;

					.name {
						font-size: 0.875rem;
						font-weight: 500;
						text-align: center;
					}
				}
			}
		}
	}
</style>
