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

            <PMessage
              v-if="user.emailConfirmedAt"
              class="default"
              severity="success"
            >
              <Icon name="mdi:checkbox-marked-circle-outline" />
              Email verified
            </PMessage>

            <PMessage v-else class="default" severity="error">
              <Icon name="mdi:alert-circle-outline" />
              Email not verified.
            </PMessage>
          </FormInput>

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
            :disabled="isContactInfoSubmitting"
          />

          <PButton
            v-if="!user.emailConfirmedAt && !isEmailVerifyRequested"
            type="button"
            class="default"
            severity="contrast"
            label="Request code"
            :disabled="isContactInfoSubmitting"
            @click="onSubmitRequestEmailVerify"
          />
        </form>

        <form @submit.prevent="onSubmitChangePassword">
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
            :disabled="isChangePasswordSubmitting"
          />
        </form>
      </FormContainer>

      <FormContainer
        title="Delete account"
        title-icon="mdi:delete-outline"
        description="Your account will be marked as deleted and will be removed from the system after 30 days."
      >
        <form @submit.prevent="onSubmitDeleteAccount">
          <PButton
            type="submit"
            class="default"
            severity="danger"
            icon="pi pi-trash"
            label="Delete account"
            :disabled="actionInProgress"
          />
        </form>
      </FormContainer>
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

const onSubmitDeleteAccount = async () => {
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
};
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
  }
}
</style>
