import { Static, Type } from '@sinclair/typebox';

export const ErrorResponse = Type.Object({
  error: Type.String(),
});

export type ErrorResponseType = Static<typeof ErrorResponse>;
