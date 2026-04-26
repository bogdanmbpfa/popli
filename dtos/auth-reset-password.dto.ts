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
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    ),
});

export type IAuthResetPasswordYup = yup.InferType<
  typeof AuthResetPasswordYupSchema
>;
