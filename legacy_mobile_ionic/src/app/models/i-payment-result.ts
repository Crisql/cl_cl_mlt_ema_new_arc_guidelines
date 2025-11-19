import {IDocumentInPayment} from "./db/Doc-model";

export interface IPaymentResult {
    DocEntry: number;
    DocNum: number;
    UserSign?: number;
    NumeroConsecutivo: string;
    Clave: string;
    PaymentInvoices: IDocumentInPayment[]
}
