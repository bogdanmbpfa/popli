import { defineStore } from 'pinia';

import type {
  IConfirmDialogOptions,
  IDynamicDialogOptions,
  IToastMessage,
} from '~~/interfaces';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    actionInProgress: false,
    darkMode: false,
    toastMessages: [] as IToastMessage[],
    confirmDialogOptions: null as IConfirmDialogOptions | null,
    dynamicDialogOptions: null as IDynamicDialogOptions | null,
  }),
  getters: {
    getActionInProgress: (state): boolean => state.actionInProgress,
    getDarkMode: (state): boolean => state.darkMode,
    getToastMessages: (state): IToastMessage[] => state.toastMessages,
    getConfirmDialogOptions: (state): IConfirmDialogOptions | null =>
      state.confirmDialogOptions,
    getDynamicDialogOptions: (state): IDynamicDialogOptions | null =>
      state.dynamicDialogOptions,
  },
  actions: {
    toggleActionInProgress(): void {
      this.actionInProgress = !this.actionInProgress;
    },
    toggleDarkMode(): void {
      this.darkMode = !this.darkMode;
    },
    setDarkMode(value: boolean): void {
      this.darkMode = value;
    },
    addToastMessage(message: IToastMessage): void {
      this.toastMessages.push(message);
    },
    removeToastMessage(id: number): void {
      this.toastMessages = this.toastMessages.filter(
        (message) => message.id !== id,
      );
    },
    clearToastMessages(): void {
      this.toastMessages = [];
    },
    setConfirmDialogOptions(options: IConfirmDialogOptions): void {
      this.confirmDialogOptions = options;
    },
    clearConfirmDialogOptions(): void {
      this.confirmDialogOptions = null;
    },
    setDynamicDialogOptions(options: IDynamicDialogOptions): void {
      this.dynamicDialogOptions = options;
    },
    clearDynamicDialogOptions(): void {
      this.dynamicDialogOptions = null;
    },
  },
});
