<template>
	<nav>
		<div class="container">
			<div class="left">
				<nuxt-link to="/">
					<nuxt-img :src="images.logo" alt="Popli.one" loading="lazy" />

					<span>Popli.one</span>
				</nuxt-link>
			</div>

			<div class="center">
				<nuxt-link to="#features"> Features </nuxt-link>

				<nuxt-link to="#pricing"> Pricing </nuxt-link>

				<nuxt-link to="/about"> About </nuxt-link>
			</div>

			<div class="right">
				<PButton
					class="default"
					:icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'"
					@click="handleThemeChange" />

				<PButton class="default" as="a" variant="link" label="Log In" href="/login" />

				<PButton class="default" as="a" label="Get Started" href="/signup" />
			</div>
		</div>
	</nav>
</template>

<script setup lang="ts">
	const globalStore = useGlobalStore();
	const {
		public: { images },
	} = useRuntimeConfig();

	const darkMode = computed(() => globalStore.getDarkMode);

	onMounted(() => {
		if (import.meta.client) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

			mediaQuery.matches
				? (document.documentElement.setAttribute('data-theme', 'dark'), globalStore.setDarkMode(true))
				: (document.documentElement.setAttribute('data-theme', 'light'), globalStore.setDarkMode(false));
		}
	});

	const handleThemeChange = () => {
		globalStore.toggleDarkMode();

		if (import.meta.client) {
			document.documentElement.setAttribute('data-theme', darkMode.value ? 'dark' : 'light');
		}
	};
</script>

<style lang="scss" scoped>
	nav {
		width: 100%;
		height: 4rem;
		position: sticky;
		z-index: 10;
		top: 0;
		left: 0;
		padding: 0 0.5rem;
		backdrop-filter: blur(8px);
		background-color: color-mix(in oklab, var(--background) 60%, transparent);
		border-bottom: 1px solid var(--border);
		outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
		color: var(--foreground);
		display: flex;
		align-items: center;
		justify-content: center;

		.container {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			max-width: 80rem;
			height: 100%;

			.left {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				a {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					text-decoration: none;

					img {
						width: 2rem;
						height: 2rem;
					}

					span {
						font-size: 1.25rem;
						font-weight: 600;
						color: var(--foreground);
					}
				}
			}

			.center {
				display: flex;
				align-items: center;
				gap: 1rem;

				a {
					text-decoration: none;
					color: var(--muted-foreground);
				}
			}

			.right {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				.theme-toggle {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}
			}
		}
	}

	@media (max-width: 768px) {
		nav {
			.container {
				.center {
					display: none;
				}
			}
		}
	}
</style>
