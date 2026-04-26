import * as yup from 'yup';

export const AccountVerifyEmailYupSchema = yup.object({
  code: yup
    .string()
    .required('Code is required')
    .matches(/^[0-9]+$/, 'Code must be a number')
    .length(6, 'Code must be 6 digits'),
});

export type IAccountVerifyEmailYup = yup.InferType<
  typeof AccountVerifyEmailYupSchema
>;
