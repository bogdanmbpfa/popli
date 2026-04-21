<template>
	<form @submit.prevent="onSubmit">
		<FormInput id="url" label="URL" :error="errors.url" :required="true">
			<UiInputText
				id="url"
				v-model="url"
				v-bind="urlAttributes"
				fluid
				placeholder="https://example.com/long-url"
				:invalid="!!errors.url"
				:disabled="isSubmitting" />
		</FormInput>

		<FormInput id="alias" label="Alias" :error="errors.alias" :required="false">
			<UiInputText
				id="alias"
				v-model="alias"
				v-bind="aliasAttributes"
				fluid
				placeholder="my-short-url"
				:invalid="!!errors.alias"
				:disabled="isSubmitting" />
		</FormInput>

		<FormInput id="title" label="Title" :error="errors.title" :required="false">
			<UiInputText
				id="title"
				v-model="title"
				v-bind="titleAttributes"
				fluid
				placeholder="My Short URL"
				:invalid="!!errors.title"
				:disabled="isSubmitting" />
		</FormInput>

		<UiButton
			type="submit"
			severity="contrast"
			icon="popli:check"
			icon-size="1.25rem"
			label="Update"
			aria-label="Update short URL"
			:disabled="isSubmitting" />
	</form>
</template>

<script setup lang="ts">
	import * as yup from 'yup';

	import { EApiEndpoint } from '~~/enums';
	import type { IUpdateShortUrl, IUrlShortUrl } from '~~/interfaces';

	const props = defineProps<{
		shortUrl: IUrlShortUrl;
	}>();

	const uiToast = useUiToast();
	const uiDynamicDialog = useUiDynamicDialog();

	const { defineField, errors, handleSubmit, resetForm, isSubmitting } = useForm<IUpdateShortUrl>({
		validationSchema: yup.object().shape({
			url: yup.string().required('URL is required').url('Invalid URL'),
			alias: yup
				.string()
				.notRequired()
				.min(3, 'Alias must be at least 3 characters')
				.max(255, 'Alias must be less than 255 characters'),
			title: yup
				.string()
				.notRequired()
				.min(3, 'Title must be at least 3 characters')
				.max(255, 'Title must be less than 255 characters'),
		}),
	});

	const [url, urlAttributes] = defineField('url');
	const [alias, aliasAttributes] = defineField('alias');
	const [title, titleAttributes] = defineField('title');

	onMounted(() => {
		url.value = props.shortUrl.originalUrl;
		alias.value = props.shortUrl.alias ?? undefined;
		title.value = props.shortUrl.title ?? undefined;
	});

	const onSubmit = handleSubmit(async (values) => {
		const { error } = await useApiJson(EApiEndpoint.URL_SHORT_URL_UPDATE, {
			...values,
			id: props.shortUrl.id,
		});

		if (error) {
			return uiToast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: error.message,
				life: 3000,
			});
		}

		uiToast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Short URL updated successfully',
			life: 3000,
		});

		resetForm();

		return uiDynamicDialog.close();
	});
</script>
