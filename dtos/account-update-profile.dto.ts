import * as yup from 'yup';

export const AccountUpdateProfileYupSchema = yup.object({
  name: yup
    .string()
    .optional()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must be less than 255 characters')
    .matches(
      /^[a-zA-Z-\\'\s]+$/,
      'Name must contain only letters, apostrophes and spaces',
    ),
  handle: yup
    .string()
    .optional()
    .min(3, 'Handle must be at least 3 characters')
    .max(40, 'Handle must be less than 40 characters')
    .matches(
      /^[a-zA-Z0-9_\-.]+$/,
      'Handle must contain only letters, numbers, underscores and dots',
    ),
  handleColor: yup
    .string()
    .optional()
    .length(7, 'Handle color must be 7 characters')
    .matches(/^#[0-9a-fA-F]+$/, 'Handle color must be a valid hex color'),
  bio: yup.string().optional().max(255, 'Bio must be less than 255 characters'),
  bioColor: yup
    .string()
    .optional()
    .length(7, 'Bio color must be 7 characters')
    .matches(/^#[0-9a-fA-F]+$/, 'Bio color must be a valid hex color'),
  profileImageId: yup
    .string()
    .optional()
    .nullable()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
  coverImageId: yup
    .string()
    .optional()
    .nullable()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
});

export type IAccountUpdateProfileYup = yup.InferType<
  typeof AccountUpdateProfileYupSchema
>;
