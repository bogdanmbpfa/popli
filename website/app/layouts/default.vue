<template>
	<div class="layout">
		<AppNavbar />

		<main>
			<slot />
		</main>

		<div class="ad-drawer" :class="{ open: isAdDrawerOpen }">
			<div class="container">
				<PButton class="default" icon="pi pi-arrow-up" @click="isAdDrawerOpen = !isAdDrawerOpen" />
			</div>
		</div>

		<AppFooter />
	</div>
</template>

<script setup lang="ts">
	const isAdDrawerOpen = ref(false);
</script>

<style lang="scss" scoped>
	.layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100lvh;
		position: relative;

		main {
			flex: 1;
			width: 100%;
		}

		.ad-drawer {
			position: fixed;
			bottom: 0;
			right: 0;
			left: 0;
			z-index: 1000;
			width: 40rem;
			height: 0;
			background-color: white;
			margin: 0 auto;
			transition: height 0.3s ease-in-out;

			&.open {
				height: 40rem;
			}

			.container {
				width: 100%;
				height: 100%;
				position: relative;

				:deep(.p-button) {
					width: 5rem;
					height: 2rem;
					background-color: white;
					position: absolute;
					left: 0;
					right: 0;
					top: -2rem;
					margin: 0 auto;
					border-bottom-left-radius: 0;
					border-bottom-right-radius: 0;
					border-top-left-radius: 1rem;
					border-top-right-radius: 1rem;
				}
			}
		}
	}
</style>
