import type { EClickType } from '~~/enums';

export interface IProfileCountryClicks {
  country: string;
  countryCode: string;
  clicks: number;
}

export interface IProfileTypeClicks {
  type: EClickType;
  clicks: number;
}

export interface IProfileTotalClicks {
  totalClicks: number;
  countryClicks: IProfileCountryClicks[];
  typeClicks: IProfileTypeClicks[];
}
