<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="drawer-overlay" @click="closeDrawer(true)">
        <div
          ref="drawerRef"
          class="drawer"
          :class="{ 'is-dragging': isDragging }"
          :style="drawerStyle"
          @click.stop
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @mousedown="handleMouseDown"
        >
          <div class="drawer-handle" />
          <div class="drawer-content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const drawerRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const isClosing = ref(false);
const justFinishedDrag = ref(false);
const startY = ref(0);
const currentY = ref(0);
const translateY = ref(0);
const drawerHeight = ref(0);

const drawerStyle = computed(() => {
  if (isDragging.value || isClosing.value) {
    return {
      transform: `translateY(${translateY.value}px)`,
      transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
    };
  }
  return {};
});

const closeDrawer = (animateFromCurrent = false) => {
  isDragging.value = false;
  isClosing.value = true;

  if (animateFromCurrent) {
    translateY.value = drawerHeight.value;

    setTimeout(() => {
      emit('update:modelValue', false);
      resetPosition();
    }, 300);
  } else {
    resetPosition();
    requestAnimationFrame(() => {
      emit('update:modelValue', false);
    });
  }
};

const snapBack = () => {
  isDragging.value = false;
  isClosing.value = true;

  translateY.value = 0;

  setTimeout(() => {
    resetPosition();
  }, 300);
};

const resetPosition = () => {
  translateY.value = 0;
  currentY.value = 0;
  isDragging.value = false;
  isClosing.value = false;
  justFinishedDrag.value = false;
};

const handleTouchStart = (e: TouchEvent) => {
  const target = e.target as HTMLElement;
  const touchY = e.touches[0]!.clientY;
  const drawerTop = drawerRef.value?.getBoundingClientRect().top ?? 0;
  const relativeY = touchY - drawerTop;

  if (target.closest('.drawer-handle') || relativeY < 50) {
    isDragging.value = true;
    startY.value = touchY;
    if (drawerRef.value) {
      drawerHeight.value = drawerRef.value.offsetHeight;
    }
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;

  currentY.value = e.touches[0]!.clientY;
  const deltaY = currentY.value - startY.value;

  translateY.value = Math.max(0, deltaY);
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;

  const threshold = drawerHeight.value * 0.2;

  if (translateY.value > threshold) {
    closeDrawer(true);
  } else {
    snapBack();
  }
};

const handleMouseDown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('.drawer-handle')) {
    isDragging.value = true;
    startY.value = e.clientY;
    if (drawerRef.value) {
      drawerHeight.value = drawerRef.value.offsetHeight;
    }
    e.preventDefault();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;

  currentY.value = e.clientY;
  const deltaY = currentY.value - startY.value;

  translateY.value = Math.max(0, deltaY);
};

const handleMouseUp = () => {
  if (!isDragging.value) return;

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);

  const threshold = drawerHeight.value * 0.2;

  if (translateY.value > threshold) {
    closeDrawer(true);
  } else {
    snapBack();
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetPosition();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
);

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style lang="scss" scoped>
@use '../assets/mixins.scss' as *;

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.drawer {
  width: 100%;
  max-height: 80svh;
  background-color: oklch(0.1773 0.0133 264.14);
  border: 2px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
  border-top-left-radius: 1.5rem;
  border-top-right-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: var(--box-shadow-1);
  touch-action: pan-y;

  &.is-dragging {
    cursor: grabbing;
  }

  .drawer-handle {
    position: absolute;
    top: 0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 6rem;
    height: 0.25rem;
    background-color: color-mix(
      in oklab,
      var(--color-gray-700) 70%,
      transparent
    );
    border-radius: 0.125rem;
    cursor: grab;
    flex-shrink: 0;
    touch-action: none;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1rem 1rem;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

.drawer-enter-active .drawer {
  transition: transform 0.3s ease-out;
}

.drawer-leave-active .drawer {
  transition: transform 0.3s ease-out;
}

.drawer-enter-from .drawer {
  transform: translateY(100%);
}

.drawer-leave-to .drawer {
  transform: translateY(100%);
}
</style>
