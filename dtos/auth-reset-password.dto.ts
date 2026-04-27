import * as yup from 'yup';

export const AuthResetPasswordYupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  code: yup
    .string()
    .required('Code is required')
    .matches(/^[0-9]+$/, 'Code must be a number')
    .length(6, 'Code must be 6 digits'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must have at least one uppercase letter')
    .matches(/[a-z]/, 'Password must have at least one lowercase letter')
    .matches(/[0-9]/, 'Password must have at least one number')
    .matches(
      /[!@#$%^&*(){}[\]=;'\:"|,.\/<>?§±`~_+-]/,
      'Password must have at least one special character',
    ),
});

export type IAuthResetPasswordYup = yup.InferType<
  typeof AuthResetPasswordYupSchema
>;
