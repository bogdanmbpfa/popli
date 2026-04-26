import * as yup from 'yup';

export const AccountCheckEmailYupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
});

export type IAccountCheckEmailYup = yup.InferType<
  typeof AccountCheckEmailYupSchema
>;
