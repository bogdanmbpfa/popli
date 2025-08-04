import { Static, Type } from '@sinclair/typebox';

export const Account = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  handle: Type.String(),
  profileImage: Type.Union([Type.String({ format: 'uri' }), Type.Null()]),
  emailConfirmedAt: Type.Union([
    Type.String({ format: 'date-time' }),
    Type.Null(),
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export const AccountUpdate = Type.Object({
  name: Type.Optional(Type.String()),
  handle: Type.Optional(Type.String()),
});

export const AccountVerifyEmail = Type.Object({
  code: Type.String({
    minLength: 6,
    maxLength: 6,
    pattern: new RegExp(/^[0-9]+$/).source,
  }),
});

export const AccountChangePassword = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String({
    pattern: new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ).source,
  }),
});

export const AccountCheckHandle = Type.Object({
  handle: Type.String({
    minLength: 3,
    maxLength: 255,
    pattern: new RegExp(/^[a-zA-Z0-9_\-.]+$/).source,
  }),
});

export const AccountCheckEmail = Type.Object({
  email: Type.String({ format: 'email' }),
});

export const AccountUpdateProfile = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 3,
      maxLength: 255,
      pattern: new RegExp(/^[a-zA-Z-\\'\s]+$/).source,
    }),
  ),
  bio: Type.Optional(Type.String({ minLength: 0, maxLength: 255 })),
});

export const AccountUpdateEmail = Type.Object({
  email: Type.String({ format: 'email' }),
  code: Type.String({
    minLength: 6,
    maxLength: 6,
    pattern: new RegExp(/^[0-9]+$/).source,
  }),
});

export type AccountType = Static<typeof Account>;
export type AccountUpdateType = Static<typeof AccountUpdate>;
export type AccountVerifyEmailType = Static<typeof AccountVerifyEmail>;
export type AccountChangePasswordType = Static<typeof AccountChangePassword>;
export type AccountCheckHandleType = Static<typeof AccountCheckHandle>;
export type AccountCheckEmailType = Static<typeof AccountCheckEmail>;
export type AccountUpdateProfileType = Static<typeof AccountUpdateProfile>;
export type AccountUpdateEmailType = Static<typeof AccountUpdateEmail>;
