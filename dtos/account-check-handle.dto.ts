import * as yup from 'yup';

export const AccountCheckHandleYupSchema = yup.object({
  handle: yup
    .string()
    .required('Handle is required')
    .min(3, 'Handle must be at least 3 characters')
    .max(255, 'Handle must be less than 255 characters')
    .matches(
      /^[a-zA-Z0-9_\-.]+$/,
      'Handle must contain only letters, numbers, underscores and dots',
    ),
});

export type IAccountCheckHandleYup = yup.InferType<
  typeof AccountCheckHandleYupSchema
>;
