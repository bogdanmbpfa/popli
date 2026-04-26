export interface IProfileDailyClick {
  date: string;
  clicks: number;
}

export interface IProfileDailyClicks {
  dailyClicks: IProfileDailyClick[];
  changePercentage: number;
}
