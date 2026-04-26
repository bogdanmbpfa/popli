<template>
  <div class="ui-input-group" v-bind="$attrs">
    <div v-if="$slots.prepend" class="group-addon"><slot name="prepend" /></div>
    <div class="group-main"><slot /></div>
    <div v-if="$slots.append" class="group-addon"><slot name="append" /></div>
  </div>
</template>

<style scoped lang="scss">
.ui-input-group {
  display: flex;
  align-items: center;
  width: 100%;

  .group-addon {
    width: fit-content;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: 1rem;
    font-size: 1rem;
    line-height: 1.5;
    background-color: var(--input-background);
    border: 1px solid transparent;
    border-right: none;
    color: var(--neutral-100);
  }

  .group-main {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .group-main {
    :deep(input) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      padding-left: 0;
      border-left: none;
    }
  }

  &:has(.group-main input.invalid) {
    .group-addon {
      border-color: var(--primary-600);
    }
  }

  &:has(.group-main input:focus) {
    .group-addon {
      background-color: var(--input-background);
      border-color: var(--primary-400);
      border-right: none;
    }
  }

  &:has(.group-main input:hover) {
    .group-addon {
      background-color: var(--input-background);
      border-color: transparent;
      border-right: none;
    }
  }
}
</style>
