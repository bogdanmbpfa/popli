export interface IUrlIpApiResponse {
  ipVersion: number;
  ipAddress: string;
  latitude: number;
  longitude: number;
  countryName: string;
  countryCode: string;
  capital: string;
  phoneCodes: number[];
  timeZones: string[];
  zipCode: string;
  cityName: string;
  regionName: string;
  continent: string;
  continentCode: string;
  currencies: string[];
  languages: string[];
  asn: string;
  asnOrganization: string;
  isProxy: boolean;
}
