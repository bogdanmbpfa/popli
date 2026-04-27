import * as yup from 'yup';

export const AccountChangePasswordYupSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must have at least one uppercase letter')
    .matches(/[a-z]/, 'Password must have at least one lowercase letter')
    .matches(/[0-9]/, 'Password must have at least one number')
    .matches(
      /[!@#$%^&*(){}[\]=;'\:"|,.\/<>?§±`~_+-]/,
      'Password must have at least one special character',
    ),
});

export type IAccountChangePasswordYup = yup.InferType<
  typeof AccountChangePasswordYupSchema
>;
