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
						<div class="heading">
							<span class="title"> Welcome back </span>

							<span class="description"> Sign in to your account to continue </span>
						</div>

						<form @submit.prevent="onLoginSubmit">
							<FormInput id="email" label="Email" :error="loginErrors.email" required>
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
										:disabled="loginIsSubmitting" />
								</PIconField>
							</FormInput>

							<FormInput id="password" label="Password" :error="loginErrors.password" required>
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
										:disabled="loginIsSubmitting" />
								</PIconField>
							</FormInput>

							<div class="forgot-password">
								<nuxt-link to="/auth/forgot-password"> Forgot password? </nuxt-link>
							</div>

							<PButton
								class="default"
								type="submit"
								label="Sign In"
								fluid
								severity="contrast"
								:loading="loginIsSubmitting"
								:disabled="loginIsSubmitting || !turnstileToken" />

							<NuxtTurnstile v-model="turnstileToken" element="div" class="turnstile" />
						</form>
					</PTabPanel>

					<PTabPanel value="sign-up">
						<div class="heading">
							<span class="title"> Create your account </span>

							<span class="description"> Sign up to Popli.one to continue </span>
						</div>

						<form @submit.prevent="onRegisterSubmit">
							<FormInput id="name" label="Full Name" :error="registerErrors.name" required>
								<PIconField>
									<PInputIcon class="pi pi-user" />

									<PInputText
										id="name"
										v-model="nameRegister"
										v-bind="nameRegisterAttributes"
										class="default"
										placeholder="Enter your full name"
										fluid
										autocomplete="name"
										:invalid="!!registerErrors.name"
										:disabled="registerIsSubmitting" />
								</PIconField>
							</FormInput>

							<FormInput
								id="handle"
								label="Handle"
								:error="registerErrors.handle"
								required
								caption="This will be your popli.one/handle URL">
								<PIconField>
									<PInputIcon class="pi pi-at" />

									<PInputText
										id="handle"
										v-model="handleRegister"
										v-bind="handleRegisterAttributes"
										class="default"
										placeholder="Choose your unique handle"
										fluid
										autocomplete="handle"
										:invalid="!!registerErrors.handle"
										:disabled="registerIsSubmitting"
										@value-change="onHandleChange" />
								</PIconField>
							</FormInput>

							<FormInput id="register-email" label="Email" :error="registerErrors.email" required>
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
										@value-change="onEmailChange" />
								</PIconField>
							</FormInput>

							<FormInput
								id="register-password"
								label="Password"
								:error="registerErrors.password"
								required
								caption="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character">
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
										:disabled="registerIsSubmitting" />
								</PIconField>
							</FormInput>

							<PButton
								class="default"
								type="submit"
								label="Sign Up"
								fluid
								severity="contrast"
								:loading="registerIsSubmitting"
								:disabled="registerIsSubmitting || !turnstileToken" />

							<div class="disclaimer">
								By signing up, you agree to our
								<nuxt-link to="/terms">Terms of Service</nuxt-link> and
								<nuxt-link to="/privacy">Privacy Policy</nuxt-link>.
							</div>

							<NuxtTurnstile v-model="turnstileToken" element="div" class="turnstile" />
						</form>
					</PTabPanel>
				</PTabPanels>
			</PTabs>
		</div>
	</div>
</template>

<script setup lang="ts">
	import debounce from 'lodash/debounce';
	import * as yup from 'yup';

	import { EApiEndpoint } from '~/enums';
	import { type IAuthLogin, type IAuthRegister } from '~/interfaces';

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
	const turnstileToken = ref<string | undefined>(undefined);

	const {
		defineField: loginDefineField,
		errors: loginErrors,
		handleSubmit: loginHandleSubmit,
		isSubmitting: loginIsSubmitting,
		resetForm: loginResetForm,
	} = useForm<IAuthLogin>({
		validationSchema: yup.object().shape({
			email: yup.string().required('Email is required').email('Invalid email address'),
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
			email: yup.string().required('Email is required').email('Invalid email address'),
			password: yup
				.string()
				.required('Password is required')
				.matches(
					/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
					'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
				),
			name: yup
				.string()
				.required('Name is required')
				.min(3, 'Name must be at least 3 characters')
				.max(255, 'Name must be less than 255 characters')
				.matches(
					/^[a-zA-Z-\\'\s]+$/,
					'Name must contain only letters, spaces, hyphens and apostrophes'
				),
			handle: yup
				.string()
				.required('Handle is required')
				.min(3, 'Handle must be at least 3 characters')
				.max(255, 'Handle must be less than 255 characters')
				.matches(
					/^[a-zA-Z0-9_\-.]+$/,
					'Handle must contain only letters, numbers, underscores and dots'
				),
		}),
	});

	const [emailRegister, emailRegisterAttributes] = registerDefineField('email');
	const [passwordRegister, passwordRegisterAttributes] = registerDefineField('password');
	const [nameRegister, nameRegisterAttributes] = registerDefineField('name');
	const [handleRegister, handleRegisterAttributes] = registerDefineField('handle');

	onMounted(() => {
		if (!params.type || !['sign-in', 'sign-up'].includes(String(params.type))) {
			return navigateTo('/');
		}

		tab.value = String(params.type) === 'sign-in' ? 'sign-in' : 'sign-up';
	});

	const onLoginSubmit = loginHandleSubmit(async (values) => {
		if (!turnstileToken.value) {
			return toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: 'Please verify you are human',
				life: 3000,
				closable: false,
			});
		}

		const { success } = await $fetch('/_turnstile/validate', {
			method: 'POST',
			body: { token: turnstileToken.value },
		});

		if (!success) {
			return toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: 'Please verify you are human',
				life: 3000,
				closable: false,
			});
		}

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

		await useSetAuthToken(data.token);

		const { data: userData, error: userError } = await useApiJson(
			EApiEndpoint.ACCOUNT_ME,
			{},
			{},
			{},
			{
				Authorization: `Bearer ${data.token}`,
			}
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

		const { data: profileData } = await useApiJson(
			EApiEndpoint.ACCOUNT_PROFILE,
			{},
			{},
			{},
			{
				Authorization: `Bearer ${data.token}`,
			}
		);

		userStore.setUser(userData);
		userStore.setProfile(profileData || null);

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

	const onHandleChange = debounce(async (value?: string) => {
		if (!value) return;

		await registerValidateField('handle');

		if (registerErrors.value.handle) return;

		const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHECK_HANDLE, { handle: value });

		registerSetFieldError('handle', error ? 'Handle not available' : undefined);

		return;
	}, 500);

	const onEmailChange = debounce(async (value?: string) => {
		if (!value) return;

		await registerValidateField('email');

		if (registerErrors.value.email) return;

		const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHECK_EMAIL, { email: value });

		registerSetFieldError('email', error ? 'Email not available' : undefined);

		return;
	}, 500);

	const onRegisterSubmit = registerHandleSubmit(async (values) => {
		if (!turnstileToken.value) {
			return toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: 'Please verify you are human',
				life: 3000,
				closable: false,
			});
		}

		const { success } = await $fetch('/_turnstile/validate', {
			method: 'POST',
			body: { token: turnstileToken.value },
		});

		if (!success) {
			return toast.add({
				severity: 'error',
				summary: 'Oops!',
				detail: 'Please verify you are human',
				life: 3000,
				closable: false,
			});
		}

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

		await useSetAuthToken(data.token);

		const { data: userData, error: userError } = await useApiJson(
			EApiEndpoint.ACCOUNT_ME,
			{},
			{},
			{},
			{
				Authorization: `Bearer ${data.token}`,
			}
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

		const { data: profileData } = await useApiJson(
			EApiEndpoint.ACCOUNT_PROFILE,
			{},
			{},
			{},
			{
				Authorization: `Bearer ${data.token}`,
			}
		);

		userStore.setUser(userData);
		userStore.setProfile(profileData || null);

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
			var(--color-blue-50) 0%,
			var(--color-purple-50) 50%,
			var(--color-pink-50) 100%
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
									color: var(--text-100);
									text-decoration: none;

									&:hover {
										text-decoration: underline;
									}
								}
							}

							.turnstile {
								width: 100%;
								display: flex;
								justify-content: center;
							}
						}
					}
				}
			}
		}

		:root[data-theme='dark'] & {
			background-image: linear-gradient(
				to bottom right in oklab,
				color-mix(in oklab, var(--color-blue-950) 20%, transparent) 0%,
				color-mix(in oklab, var(--color-purple-950) 20%, transparent) 50%,
				color-mix(in oklab, var(--color-pink-950) 20%, transparent) 100%
			);

			.container {
				:deep(.p-tabs) {
					.p-tabpanels {
						.p-tabpanel {
							form {
								.forgot-password {
									a {
										color: var(--color-blue-400);
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
