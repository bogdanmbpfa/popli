import type { IDynamicDialogOptions } from '~~/interfaces';

export const useUiDynamicDialog = () => {
  const globalStore = useGlobalStore();

  const open = (options: IDynamicDialogOptions) =>
    globalStore.setDynamicDialogOptions(options);

  const close = () => {
    const options = globalStore.getDynamicDialogOptions;

    if (!options) return;

    options.onClose?.();

    return globalStore.clearDynamicDialogOptions();
  };

  return {
    open,
    close,
  };
};
