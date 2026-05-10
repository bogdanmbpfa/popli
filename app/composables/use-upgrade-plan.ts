import { EApiEndpoint } from '~~/enums';

export const useUpgradePlan = () => {
  const uiToast = useUiToast();

  const upgradeToPro = async () => {
    const { data, error } = await useApiJson(
      EApiEndpoint.BILLING_CHECKOUT_SESSION,
    );

    if (error) {
      return uiToast.add({
        severity: 'error',
        detail: error.message,
        life: 3000,
      });
    }

    if (data?.url) {
      await navigateTo(data.url, { external: true });
    }
  };

  return {
    upgradeToPro,
  };
};