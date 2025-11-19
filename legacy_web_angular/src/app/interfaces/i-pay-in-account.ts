import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {ICurrency} from "@clavisco/payment-modal";
import {ICurrencies} from "@app/interfaces/i-currencies";

export interface IInternalReconciliations {
  ReconDate: string;
  CardOrAccount: string;
  InternalReconciliationOpenTransRows: IInternalReconciliationRows[];
}

export interface IInternalReconciliationRows {
  CreditOrDebit: string;
  ReconcileAmount: number;
  ShortName: string;
  SrcObjAbs: number;
  SrcObjTyp: string;
  CashDiscount: number;
  Selected: string;
  TransRowId: number;
  TransId: number;
}

export interface IPayInAccount {
  DocEntry: number;
  DocNum: number;
  DocTotal: number;
  DocCurrency: string;
  ReconcileAmount: number;
  Selected: boolean;
  TransId: number;
  ObjType: string;
  DocumentType: string;
  DocDate: string;
  Saldo: number;
}

export interface IDataForReconciliationModal {
  Customer: IBusinessPartner;
  Currency: string;
  listInvoice: IPayInAccount[];
  Currencies: ICurrencies[];
  DecimalDocument: number;
  ExchangeRate: number;
}

export interface InternalReconciliationsResponse {
  ReconNum: number;
}
