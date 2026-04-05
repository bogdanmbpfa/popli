<template>
  <div class="forgot-password">
    <BackgroundBlur position="top-left" type="secondary" />
    <BackgroundBlur position="bottom-right" type="primary" />

    <div class="heading">
      <nuxt-link to="/" class="default">
        <h1>Popli</h1>
      </nuxt-link>

      <h2>Pop your links. Amplify your <span class="contrast">REACH.</span></h2>
    </div>

    <FormContainer
      title="Forgot your password?"
      description="No worries, it happens. Enter your email below and we'll send you instructions to reset your password."
    >
      <form
        v-if="!passwordResetRequested"
        @submit.prevent="onForgotPasswordSubmit"
      >
        <FormInput
          id="email"
          label="Email"
          :error="forgotPasswordErrors.email"
          required
        >
          <PIconField>
            <PInputIcon class="pi pi-envelope" />

            <PInputText
              id="email"
              v-model="email"
              v-bind="emailAttributes"
              class="default"
              placeholder="Enter your email address"
              fluid
              autocomplete="username"
              :invalid="!!forgotPasswordErrors.email"
              :disabled="forgotPasswordIsSubmitting"
            />
          </PIconField>
        </FormInput>

        <PButton
          class="default"
          type="submit"
          label="Reset Password"
          aria-label="Reset password"
          fluid
          severity="contrast"
          :disabled="forgotPasswordIsSubmitting"
        />
      </form>

      <form v-else @submit.prevent="onResetPasswordSubmit">
        <FormInput
          id="code"
          label="Code"
          :error="resetPasswordErrors.code"
          required
        >
          <PInputOtp
            id="code"
            v-model="codeReset"
            v-bind="codeResetAttributes"
            input-class="default"
            class="default"
            placeholder="Enter the code"
            fluid
            :length="6"
            :invalid="!!resetPasswordErrors.code"
            :disabled="resetPasswordIsSubmitting"
          />
        </FormInput>

        <FormInput
          id="password"
          label="Password"
          :error="resetPasswordErrors.password"
          required
        >
          <PIconField>
            <PInputIcon class="pi pi-lock" />

            <PPassword
              v-model="passwordReset"
              v-bind="passwordResetAttributes"
              input-id="password"
              input-class="default"
              placeholder="Enter your new password"
              fluid
              toggle-mask
              :feedback="false"
              :input-props="{ autocomplete: 'new-password' }"
              :invalid="!!resetPasswordErrors.password"
              :disabled="resetPasswordIsSubmitting"
            />
          </PIconField>
        </FormInput>

        <PButton
          class="default"
          type="submit"
          label="Reset Password"
          aria-label="Reset password"
          fluid
          severity="contrast"
          :disabled="resetPasswordIsSubmitting"
        />
      </form>
    </FormContainer>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';
import type { IAuthForgotPassword, IAuthResetPassword } from '~~/interfaces';

definePageMeta({
  layout: 'auth',
  middleware: 'is-not-logged-in',
});

const toast = useToast();

const passwordResetRequested = ref(false);

const {
  defineField: forgotPasswordDefineField,
  errors: forgotPasswordErrors,
  handleSubmit: forgotPasswordHandleSubmit,
  isSubmitting: forgotPasswordIsSubmitting,
  resetForm: forgotPasswordResetForm,
} = useForm<IAuthForgotPassword>({
  validationSchema: yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
  }),
});

const [email, emailAttributes] = forgotPasswordDefineField('email');

const {
  defineField: resetPasswordDefineField,
  errors: resetPasswordErrors,
  handleSubmit: resetPasswordHandleSubmit,
  isSubmitting: resetPasswordIsSubmitting,
  resetForm: resetPasswordResetForm,
} = useForm<IAuthResetPassword>({
  validationSchema: yup.object().shape({
    code: yup
      .string()
      .required('Code is required')
      .min(6, 'Code must be 6 characters long')
      .max(6, 'Code must be 6 characters long'),
    password: yup
      .string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
      ),
  }),
});

const [codeReset, codeResetAttributes] = resetPasswordDefineField('code');
const [passwordReset, passwordResetAttributes] =
  resetPasswordDefineField('password');

const onForgotPasswordSubmit = forgotPasswordHandleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.AUTH_REQUEST_PASSWORD_RESET, {
    email: values.email,
  });

  if (error) {
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
    });
  }

  passwordResetRequested.value = true;

  toast.add({
    severity: 'success',
    summary: 'Success!',
    detail: 'Please check your email for a password reset code',
    life: 3000,
  });

  return Promise.resolve();
});

const onResetPasswordSubmit = resetPasswordHandleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.AUTH_RESET_PASSWORD, {
    email: email.value,
    code: values.code,
    password: values.password,
  });

  if (error) {
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
    });
  }

  toast.add({
    severity: 'success',
    summary: 'Success!',
    detail:
      'Your password has been reset. Please sign in with your new password.',
    life: 3000,
  });

  resetPasswordResetForm();
  forgotPasswordResetForm();
  passwordResetRequested.value = false;

  return navigateTo('/sign-in');
});
</script>

<style lang="scss" scoped>
.forgot-password {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
  padding: 2rem 0.5rem;

  .heading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    h2 {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-400);
    }
  }

  .form-container {
    max-width: 30rem;
  }
}
</style>
