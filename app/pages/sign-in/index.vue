<template>
  <div class="sign-in">
    <BackgroundBlur position="top-right" type="primary" />
    <BackgroundBlur position="bottom-left" type="secondary" />

    <div class="heading">
      <nuxt-link to="/" class="default">
        <nuxt-img src="/logo.png" alt="Popli.one logo" width="40" loading="lazy" />
        <h1>Popli</h1>
      </nuxt-link>

      <h2>Pop your links. Amplify your <span class="contrast">REACH.</span></h2>
    </div>

    <FormContainer
      title="Welcome back"
      description="Sign in to your account to continue"
    >
      <form @submit.prevent="onLoginSubmit">
        <FormInput id="email" label="Email" :error="errors.email" required>
          <UiInputGroup>
            <template #prepend>
              <Icon name="popli:email-outline" class="default" size="1.25rem" />
            </template>

            <UiInputText
              id="email"
              v-model="email"
              v-bind="emailAttributes"
              placeholder="hello@example.com"
              fluid
              autocomplete="username"
              :invalid="!!errors.email"
              :disabled="isSubmitting"
            />
          </UiInputGroup>
        </FormInput>

        <FormInput
          id="password"
          label="Password"
          :error="errors.password"
          required
        >
          <UiInputGroup>
            <template #prepend>
              <Icon name="popli:lock-outline" class="default" size="1.25rem" />
            </template>

            <UiInputText
              id="password"
              v-model="password"
              v-bind="passwordAttributes"
              type="password"
              placeholder="********"
              fluid
              autocomplete="current-password"
              toggle-mask
              :invalid="!!errors.password"
              :disabled="isSubmitting"
            />
          </UiInputGroup>
        </FormInput>

        <UiButton
          type="submit"
          label="Sign In"
          aria-label="Sign in"
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

import { EApiEndpoint, EEnvironment } from '~~/enums';
import type { IAuthLogin } from '~~/interfaces';

definePageMeta({
  layout: 'auth',
  middleware: 'is-not-logged-in',
});

const { seo } = useAppConfig();
const {
  public: { nodeEnv },
} = useRuntimeConfig();
const uiToast = useUiToast();
const userStore = useUserStore();

usePageSeo({
  title: seo.signInTitle,
  description: seo.signInDescription,
  path: '/sign-in',
  keywords: 'Popli login, sign in, account access',
  ogImage: seo.defaultOgImagePath,
  robots: 'index, follow',
});

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
  if (nodeEnv === EEnvironment.PRODUCTION) return;

  const { error } = await useApiJson(EApiEndpoint.AUTH_LOGIN, values);

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
      closable: false,
    });
  }

  const { data: userData, error: userError } = await useApiJson(
    EApiEndpoint.ACCOUNT_ME,
    {},
    {},
    {},
  );

  if (userError) {
    return uiToast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: userError.message,
      life: 3000,
      closable: false,
    });
  }

  userStore.setUser(userData ? { ...userData! } : null);

  uiToast.add({
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
