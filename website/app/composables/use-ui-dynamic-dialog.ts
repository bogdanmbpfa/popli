import type { IDynamicDialogOptions } from '~~/interfaces';

export const useUiDynamicDialog = () => {
  const globalStore = useGlobalStore();

  const open = (options: IDynamicDialogOptions) =>
    globalStore.setDynamicDialogOptions(options);

  const close = () => globalStore.clearDynamicDialogOptions();

  return {
    open,
    close,
  };
};
