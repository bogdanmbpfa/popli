import * as yup from 'yup';

import {
  EQRCodeCornerDotType,
  EQRCodeCornerSquaresType,
  EQRCodeDataType,
  EQRCodeDotsType,
  EQRCodeGradientType,
  EQRCodeShape,
} from '../enums';

export const CreateQrCodeYupSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title must be less than 255 characters'),
  type: yup
    .string()
    .required('Type is required')
    .oneOf(Object.values(EQRCodeDataType)),
  imageId: yup
    .string()
    .optional()
    .nullable()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
  options: yup
    .object({
      shape: yup.string().required().oneOf(Object.values(EQRCodeShape)),
      type: yup.string().optional(),
      width: yup
        .number()
        .required()
        .min(128, 'Width must be greater than 128')
        .max(512, 'Width must be less than 512'),
      height: yup
        .number()
        .required()
        .min(128, 'Height must be greater than 128')
        .max(512, 'Height must be less than 512'),
      margin: yup
        .number()
        .required()
        .min(0, 'Margin must be greater than 0')
        .max(10, 'Margin must be less than 10'),
      data: yup.string().required(),
      image: yup.string().optional(),
      qrOptions: yup.object().optional().default(undefined),
      imageOptions: yup
        .object({
          crossOrigin: yup.string().required(),
          imageSize: yup
            .number()
            .required()
            .min(0, 'Image size must be greater than 0'),
          hideBackgroundDots: yup.boolean().required(),
          saveAsBlob: yup.boolean().required(),
        })
        .optional()
        .default(undefined),
      dotsOptions: yup
        .object({
          color: yup.string().required(),
          type: yup.string().required().oneOf(Object.values(EQRCodeDotsType)),
          gradient: yup
            .object({
              type: yup
                .string()
                .required()
                .oneOf(Object.values(EQRCodeGradientType)),
              rotation: yup.number().required(),
              colorStops: yup
                .array()
                .required()
                .of(
                  yup.object().shape({
                    color: yup.string().required(),
                    offset: yup.number().required(),
                  }),
                ),
            })
            .optional()
            .default(undefined),
        })
        .optional()
        .default(undefined),
      cornersSquareOptions: yup
        .object({
          color: yup.string().optional(),
          type: yup
            .string()
            .required()
            .oneOf(Object.values(EQRCodeCornerSquaresType)),
          gradient: yup
            .object({
              type: yup
                .string()
                .required()
                .oneOf(Object.values(EQRCodeGradientType)),
              rotation: yup.number().required(),
              colorStops: yup
                .array()
                .required()
                .of(
                  yup.object().shape({
                    color: yup.string().required(),
                    offset: yup.number().required(),
                  }),
                ),
            })
            .optional()
            .default(undefined),
        })
        .optional()
        .default(undefined),
      cornersDotOptions: yup
        .object({
          color: yup.string().optional(),
          type: yup
            .string()
            .required()
            .oneOf(Object.values(EQRCodeCornerDotType)),
          gradient: yup
            .object({
              type: yup
                .string()
                .required()
                .oneOf(Object.values(EQRCodeGradientType)),
              rotation: yup.number().required(),
              colorStops: yup
                .array()
                .required()
                .of(
                  yup.object().shape({
                    color: yup.string().required(),
                    offset: yup.number().required(),
                  }),
                ),
            })
            .optional()
            .default(undefined),
        })
        .optional()
        .default(undefined),
      backgroundOptions: yup
        .object({
          round: yup.number().required().min(0, 'Round must be greater than 0'),
          color: yup.string().optional(),
          gradient: yup
            .object({
              type: yup
                .string()
                .required()
                .oneOf(Object.values(EQRCodeGradientType)),
              rotation: yup.number().required(),
              colorStops: yup
                .array()
                .required()
                .of(
                  yup.object().shape({
                    color: yup.string().required(),
                    offset: yup.number().required(),
                  }),
                ),
            })
            .optional()
            .default(undefined),
        })
        .optional()
        .default(undefined),
    })
    .optional()
    .default(undefined),
});

export type ICreateQrCodeYup = yup.InferType<typeof CreateQrCodeYupSchema>;
