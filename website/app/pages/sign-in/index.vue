<template>
  <div class="sign-in">
    <BackgroundBlur position="top-right" type="primary" />
    <BackgroundBlur position="bottom-left" type="secondary" />

    <div class="heading">
      <h1>Popli</h1>

      <h2>Pop your links. Amplify your <span class="contrast">REACH.</span></h2>
    </div>

    <FormContainer
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <form @submit.prevent="onLoginSubmit">
        <FormInput id="email" label="Email" :error="errors.email" required>
          <PIconField>
            <PInputIcon class="pi pi-envelope" />

            <PInputText
              id="email"
              v-model="email"
              v-bind="emailAttributes"
              class="default"
              placeholder="Email"
              fluid
              autocomplete="username"
              :invalid="!!errors.email"
              :disabled="isSubmitting"
            />
          </PIconField>
        </FormInput>

        <FormInput
          id="password"
          label="Password"
          :error="errors.password"
          required
        >
          <PIconField>
            <PInputIcon class="pi pi-lock" />

            <PPassword
              v-model="password"
              v-bind="passwordAttributes"
              input-id="password"
              input-class="default"
              placeholder="Password"
              fluid
              :feedback="false"
              toggle-mask
              :input-props="{ autocomplete: 'current-password' }"
              :invalid="!!errors.password"
              :disabled="isSubmitting"
            />
          </PIconField>
        </FormInput>

        <PButton
          class="default"
          type="submit"
          label="Sign In"
          fluid
          severity="contrast"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </form>

      <div class="forgot-password">
        <nuxt-link class="default" to="/forgot-password">
          Forgot password?
        </nuxt-link>
      </div>
    </FormContainer>

    <div class="sign-up">
      Don't have an account?
      <nuxt-link class="primary" to="/sign-up"> Sign up </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { EApiEndpoint } from '~~/enums';
import type { IAuthLogin } from '~~/interfaces';

definePageMeta({
  layout: 'auth',
  middleware: 'is-not-logged-in',
});

const toast = useToast();
const userStore = useUserStore();

const { defineField, errors, handleSubmit, isSubmitting, resetForm } =
  useForm<IAuthLogin>({
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .required('Email is required')
        .email('Invalid email address'),
      password: yup.string().required('Password is required'),
    }),
  });

const [email, emailAttributes] = defineField('email');
const [password, passwordAttributes] = defineField('password');

const onLoginSubmit = handleSubmit(async (values) => {
  const { data, error } = await useApiJson(EApiEndpoint.AUTH_LOGIN, values);

  if (error) {
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
      closable: false,
    });
  }

  await useSetAuthToken(data.token, data.refreshToken);

  const { data: userData, error: userError } = await useApiJson(
    EApiEndpoint.ACCOUNT_ME,
    {},
    {},
    {},
    {
      Authorization: `Bearer ${data.token}`,
    },
  );

  if (userError) {
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: userError.message,
      life: 3000,
      closable: false,
    });
  }

  userStore.setUser(userData ? { ...userData! } : null);

  toast.add({
    severity: 'success',
    summary: 'Welcome back!',
    detail: 'You have been logged in successfully',
    life: 3000,
    closable: false,
  });

  resetForm();

  return navigateTo('/account');
});
</script>

<style lang="scss" scoped>
.sign-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
  padding: 2rem;

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

    .forgot-password {
      display: flex;
      justify-content: center;
      width: 100%;

      a {
        font-size: 0.75rem;
      }
    }
  }

  .sign-up {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
}
</style>
