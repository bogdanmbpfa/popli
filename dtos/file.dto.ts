import * as yup from 'yup';

export const FileYupSchema = yup.object({
  buffer: yup.mixed().required(),
  mimetype: yup.string().required(),
  size: yup.number().required(),
  originalname: yup.string().required(),
});

export type IFileYup = yup.InferType<typeof FileYupSchema>;
