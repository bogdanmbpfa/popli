import * as yup from 'yup';

import { EContactInquiryType } from '~~/enums';

export const AccountContactYupSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  inquiryType: yup
    .mixed<EContactInquiryType>()
    .oneOf(
      Object.values(EContactInquiryType),
      'Please select a valid inquiry type',
    )
    .required('Please select an inquiry type'),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
});

export type IAccountContactYup = yup.InferType<typeof AccountContactYupSchema>;
