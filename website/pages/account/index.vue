<template>
	<div class="account-page">
		<div class="container">
			<FormContainer
				title="Cover image"
				description="Upload a cover image for your account. This will be displayed on your profile page.">
				<form @submit.prevent="onSubmitCoverImage">
					<FormFileUpload
						id="cover-image"
						ref="coverImageUpload"
						accept="image/jpeg,image/png,image/webp"
						:disabled="isCoverImageSubmitting"
						@select="onSelectCoverImage" />

					<span class="caption"> Recommended size: 1280x720px, JPG, PNG, WEBP </span>

					<PButton
						type="submit"
						class="default"
						severity="contrast"
						icon="pi pi-upload"
						label="Upload"
						:disabled="!coverImage || isCoverImageSubmitting" />
				</form>
			</FormContainer>

			<FormContainer title="Basic info" description="Your public profile information.">
				<form @submit.prevent="onSubmitBasicInfo">
					<FormInput
						id="name"
						v-model="name"
						label="Name"
						:error="basicInfoErrors.name"
						:required="false"
						size="half">
						<PInputText
							id="name"
							v-model="name"
							v-bind="nameAttributes"
							class="default"
							placeholder="Name"
							fluid
							:invalid="!!basicInfoErrors.name"
							:disabled="isBasicInfoSubmitting" />
					</FormInput>

					<FormInput
						id="handle"
						v-model="handle"
						label="Handle"
						:error="basicInfoErrors.handle"
						:required="false"
						size="half">
						<PInputGroup class="default">
							<PInputGroupAddon> popli.one/ </PInputGroupAddon>

							<PInputText
								id="handle"
								v-model="handle"
								v-bind="handleAttributes"
								class="default"
								fluid
								:invalid="!!basicInfoErrors.handle"
								:disabled="isBasicInfoSubmitting"
								@value-change="onHandleChange" />
						</PInputGroup>
					</FormInput>

					<FormInput
						id="bio"
						v-model="bio"
						label="Bio"
						:error="basicInfoErrors.bio"
						:required="false">
						<PTextarea
							id="bio"
							v-model="bio"
							v-bind="bioAttributes"
							class="default"
							placeholder="Bio"
							fluid
							rows="3"
							auto-resize
							:invalid="!!basicInfoErrors.bio"
							:disabled="isBasicInfoSubmitting" />
					</FormInput>

					<PButton
						type="submit"
						class="default"
						severity="contrast"
						icon="pi pi-save"
						label="Save"
						:disabled="isBasicInfoSubmitting" />
				</form>
			</FormContainer>

			<FormContainer title="Contact info" description="Your contact information.">
				<form @submit.prevent="onSubmitVerifyEmail">
					<FormInput
						id="email"
						v-model="email"
						label="Email"
						:error="contactInfoErrors.email"
						required>
						<PInputText
							id="email"
							v-model="email"
							v-bind="emailAttributes"
							class="default"
							placeholder="Email"
							fluid
							:invalid="!!contactInfoErrors.email"
							readonly />

						<PMessage v-if="user.emailConfirmedAt" class="default" severity="success">
							<Icon name="mdi:checkbox-marked-circle-outline" />
							Email verified
						</PMessage>
					</FormInput>

					<FormInput
						v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
						id="code"
						v-model="code"
						label="Code"
						:error="contactInfoErrors.code"
						:required="false">
						<PInputOtp
							id="code"
							v-model="code"
							v-bind="codeAttributes"
							class="default"
							fluid
							integer-only
							:length="6"
							:invalid="!!contactInfoErrors.code"
							:disabled="isContactInfoSubmitting" />
					</FormInput>

					<PButton
						v-if="isEmailVerifyRequested && !user.emailConfirmedAt"
						type="submit"
						class="default"
						severity="contrast"
						label="Verify"
						:disabled="isContactInfoSubmitting" />

					<PButton
						v-if="!user.emailConfirmedAt && !isEmailVerifyRequested"
						type="button"
						class="default"
						severity="contrast"
						label="Request code"
						:disabled="isContactInfoSubmitting"
						@click="onSubmitRequestEmailVerify" />
				</form>
			</FormContainer>
		</div>

		<ProfilePreview v-if="profile" :profile="profile" />
	</div>
</template>

<script setup lang="ts">
	import debounce from 'lodash/debounce';
	import * as yup from 'yup';

	import FileUpload from '~/components/form/FileUpload.vue';
	import { EApiEndpoint } from '~/enums';
	import type { IAccountUpdateProfile } from '~/interfaces';

	definePageMeta({
		layout: 'account',
		middleware: 'is-logged-in',
	});

	const toast = useToast();
	const userStore = useUserStore();

	const coverImageUpload = ref<InstanceType<typeof FileUpload>>();
	const isEmailVerifyRequested = ref(false);

	const {
		defineField: defineCoverImageField,
		handleSubmit: handleCoverImageSubmit,
		isSubmitting: isCoverImageSubmitting,
		resetForm: resetCoverImageForm,
	} = useForm({
		validationSchema: yup.object({
			coverImage: yup.string().required('Cover image is required'),
		}),
	});

	const [coverImage] = defineCoverImageField('coverImage');

	const {
		defineField: defineBasicInfoField,
		errors: basicInfoErrors,
		handleSubmit: handleBasicInfoSubmit,
		isSubmitting: isBasicInfoSubmitting,
		resetForm: resetBasicInfoForm,
		setFieldError: basicInfoSetFieldError,
		validateField: validateBasicInfoField,
	} = useForm<IAccountUpdateProfile>({
		validationSchema: yup.object({
			name: yup
				.string()
				.min(3, 'Name must be at least 3 characters')
				.max(255, 'Name must be less than 255 characters'),
			handle: yup
				.string()
				.min(3, 'Handle must be at least 3 characters')
				.max(255, 'Handle must be less than 255 characters'),
			bio: yup.string().max(255, 'Bio must be less than 255 characters'),
		}),
	});

	const [name, nameAttributes] = defineBasicInfoField('name');
	const [handle, handleAttributes] = defineBasicInfoField('handle');
	const [bio, bioAttributes] = defineBasicInfoField('bio');

	const {
		defineField: defineContactInfoField,
		errors: contactInfoErrors,
		handleSubmit: handleContactInfoSubmit,
		isSubmitting: isContactInfoSubmitting,
		resetForm: resetContactInfoForm,
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

	const [email, emailAttributes] = defineContactInfoField('email');
	const [code, codeAttributes] = defineContactInfoField('code');

	const profile = computed(() => userStore.getProfile!);
	const user = computed(() => userStore.getUser!);

	onMounted(async () => {
		const { data } = await useApiJson(EApiEndpoint.ACCOUNT_PROFILE);
		const { data: userData } = await useApiJson(EApiEndpoint.ACCOUNT_ME);

		userStore.setProfile(data || null);
		userStore.setUser(userData || null);

		name.value = data?.name || '';
		handle.value = data?.handle || '';
		bio.value = data?.bio || '';
		email.value = userData?.email || '';
	});

	const onSelectCoverImage = (file: File) => {
		coverImage.value = file;
	};

	const onHandleChange = debounce(async (value?: string) => {
		if (!value) return;

		await validateBasicInfoField('handle');

		if (basicInfoErrors.value.handle) return;

		const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHECK_HANDLE, { handle: value });

		basicInfoSetFieldError('handle', error ? 'Handle not available' : undefined);

		return;
	}, 500);

	const onSubmitCoverImage = handleCoverImageSubmit(async (values) => {
		const { error } = await useApiMultipart(EApiEndpoint.ACCOUNT_UPLOAD_COVER_IMAGE, {
			file: values.coverImage,
		});

		if (error) {
			return toast.add({
				severity: 'error',
				summary: 'Error',
				detail: error.message,
				life: 3000,
			});
		}

		const { data: profileData } = await useApiJson(EApiEndpoint.ACCOUNT_PROFILE);

		userStore.setProfile(profileData || null);

		resetCoverImageForm();

		coverImageUpload.value?.remove();

		return toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Cover image uploaded successfully',
			life: 3000,
		});
	});

	const onSubmitBasicInfo = handleBasicInfoSubmit(async (values) => {
		const { error } = await useApiJson(EApiEndpoint.ACCOUNT_UPDATE_PROFILE, values);

		if (error) {
			return toast.add({
				severity: 'error',
				summary: 'Error',
				detail: error.message,
				life: 3000,
			});
		}

		const { data: userData } = await useApiJson(EApiEndpoint.ACCOUNT_ME);

		userStore.setUser(userData || null);

		return toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Basic info updated successfully',
			life: 3000,
		});
	});

	const onSubmitRequestEmailVerify = async () => {
		const { error } = await useApiJson(EApiEndpoint.ACCOUNT_REQUEST_EMAIL_VERIFY, {});

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
		const { error } = await useApiJson(EApiEndpoint.ACCOUNT_VERIFY_EMAIL, { code: values.code });

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
		const { data: profileData } = await useApiJson(EApiEndpoint.ACCOUNT_PROFILE);

		userStore.setUser(userData || null);
		userStore.setProfile(profileData || null);

		return toast.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Email verified successfully',
			life: 3000,
		});
	});
</script>

<style lang="scss" scoped>
	.account-page {
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

				.caption {
					font-size: 0.75rem;
					font-weight: 400;
					color: var(--text-300);
				}
			}
		}
	}
</style>
