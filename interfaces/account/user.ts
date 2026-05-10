import { EPlanType } from '~~/enums';

export interface IAccountUser {
	id: string;
	email: string;
	plan: EPlanType;
	planStartedAt: string | null;
	planEndsAt: string | null;
	emailConfirmedAt: string | null;
	emailConfirmationCode: string | null;
	emailConfirmationCodeExpiresAt: string | null;
	createdAt: string;
	updatedAt: string;
}
