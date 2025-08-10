import type { IApiError } from './api-error';

export interface IApiFailure {
	data?: undefined;
	error: IApiError;
}
