<template>
  <div class="account-settings-page">
    <div v-if="user" class="container">
      <FormContainer
        title="Account information"
        title-icon="mdi:shield-outline"
        description="Update your account information."
      >
        <form @submit.prevent="onSubmitVerifyEmail">
          <FormInput id="email" label="Email Address" required>
            <PInputText
              id="email"
              class="default"
              placeholder="Enter your current password"
              fluid
              :value="user.email"
              readonly
            />
          </FormInput>

          <PMessage
            v-if="user.emailConfirmedAt"
            class="default text-left"
            severity="success"
          >
            <Icon name="mdi:checkbox-marked-circle-outline" class="success" />
            Email verified
          </PMessage>

          <PMessage v-else class="default text-left" severity="error">
            <Icon name="mdi:alert-circle-outline" class="danger" />
            Email not verified.
          </PMessage>

          <FormInput
            v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
            id="code"
            v-model="code"
            label="Code"
            :error="contactInfoErrors.code"
            :required="false"
          >
            <PInputOtp
              id="code"
              v-model="code"
              name="code"
              v-bind="codeAttributes"
              class="default"
              fluid
              integer-only
              :length="6"
              :invalid="!!contactInfoErrors.code"
              :disabled="isContactInfoSubmitting"
            />
          </FormInput>

          <PButton
            v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
            type="submit"
            class="default"
            severity="contrast"
            label="Verify"
            aria-label="Verify email"
            :disabled="isContactInfoSubmitting"
          />

          <PButton
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
          <PInputText
            class="default"
            name="email"
            :value="user.email"
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
            <PPassword
              v-model="currentPassword"
              v-bind="currentPasswordAttributes"
              class="default"
              input-id="currentPassword"
              input-class="default"
              placeholder="Enter your current password"
              fluid
              :feedback="false"
              toggle-mask
              :input-props="{ autocomplete: 'current-password' }"
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
            <PPassword
              v-model="newPassword"
              v-bind="newPasswordAttributes"
              class="default"
              input-id="newPassword"
              input-class="default"
              placeholder="Enter your new password"
              fluid
              toggle-mask
              :feedback="false"
              :input-props="{ autocomplete: 'new-password' }"
              :invalid="!!changePasswordErrors.newPassword"
              :disabled="isChangePasswordSubmitting"
            />
          </FormInput>

          <PButton
            type="submit"
            class="default"
            severity="contrast"
            label="Update password"
            aria-label="Update password"
            :disabled="isChangePasswordSubmitting"
          />
        </form>
      </FormContainer>

      <div class="danger-zone">
        <div class="heading">
          <Icon name="pixel:octagon-times-solid" class="danger" size="1.5rem" />
          <span>Danger Zone</span>
        </div>

        <div class="content">
          <span class="disclaimer">
            Deleting your account is permanent. This will immediately disable
            your <span class="highlight">Popli</span> short links, clear your
            analytics history, and remove all bio page data. This action cannot
            be undone.
          </span>

          <PButton
            type="submit"
            class="default"
            severity="danger"
            icon="pi pi-trash"
            label="Delete account"
            aria-label="Delete account"
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

const confirm = useConfirm();
const globalStore = useGlobalStore();
const toast = useToast();
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
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  isEmailVerifyRequested.value = true;

  return toast.add({
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
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  isEmailVerifyRequested.value = false;

  const { data: userData } = await useApiJson(EApiEndpoint.ACCOUNT_ME);

  userStore.setUser(userData ? { ...userData! } : null);

  return toast.add({
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
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  resetChangePasswordForm();

  return toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Password changed successfully',
    life: 3000,
  });
});

const openConfirmDeleteAccount = () =>
  confirm.require({
    icon: 'pi pi-exclamation-triangle',
    header: 'Delete Account permanently?',
    message:
      'This action is irreversible. All your short links, qr codes, analytics data and profile settings will be deleted forever.',
    acceptClass: 'default p-button-danger',
    acceptIcon: 'pi pi-trash',
    acceptLabel: 'Delete account',
    rejectClass: 'default p-button-help',
    rejectLabel: 'Cancel',
    modal: true,
    position: 'center',
    blockScroll: true,
    accept: async () => {
      globalStore.toggleActionInProgress();

      const { error } = await useApiJson(EApiEndpoint.ACCOUNT_DELETE, {});

      if (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message,
          life: 3000,
        });

        return globalStore.toggleActionInProgress();
      }

      useSignOut();

      userStore.setUser(null);

      toast.add({
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
