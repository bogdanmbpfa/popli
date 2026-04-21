<template>
  <div class="ui-select-button" :class="{ fluid }" v-bind="$attrs">
    <button
      v-for="option in options"
      :key="getOptionValue(option).toString()"
      type="button"
      class="option"
      :class="{ active: isSelected(option), disabled: option.disabled }"
      :disabled="Boolean(option.disabled)"
      @click="select(option)"
    >
      <slot name="option" :option="option">
        {{ getOptionLabel(option) }}
      </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
type Option = Record<string, string | number | boolean>;

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: Option[];
    optionLabel?: string;
    optionValue?: string;
    fluid?: boolean;
  }>(),
  {
    modelValue: undefined,
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    fluid: false,
  },
);
const emit = defineEmits<{ 'update:modelValue': [unknown] }>();

const getOptionLabel = (option: Option) =>
  String(option[props.optionLabel] ?? '');
const getOptionValue = (option: Option) =>
  option[props.optionValue] ?? getOptionLabel(option);
const isSelected = (option: Option) =>
  Object.is(getOptionValue(option), props.modelValue);
const select = (option: Option) =>
  emit('update:modelValue', getOptionValue(option));
</script>

<style scoped lang="scss">
.ui-select-button {
  border-radius: 0.25rem;
  display: inline-flex;
  padding: 0.25rem;
  background-color: var(--input-background);
  width: fit-content;

  &.fluid {
    width: 100%;
  }

  .option {
    width: 100%;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0;
    background-color: var(--input-background);
    padding: 0.6rem clamp(0.5rem, 1vw, 2rem);
    color: var(--neutral-400);
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    font-weight: 500;
    cursor: pointer;

    &:first-child {
      border-top-left-radius: 0.25rem;
      border-bottom-left-radius: 0.25rem;
    }

    &:last-child {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }

    &.active,
    &:not(:disabled):hover {
      background-color: var(--background-primary);
      color: var(--neutral-100);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 768px) {
  .ui-select-button {
    .option:has(.iconify) {
      .label {
        display: none;
      }
    }
  }
}
</style>
