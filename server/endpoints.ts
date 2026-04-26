import { EApiEndpoint } from '~~/enums';
import type {
	IAccountProfile,
	IAccountUser,
	IApiEndpoint,
	IAuthLoginResponse,
	ILink,
	IProfile,
	IProfileDailyClicks,
	IProfileTotalClicks,
	IQrCode,
	IQrCodeAnalytics,
	IUrlShortUrl,
	IUrlShortUrlCountryClicks,
	IUrlShortUrlDailyClicks,
} from '~/../interfaces';

export const apiEndpoints: Record<keyof typeof EApiEndpoint, IApiEndpoint> = {
	// Auth API Endpoints
	[EApiEndpoint.AUTH_LOGIN]: {
		path: '/api/auth/login',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.AUTH_REGISTER]: {
		path: '/api/auth/register',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.AUTH_REQUEST_PASSWORD_RESET]: {
		path: '/api/auth/request-password-reset',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.AUTH_RESET_PASSWORD]: {
		path: '/api/auth/reset-password',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.AUTH_LOGOUT]: {
		path: '/api/auth/logout',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},

	// Account API Endpoints
	[EApiEndpoint.ACCOUNT_ME]: {
		path: '/api/account/me',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_CHECK_HANDLE]: {
		path: '/api/account/check-handle',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.ACCOUNT_CHECK_EMAIL]: {
		path: '/api/account/check-email',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},

	[EApiEndpoint.ACCOUNT_PROFILE]: {
		path: '/api/account/profile',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_UPLOAD_COVER_IMAGE]: {
		path: '/api/account/upload-cover-image',
		method: 'POST',
		contentType: 'multipart',
		auth: true,
		filenames: ['file'],
	},
	[EApiEndpoint.ACCOUNT_UPLOAD_PROFILE_IMAGE]: {
		path: '/api/account/upload-profile-image',
		method: 'POST',
		contentType: 'multipart',
		auth: true,
		filenames: ['file'],
	},
	[EApiEndpoint.ACCOUNT_UPDATE_PROFILE]: {
		path: '/api/account/update-profile',
		method: 'PATCH',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_REQUEST_EMAIL_VERIFY]: {
		path: '/api/account/request-email-verify',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_VERIFY_EMAIL]: {
		path: '/api/account/verify-email',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_CHANGE_PASSWORD]: {
		path: '/api/account/change-password',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.ACCOUNT_DELETE]: {
		path: '/api/index',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},

	// URL API Endpoints
	[EApiEndpoint.URL_SHORT_URL_CREATE]: {
		path: '/api/url/short-url',
		method: 'POST',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_SHORT_URL]: {
		path: '/api/url/short-url',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_SHORT_URL_TOGGLE]: {
		path: '/api/url/short-url/{id}/toggle',
		method: 'PATCH',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_SHORT_URL_UPDATE]: {
		path: '/api/url/short-url',
		method: 'PATCH',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_SHORT_URL_DELETE]: {
		path: '/api/url/short-url/{id}',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_SHORT_URL_DAILY_CLICKS]: {
		path: '/api/url/short-url/{id}/daily-clicks',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_SHORT_URL_COUNTRY_CLICKS]: {
		path: '/api/url/short-url/{id}/country-clicks',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_LINKS]: {
		path: '/api/url/link',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_LINKS_CREATE]: {
		path: '/api/url/link',
		method: 'POST',
		contentType: 'multipart',
		auth: true,
		filenames: ['backgroundImage'],
		stringArrays: ['titleColors', 'backgroundColors'],
	},
	[EApiEndpoint.URL_LINK_BACKGROUND_IMAGE]: {
		path: '/api/url/link/{id}/background-image',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_LINK_DELETE]: {
		path: '/api/url/link/{id}',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.URL_LINK_CLICK]: {
		path: '/api/url/link/{id}/click',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},

	// QR Code API Endpoints
	[EApiEndpoint.QR_CODE_CREATE]: {
		path: '/api/qr-code',
		method: 'POST',
		contentType: 'multipart',
		auth: true,
		filenames: ['image'],
	},
	[EApiEndpoint.QR_CODE_GET]: {
		path: '/api/qr-code',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.QR_CODE_ANALYTICS]: {
		path: '/api/qr-code/{id}/analytics',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.QR_CODE_DELETE]: {
		path: '/api/qr-code/{id}',
		method: 'DELETE',
		contentType: 'json',
		auth: true,
	},

	// Profile API Endpoints
	[EApiEndpoint.PROFILE_GET]: {
		path: '/api/profile/{handle}',
		method: 'GET',
		contentType: 'json',
		auth: false,
	},
	[EApiEndpoint.PROFILE_DAILY_CLICKS]: {
		path: '/api/profile/daily-clicks',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.PROFILE_TOTAL_CLICKS]: {
		path: '/api/profile/total-clicks',
		method: 'GET',
		contentType: 'json',
		auth: true,
	},
	[EApiEndpoint.PROFILE_ACCESS]: {
		path: '/api/profile/{handle}/access',
		method: 'POST',
		contentType: 'json',
		auth: false,
	},
};

export type TApiEndpoint = {
	// Auth API Endpoints
	[EApiEndpoint.AUTH_LOGIN]: IAuthLoginResponse;
	[EApiEndpoint.AUTH_REGISTER]: IAuthLoginResponse;
	[EApiEndpoint.AUTH_REQUEST_PASSWORD_RESET]: undefined;
	[EApiEndpoint.AUTH_RESET_PASSWORD]: undefined;
	[EApiEndpoint.AUTH_LOGOUT]: undefined;

	// Account API Endpoints
	[EApiEndpoint.ACCOUNT_ME]: IAccountUser;
	[EApiEndpoint.ACCOUNT_CHECK_HANDLE]: undefined;
	[EApiEndpoint.ACCOUNT_CHECK_EMAIL]: undefined;
	[EApiEndpoint.ACCOUNT_PROFILE]: IAccountProfile;
	[EApiEndpoint.ACCOUNT_UPLOAD_COVER_IMAGE]: undefined;
	[EApiEndpoint.ACCOUNT_UPLOAD_PROFILE_IMAGE]: undefined;
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
	[EApiEndpoint.URL_SHORT_URL_DAILY_CLICKS]: IUrlShortUrlDailyClicks[];
	[EApiEndpoint.URL_SHORT_URL_COUNTRY_CLICKS]: IUrlShortUrlCountryClicks[];
	[EApiEndpoint.URL_LINKS]: ILink[];
	[EApiEndpoint.URL_LINKS_CREATE]: undefined;
	[EApiEndpoint.URL_LINK_BACKGROUND_IMAGE]: Buffer;
	[EApiEndpoint.URL_LINK_DELETE]: undefined;
	[EApiEndpoint.URL_LINK_CLICK]: string;

	// QR Code API Endpoints
	[EApiEndpoint.QR_CODE_CREATE]: undefined;
	[EApiEndpoint.QR_CODE_GET]: IQrCode[];
	[EApiEndpoint.QR_CODE_ANALYTICS]: IQrCodeAnalytics;
	[EApiEndpoint.QR_CODE_DELETE]: undefined;

	// Profile API Endpoints
	[EApiEndpoint.PROFILE_GET]: IProfile;
	[EApiEndpoint.PROFILE_DAILY_CLICKS]: IProfileDailyClicks;
	[EApiEndpoint.PROFILE_TOTAL_CLICKS]: IProfileTotalClicks;
	[EApiEndpoint.PROFILE_ACCESS]: undefined;
};
