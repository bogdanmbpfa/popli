import { Static, Type } from '@sinclair/typebox';

import { EQRCodeDataType } from '../enums';

export const QrCodeCreate = Type.Object({
  title: Type.String({ minLength: 3, maxLength: 255 }),
  dataType: Type.Enum(EQRCodeDataType),
  options: Type.Object({}),
});

export type QrCodeCreateType = Static<typeof QrCodeCreate>;
