import { defineStore } from 'pinia';

import type { IAccountUser } from '~/../interfaces';

export const useUserStore = defineStore('user', {
	state: () => ({
		user: null as IAccountUser | null,
	}),
	getters: {
		getUser: (state): IAccountUser | null => state.user,
	},
	actions: {
		setUser(user: IAccountUser | null): void {
			this.user = user;
		},
	},
});
