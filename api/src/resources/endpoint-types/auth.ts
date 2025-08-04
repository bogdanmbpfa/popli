import { Static, Type } from '@sinclair/typebox';

export const AuthResponse = Type.Object({
  token: Type.String(),
});

export const AuthLogin = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export const AuthRegister = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({
    pattern: new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ).source,
  }),
  name: Type.String({
    minLength: 3,
    maxLength: 255,
    pattern: new RegExp(/^[a-zA-Z-\\'\s]+$/).source,
  }),
  handle: Type.String({
    minLength: 3,
    maxLength: 255,
    pattern: new RegExp(/^[a-zA-Z0-9_\-.]+$/).source,
  }),
});

export const AuthRequestPasswordReset = Type.Object({
  email: Type.String({ format: 'email' }),
});

export const AuthResetPassword = Type.Object({
  email: Type.String({ format: 'email' }),
  code: Type.String(),
  password: Type.String({
    pattern: new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ).source,
  }),
});

export type AuthResponseType = Static<typeof AuthResponse>;
export type AuthLoginType = Static<typeof AuthLogin>;
export type AuthRegisterType = Static<typeof AuthRegister>;
export type AuthRequestPasswordResetType = Static<
  typeof AuthRequestPasswordReset
>;
export type AuthResetPasswordType = Static<typeof AuthResetPassword>;
