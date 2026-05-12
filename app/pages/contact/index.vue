<template>
  <div class="contact-page">
    <BackgroundBlur position="top-left" type="primary" />
    <BackgroundBlur position="bottom-right" type="secondary" />

    <header class="contact-page__heading">
      <h1>Contact us</h1>
      <p>
        Questions about Popli.one? Use the form below and we'll get back to you
        as soon as possible.
      </p>
    </header>

    <FormContainer
      class="contact-page__form-container"
      title="Get in touch"
      description="Tell us who you are and how we can help."
    >
      <form class="contact-page__form" @submit.prevent="onSubmit">
        <FormInput
          id="contact-name"
          label="Name"
          :error="errors.name"
          :required="true"
        >
          <UiInputText
            id="contact-name"
            v-model="name"
            v-bind="nameAttributes"
            placeholder="Your full name"
            fluid
            autocomplete="name"
            :invalid="!!errors.name"
            :disabled="isSubmitting"
          />
        </FormInput>

        <FormInput
          id="contact-email"
          label="Email address"
          :error="errors.email"
          :required="true"
        >
          <UiInputText
            id="contact-email"
            v-model="email"
            v-bind="emailAttributes"
            placeholder="hello@example.com"
            fluid
            autocomplete="email"
            :invalid="!!errors.email"
            :disabled="isSubmitting"
          />
        </FormInput>

        <FormInput
          id="contact-inquiry-type"
          label="Type of inquiry"
          :error="errors.inquiryType"
          :required="true"
          caption="Choose the category that best matches your message."
        >
          <UiSelect
            id="contact-inquiry-type"
            v-model="inquiryType"
            v-bind="inquiryTypeAttributes"
            :options="inquiryOptions"
            option-label="label"
            option-value="value"
            placeholder="Select inquiry type"
            :invalid="!!errors.inquiryType"
            :disabled="isSubmitting"
          />
        </FormInput>

        <FormInput
          id="contact-message"
          label="Message"
          :error="errors.message"
          :required="true"
        >
          <UiTextarea
            id="contact-message"
            v-model="message"
            v-bind="messageAttributes"
            rows="6"
            placeholder="Describe your question or issue in detail."
            :class="{ invalid: !!errors.message }"
            :disabled="isSubmitting"
          />
        </FormInput>

        <UiButton
          type="submit"
          label="Send message"
          aria-label="Send contact message"
          severity="contrast"
          fluid
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </form>
    </FormContainer>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint, EContactInquiryType } from '~~/enums';
import type { IAccountContact } from '~~/interfaces';

const { seo } = useAppConfig();
const uiToast = useUiToast();

usePageSeo({
  title: seo.contactTitle,
  description: seo.contactDescription,
  path: '/contact',
  ogImage: seo.defaultOgImagePath,
  robots: 'index, follow',
});

const inquiryOptions: { label: string; value: EContactInquiryType }[] = [
  { label: 'General support', value: EContactInquiryType.GENERAL },
  { label: 'Billing & subscriptions', value: EContactInquiryType.BILLING },
  { label: 'Technical issue', value: EContactInquiryType.TECHNICAL },
  { label: 'Partnership / press', value: EContactInquiryType.PARTNERSHIP },
  {
    label: 'Abuse, copyright, or illegal content',
    value: EContactInquiryType.ABUSE,
  },
  { label: 'Privacy / data rights', value: EContactInquiryType.PRIVACY },
  { label: 'Other', value: EContactInquiryType.OTHER },
];

const { defineField, errors, handleSubmit, isSubmitting, resetForm } =
  useForm<IAccountContact>({
    validationSchema: yup.object().shape({
      name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(255, 'Name must be less than 255 characters'),
      email: yup
        .string()
        .required('Email is required')
        .email('Invalid email address'),
      inquiryType: yup
        .mixed<EContactInquiryType>()
        .oneOf(
          Object.values(EContactInquiryType),
          'Please select a valid inquiry type',
        )
        .required('Please select an inquiry type'),
      message: yup
        .string()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must be less than 5000 characters'),
    }),
  });

const [name, nameAttributes] = defineField('name');
const [email, emailAttributes] = defineField('email');
const [inquiryType, inquiryTypeAttributes] = defineField('inquiryType');
const [message, messageAttributes] = defineField('message');

const onSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CONTACT, values);

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
      closable: false,
    });
  }

  resetForm();

  return uiToast.add({
    severity: 'success',
    summary: 'Message sent',
    detail: "Thanks for reaching out. We'll get back to you shortly.",
    life: 4000,
    closable: true,
  });
});
</script>

<style lang="scss" scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem 4rem;

  &__heading {
    width: 100%;
    max-width: 32rem;
    text-align: center;

    h1 {
      margin: 0 0 0.75rem;
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      font-weight: 700;
      color: var(--neutral-100);
      width: 100%;
    }

    p {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.65;
      color: var(--neutral-400);
    }
  }

  &__form-container {
    max-width: 32rem;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  :deep(.ui-textarea.invalid) {
    outline: 1px solid var(--primary-400);
  }
}
</style>
