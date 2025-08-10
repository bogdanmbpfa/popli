import { EApiEndpoint } from '~/enums';
import type { IApiEndpoint, IAuthLoginResponse, IAccountUser } from '~/interfaces';

export const apiEndpoints: Record<EApiEndpoint, IApiEndpoint> = {
	// Auth API Endpoints
	[EApiEndpoint.AUTH_LOGIN]: {
		path: '/auth/login',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},

	[EApiEndpoint.AUTH_REGISTER]: {
		path: '/auth/register',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},

	[EApiEndpoint.AUTH_REQUEST_PASSWORD_RESET]: {
		path: '/auth/request-password-reset',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},

	[EApiEndpoint.AUTH_RESET_PASSWORD]: {
		path: '/auth/reset-password',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},

	// Account API Endpoints
	[EApiEndpoint.ACCOUNT_ME]: {
		path: '/account/me',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_CHECK_HANDLE]: {
		path: '/account/check-handle',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.ACCOUNT_CHECK_EMAIL]: {
		path: '/account/check-email',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
};

export type TApiEndpoint = {
	// Auth API Endpoints
	[EApiEndpoint.AUTH_LOGIN]: IAuthLoginResponse;
	[EApiEndpoint.AUTH_REGISTER]: IAuthLoginResponse;
	[EApiEndpoint.AUTH_REQUEST_PASSWORD_RESET]: void;
	[EApiEndpoint.AUTH_RESET_PASSWORD]: void;

	// Account API Endpoints
	[EApiEndpoint.ACCOUNT_ME]: IAccountUser;
	[EApiEndpoint.ACCOUNT_CHECK_HANDLE]: void;
	[EApiEndpoint.ACCOUNT_CHECK_EMAIL]: void;
};
