<template>
	<div class="file-upload">
		<input
			:id="id"
			ref="fileInput"
			type="file"
			:multiple="false"
			:accept="accept"
			:disabled="disabled"
			@change="onFileSelect" />

		<nuxt-img v-if="file" :src="imagePreview(file)" alt="File preview" class="preview-image" />

		<PButton
			type="button"
			class="default"
			severity="info"
			icon="pi pi-upload"
			icon-pos="left"
			label="Choose file"
			:disabled="disabled"
			@click="choose" />
	</div>
</template>

<script setup lang="ts">
	const emit = defineEmits<{
		(e: 'select', file: File): void;
	}>();
	const props = defineProps({
		id: {
			type: String,
			default: 'file-upload',
		},
		accept: {
			type: String,
			default: 'image/jpeg',
		},
		maxFileSize: {
			type: Number,
			default: 10000000, // 10MB
		},
		fileLimit: {
			type: Number,
			default: 1,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	});

	const { t } = useI18n();

	const fileInput = ref<HTMLInputElement>();
	const file = ref<File | null>(null);
	const mimeTypes = {
		'image/jpeg': 'JPEG',
		'image/jpg': 'JPG',
		'image/png': 'PNG',
		'application/pdf': 'PDF',
		'image/webp': 'WEBP',
	};

	const acceptedMimeTypes = computed(() =>
		props.accept
			.split(',')
			.map((type) => mimeTypes[type.trim() as keyof typeof mimeTypes])
			.join(', ')
	);

	const choose = () => {
		if (fileInput.value) {
			fileInput.value.click();
		}
	};

	const onFileSelect = (event: Event) => {
		if (!event.type || event.type !== 'change') return;

		if (!event.target || !(event.target instanceof HTMLInputElement)) return;

		const selectedFile = event.target.files?.[0];

		if (!selectedFile) return;

		file.value = selectedFile;

		return emit('select', selectedFile);
	};

	const imagePreview = (file: File) => URL.createObjectURL(file);

	const remove = () => {
		file.value = null;
	};

	defineExpose({ remove });
</script>

<style lang="scss" scoped>
	.file-upload {
		position: relative;
		width: 100%;
		height: 10rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 2px solid var(--border-1);
		border-radius: 1.5rem;

		input[type='file'] {
			width: 0;
			height: 0;
			opacity: 0;
			position: absolute;
		}

		.preview-image {
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: center;
		}

		:deep(.p-button) {
			position: absolute !important;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			margin: auto;
			z-index: 10;
			width: fit-content;
			height: fit-content;
		}
	}
</style>
