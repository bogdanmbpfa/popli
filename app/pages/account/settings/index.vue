<template>
  <div class="account-settings-page">
    <div class="heading">
      <span class="title">Account Settings</span>

      <span class="description">
        Manage your personal information, security preferences and account
        status.
      </span>
    </div>

    <FormContainer
      v-if="user"
      title="Account information"
      title-icon="popli:shield-outline"
      description="Update your account information."
    >
      <form @submit.prevent="onSubmitVerifyEmail">
        <FormInput id="email" label="Email Address" required>
          <UiInputText
            id="email"
            v-model="user.email"
            fluid
            readonly
            autocomplete="off"
          />
        </FormInput>

        <UiMessage
          v-if="user.emailConfirmedAt"
          class="default text-left"
          severity="success"
        >
          <Icon name="popli:checkbox-marked-circle-outline" class="success" />
          Email verified
        </UiMessage>

        <UiMessage v-else class="default text-left" severity="error">
          <Icon name="popli:alert-circle-outline" class="danger" />
          Email not verified.
        </UiMessage>

        <FormInput
          v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
          id="code"
          v-model="code"
          label="Code"
          :error="contactInfoErrors.code"
          :required="false"
        >
          <UiInputOtp
            id="code"
            v-model="code"
            v-bind="codeAttributes"
            fluid
            :length="6"
            :invalid="!!contactInfoErrors.code"
            :disabled="isContactInfoSubmitting || actionInProgress"
          />
        </FormInput>

        <UiButton
          v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
          type="submit"
          class="default"
          severity="contrast"
          label="Verify"
          aria-label="Verify email"
          :loading="isContactInfoSubmitting"
          :disabled="isContactInfoSubmitting || actionInProgress"
        />

        <UiButton
          v-if="!user.emailConfirmedAt && !isEmailVerifyRequested"
          type="button"
          class="default"
          severity="contrast"
          label="Request code"
          aria-label="Request email verification code"
          :loading="actionInProgress"
          :disabled="isContactInfoSubmitting || actionInProgress"
          @click="onSubmitRequestEmailVerify"
        />
      </form>

      <form
        class="change-password-form"
        @submit.prevent="onSubmitChangePassword"
      >
        <UiInputText
          :value="user.email"
          name="email"
          fluid
          autocomplete="username"
          readonly
          disabled
          hidden
        />

        <FormInput
          id="currentPassword"
          label="Current password"
          :error="changePasswordErrors.currentPassword"
          size="half"
          required
        >
          <UiInputText
            id="currentPassword"
            v-model="currentPassword"
            v-bind="currentPasswordAttributes"
            type="password"
            placeholder="Enter your current password"
            fluid
            autocomplete="current-password"
            toggle-mask
            :invalid="!!changePasswordErrors.currentPassword"
            :disabled="isChangePasswordSubmitting || actionInProgress"
          />
        </FormInput>

        <FormInput
          id="newPassword"
          label="New password"
          :error="changePasswordErrors.newPassword"
          size="half"
          required
        >
          <UiInputText
            id="newPassword"
            v-model="newPassword"
            v-bind="newPasswordAttributes"
            type="password"
            placeholder="Enter your new password"
            autocomplete="new-password"
            fluid
            toggle-mask
            :invalid="!!changePasswordErrors.newPassword"
            :disabled="isChangePasswordSubmitting || actionInProgress"
          />
        </FormInput>

        <UiButton
          type="submit"
          severity="contrast"
          label="Update password"
          aria-label="Update password"
          :loading="isChangePasswordSubmitting"
          :disabled="isChangePasswordSubmitting || actionInProgress"
        />
      </form>
    </FormContainer>

    <FormContainer
      v-if="user"
      title="Billing"
      title-icon="popli:credit-card-outline"
      description="Manage your subscription and payment history."
    >
      <div class="billing">
        <div class="current-plan">
          <span class="label">Current plan</span>
          <span class="value">{{ user.plan.toUpperCase() }}</span>
          <span v-if="user.planStartedAt" class="meta">
            Started: {{ formatDate(user.planStartedAt) }}
          </span>
          <span v-if="user.planEndsAt" class="meta">
            Renews/Ends: {{ formatDate(user.planEndsAt) }}
          </span>
        </div>

        <div class="actions">
          <UiButton
            v-if="user.plan === EPlanType.PRO"
            type="button"
            severity="contrast"
            label="Manage subscription"
            aria-label="Manage subscription"
            :loading="isBillingSubmitting"
            :disabled="isBillingSubmitting || actionInProgress"
            @click="onManageSubscription"
          />

          <UiButton
            v-if="user.plan === EPlanType.FREE"
            type="button"
            severity="contrast"
            label="Upgrade to Pro"
            aria-label="Upgrade to Pro"
            :loading="isBillingSubmitting"
            :disabled="isBillingSubmitting || actionInProgress"
            @click="onUpgradeToPro"
          />
        </div>

        <div v-if="transactions?.length" class="transaction-history">
          <span class="label">Transaction history</span>

          <div class="list">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="item"
            >
              <span class="status">
                {{ transaction.status.toUpperCase() }} -
                {{ formatAmount(transaction.amount, transaction.currency) }}
              </span>
              <span class="meta">{{ formatDate(transaction.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>

    <div class="danger-zone">
      <div class="heading">
        <Icon name="popli:octagon-times-solid" class="danger" size="1.5rem" />
        <span>Danger Zone</span>
      </div>

      <div class="content">
        <span class="disclaimer">
          Deleting your account is permanent. This will immediately disable your
          <span class="highlight">Popli</span> short links, clear your analytics
          history, and remove all bio page data. This action cannot be undone.
        </span>

        <UiButton
          type="button"
          severity="danger"
          icon="popli:delete-outline"
          label="Delete account"
          aria-label="Delete account"
          :loading="actionInProgress"
          :disabled="actionInProgress"
          @click="openConfirmDeleteAccount"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint, EPlanType } from '~~/enums';
import type { IAccountChangePassword } from '~~/interfaces';

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const uiConfirmDialog = useUiConfirmDialog();
const globalStore = useGlobalStore();
const uiToast = useUiToast();
const userStore = useUserStore();

const isBillingSubmitting = ref(false);
const isEmailVerifyRequested = ref(false);

const {
  defineField: defineContactInfoField,
  errors: contactInfoErrors,
  handleSubmit: handleContactInfoSubmit,
  isSubmitting: isContactInfoSubmitting,
} = useForm({
  validationSchema: yup.object({
    email: yup.string().email(),
    code: yup
      .string()
      .required('Code is required')
      .min(6, 'Code must be 6 characters')
      .max(6, 'Code must be 6 characters'),
  }),
});

const [code, codeAttributes] = defineContactInfoField('code');

const {
  defineField: defineChangePasswordField,
  errors: changePasswordErrors,
  handleSubmit: handleChangePasswordSubmit,
  isSubmitting: isChangePasswordSubmitting,
  resetForm: resetChangePasswordForm,
} = useForm<IAccountChangePassword>({
  validationSchema: yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup
      .string()
      .required('New password is required')
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[A-Z]/, 'Password must have at least one uppercase letter')
      .matches(/[a-z]/, 'Password must have at least one lowercase letter')
      .matches(/[0-9]/, 'Password must have at least one number')
      .matches(
        /[!@#$%^&*(){}[\]=;'\:"|,.\/<>?§±`~_+-]/,
        'Password must have at least one special character',
      ),
  }),
});

const [currentPassword, currentPasswordAttributes] =
  defineChangePasswordField('currentPassword');
const [newPassword, newPasswordAttributes] =
  defineChangePasswordField('newPassword');

const actionInProgress = computed(() => globalStore.getActionInProgress);
const user = computed(() => userStore.getUser!);
const route = useRoute();

onMounted(async () => {
  if (route.query.billing === 'success') {
    uiToast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Subscription checkout completed.',
      life: 3000,
    });
  }

  if (route.query.billing === 'cancel') {
    uiToast.add({
      severity: 'warn',
      summary: 'Cancelled',
      detail: 'Subscription checkout cancelled.',
      life: 3000,
    });
  }
});

const { data: transactions } = await useAsyncData(
  'billing-transactions',
  () => useApiJson(EApiEndpoint.BILLING_TRANSACTIONS),
  {
    transform: (data) => data?.data || [],
  },
);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);

const onManageSubscription = async () => {
  isBillingSubmitting.value = true;
  globalStore.toggleActionInProgress();

  const { data, error } = await useApiJson(EApiEndpoint.BILLING_PORTAL, {});

  if (error) {
    isBillingSubmitting.value = false;
    globalStore.toggleActionInProgress();

    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  if (data?.url) {
    await navigateTo(data.url, { external: true });
  }

  isBillingSubmitting.value = false;
  globalStore.toggleActionInProgress();
};

const onSubmitRequestEmailVerify = async () => {
  globalStore.toggleActionInProgress();

  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_REQUEST_EMAIL_VERIFY);

  if (error) {
    isEmailVerifyRequested.value = false;
    globalStore.toggleActionInProgress();

    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  isEmailVerifyRequested.value = true;
  globalStore.toggleActionInProgress();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Email verification code sent',
    life: 3000,
  });
};

const onSubmitVerifyEmail = handleContactInfoSubmit(async (values) => {
  globalStore.toggleActionInProgress();

  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_VERIFY_EMAIL, {
    code: values.code,
  });

  if (error) {
    globalStore.toggleActionInProgress();

    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  isEmailVerifyRequested.value = false;

  const { data: userData } = await useApiJson(EApiEndpoint.ACCOUNT_ME);

  userStore.setUser(userData ? { ...userData! } : null);

  globalStore.toggleActionInProgress();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Email verified successfully',
    life: 3000,
  });
});

const onSubmitChangePassword = handleChangePasswordSubmit(async (values) => {
  globalStore.toggleActionInProgress();

  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHANGE_PASSWORD, {
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  });

  if (error) {
    globalStore.toggleActionInProgress();

    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  resetChangePasswordForm();
  globalStore.toggleActionInProgress();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Password changed successfully',
    life: 3000,
  });
});

const openConfirmDeleteAccount = () =>
  uiConfirmDialog.require({
    header: 'Delete Account permanently?',
    message:
      'This action is irreversible. All your short links, qr codes, analytics data and profile settings will be deleted forever.',
    acceptLabel: 'Delete account',
    acceptSeverity: 'help',
    rejectLabel: 'Cancel',
    rejectSeverity: 'contrast',
    accept: async () => {
      globalStore.toggleActionInProgress();

      const { error } = await useApiJson(EApiEndpoint.ACCOUNT_DELETE);

      if (error) {
        globalStore.toggleActionInProgress();

        return uiToast.add({
          severity: 'error',
          detail: error.message,
          life: 3000,
        });
      }

      await useApiJson(EApiEndpoint.AUTH_LOGOUT);

      userStore.setUser(null);

      uiToast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Account deleted successfully',
        life: 3000,
      });

      globalStore.toggleActionInProgress();

      return navigateTo('/');
    },
  });

const onUpgradeToPro = async () => {
  globalStore.toggleActionInProgress();

  const { data, error } = await useApiJson(
    EApiEndpoint.BILLING_CHECKOUT_SESSION,
  );

  if (error) {
    globalStore.toggleActionInProgress();

    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  if (data?.url) {
    await navigateTo(data.url, { external: true });
  }

  globalStore.toggleActionInProgress();
};
</script>

<style lang="scss" scoped>
.account-settings-page {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 0;

  .heading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--neutral-100);
    }

    .description {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--neutral-400);
    }
  }

  :deep(.form-container) {
    form {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .billing {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;

    .current-plan {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .label {
        font-size: 0.875rem;
        color: var(--neutral-400);
      }

      .value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--neutral-100);
      }

      .meta {
        font-size: 0.875rem;
        color: var(--neutral-300);
      }
    }

    .transaction-history {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .label {
        font-size: 0.875rem;
        color: var(--neutral-400);
      }

      .list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        border: 1px solid
          color-mix(in oklab, var(--neutral-400) 20%, transparent);
        border-radius: 0.5rem;
        padding: 1rem 0.5rem;
        max-height: 8rem;
        overflow-y: auto;
        /* Custom scrollbar styling for .types container */
        scrollbar-width: thin;
        scrollbar-color: var(--neutral-800) transparent;
        scrollbar-gutter: stable both-edges;

        /* Webkit-based browsers */
        &::-webkit-scrollbar {
          width: 0.25rem;
          color: var(--neutral-800);
          background-color: transparent;
          border-radius: 0.25rem;
        }

        &::-webkit-scrollbar-thumb {
          color: var(--neutral-800);
          background-color: transparent;
          border-radius: 0.25rem;
          min-height: 2rem;
          transition: background-color 0.3s;
        }

        &::-webkit-scrollbar-thumb:hover {
          color: var(--neutral-800);
          background-color: transparent;
        }

        &::-webkit-scrollbar-corner {
          color: var(--neutral-800);
          background-color: transparent;
        }

        .item {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;

          .status {
            font-size: 0.875rem;
            font-weight: 400;
            color: var(--neutral-400);
          }

          .meta {
            font-size: 0.875rem;
            font-weight: 400;
            color: var(--neutral-400);
          }
        }
      }
    }
  }

  .danger-zone {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: var(--danger);
    border: 1px solid color-mix(in oklab, var(--primary-400) 20%, transparent);
    border-radius: 0.5rem;
    padding: 1.5rem;

    .heading {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-400);
    }

    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;

      .disclaimer {
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--neutral-400);

        .highlight {
          color: var(--neutral-100);
          font-weight: 600;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .account-settings-page {
    :deep(.form-container) {
      form.change-password-form {
        flex-direction: column;

        .form-input {
          max-width: 100%;
        }
      }
    }

    .danger-zone {
      .content {
        flex-direction: column;
      }
    }
  }
}
</style>
