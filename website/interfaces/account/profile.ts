export interface IAccountProfile {
	id: string;
	userId: string;
	name: string | null;
	handle: string | null;
	handleColor: string | null;
	profileImage: string | null;
	coverImage: string | null;
	bio: string | null;
	bioColor: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
