export interface IPaydeskBalance {
  UserId: string;
  UserSignature: string;
  CashAmount: number;
  CardAmount: number;
  TransferAmount: number;
  CashflowIncomme: number;
  CashflowEgress: number;
  CardAmountPinpad: number;
  Terminal: string;
  ExchangeRate: number;
  UrlReport: string;
  Email: string;
  License: string;
  Currency: string;
  CreatedBy: string;
  CreatedDate: Date;

  /**
   * Represents or sets the unique identifier of the seller
   * */
  SlpCode: number;
}

export interface ISendClashClosingReport {
  To: string;
  Subject: string;
  Body: string;
  UrlReport: string;
}

export interface ITotalTransaction {
  Total: number;
}
