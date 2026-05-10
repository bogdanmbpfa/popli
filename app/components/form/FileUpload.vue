<template>
  <div class="file-upload">
    <input
      :id="id"
      ref="fileInput"
      type="file"
      :multiple="false"
      :accept="accept"
      :disabled="disabled"
      @change="onFileSelect"
    />

    <NuxtImg
      v-if="file || image"
      :src="file ? imagePreview(file) : image"
      alt="File preview image"
      class="preview-image"
    />

    <UiButton
      type="button"
      severity="secondary"
      icon="popli:upload-outline"
      icon-size="1.25rem"
      icon-pos="left"
      label="Choose file"
      aria-label="Choose file"
      naked
      :disabled="disabled"
      @click="choose"
    />
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
  image: {
    type: String,
    required: false,
    default: null,
  },
});

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);

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

const setFile = (newFile: File) => {
  file.value = newFile;
};

defineExpose({ remove, setFile });
</script>

<style lang="scss" scoped>
.file-upload {
  position: relative;
  width: 100%;
  height: 10rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 2px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
  border-radius: 1.5rem;

  input[type='file'] {
    width: 0;
    height: 0;
    opacity: 0;
    position: absolute;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  :deep(.ui-button) {
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
