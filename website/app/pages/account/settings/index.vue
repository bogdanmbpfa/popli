<template>
  <div class="account-settings-page">
    <div v-if="user" class="container">
      <FormContainer
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
              :disabled="isContactInfoSubmitting"
            />
          </FormInput>

          <UiButton
            v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
            type="submit"
            class="default"
            severity="contrast"
            label="Verify"
            aria-label="Verify email"
            :disabled="isContactInfoSubmitting"
          />

          <UiButton
            v-if="!user.emailConfirmedAt && !isEmailVerifyRequested"
            type="button"
            class="default"
            severity="contrast"
            label="Request code"
            aria-label="Request email verification code"
            :disabled="isContactInfoSubmitting"
            @click="onSubmitRequestEmailVerify"
          />
        </form>

        <form
          class="change-password-form"
          @submit.prevent="onSubmitChangePassword"
        >
          <UiInputText
            name="email"
            v-model="user.email"
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
              type="password"
              v-model="currentPassword"
              v-bind="currentPasswordAttributes"
              placeholder="Enter your current password"
              fluid
              autocomplete="current-password"
              toggle-mask
              :invalid="!!changePasswordErrors.currentPassword"
              :disabled="isChangePasswordSubmitting"
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
              :disabled="isChangePasswordSubmitting"
            />
          </FormInput>

          <UiButton
            type="submit"
            severity="contrast"
            label="Update password"
            aria-label="Update password"
            :disabled="isChangePasswordSubmitting"
          />
        </form>
      </FormContainer>

      <div class="danger-zone">
        <div class="heading">
          <Icon name="popli:octagon-times-solid" class="danger" size="1.5rem" />
          <span>Danger Zone</span>
        </div>

        <div class="content">
          <span class="disclaimer">
            Deleting your account is permanent. This will immediately disable
            your <span class="highlight">Popli</span> short links, clear your
            analytics history, and remove all bio page data. This action cannot
            be undone.
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
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';
import type { IAccountChangePassword } from '~~/interfaces';

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const uiConfirmDialog = useUiConfirmDialog();
const globalStore = useGlobalStore();
const uiToast = useUiToast();
const userStore = useUserStore();

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
    newPassword: yup.string().required('New password is required'),
  }),
});

const [currentPassword, currentPasswordAttributes] =
  defineChangePasswordField('currentPassword');
const [newPassword, newPasswordAttributes] =
  defineChangePasswordField('newPassword');

const actionInProgress = computed(() => globalStore.getActionInProgress);
const user = computed(() => userStore.getUser!);

const onSubmitRequestEmailVerify = async () => {
  const { error } = await useApiJson(
    EApiEndpoint.ACCOUNT_REQUEST_EMAIL_VERIFY,
    {},
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  isEmailVerifyRequested.value = true;

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Email verification code sent',
    life: 3000,
  });
};

const onSubmitVerifyEmail = handleContactInfoSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_VERIFY_EMAIL, {
    code: values.code,
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  isEmailVerifyRequested.value = false;

  const { data: userData } = await useApiJson(EApiEndpoint.ACCOUNT_ME);

  userStore.setUser(userData ? { ...userData! } : null);

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Email verified successfully',
    life: 3000,
  });
});

const onSubmitChangePassword = handleChangePasswordSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHANGE_PASSWORD, {
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  resetChangePasswordForm();

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

      const { error } = await useApiJson(EApiEndpoint.ACCOUNT_DELETE, {});

      if (error) {
        uiToast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
          life: 3000,
        });

        return globalStore.toggleActionInProgress();
      }

      await useSignOut();

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
</script>

<style lang="scss" scoped>
.account-settings-page {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  flex: 1;
  position: relative;

  .container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
    width: 100%;
    max-width: 60rem;
    padding: 1.5rem;

    :deep(.form-container) {
      form {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
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
}

@media (max-width: 768px) {
  .account-settings-page {
    .container {
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
}
</style>
