export interface IQrCodeAnalytics {
  totalScans: number;
  totalCountries: number;
  averageScansPerCountry: number;
  countryDistribution: {
    country: string;
    countryCode: string;
    totalScans: number;
  }[];
}
