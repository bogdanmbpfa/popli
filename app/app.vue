<template>
  <div class="wrapper">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>

  <CookieControl locale="en" />

  <UiDynamicDialog />
  <UiConfirmDialog />
  <UiToast />
</template>

<script setup lang="ts">
import { configure } from 'vee-validate';

useHead({
  titleTemplate(titleChunk) {
    if (!titleChunk) return 'Popli.one';
    if (titleChunk.includes('Popli.one')) return titleChunk;
    return `${titleChunk} | Popli.one`;
  },
});

configure({
  validateOnInput: false,
  validateOnModelUpdate: false,
  validateOnBlur: false,
  validateOnChange: true,
});
</script>

<style lang="scss">
.cookieControl {
  .cookieControl__Bar {
    padding: 1.5rem;
    background-color: transparent;

    .cookieControl__BarContainer {
      background-color: var(--neutral-950);
      border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
      border-radius: 0.5rem;
			padding: 1.5rem;

			h2 {
				font-family: 'Roboto', sans-serif;
				font-size: 1.25rem;
				font-weight: 500;
				color: var(--neutral-100);
			}

			p {
				font-family: 'Roboto', sans-serif;
				font-size: 1rem;
				font-weight: 400;
				color: var(--neutral-400);
			}

			.cookieControl__BarButtons {
				button:first-child {
					background-color: transparent;
					background-image: var(--linear-gradient-primary);
					border-radius: 0.25rem;
					padding: 0.75rem 2rem;
					font-size: 1rem;
					font-weight: 500;
					color: var(--primary-950);
				}

				button:last-child {
					background-color: transparent;
					border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
					border-radius: 0.25rem;
					padding: 0.75rem 2rem;
					font-size: 1rem;
					font-weight: 500;
					color: var(--neutral-100);
				}
			}
    }
  }

	.cookieControl__Modal {
		.cookieControl__ModalContent {
			overflow: hidden;
			background-color: var(--background-primary);
			border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
			border-radius: 0.5rem;

			.cookieControl__ModalContentInner {
				padding: 1.5rem;
				gap: 1rem;

				.cookieControl__ModalClose {
					padding: 0.75rem 2rem;
					font-size: 1rem;
					font-weight: 500;
					color: var(--neutral-100);
					background-color: transparent;
					border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
					border-radius: 0.25rem;
				}

				h2 {
					font-family: 'Roboto', sans-serif;
					font-size: 1.25rem;
					font-weight: 500;
					color: var(--neutral-100);
					margin: 0;
				}

				ul {
					margin: 0;

					li {
						.cookieControl__ModalInputWrapper {
							button {
								background-color: var(--neutral-950);

								&::before {
									background-color: var(--neutral-100);
								}
							}

							&:has(input:checked) {
								button {
									background-color: var(--neutral-800);
								}
							}

							label {
								font-family: 'Roboto', sans-serif;
								font-size: 1rem;
								font-weight: 400;
								color: var(--neutral-100);

								span {
									color: var(--neutral-400);
								}
							}
						}
					}
				}

				.cookieControl__ModalButtons {
					display: flex;
					justify-content: space-between;
					gap: 1rem;

					button {
						display: flex;
						align-items: center;
						justify-content: center;
						flex: 1;
						padding: 0.75rem 2rem;
						font-family: 'Roboto', sans-serif;
						font-size: 1rem;
						font-weight: 500;
						border-radius: 0.25rem;
						border: 1px solid transparent;

						&:nth-child(1) {
							background-color: transparent;
							border-color: color-mix(in oklab, var(--neutral-400) 20%, transparent);
							color: var(--neutral-100);
						}

						&:nth-child(2) {
							background-color: transparent;
							background-image: var(--linear-gradient-primary);
							border: none;
							color: var(--primary-950);
						}

						&:nth-child(3) {
							background-color: var(--danger);
							border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
							color: var(--primary-400);
						}
					}
				}
			}
		}
	}
}
</style>
