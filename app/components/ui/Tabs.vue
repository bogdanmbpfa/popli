<template>
  <div class="ui-tabs" v-bind="$attrs">
    <div class="tabs-list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="tab-trigger"
        :class="{ active: tab.value === selected, disabled: tab.disabled }"
        role="tab"
        :disabled="tab.disabled"
        @click="select(tab.value)"
      >
        <slot :name="`tab-${tab.value}`" :tab="tab">{{ tab.label }}</slot>
      </button>
    </div>

    <div class="tabs-panel" role="tabpanel">
      <slot :name="`panel-${selected}`" :value="selected">
        <slot />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type TabItem = { value: string; label: string; disabled?: boolean };
const props = withDefaults(defineProps<{ value?: string; tabs?: TabItem[] }>(), {
  value: '',
  tabs: () => []
});
const emit = defineEmits<{ 'update:value': [string] }>();

const selected = computed(() => props.value || props.tabs[0]?.value || '');
const select = (value: string) => emit('update:value', value);
</script>

<style scoped lang="scss">
.ui-tabs {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .tabs-list {
    height: fit-content;
    display: flex;
    border: none;
    background: none;
    background-color: var(--background-secondary);

    .tab-trigger {
      width: 100%;
      height: fit-content;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      border: none;
      color: var(--neutral-400);
      font-weight: 500;
      font-size: 1rem;
      border-radius: 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: transparent;
      cursor: pointer;

      &.active {
        color: var(--primary-400);
        border-bottom: 4px solid var(--primary-400);
      }
    }
  }

  .tabs-panel {
    background: none;
    padding: 0;
    color: unset;
  }
}
</style>
