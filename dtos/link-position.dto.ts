import * as yup from 'yup';

export const LinkPositionYupSchema = yup.object({
  id: yup
    .string()
    .required()
    .matches(
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    ),
  position: yup.number().required().min(0, 'Position must be greater than 0'),
});

export type ILinkPositionYup = yup.InferType<typeof LinkPositionYupSchema>;
