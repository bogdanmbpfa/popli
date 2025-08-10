export interface IAccountUser {
	id: string;
	email: string;
	name: string;
	handle: string;
	profileImage: string | null;
	emailConfirmedAt: string | null;
	createdAt: string;
	updatedAt: string;
}
