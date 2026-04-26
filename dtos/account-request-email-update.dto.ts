import * as yup from 'yup';

export const AccountRequestEmailUpdateYupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
});

export type IAccountRequestEmailUpdateYup = yup.InferType<
  typeof AccountRequestEmailUpdateYupSchema
>;
