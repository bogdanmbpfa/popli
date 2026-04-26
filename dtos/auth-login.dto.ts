import * as yup from 'yup';

export const AuthLoginYupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup.string().required('Password is required'),
});

export type IAuthLoginYup = yup.InferType<typeof AuthLoginYupSchema>;
