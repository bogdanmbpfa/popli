import * as yup from 'yup';

import { ELinkPlatform, ELinkType } from '../enums';

export const CreateLinkYupSchema = yup.object({
  id: yup
    .string()
    .optional()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
  type: yup.string().required().oneOf(Object.values(ELinkType)),
  platform: yup
    .string()
    .optional()
    .nullable()
    .oneOf(Object.values(ELinkPlatform)),
  url: yup.string().required().url(),
  title: yup
    .string()
    .optional()
    .nullable()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  backgroundImageId: yup
    .string()
    .optional()
    .nullable()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
  titleColors: yup
    .array()
    .optional()
    .of(
      yup
        .string()
        .matches(
          /^#([0-9a-fA-F]{6})$/,
          'Title color must be a valid hex color',
        ),
    ),
  backgroundColors: yup
    .array()
    .optional()
    .of(
      yup
        .string()
        .matches(
          /^#([0-9a-fA-F]{6})$/,
          'Background color must be a valid hex color',
        ),
    ),
  position: yup.number().required().min(0, 'Position must be greater than 0'),
});

export type ICreateLinkYup = yup.InferType<typeof CreateLinkYupSchema>;
