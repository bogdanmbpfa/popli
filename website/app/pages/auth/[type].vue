<template>
  <div class="auth">
    <div class="container">
      <div class="heading">
        <div class="logo">
          <nuxt-img :src="images.logo" alt="Popli.one" loading="lazy" />

          <span>Popli.one</span>
        </div>

        <span class="description"> Pop your links. Share your story. </span>
      </div>

      <PTabs v-model:value="tab" class="default">
        <PTabList>
          <PTab value="sign-in">Sign In</PTab>
          <PTab value="sign-up">Sign Up</PTab>
        </PTabList>

        <PTabPanels>
          <PTabPanel value="sign-in">
            <div class="card">
              <div class="heading">
                <span class="title"> Welcome back </span>

                <span class="description">
                  Sign in to your account to continue
                </span>
              </div>

              <form @submit.prevent="onLoginSubmit">
                <FormInput
                  id="email"
                  label="Email"
                  :error="loginErrors.email"
                  required
                >
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
                      :invalid="!!loginErrors.email"
                      :disabled="loginIsSubmitting"
                    />
                  </PIconField>
                </FormInput>

                <FormInput
                  id="password"
                  label="Password"
                  :error="loginErrors.password"
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
                      :invalid="!!loginErrors.password"
                      :disabled="loginIsSubmitting"
                    />
                  </PIconField>
                </FormInput>

                <div class="forgot-password">
                  <nuxt-link to="/auth/forgot-password">
                    Forgot password?
                  </nuxt-link>
                </div>

                <PButton
                  class="default"
                  type="submit"
                  label="Sign In"
                  fluid
                  severity="contrast"
                  :loading="loginIsSubmitting"
                  :disabled="loginIsSubmitting"
                />
              </form>
            </div>
          </PTabPanel>

          <PTabPanel value="sign-up">
            <div class="card">
              <div class="heading">
                <span class="title"> Create your account </span>

                <span class="description">
                  Sign up to Popli.one to continue
                </span>
              </div>

              <form @submit.prevent="onRegisterSubmit">
                <FormInput
                  id="register-email"
                  label="Email"
                  :error="registerErrors.email"
                  required
                >
                  <PIconField>
                    <PInputIcon class="pi pi-envelope" />

                    <PInputText
                      id="register-email"
                      v-model="emailRegister"
                      v-bind="emailRegisterAttributes"
                      class="default"
                      placeholder="Enter your email address"
                      fluid
                      autocomplete="username"
                      :invalid="!!registerErrors.email"
                      :disabled="registerIsSubmitting"
                      @value-change="onEmailChange"
                    />
                  </PIconField>
                </FormInput>

                <FormInput
                  id="register-password"
                  label="Password"
                  :error="registerErrors.password"
                  required
                  caption="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
                >
                  <PIconField>
                    <PInputIcon class="pi pi-lock" />

                    <PPassword
                      v-model="passwordRegister"
                      v-bind="passwordRegisterAttributes"
                      input-id="register-password"
                      input-class="default"
                      placeholder="Create a strong password"
                      fluid
                      :feedback="false"
                      toggle-mask
                      :input-props="{ autocomplete: 'new-password' }"
                      :invalid="!!registerErrors.password"
                      :disabled="registerIsSubmitting"
                    />
                  </PIconField>
                </FormInput>

                <PButton
                  class="default"
                  type="submit"
                  label="Sign Up"
                  fluid
                  severity="contrast"
                  :loading="registerIsSubmitting"
                  :disabled="registerIsSubmitting"
                />

                <div class="disclaimer">
                  By signing up, you agree to our
                  <nuxt-link to="/terms">Terms of Service</nuxt-link> and
                  <nuxt-link to="/privacy">Privacy Policy</nuxt-link>.
                </div>
              </form>
            </div>
          </PTabPanel>
        </PTabPanels>
      </PTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';
import type { IAuthLogin, IAuthRegister } from '~~/interfaces';

definePageMeta({
  layout: 'auth',
  middleware: 'is-not-logged-in',
});

const { params } = useRoute();
const {
  public: { images },
} = useRuntimeConfig();
const toast = useToast();
const userStore = useUserStore();

const tab = ref<'sign-in' | 'sign-up'>('sign-in');

const {
  defineField: loginDefineField,
  errors: loginErrors,
  handleSubmit: loginHandleSubmit,
  isSubmitting: loginIsSubmitting,
  resetForm: loginResetForm,
} = useForm<IAuthLogin>({
  validationSchema: yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
    password: yup.string().required('Password is required'),
  }),
});

const [email, emailAttributes] = loginDefineField('email');
const [password, passwordAttributes] = loginDefineField('password');

const {
  defineField: registerDefineField,
  errors: registerErrors,
  handleSubmit: registerHandleSubmit,
  isSubmitting: registerIsSubmitting,
  resetForm: registerResetForm,
  setFieldError: registerSetFieldError,
  validateField: registerValidateField,
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

const [emailRegister, emailRegisterAttributes] = registerDefineField('email');
const [passwordRegister, passwordRegisterAttributes] =
  registerDefineField('password');

onMounted(() => {
  if (!params.type || !['sign-in', 'sign-up'].includes(String(params.type))) {
    return navigateTo('/');
  }

  tab.value = String(params.type) === 'sign-in' ? 'sign-in' : 'sign-up';
});

const onLoginSubmit = loginHandleSubmit(async (values) => {
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

  loginResetForm();

  return navigateTo('/account');
});

const onEmailChange = debounce(async (value?: string) => {
  if (!value) return;

  await registerValidateField('email');

  if (registerErrors.value.email) return;

  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHECK_EMAIL, {
    email: value,
  });

  registerSetFieldError('email', error ? 'Email not available' : undefined);

  return;
}, 500);

const onRegisterSubmit = registerHandleSubmit(async (values) => {
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

  registerResetForm();

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
.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  background-image: linear-gradient(
    to bottom right in oklab,
    color-mix(in oklab, var(--color-blue-950) 20%, transparent) 0%,
    color-mix(in oklab, var(--color-purple-950) 20%, transparent) 50%,
    color-mix(in oklab, var(--color-pink-950) 20%, transparent) 100%
  );
  padding: 1rem;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: fit-content;
    width: 100%;
    max-width: 30rem;

    .heading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      .logo {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        img {
          width: 3rem;
          height: 3rem;
        }

        span {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-100);
        }
      }

      .description {
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--text-300);
        text-align: center;
      }
    }

    :deep(.p-tabs) {
      .p-tabpanels {
        .p-tabpanel {
          .card {
            background-color: color-mix(
              in oklab,
              var(--color-gray-900) 40%,
              transparent
            );
            border: 1px solid
              color-mix(in oklab, var(--color-gray-700) 30%, transparent);
            backdrop-filter: blur(1.5rem) saturate(150%);
            box-shadow: 0 25px 50px -12px #00000040;
            padding: 1rem;
            @include squircle(1.5rem);

            .heading {
              .title {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-100);
                text-align: center;
              }

              .description {
                font-size: 0.875rem;
                font-weight: 400;
                color: var(--text-300);
                text-align: center;
              }
            }

            form {
              .disclaimer {
                font-size: 0.75rem;
                font-weight: 400;
                color: var(--text-300);
                text-align: center;

                a {
                  color: var(--text-100);
                  text-decoration: none;
                }
              }

              .forgot-password {
                display: flex;
                justify-content: flex-end;
                width: 100%;

                a {
                  font-size: 0.75rem;
                  font-weight: 500;
                  color: var(--color-blue-400);
                  text-decoration: none;

                  &:hover {
                    text-decoration: underline;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
