import type { Component } from 'vue';

export interface IDynamicDialogOptions {
  header: string;
  component: Component;
  props?: Record<string, unknown>;
  onClose?: () => void;
  widthFit?: boolean;
  hideCloseButton?: boolean;
  hideOverflow?: boolean;
}
