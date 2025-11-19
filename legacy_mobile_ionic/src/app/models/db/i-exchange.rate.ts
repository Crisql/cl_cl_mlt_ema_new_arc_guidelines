export interface IExchangeRate {
    // That was another adapter only to ema mobile
    Rate: number;
    value: number;
    date: Date;
}

export interface UpcomingExchangeRate {
    Rate: number;
    RateDate: Date;
}