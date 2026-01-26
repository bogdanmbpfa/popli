import { EApiEndpoint } from '~~/enums';
import type {
	IAccountProfile,
	IAccountUser,
	IApiEndpoint,
	IAuthLoginResponse,
	IQrCode,
	IQrCodeAnalytics,
	IUrlShortUrl,
	IUrlShortUrlCountryClicks,
	IUrlShortUrlDailyClicks,
	IUrlShortUrlRedirect,
} from '~/../interfaces';

export const apiEndpoints: Record<keyof typeof EApiEndpoint, IApiEndpoint> = {
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
	[EApiEndpoint.AUTH_LOGOUT]: {
		path: '/auth/logout',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.AUTH_REFRESH_TOKEN]: {
		path: '/auth/refresh-token',
		method: 'POST',
		contentType: 'json',
		auth: true,
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

	[EApiEndpoint.ACCOUNT_PROFILE]: {
		path: '/account/profile',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_UPLOAD_COVER_IMAGE]: {
		path: '/account/upload-cover-image',
		method: 'POST',
		contentType: 'multipart',
		auth: true,
		filenames: ['file'],
	},
	[EApiEndpoint.ACCOUNT_UPDATE_PROFILE]: {
		path: '/account',
		method: 'PATCH',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_REQUEST_EMAIL_VERIFY]: {
		path: '/account/request-email-verify',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_VERIFY_EMAIL]: {
		path: '/account/verify-email',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_CHANGE_PASSWORD]: {
		path: '/account/change-password',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_DELETE]: {
		path: '/account',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},

	// URL API Endpoints
	[EApiEndpoint.URL_SHORT_URL_CREATE]: {
		path: '/url/short-url',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},

	[EApiEndpoint.URL_SHORT_URL]: {
		path: '/url/short-url',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},

	[EApiEndpoint.URL_SHORT_URL_TOGGLE]: {
		path: '/url/short-url/{id}/toggle',
		method: 'PATCH',
		contentType: 'json',
		auth: true,
	},

	[EApiEndpoint.URL_SHORT_URL_UPDATE]: {
		path: '/url/short-url',
		method: 'PATCH',
		contentType: 'json',
		auth: true,
	},

	[EApiEndpoint.URL_SHORT_URL_DELETE]: {
		path: '/url/short-url/{id}',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},

	[EApiEndpoint.URL_SHORT_URL_REDIRECT]: {
		path: '/url/short-url/{shortUrlCode}',
		method: 'GET',
		contentType: 'json',
		auth: false,
	},

	[EApiEndpoint.URL_SHORT_URL_DAILY_CLICKS]: {
		path: '/url/short-url/{id}/daily-clicks',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},

	[EApiEndpoint.URL_SHORT_URL_COUNTRY_CLICKS]: {
		path: '/url/short-url/{id}/country-clicks',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},

	// QR Code API Endpoints
	[EApiEndpoint.QR_CODE_CREATE]: {
		path: '/qr-code',
		method: 'POST',
		contentType: 'multipart',
		auth: true,
		filenames: ['image'],
	},
	[EApiEndpoint.QR_CODE_GET]: {
		path: '/qr-code',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.QR_CODE_ANALYTICS]: {
		path: '/qr-code/{id}/analytics',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.QR_CODE_DELETE]: {
		path: '/qr-code/{id}',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},
};

export type TApiEndpoint = {
	// Auth API Endpoints
	[EApiEndpoint.AUTH_LOGIN]: IAuthLoginResponse;
	[EApiEndpoint.AUTH_REGISTER]: IAuthLoginResponse;
	[EApiEndpoint.AUTH_REQUEST_PASSWORD_RESET]: undefined;
	[EApiEndpoint.AUTH_RESET_PASSWORD]: undefined;
	[EApiEndpoint.AUTH_LOGOUT]: undefined;
	[EApiEndpoint.AUTH_REFRESH_TOKEN]: IAuthLoginResponse;

	// Account API Endpoints
	[EApiEndpoint.ACCOUNT_ME]: IAccountUser;
	[EApiEndpoint.ACCOUNT_CHECK_HANDLE]: undefined;
	[EApiEndpoint.ACCOUNT_CHECK_EMAIL]: undefined;
	[EApiEndpoint.ACCOUNT_PROFILE]: IAccountProfile;
	[EApiEndpoint.ACCOUNT_UPLOAD_COVER_IMAGE]: undefined;
	[EApiEndpoint.ACCOUNT_UPDATE_PROFILE]: undefined;
	[EApiEndpoint.ACCOUNT_REQUEST_EMAIL_VERIFY]: undefined;
	[EApiEndpoint.ACCOUNT_VERIFY_EMAIL]: undefined;
	[EApiEndpoint.ACCOUNT_CHANGE_PASSWORD]: undefined;
	[EApiEndpoint.ACCOUNT_DELETE]: undefined;

	// URL API Endpoints
	[EApiEndpoint.URL_SHORT_URL_CREATE]: undefined;
	[EApiEndpoint.URL_SHORT_URL]: IUrlShortUrl[];
	[EApiEndpoint.URL_SHORT_URL_UPDATE]: undefined;
	[EApiEndpoint.URL_SHORT_URL_DELETE]: undefined;
	[EApiEndpoint.URL_SHORT_URL_TOGGLE]: undefined;
	[EApiEndpoint.URL_SHORT_URL_REDIRECT]: IUrlShortUrlRedirect;
	[EApiEndpoint.URL_SHORT_URL_DAILY_CLICKS]: IUrlShortUrlDailyClicks[];
	[EApiEndpoint.URL_SHORT_URL_COUNTRY_CLICKS]: IUrlShortUrlCountryClicks[];

	// QR Code API Endpoints
	[EApiEndpoint.QR_CODE_CREATE]: undefined;
	[EApiEndpoint.QR_CODE_GET]: IQrCode[];
	[EApiEndpoint.QR_CODE_ANALYTICS]: IQrCodeAnalytics;
	[EApiEndpoint.QR_CODE_DELETE]: undefined;
};
