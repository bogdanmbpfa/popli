<template>
  <div class="ui-input-otp" v-bind="$attrs">
    <input
      v-for="(_, index) in slotsCount"
      :key="index"
      :value="chars[index] || ''"
      :id="`${props.id}-${index}`"
      maxlength="1"
      :inputmode="integerOnly ? 'numeric' : 'text'"
      class="otp-char"
      :class="{ invalid }"
      autocomplete="one-time-code"
      @input="onInput(index, $event)"
      @focus="onFocus($event)"
      @blur="onBlur($event)"
      @click="onClick($event)"
      @keydown="onKeyDown($event)"
      @paste="onPaste($event)"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id?: string;
    modelValue?: string;
    length?: number;
    invalid?: boolean;
    integerOnly?: boolean;
    readonly?: boolean;
    disabled?: boolean;
  }>(),
  {
    id: '',
    modelValue: '',
    length: 6,
    invalid: false,
    integerOnly: true,
    readonly: false,
    disabled: false,
  },
);
const emit = defineEmits<{
  'update:modelValue': [string];
  focus: [FocusEvent];
  blur: [FocusEvent];
}>();

const chars = computed(() => props.modelValue.split(''));
const slotsCount = computed(() => props.length);

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

const updateModel = (value: string) => emit('update:modelValue', value);

const onInput = (index: number, event: InputEvent) => {
  const current = chars.value;
  current[index] = (event.target as HTMLInputElement).value.slice(-1);
  updateModel(current.join(''));

  if (event.inputType === 'deleteContentBackward') {
    moveToPrev(event);
  } else if (
    event.inputType === 'insertText' ||
    event.inputType === 'deleteContentForward' ||
    (isTouchDevice() && event instanceof CustomEvent)
  ) {
    moveToNext(event);
  }
};

const moveToPrev = (event: Event) => {
  const prevInput = (event.target as HTMLInputElement)
    .previousElementSibling as HTMLInputElement;
  if (prevInput) {
    prevInput.focus();
    prevInput.select();
  }
};

const moveToNext = (event: Event) => {
  const nextInput = (event.target as HTMLInputElement)
    .nextElementSibling as HTMLInputElement;
  if (nextInput) {
    nextInput.focus();
    nextInput.select();
  }
};

const findNextInput = (element: HTMLElement): HTMLElement | null => {
  const nextElement = element.nextElementSibling as HTMLElement;
  if (!nextElement) return null;
  return nextElement.nodeName === 'INPUT'
    ? nextElement
    : findNextInput(nextElement);
};

const findPrevInput = (element: HTMLElement): HTMLElement | null => {
  const prevElement = element.previousElementSibling as HTMLElement;
  if (!prevElement) return null;
  return prevElement.nodeName === 'INPUT'
    ? prevElement
    : findPrevInput(prevElement);
};

const onFocus = (event: FocusEvent) => {
  (event.target as HTMLInputElement).select();
  emit('focus', event);
};

const onBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const onClick = (event: MouseEvent) => {
  setTimeout(() => (event.target as HTMLInputElement).select(), 1);
};

const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
      moveToPrev(event);
      event.preventDefault();

      break;

    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault();

      break;

    case 'Backspace':
      if ((event.target as HTMLInputElement).value.length === 0) {
        moveToPrev(event);
        event.preventDefault();
      }

      break;

    case 'ArrowRight':
      moveToNext(event);
      event.preventDefault();

      break;

    case 'Enter':
    case 'Tab':
      break;

    default:
      const target = event.target as HTMLInputElement;
      const hasSelection = target.selectionStart !== target.selectionEnd;
      const isAtMaxLength = chars.value.join('').length >= props.length;
      const isValidKey = props.integerOnly ? /^[0-9]$/.test(event.key) : true;

      if (
        !isValidKey ||
        (isAtMaxLength && event.key !== 'Delete' && !hasSelection)
      ) {
        event.preventDefault();
      }

      break;
  }
};

const onPaste = (event: ClipboardEvent) => {
  if (props.readonly || props.disabled) {
    return;
  }

  let paste = event.clipboardData?.getData('text') ?? '';

  if (paste.length) {
    let pastedCode = paste.substring(0, props.length);

    if (!props.integerOnly || !isNaN(Number(pastedCode))) {
      const current = chars.value;
      current.splice(0, current.length, ...pastedCode.split(''));
      updateModel(current.join(''));
    }
  }

  event.preventDefault();
};
</script>

<style scoped lang="scss">
.ui-input-otp {
  display: flex;
  gap: 0.5rem;

  .otp-char {
    width: 100%;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: 1rem;
    background-color: var(--input-background);
    border: 1px solid transparent;
    color: var(--neutral-100);

    &::placeholder {
      color: var(--neutral-400);
    }

    &.invalid {
      border-color: var(--primary-600);
    }

    &:focus,
    &:enabled:focus,
    &:active,
    &:enabled:active {
      background: var(--input-background) !important;
      background-color: var(--input-background) !important;
      border-color: var(--primary-400);
      outline: none;
    }

    &:hover,
    &:enabled:hover {
      background: var(--input-background) !important;
      background-color: var(--input-background) !important;
      border-color: transparent;
      outline: none;
    }
  }
}
</style>
