<template>
	<form @submit.prevent="onSubmit">
		<FormInput id="url" label="URL" :error="errors.url" :required="true">
			<PInputText
				id="url"
				v-model="url"
				v-bind="urlAttributes"
				class="default"
				fluid
				placeholder="https://example.com/long-url"
				:invalid="!!errors.url"
				:disabled="isSubmitting" />
		</FormInput>

		<FormInput id="alias" label="Alias" :error="errors.alias" :required="false">
			<PInputText
				id="alias"
				v-model="alias"
				v-bind="aliasAttributes"
				class="default"
				fluid
				placeholder="my-short-url"
				:invalid="!!errors.alias"
				:disabled="isSubmitting" />
		</FormInput>

		<FormInput id="title" label="Title" :error="errors.title" :required="false">
			<PInputText
				id="title"
				v-model="title"
				v-bind="titleAttributes"
				class="default"
				fluid
				placeholder="My Short URL"
				:invalid="!!errors.title"
				:disabled="isSubmitting" />
		</FormInput>

		<PButton
			type="submit"
			class="default"
			severity="contrast"
			icon="pi pi-check"
			label="Update"
			:disabled="isSubmitting" />
	</form>
</template>

<script setup lang="ts">
	import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions';
	import * as yup from 'yup';

	import { EApiEndpoint } from '~/../enums';
	import type { IUpdateShortUrl } from '~/../interfaces';

	const dialogRef = inject<{ value: DynamicDialogInstance }>('dialogRef');

	const toast = useToast();

	const id = ref<string | undefined>(undefined);

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
		id.value = dialogRef?.value.data.id;
		url.value = dialogRef?.value.data.url;
		alias.value = dialogRef?.value.data.alias;
		title.value = dialogRef?.value.data.title;
	});

	const onSubmit = handleSubmit(async (values) => {
		const { error } = await useApiJson(EApiEndpoint.URL_SHORT_URL_UPDATE, {
			...values,
			id: id.value,
		});

		if (error) {
			return toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: error.message,
				life: 3000,
			});
		}

		toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Short URL updated successfully',
			life: 3000,
		});

		resetForm();

		return dialogRef?.value.close();
	});
</script>
