<template>
	<div class="auth-forgot-password">
		<div class="container">
			<div class="heading">
				<div class="logo">
					<nuxt-img :src="images.logo" alt="Popli.one" loading="lazy" />

					<span>Popli.one</span>
				</div>

				<span class="description"> Pop your links. Share your story. </span>
			</div>

			<form v-if="!passwordResetRequested" @submit.prevent="onForgotPasswordSubmit">
				<div class="heading">
					<span class="title"> Forgot your password? </span>

					<span class="description"> Enter your email to reset your password </span>
				</div>

				<FormInput id="email" label="Email" :error="forgotPasswordErrors.email" required>
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
							:disabled="forgotPasswordIsSubmitting" />
					</PIconField>
				</FormInput>

				<PButton
					class="default"
					type="submit"
					label="Reset Password"
					fluid
					severity="contrast"
					:disabled="forgotPasswordIsSubmitting" />
			</form>

			<form v-else @submit.prevent="onResetPasswordSubmit">
				<div class="heading">
					<span class="title"> Reset your password </span>

					<span class="description"> Enter your new password </span>
				</div>

				<FormInput id="code" label="Code" :error="resetPasswordErrors.code" required>
					<PInputOtp
						v-model="codeReset"
						v-bind="codeResetAttributes"
						id="code"
						input-class="default"
						class="default"
						placeholder="Enter the code"
						fluid
						:length="6"
						:invalid="!!resetPasswordErrors.code"
						:disabled="resetPasswordIsSubmitting" />
				</FormInput>

				<FormInput id="password" label="Password" :error="resetPasswordErrors.password" required>
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
							:disabled="resetPasswordIsSubmitting" />
					</PIconField>
				</FormInput>

				<PButton
					class="default"
					type="submit"
					label="Reset Password"
					fluid
					severity="contrast"
					:disabled="resetPasswordIsSubmitting" />
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
	import * as yup from 'yup';

	import { EApiEndpoint } from '~/enums';
	import type { IAuthForgotPassword, IAuthResetPassword } from '~/interfaces';

	definePageMeta({
		layout: 'auth',
		middleware: 'is-not-logged-in',
	});

	const {
		public: { images },
	} = useRuntimeConfig();
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
			email: yup.string().required('Email is required').email('Invalid email address'),
		}),
	});

	const [email, emailAttributes] = forgotPasswordDefineField('email');

	const {
		defineField: resetPasswordDefineField,
		errors: resetPasswordErrors,
		handleSubmit: resetPasswordHandleSubmit,
		isSubmitting: resetPasswordIsSubmitting,
		resetForm: resetPasswordResetForm,
		setFieldError: resetPasswordSetFieldError,
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
					'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
				),
		}),
	});

	const [codeReset, codeResetAttributes] = resetPasswordDefineField('code');
	const [passwordReset, passwordResetAttributes] = resetPasswordDefineField('password');

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
			detail: 'Your password has been reset. Please sign in with your new password.',
			life: 3000,
		});

		resetPasswordResetForm();
		forgotPasswordResetForm();
		passwordResetRequested.value = false;

		return navigateTo('/auth/sign-in');
	});
</script>

<style lang="scss" scoped>
	.auth-forgot-password {
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

			form {
				width: 100%;
				background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
				border: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
				@include squircle(1.5rem);
				backdrop-filter: blur(1.5rem) saturate(150%);
				box-shadow: 0 25px 50px -12px #00000040;
				padding: 2rem;
				display: flex;
				gap: 2rem;

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
			}
		}
	}
</style>
