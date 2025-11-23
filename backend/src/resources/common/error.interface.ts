import { EErrorCode } from './error-code.enum';

export interface IError {
  code: EErrorCode;
  message: string;
  errors?: Record<string, string>;
}
