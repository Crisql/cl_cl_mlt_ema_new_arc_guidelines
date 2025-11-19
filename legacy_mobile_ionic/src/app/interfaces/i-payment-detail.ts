export interface IIncomingPaymentDetail {
    DocNumOinv:number,
    DocNumPay:number,
    CashSum: number;
    CashSumFC: number;
    TrsfrSum: number;
    TrsfrSumFC: number;
    CreditCards: ICreditVouchersDetail[];
}
export interface ICreditVouchersDetail {
    Id: number;
    CreditCard: number;
    VoucherNum: string;
    CreditSum: number;
    CardValid:Date;
    CollectionDate: Date;
    Account: string;
    IsManualEntry:boolean;
}