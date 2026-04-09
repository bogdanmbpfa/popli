<template>
  <div class="sign-up">
    <BackgroundBlur position="top-left" type="primary" />
    <BackgroundBlur position="bottom-right" type="secondary" />

    <div class="heading">
      <nuxt-link to="/" class="default">
        <nuxt-img src="/logo.png" alt="Popli.one logo" loading="lazy" />
        <h1>Popli</h1>
      </nuxt-link>

      <h2>Pop your links. Amplify your <span class="contrast">REACH.</span></h2>
    </div>

    <FormContainer
      title="Create Account"
      description="Enter your details to start popping links"
    >
      <form @submit.prevent="onRegisterSubmit">
        <FormInput
          id="email"
          label="Email address"
          :error="errors.email"
          required
        >
          <PIconField>
            <PInputIcon class="pi pi-envelope" />

            <PInputText
              id="email"
              v-model="email"
              v-bind="emailAttributes"
              class="default"
              placeholder="hello@example.com"
              fluid
              autocomplete="username"
              :invalid="!!errors.email"
              :disabled="isSubmitting"
              @value-change="onEmailChange"
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
          label="Create Account"
          aria-label="Create account"
          fluid
          severity="contrast"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </form>
    </FormContainer>

    <div class="sign-in">
      Already have an account?
      <nuxt-link class="primary" to="/sign-in"> Sign in </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint, EEnvironment } from '~~/enums';
import type { IAuthRegister } from '~~/interfaces';

definePageMeta({
  layout: 'auth',
  middleware: 'is-not-logged-in',
});

useHead({
  title: 'Sign up - Popli.one',
  meta: [{ name: 'description', content: 'Sign up to create your account' }],
  link: [{ rel: 'canonical', href: 'https://popli.one/sign-up' }],
});

useSeoMeta({
  title: 'Sign up - Popli.one',
  description: 'Sign up to create your account',
  applicationName: 'Popli.one',
  ogTitle: 'Sign up - Popli.one',
  ogDescription: 'Sign up to create your account',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Sign up - Popli.one',
  twitterDescription: 'Sign up to create your account',
});

const {
  public: { nodeEnv },
} = useRuntimeConfig();
const toast = useToast();
const userStore = useUserStore();

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
  resetForm,
  validateField,
  setFieldError,
} = useForm<IAuthRegister>({
  validationSchema: yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
    password: yup
      .string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
      ),
  }),
});

const [email, emailAttributes] = defineField('email');
const [password, passwordAttributes] = defineField('password');

const onEmailChange = debounce(async (value?: string) => {
  if (!value) return;

  await validateField('email');

  if (errors.value.email) return;

  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHECK_EMAIL, {
    email: value,
  });

  setFieldError('email', error ? 'Email not available' : undefined);

  return;
}, 500);

const onRegisterSubmit = handleSubmit(async (values) => {
  if (nodeEnv === EEnvironment.PRODUCTION) return;

  const { data, error } = await useApiJson(EApiEndpoint.AUTH_REGISTER, values);

  if (error) {
    return toast.add({
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
    {
      'X-User-Authorization': `Bearer ${data.token}`,
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

  resetForm();

  toast.add({
    severity: 'success',
    summary: 'Welcome!',
    detail: 'You have been registered successfully',
    life: 3000,
    closable: false,
  });

  return navigateTo('/account');
});
</script>

<style lang="scss" scoped>
.sign-up {
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

  .sign-in {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }
}
</style>
