<template>
	<div class="url-shortener-page">
		<div class="container">
			<FormContainer
				title="Create Short URL"
				title-icon="mdi:link"
				description="Transform your long URLs into short, shareable links.">
				<form @submit.prevent="onSubmitShortenUrl">
					<FormInput id="url" label="URL" :error="shortenUrlErrors.url" :required="true">
						<PInputText
							id="url"
							v-model="url"
							v-bind="urlAttributes"
							class="default"
							placeholder="https://example.com/long-url"
							fluid
							:invalid="!!shortenUrlErrors.url"
							:disabled="isShortenUrlSubmitting" />
					</FormInput>

					<FormInput
						id="title"
						label="Title"
						:error="shortenUrlErrors.title"
						:required="true"
						size="half">
						<PInputText
							id="title"
							v-model="title"
							v-bind="titleAttributes"
							class="default"
							placeholder="My Short URL"
							fluid
							:invalid="!!shortenUrlErrors.title"
							:disabled="isShortenUrlSubmitting" />
					</FormInput>

					<FormInput
						id="alias"
						label="Alias"
						:error="shortenUrlErrors.alias"
						:required="false"
						size="half">
						<PInputText
							id="alias"
							v-model="alias"
							v-bind="aliasAttributes"
							class="default"
							placeholder="my-short-url"
							fluid
							:invalid="!!shortenUrlErrors.alias"
							:disabled="isShortenUrlSubmitting" />
					</FormInput>

					<PButton
						type="submit"
						class="default"
						severity="contrast"
						icon="pi pi-link"
						label="Shorten URL"
						:disabled="isShortenUrlSubmitting" />
				</form>
			</FormContainer>

			<div v-if="shortUrls && shortUrls.length" class="short-urls">
				<div
					v-for="shortUrl in shortUrls"
					:key="shortUrl.id"
					class="short-url-item"
					:class="{ expanded: expandedShortUrl === shortUrl.id }">
					<div class="main">
						<div class="header">
							<div class="title">
								<span class="url-title">
									{{ shortUrl.title }}
								</span>

								<PTag
									class="default"
									:value="shortUrl.isActive ? 'Active' : 'Inactive'"
									:severity="shortUrl.isActive ? 'contrast' : 'secondary'" />
							</div>

							<div class="actions">
								<PButton
									class="default"
									icon="pi pi-chart-bar"
									title="View"
									@click="expandShortUrl(shortUrl.id)" />

								<PButton
									class="default"
									:icon="shortUrl.isActive ? 'pi pi-times' : 'pi pi-check'"
									:title="shortUrl.isActive ? 'Deactivate' : 'Activate'"
									:disabled="globalStore.actionInProgress"
									@click="handleToggleShortenedUrl(shortUrl.id)" />

								<PButton
									class="default"
									icon="pi pi-pencil"
									title="Edit"
									:disabled="globalStore.actionInProgress"
									@click="handleUpdateShortUrl(shortUrl)" />

								<PButton
									class="default"
									icon="pi pi-trash"
									title="Delete"
									:disabled="globalStore.actionInProgress"
									@click="handleDeleteShortenedUrl(shortUrl.id, shortUrl.title)" />
							</div>
						</div>

						<div class="body">
							<div class="short-code-url">
								<span class="url">
									{{ shortUrl.shortCodeUrl }}
								</span>

								<PButton
									class="default"
									icon="pi pi-clone"
									title="Copy to clipboard"
									@click="copyToClipboard(shortUrl.shortCodeUrl)" />
							</div>

							<div v-if="shortUrl.aliasUrl" class="alias-url">
								<span class="url">
									{{ shortUrl.aliasUrl }}
								</span>

								<PButton
									class="default"
									icon="pi pi-clone"
									title="Copy to clipboard"
									@click="copyToClipboard(shortUrl.aliasUrl)" />
							</div>

							<div class="original-url">
								<span class="url">
									{{ shortUrl.originalUrl }}
								</span>

								<PButton
									class="default"
									icon="pi pi-clone"
									title="Copy to clipboard"
									@click="copyToClipboard(shortUrl.originalUrl)" />
							</div>
						</div>

						<div class="footer">
							<div class="stats">
								<Icon name="mdi:eye" size="0.75rem" title="Total clicks" />
								<span class="value">{{ shortUrl.totalClicks }}</span>
							</div>

							<div class="stats">
								<Icon name="mdi:calendar-clock" size="0.75rem" title="Today's clicks" />
								<span class="value">{{ shortUrl.todayClicks }}</span>
							</div>
						</div>
					</div>

					<div class="content">
						<AnalyticsShortUrlDailyClicksChart :id="shortUrl.id" />

						<AnalyticsShortUrlClicksMap :id="shortUrl.id" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import * as yup from 'yup';

	import { EApiEndpoint } from '~/enums';
	import type { IUrlShortenUrl, IUrlShortUrl } from '~/interfaces';

	const UpdateShortUrlDialog = defineAsyncComponent(
		() => import('~/components/dialog/UpdateShortUrl.vue')
	);

	definePageMeta({
		layout: 'account',
		middleware: 'is-logged-in',
	});

	const confirm = useConfirm();
	const dialog = useDialog();
	const globalStore = useGlobalStore();
	const toast = useToast();

	const { data: shortUrls, refresh: refreshShortUrls } = await useAsyncData(
		'short-url',
		() =>
			$fetch<IUrlShortUrl[]>('/api/json', {
				method: 'POST',
				body: { key: EApiEndpoint.URL_SHORT_URL, headers: useRequestHeaders() },
			}),
		{ server: false, default: () => [] }
	);

	const expandedShortUrl = ref<string | null>(null);

	const {
		defineField: defineShortenUrlField,
		errors: shortenUrlErrors,
		handleSubmit: handleShortenUrlSubmit,
		isSubmitting: isShortenUrlSubmitting,
		resetForm: resetShortenUrlForm,
	} = useForm<IUrlShortenUrl>({
		validationSchema: yup.object({
			url: yup.string().required('URL is required').url('Invalid URL'),
			alias: yup
				.string()
				.notRequired()
				.min(3, 'Alias must be at least 3 characters')
				.max(255, 'Alias must be less than 255 characters'),
			title: yup
				.string()
				.required('Title is required')
				.min(3, 'Title must be at least 3 characters')
				.max(255, 'Title must be less than 255 characters'),
		}),
	});

	const [url, urlAttributes] = defineShortenUrlField('url');
	const [alias, aliasAttributes] = defineShortenUrlField('alias');
	const [title, titleAttributes] = defineShortenUrlField('title');

	const onSubmitShortenUrl = handleShortenUrlSubmit(async (values) => {
		const { error } = await useApiJson(EApiEndpoint.URL_SHORT_URL_CREATE, values);

		if (error) {
			return toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: error.message,
				life: 3000,
			});
		}

		resetShortenUrlForm();

		await refreshShortUrls();

		return toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'URL shortened successfully',
			life: 3000,
		});
	});

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);

		toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Copied to clipboard',
			life: 3000,
		});
	};

	const handleDeleteShortenedUrl = (id: string, title: string) =>
		confirm.require({
			header: 'Delete Shortened URL',
			message: `Are you sure you want to delete "${title}"?`,
			acceptClass: 'default p-button-danger',
			acceptLabel: 'Delete',
			blockScroll: true,
			modal: true,
			position: 'center',
			rejectClass: 'default',
			rejectLabel: 'Cancel',
			accept: async () => {
				const { error } = await useApiJson(EApiEndpoint.URL_SHORT_URL_DELETE, {}, {}, { id });

				if (error) {
					return toast.add({
						severity: 'error',
						summary: 'Oops!',
						detail: error.message,
						life: 3000,
					});
				}

				await refreshShortUrls();

				return toast.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Shortened URL deleted successfully',
					life: 3000,
				});
			},
		});

	const handleToggleShortenedUrl = async (id: string) => {
		globalStore.toggleActionInProgress();

		const { error } = await useApiJson(EApiEndpoint.URL_SHORT_URL_TOGGLE, {}, {}, { id });

		if (error) {
			toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: error.message,
				life: 3000,
			});

			return globalStore.toggleActionInProgress();
		}

		await refreshShortUrls();

		toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Shortened URL status updated successfully',
			life: 3000,
		});

		return globalStore.toggleActionInProgress();
	};

	const handleUpdateShortUrl = (shortUrl: IUrlShortUrl) =>
		dialog.open(UpdateShortUrlDialog, {
			data: {
				id: shortUrl.id,
				url: shortUrl.originalUrl,
				alias: shortUrl.alias,
				title: shortUrl.title,
			},
			props: {
				blockScroll: true,
				closable: true,
				closeOnEscape: true,
				dismissableMask: true,
				draggable: false,
				header: 'Update Short URL',
				modal: true,
				position: 'center',
				pt: { root: { class: 'default' } },
				style: { width: '30rem' },
			},
			onClose: () => refreshShortUrls(),
		});

	const expandShortUrl = (id: string) => {
		if (expandedShortUrl.value === id) {
			expandedShortUrl.value = null;
		} else {
			expandedShortUrl.value = id;
		}
	};
</script>

<style lang="scss" scoped>
	@use '../../../assets/mixins.scss' as *;

	.url-shortener-page {
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
		flex: 1;
		position: relative;

		.container {
			display: flex;
			flex-direction: column;
			gap: 2rem;
			flex: 1;
			width: 100%;
			max-width: 60rem;
			padding: 1.5rem;

			:deep(.form-container) {
				form {
					flex-direction: row;
					flex-wrap: wrap;
				}
			}

			.short-urls {
				display: flex;
				flex-direction: column;
				gap: 1rem;

				.short-url-item {
					display: flex;
					flex-direction: column;

					.main {
						display: flex;
						flex-direction: column;
						gap: 1rem;
						padding: 1rem;
						@include squircle(1.5rem);
						background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
						border: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
						transition: border-radius 0.3s ease-in-out;
						z-index: 1;

						.header {
							display: flex;
							flex-direction: row;
							justify-content: space-between;
							align-items: center;
							z-index: 2;

							.title {
								display: flex;
								align-items: center;
								gap: 0.5rem;

								.url-title {
									font-size: 1.25rem;
									font-weight: 500;
									color: var(--color-neutral-100);
								}
							}

							.actions {
								display: flex;
								flex-direction: row;
								gap: 1rem;
							}
						}

						.body {
							display: flex;
							flex-direction: column;
							gap: 0.25rem;

							.short-code-url,
							.alias-url,
							.original-url {
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 0.25rem;

								.url {
									font-size: 0.825rem;
									font-weight: 400;
									color: transparent;
									background-image: var(--gradient-right-primary);
									-webkit-background-clip: text;
									background-clip: text;
								}

								:deep(.p-button) {
									.p-button-icon {
										font-size: 0.75rem;
									}
								}
							}

							.original-url {
								.url {
									color: var(--color-neutral-400);
								}
							}
						}

						.footer {
							display: flex;
							flex-direction: row;
							gap: 1rem;

							.stats {
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 0.25rem;

								.value {
									font-size: 0.75rem;
									font-weight: 300;
									color: var(--color-neutral-400);
								}
							}
						}
					}

					.content {
						display: flex;
						flex-direction: column;
						gap: 1rem;
						border-bottom-left-radius: 1.5rem;
						border-bottom-right-radius: 1.5rem;
						background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
						padding: 0;
						height: 0;
						overflow: hidden;
						border: none;
						transition: height, padding 0.3s ease-in-out;
					}

					&.expanded {
						.main {
							border-bottom-left-radius: 0;
							border-bottom-right-radius: 0;
						}

						.content {
							padding: 1rem;
							height: auto;
							border-left: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
							border-right: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
							border-bottom: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
						}
					}
				}
			}
		}
	}
</style>
