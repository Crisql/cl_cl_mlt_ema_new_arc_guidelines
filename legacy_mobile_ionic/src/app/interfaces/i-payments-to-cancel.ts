/**
 * This interface is used to mapping the model to cancel payment
 */
export interface IPaymentToCancel {
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
