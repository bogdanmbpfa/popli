<template>
  <div class="sign-up">
    <BackgroundBlur position="top-left" type="primary" />
    <BackgroundBlur position="bottom-right" type="secondary" />

    <div class="heading">
      <nuxt-link to="/" class="default">
        <nuxt-img
          src="/logo.png"
          alt="Popli.one logo"
          width="40"
          loading="lazy"
        />
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
              @update:model-value="onEmailChange"
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
              placeholder="Enter your password"
              fluid
              autocomplete="new-password"
              toggle-mask
              :invalid="!!errors.password"
              :disabled="isSubmitting"
            />
          </UiInputGroup>
        </FormInput>

        <UiButton
          type="submit"
          label="Create Account"
          aria-label="Create account"
          severity="contrast"
          fluid
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

import { EApiEndpoint, EPlanType } from '~~/enums';
import type { IAuthRegister } from '~~/interfaces';

definePageMeta({
  layout: 'auth',
  middleware: 'is-not-logged-in',
});

const { seo } = useAppConfig();
const uiToast = useUiToast();
const userStore = useUserStore();
const route = useRoute();

const selectedPlan = computed<EPlanType>(() =>
  route.query.plan === EPlanType.PRO ? EPlanType.PRO : EPlanType.FREE,
);

usePageSeo({
  title: seo.signUpTitle,
  description: seo.signUpDescription,
  path: '/sign-up',
  ogImage: seo.defaultOgImagePath,
  robots: 'noindex, nofollow',
});

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
  const { error } = await useApiJson(EApiEndpoint.AUTH_REGISTER, values);

  if (error) {
    return uiToast.add({
      severity: 'error',
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
      detail: userError.message,
      life: 3000,
      closable: false,
    });
  }

  userStore.setUser(userData ? { ...userData! } : null);

  resetForm();

  uiToast.add({
    severity: 'success',
    summary: 'Welcome!',
    detail: 'You have been registered successfully',
    life: 3000,
    closable: false,
  });

  if (selectedPlan.value === EPlanType.PRO) {
    const { data: checkoutData, error: checkoutError } = await useApiJson(
      EApiEndpoint.BILLING_CHECKOUT_SESSION,
      {},
      {},
      {},
    );

    if (checkoutError) {
      uiToast.add({
        severity: 'error',
        detail: checkoutError.message,
        life: 3000,
        closable: false,
      });

      return navigateTo('/account/settings');
    }

    if (checkoutData?.url) {
      await navigateTo(checkoutData.url, {
        external: true,
      });
      return;
    }
  }

  return navigateTo('/account/settings');
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
