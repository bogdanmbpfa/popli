export interface IAccountUser {
	id: string;
	email: string;
	emailConfirmedAt: string | null;
	emailConfirmationCode: string | null;
	emailConfirmationCodeExpiresAt: string | null;
	createdAt: string;
	updatedAt: string;
}
