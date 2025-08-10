export interface IApiEndpoint {
	path: string;
	method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE';
	contentType: 'json' | 'multipart';
	auth: boolean;
	filenames?: string[];
	stringArrays?: string[];
	objectArrays?: string[];
	objects?: string[];
	dates?: string[];
}
