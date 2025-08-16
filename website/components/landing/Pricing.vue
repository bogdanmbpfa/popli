<template>
	<div id="pricing" class="pricing">
		<div class="heading">
			<h1>Simple, transparent pricing</h1>

			<span class="description">
				Choose the plan that fits your needs. Upgrade or downgrade at any time.
			</span>
		</div>

		<div class="prices">
			<div
				v-for="price in prices"
				:key="price.name"
				class="price"
				:class="{ featured: price.featured }">
				<PTag v-if="price.featured" class="default" severity="contrast" icon="pi pi-star">
					Most popular
				</PTag>

				<div class="heading">
					<span class="name">
						{{ price.name }}
					</span>

					<span class="description">
						{{ price.description }}
					</span>
				</div>

				<div class="price-details">
					<span class="price-value">
						{{
							Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: price.currency,
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							}).format(price.price)
						}}
					</span>

					<span class="period"> / {{ price.period }} </span>
				</div>

				<PButton
					class="default"
					as="a"
					:severity="price.featured ? 'contrast' : 'secondary'"
					:label="price.button.text"
					:href="price.button.link" />

				<div class="features">
					<div v-for="feature in price.features" :key="feature" class="feature">
						<Icon name="material-symbols:check" size="1rem" />

						<span class="name">
							{{ feature }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const prices = ref([
		{
			name: 'Free',
			featured: false,
			description: 'Perfect for getting started',
			price: 0,
			currency: 'EUR',
			period: 'forever',
			features: ['Basic Link-in-Bio page', '3 short links', 'Basic QR codes', 'Basic analytics'],
			button: {
				text: 'Get Started',
				link: '/signup',
			},
		},
		{
			name: 'Pro',
			featured: true,
			description: 'Perfect for getting started',
			price: 6,
			currency: 'EUR',
			period: 'month',
			features: [
				'Everything in Free',
				'Advanced Link-in-Bio page',
				'Unlimited short links',
				'Unlimited QR codes',
				'Custom themes',
				'Advanced analytics',
				'Digital assets',
			],
			button: {
				text: 'Get Started',
				link: '/signup',
			},
		},
	]);
</script>

<style scoped lang="scss">
	.pricing {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 4rem 1rem;

		.heading {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 0.5rem;

			h1 {
				font-size: 2rem;
				font-weight: 600;
			}

			.description {
				font-size: 1.25rem;
				font-weight: 400;
				color: var(--text-300);
			}
		}

		.prices {
			display: flex;
			flex-direction: row;
			justify-content: center;
			gap: 2rem;

			.price {
				position: relative;
				display: flex;
				flex-direction: column;
				gap: 2rem;
				border: 1px solid var(--border-1);
				border-radius: 1rem;
				padding: 1.5rem;

				&.featured {
					transform: scale(1.05);
					border-color: var(--border-2);
				}

				:deep(.p-tag) {
					position: absolute;
					top: -0.5rem;
					right: 0;
					left: 0;
					margin: 0 auto;
					z-index: 1;
				}

				.heading {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;

					.name {
						font-size: 1.25rem;
						font-weight: 600;
						color: var(--text-100);
					}

					.description {
						font-size: 0.875rem;
						color: var(--text-300);
					}
				}

				.price-details {
					width: 100%;
					display: flex;
					flex-direction: row;
					justify-content: center;
					gap: 0.5rem;
					align-items: center;

					.price-value {
						font-size: 2rem;
						font-weight: 600;
						color: var(--text-100);
					}

					.period {
						font-size: 1rem;
						font-weight: 400;
						color: var(--text-300);
					}
				}

				.features {
					display: flex;
					flex-direction: column;
					gap: 0.5rem;

					.feature {
						display: flex;
						flex-direction: row;
						gap: 0.5rem;
						align-items: center;

						.name {
							font-size: 0.875rem;
							color: var(--text-100);
						}

						.iconify {
							filter: brightness(0) saturate(100%) invert(49%) sepia(100%) saturate(1037%)
								hue-rotate(104deg) brightness(96%) contrast(101%);
						}
					}
				}
			}
		}
	}

	@media (max-width: 768px) {
		.pricing {
			.prices {
				flex-direction: column;
			}
		}
	}
</style>
