import {IDocument} from "@app/interfaces/i-sale-document";
import {ICurrencies} from "@app/interfaces/i-currencies";

export interface IDownPaymentClosed {
  DocEntry: number;
  DocNum: number;
  CardCode: string;
  CardName: string;
  DocCurrency: string;
  DocTotal: number;
  Saldo: number;
  Pago:number;
  DocDate: string;
  DocDueDate: string;
  Assigned:boolean;
  TransId: number;
  ObjType : string;
  VatSum: number;
}

export interface IDocumentForDownPayment {
  Document: IDocument;
  DocTotal: number;
  Decimal: number;
  Subtotal: number;
  Impuesto: number;
  Rate: number;
  Currencies: ICurrencies[];
}

