<template>
  <form @submit.prevent="onNameSubmit">
    <div class="heading">
      <Icon class="info" name="material-symbols:shield-person-outline-rounded" size="1rem" />
      <span>Name</span>
    </div>

    <FormInput
      id="name"
      label=""
      :error="errors.name"
      required
      caption="This will be displayed on your profile"
    >
      <PInputText
        id="name"
        v-model="name"
        v-bind="nameAttributes"
        class="default"
        placeholder="Enter your name"
        fluid
        :invalid="!!errors.name"
        :disabled="isSubmitting"
      />
    </FormInput>

    <PButton
      class="default"
      type="submit"
      label="Save"
      severity="contrast"
      :loading="isSubmitting"
      :disabled="isSubmitting || name === profile.name || !!errors.name"
    />
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';

const userStore = useUserStore();
const toast = useToast();

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object().shape({
    name: yup
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(255, 'Name must be less than 255 characters'),
  }),
});

const [name, nameAttributes] = defineField('name');

const profile = computed(() => userStore.getProfile!);

onMounted(() => {
  name.value = profile.value?.name || '';
});

watch(profile, () => {
  name.value = profile.value?.name || '';
});

const onNameSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(
    EApiEndpoint.ACCOUNT_UPDATE_PROFILE,
    values,
  );

  if (error) {
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  userStore.setProfile({
    ...profile.value,
    name: values.name,
  });

  return toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Name updated successfully',
    life: 3000,
  });
});
</script>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: center;

  .heading {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;

    span {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-100);
    }
  }

  .p-button {
    align-self: flex-start;
  }
}
</style>