import type { IToastMessage } from '~~/interfaces';

const DEFAULT_LIFE = 3000;

export const useUiToast = () => {
  const globalStore = useGlobalStore();

  const remove = (id: number) => globalStore.removeToastMessage(id);

  const add = (message: Partial<IToastMessage>) => {
    const nextMessage = {
      id: Date.now() + Math.floor(Math.random() * 100000),
      severity: message.severity || 'info',
      summary: message.summary ?? '',
      detail: message.detail ?? '',
      closable: message.closable ?? true,
      life: message.life ?? DEFAULT_LIFE
    };

    globalStore.addToastMessage(nextMessage);

    if ((nextMessage.life ?? 0) > 0) {
      setTimeout(() => remove(nextMessage.id), nextMessage.life);
    }
  };

  const clear = () => globalStore.clearToastMessages();

  return {
    add,
    remove,
    clear
  };
};
