import * as yup from 'yup';

export const UrlCreateShortUrlYupSchema = yup.object({
  url: yup.string().required().url(),
  alias: yup
    .string()
    .optional()
    .min(2, 'Alias must be at least 2 characters')
    .max(255, 'Alias must be less than 255 characters')
    .matches(
      /^[a-zA-Z0-9_\-.]+$/,
      'Alias must contain only letters, numbers, underscores and dots',
    ),
  title: yup
    .string()
    .required()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
});

export type IUrlCreateShortUrlYup = yup.InferType<
  typeof UrlCreateShortUrlYupSchema
>;
