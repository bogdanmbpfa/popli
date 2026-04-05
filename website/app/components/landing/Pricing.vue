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
        :class="{ featured: price.featured }"
      >
        <div class="background" />

        <div class="content">
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
            :severity="price.featured ? 'contrast' : 'secondary'"
            :label="price.button.text"
            :aria-label="`Select ${price.name} plan`"
            fluid
            @click="onSelectPrice(price.type)"
          />

          <div class="features">
            <div
              v-for="feature in price.features"
              :key="feature"
              class="feature"
            >
              <Icon
                :name="
                  price.featured
                    ? 'material-symbols:check-circle-rounded'
                    : 'material-symbols:check-circle-outline'
                "
                size="1rem"
              />

              <span class="name">
                {{ feature }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const prices = ref([
  {
    name: 'Free Tier',
    type: 'free' as const,
    featured: false,
    description: 'Perfect for getting started',
    price: 0,
    currency: 'EUR',
    period: 'forever',
    features: [
      'Basic Link-in-Bio page',
      '3x short links',
      '3x QR codes',
      'Basic analytics',
    ],
    button: {
      text: 'Get Started',
      link: '/sign-up',
    },
  },
  {
    name: 'Pro Tier',
    type: 'pro' as const,
    featured: true,
    description: 'Perfect for getting started',
    price: 6,
    currency: 'EUR',
    period: 'month',
    features: [
      'Advanced Link-in-Bio page',
      'Unlimited short links',
      'Unlimited QR codes',
      'Custom themes',
      'Advanced analytics',
    ],
    button: {
      text: 'Get Started',
      link: '/sign-up',
    },
  },
]);

const onSelectPrice = (type: 'free' | 'pro') =>
  navigateTo(`/sign-up?plan=${type}`);
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
      color: var(--neutral-400);
    }
  }

  .prices {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;

    .price {
      position: relative;
      min-width: 20rem;

      &.featured {
        transform: scale(1.1);

        .background {
          position: absolute;
          inset: -0.25rem;
          z-index: -1;
          background-image: linear-gradient(
            to right in oklab,
            var(--primary-400) 0%,
            var(--secondary-400) 100%
          );
          opacity: 0.25;
          border-radius: 1rem;
          filter: blur(0.5rem);
        }

        .content {
          border-color: color-mix(
            in oklab,
            var(--primary-400) 20%,
            transparent
          );
          background-color: color-mix(
            in oklab,
            var(--neutral-950) 60%,
            transparent
          );
          backdrop-filter: blur(0.75rem);
        }
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        border: 1px solid
          color-mix(in oklab, var(--neutral-400) 20%, transparent);
        border-radius: 1rem;
        padding: 1.5rem;

        .heading {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .name {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--tertiary-100);
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
              filter: brightness(0) saturate(100%) invert(58%) sepia(62%)
                saturate(520%) hue-rotate(304deg) brightness(106%)
                contrast(103%);
            }
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

			.price {
				&.featured {
					transform: scale(1);
				}
			}
    }
  }
}
</style>
