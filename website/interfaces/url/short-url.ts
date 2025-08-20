export interface IUrlShortUrl {
	id: string;
	originalUrl: string;
	shortCodeUrl: string;
	alias: string | null;
	aliasUrl: string | null;
	isActive: boolean;
	title: string;
	createdAt: string;
	updatedAt: string;
	todayClicks: number;
	dailyUniqueVisitors: {
		date: string;
		visitors: number;
	}[];
	todayUniqueVisitors: number;
	totalClicks: number;
	totalUniqueVisitors: number;
}
