export interface IApiError {
	code: string;
	message: string;
	errors?: Record<string, string>;
}
