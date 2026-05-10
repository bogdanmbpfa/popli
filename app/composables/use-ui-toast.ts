import type { IToastMessage } from '~~/interfaces';

const DEFAULT_LIFE = 3000;

export const useUiToast = () => {
  const globalStore = useGlobalStore();
  const { t, te } = useI18n();

  const remove = (id: number) => globalStore.removeToastMessage(id);

  const add = (message: Partial<IToastMessage>) => {
    let detail = message.detail ?? '';
    let summary = message.summary ?? '';

    if (te(`common.errorMessages.${message.detail}.summary`)) {
      summary = t(`common.errorMessages.${message.detail}.summary`);
      detail = t(`common.errorMessages.${message.detail}.detail`);
    }

    const nextMessage = {
      id: Date.now() + Math.floor(Math.random() * 100000),
      severity: message.severity || 'info',
      summary,
      detail,
      closable: message.closable ?? true,
      life: message.life ?? DEFAULT_LIFE,
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
    clear,
  };
};
