import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('global', {
	state: () => ({
		actionInProgress: false,
		darkMode: false,
	}),
	getters: {
		getActionInProgress: (state): boolean => state.actionInProgress,
		getDarkMode: (state): boolean => state.darkMode,
	},
	actions: {
		toggleActionInProgress(): void {
			this.actionInProgress = !this.actionInProgress;
		},
		toggleDarkMode(): void {
			this.darkMode = !this.darkMode;
		},
		setDarkMode(value: boolean): void {
			this.darkMode = value;
		},
	},
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
});
