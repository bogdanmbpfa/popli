import * as yup from 'yup';

export const AccountUpdateEmailYupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  code: yup
    .string()
    .required('Code is required')
    .matches(/^[0-9]+$/, 'Code must be a number')
    .length(6, 'Code must be 6 digits'),
});

export type IAccountUpdateEmailYup = yup.InferType<
  typeof AccountUpdateEmailYupSchema
>;
