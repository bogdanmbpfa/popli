import { defineStore } from 'pinia';

import type { IAccountProfile, IAccountUser } from '~/interfaces';

export const useUserStore = defineStore('user', {
	state: () => ({
		user: null as IAccountUser | null,
		profile: null as IAccountProfile | null,
	}),
	getters: {
		getUser: (state): IAccountUser | null => state.user,
		getProfile: (state): IAccountProfile | null => state.profile,
	},
	actions: {
		setUser(user: IAccountUser | null): void {
			this.user = user;
		},
		setProfile(profile: IAccountProfile | null): void {
			this.profile = profile;
		},
	},
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
});
