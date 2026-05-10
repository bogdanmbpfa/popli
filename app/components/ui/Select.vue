<template>
  <div ref="containerRef" class="ui-select-container" :class="{ open: isOpen }">
    <button
      type="button"
      class="ui-select-trigger"
      :class="{ invalid }"
      :disabled="isDisabled"
      @click="toggleDropdown"
    >
      <span v-if="!hasValue" class="placeholder">{{ placeholder }}</span>

      <slot name="value" :value="displayValue">
        {{ displayValue }}
      </slot>

      <Icon name="popli:arrow-down" class="select-icon default" size="1.5rem" />
    </button>

    <div class="ui-select-dropdown-list">
      <div
        v-for="(option, index) in normalizedOptions"
        :key="`${getOptionValue(option)}-${index}`"
        class="ui-select-dropdown-list-item"
        @click="selectOption(index)"
      >
        <slot name="option" :option="option">
          {{ getOptionLabel(option) }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useAttrs } from 'vue';

type Primitive = string | number | boolean;
type SelectOption = Primitive | Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    modelValue?: unknown;
    options?: SelectOption[];
    optionLabel?: string;
    optionValue?: string;
    optionDisabled?: string;
    placeholder?: string;
    invalid?: boolean;
  }>(),
  {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    optionDisabled: 'disabled',
    placeholder: '',
    invalid: false,
  },
);

const emit = defineEmits<{ 'update:modelValue': [unknown] }>();
const attrs = useAttrs();
const containerRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const normalizedOptions = computed(() => props.options ?? []);
const isDisabled = computed(
  () => attrs.disabled !== undefined && attrs.disabled !== false,
);

const isPrimitiveOption = (option: SelectOption): option is Primitive =>
  typeof option === 'string' ||
  typeof option === 'number' ||
  typeof option === 'boolean';

const getOptionLabel = (option: SelectOption) => {
  if (isPrimitiveOption(option)) {
    return String(option);
  }

  return String(option[props.optionLabel] ?? '');
};

const getOptionValue = (option: SelectOption) => {
  if (isPrimitiveOption(option)) {
    return option;
  }

  return option[props.optionValue] ?? null;
};

const isOptionDisabled = (option: SelectOption) => {
  if (isPrimitiveOption(option)) {
    return false;
  }

  return Boolean(option[props.optionDisabled]);
};

const selectedIndex = computed(() =>
  normalizedOptions.value.findIndex((option) =>
    Object.is(getOptionValue(option), props.modelValue),
  ),
);

const hasValue = computed(() => selectedIndex.value >= 0);
const displayValue = computed(() => {
  if (!hasValue.value) {
    return props.placeholder || '';
  }

  return getOptionLabel(
    normalizedOptions.value[selectedIndex.value] as SelectOption,
  );
});

const clearSelection = () => {
  emit('update:modelValue', null);
  isOpen.value = false;
};

const selectOption = (index: number) => {
  const selected = normalizedOptions.value[index];

  if (selected === undefined || isOptionDisabled(selected)) {
    return;
  }

  emit('update:modelValue', getOptionValue(selected));
  isOpen.value = false;
};

const toggleDropdown = () => {
  if (isDisabled.value) {
    return;
  }

  isOpen.value = !isOpen.value;
};

const onClickOutside = (event: MouseEvent) => {
  if (!containerRef.value) {
    return;
  }

  if (!containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isOpen.value = false;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    if (isDisabled.value) {
      return;
    }
    event.preventDefault();
    isOpen.value = !isOpen.value;
  }
};

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  document.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
  document.removeEventListener('keydown', onKeyDown);
});

watch(isDisabled, (value) => {
  if (value) {
    isOpen.value = false;
  }
});
</script>

<style scoped lang="scss">
.ui-select-container {
  position: relative;
  width: 100%;

  .ui-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    min-height: 3rem;
    padding: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid transparent;
    background: var(--input-background);
    background-color: var(--input-background) !important;
    color: var(--neutral-100);
    text-align: left;
    cursor: pointer;
    outline: none;

    &.invalid {
      border-color: var(--primary-600);
    }

    &:focus,
    &:focus-visible {
      border-color: var(--primary-400);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .ui-select-value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.placeholder {
        color: var(--neutral-400);
      }
    }

    .select-icon {
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }
  }

  .ui-select-dropdown-list {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    width: 100%;
    max-height: 10rem;
    display: none;
    overflow-y: auto;
    background: var(--input-background);
    border-radius: 0.25rem;
    border: 1px solid var(--neutral-400);
    z-index: 1000;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .ui-select-dropdown-list-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0.5rem;
      color: var(--neutral-400);
      cursor: pointer;

      &:hover {
        color: var(--neutral-100);
        background-color: var(--background-primary);
      }
    }
  }

  &.open {
    .ui-select-trigger {
      border-color: var(--primary-400);

      .select-icon {
        transform: rotate(180deg);
      }
    }

    .ui-select-dropdown-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  }
}
</style>
