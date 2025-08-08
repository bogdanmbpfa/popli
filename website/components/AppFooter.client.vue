<template>
	<footer class="app-footer">
		<div class="container">
			<div class="main">
				<div class="info">
					<div class="logo">
						<nuxt-img :src="images.logo" alt="Popli.one" loading="lazy" />

						<span class="name">Popli.one</span>
					</div>

					<span class="description">
						Pop your links and share your story with the world. Beautiful, powerful, and easy to
						use.
					</span>
				</div>

				<div class="links">
					<span class="title"> Product </span>

					<div class="link-list">
						<nuxt-link to="/#features">
							<span class="label">Features</span>
						</nuxt-link>

						<nuxt-link to="/#pricing">
							<span class="label">Pricing</span>
						</nuxt-link>
					</div>
				</div>

				<div class="links">
					<span class="title"> Company </span>

					<div class="link-list">
						<nuxt-link to="/about">
							<span class="label">About</span>
						</nuxt-link>

						<nuxt-link to="/contact">
							<span class="label">Contact</span>
						</nuxt-link>

						<nuxt-link to="/terms-of-service">
							<span class="label">Terms of Service</span>
						</nuxt-link>

						<nuxt-link to="/privacy-policy">
							<span class="label">Privacy Policy</span>
						</nuxt-link>

						<nuxt-link to="/cookie-policy">
							<span class="label">Cookie Policy</span>
						</nuxt-link>
					</div>
				</div>
			</div>

			<div class="bottom">
				<span class="copyright">© 2025 Popli.one. All rights reserved.</span>

				<span class="message"> Made with ❤️ for creators everywhere. </span>
			</div>
		</div>
	</footer>
</template>

<script setup lang="ts">
	const {
		public: { images },
	} = useRuntimeConfig();
</script>

<style scoped lang="scss">
	.app-footer {
    width: 100%;
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
		background-color: color-mix(in oklab, var(--muted) 30%, transparent);
    border-top: 1px solid var(--muted);

		.container {
			display: flex;
			flex-direction: column;
			width: 100%;
			max-width: 80rem;

			.main {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				gap: 2rem;
        padding-bottom: 1rem;

        .info, .links {
          width: 100%;
        }

				.info {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;

					.logo {
						display: flex;
						flex-direction: row;
						align-items: center;
						gap: 0.5rem;

						img {
							width: 2rem;
							height: 2rem;
						}

						.name {
							font-size: 1.25rem;
							font-weight: 600;
							color: var(--primary);
						}
					}

					.description {
						font-size: 0.875rem;
						color: var(--muted-foreground);
					}
				}

				.links {
					display: flex;
					flex-direction: column;
					gap: 1rem;

					.title {
						font-size: 0.875rem;
						font-weight: 600;
						color: var(--primary);
					}

					.link-list {
						display: flex;
						flex-direction: column;
						gap: 0.25rem;

						a {
							color: var(--muted-foreground);
							text-decoration: none;
							font-size: 0.875rem;
						}
					}
				}
			}

			.bottom {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				padding-top: 1rem;
				border-top: 1px solid var(--muted);

				.copyright, .message {
					font-size: 0.875rem;
					color: var(--muted-foreground);
				}
			}
		}
	}

	@media (max-width: 768px) {
		.app-footer {
			.container {
				.main {
					flex-direction: column;
				}

				.bottom {
					flex-direction: column;
					align-items: center;
					gap: 0.5rem;
				}
			}
		}
	}
</style>
