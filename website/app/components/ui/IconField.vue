<template>
  <div class="ui-icon-field" v-bind="$attrs">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-icon-field {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;

  :deep(input) {
    padding-left: 2.25rem;
  }
}
</style>
