import type { EContactInquiryType } from '~~/enums';

export interface IAccountContact {
	name: string;
	email: string;
	inquiryType: EContactInquiryType;
	message: string;
}
