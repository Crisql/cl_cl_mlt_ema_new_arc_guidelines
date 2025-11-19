export interface IPaymentForCancel {
  Assigned:boolean;
  DocNumOinv: number;
  DocEntryOinv: number;
  DocStatus: string;
  DocEntryPay: number;
  DocNumPay: number;
  DocCurrency: string;
  DocTotal: number;
  DocTotalFC: number;
  DocDate: string;
  DocumentKey: string;
}
