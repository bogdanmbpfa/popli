export interface IApiError {
	statusCode: number;
	message: string;
	errors?: Record<string, string>;
}
