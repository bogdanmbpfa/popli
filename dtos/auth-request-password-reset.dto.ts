import * as yup from 'yup';

export const AuthRequestPasswordResetYupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
});

export type IAuthRequestPasswordResetYup = yup.InferType<
  typeof AuthRequestPasswordResetYupSchema
>;
