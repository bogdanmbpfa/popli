import * as yup from 'yup';

export const UrlShortUrlUpdateYupSchema = yup.object({
  id: yup
    .string()
    .required()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
  url: yup.string().optional().url(),
  alias: yup
    .string()
    .optional()
    .min(2)
    .max(255)
    .matches(/^[a-zA-Z0-9_\-.]+$/),
  title: yup.string().optional().min(3).max(255),
});

export type IUrlShortUrlUpdateYup = yup.InferType<
  typeof UrlShortUrlUpdateYupSchema
>;
