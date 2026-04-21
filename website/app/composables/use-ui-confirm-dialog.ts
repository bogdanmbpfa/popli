import type { IConfirmDialogOptions } from '~~/interfaces';

export const useUiConfirmDialog = () => {
  const globalStore = useGlobalStore();

  const require = (options: IConfirmDialogOptions) => {
    globalStore.setConfirmDialogOptions({
      header: options.header,
      message: options.message,
      acceptLabel: options.acceptLabel ?? 'Confirm',
      acceptSeverity: options.acceptSeverity ?? 'primary',
      rejectLabel: options.rejectLabel ?? 'Cancel',
      rejectSeverity: options.rejectSeverity ?? 'danger',
      accept: options.accept,
      reject: options.reject,
    });
  };

  const close = () => globalStore.clearConfirmDialogOptions();

  const accept = () => {
    const options = globalStore.getConfirmDialogOptions;

    if (!options) return;

    options.accept();
    
    return close();
  };

  const reject = () => {
    const options = globalStore.getConfirmDialogOptions;

    if (!options) return;

    options.reject?.();

    return close();
  };

  return {
    require,
    accept,
    reject,
    close,
  };
};
