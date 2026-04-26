import type { Options } from 'qr-code-styling';

import type { EQRCodeDataType } from '../../enums';

export interface IQrCode {
  id: string;
  userId: string;
  title: string;
  url: string;
  imageUrl: string | null;
  dataType: EQRCodeDataType;
  options: Options;
  totalScans: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
