import {PinPad} from "@clavisco/core";
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import {IUdf} from "@app/interfaces/i-udf";

/**
 * This interface represents the payment model for an invoice
 */
export interface IIncomingPayment {
  /**
   * Document internal number
   */
  DocEntry: number;
  /**
   * Document number
   */
  DocNum: number;
  /**
   * Business parthner code
   */
  CardCode: string;
  /**
   * Busines parthner name
   */
  CardName: string;
  /**
   * Document type
   */
  DocType: string;
  /**
   * numbering series
   */
  Series: number;
  /**
   * Dpcuments comments
   */
  Remarks: string;
  /**
   * Document posting date
   */
  DocDate: string;
  /**
   * Document date
   */
  TaxDate: string;
  /**
   * Document currency
   */
  DocCurrency: string;
  /**
   * Exchange rate
   */
  DocRate: number;
  /**
   * cash financial account
   */
  CashAccount: string;
  /**
   * Cash amount
   */
  CashSum: number;
  /**
   * Transfer financial account
   */
  TransferAccount: string;
  /**
   * Transfer amount
   */
  TransferSum: number;
  /**
   * Transfer date
   */
  TransferDate: string;
  /**
   * Transfer reference number
   */
  TransferReference: string;
  /**
   * Invoice list
   */
  PaymentInvoices: IPaymentInvoices[];
  /**
   * Payment card list
   */
  PaymentCreditCards: IPaymentCreditCards[];
  /**
   * Bank transactions
   */
  PPTransactions: IVoidedTransaction[];
  /**
   * Dianmyc fields
   */
  Udfs: IUdf[];
}

export interface IPaymentInvoices {
  DocEntry: number;
  SumApplied: number;
  AppliedFC: number;
}

export interface IPaymentCreditCards {
  CreditCard: number;
  CreditAcct: string;
  CreditCardNumber: string;
  CardValidUntil: string;
  VoucherNum: string;
  CreditSum: number;
  U_ManualEntry: string;
}
