<template>
  <div
    class="ui-drawer-overlay"
    :class="{ visible, 'is-mobile': isMobile }"
    @click.self="$emit('update:visible', false)"
  >
    <aside class="ui-drawer" v-bind="$attrs">
      <div class="header">
        <slot name="header" />
      </div>

      <div class="content">
        <slot name="default" />
      </div>

      <div class="footer">
        <slot name="footer" />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ visible?: boolean; isMobile?: boolean }>(), {
  visible: false,
  isMobile: false,
});

defineEmits<{ 'update:visible': [boolean] }>();
</script>

<style scoped lang="scss">
.ui-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: fit-content;
  height: 100lvh;
  backdrop-filter: blur(0.5rem);
  width: 100lvh;
  transition: left 0.3s ease-in-out;

  &:not(.visible) {
    left: -100lvh;
  }

  &:not(.is-mobile) {
    width: 20rem;
    backdrop-filter: none;
  }

  .ui-drawer {
    width: 100%;
    max-width: 20rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--background-primary);
    border: none;
    border-right: 1px solid
      color-mix(in oklab, var(--neutral-800) 30%, transparent);

    .footer {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: flex-end;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }
}
</style>
