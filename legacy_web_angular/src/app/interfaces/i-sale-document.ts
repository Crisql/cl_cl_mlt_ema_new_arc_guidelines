import { IAdditionalExpense } from "./i-additional-expense";
import {IDocumentLine} from "./i-items";
import {IUdf} from "./i-udf";

/**
 * Represent document to create, update
 */
export interface IDocument {
  /**
   * Represent code of business partner
   */
  CardCode: string;
  /**
   * Represent name of business partner
   */
  CardName: string;
  /**
   * Represent comments in the document
   */
  Comments: string;
  /**
   * Represent currency in the document
   */
  DocCurrency: string;
  /**
   * Represents the date of the document
   */
  DocDate: string;
  /**
   * Represents the date of the document
   */
  TaxDate: string;
  /**
   * Represent expiration date of the document
   */
  DocDueDate: string;
  /**
   * Represent the customer's reference number for the invoice
   */
  NumAtCard: string;
  /**
   * Represent code of payment terms of document
   */
  PaymentGroupCode: number;
  /**
   * Represents the sales employee of the document.
   */
  SalesPersonCode: number;
  /**
   * Represents series with which the document is created
   */
  Series: number;
  /**
   * Represents rate with which the document is created
   */
  DocRate: number;
  /**
   * Represents lines of the document
   */
  DocumentLines: IDocumentLine[];
  /**
   * Represent the unique number assigned to each invoice
   */
  DocNum: number;
  /**
   * Represent the unique number assigned to each invoice
   */
  DocEntry: number;
  /**
   * Represent price list of the document
   */
  PriceList: number;
  /**
   * Represents the number of invoices that are allowed to be displayed in multi-invoice functionality
   */
  Quantity: number;
  /**
   * Represent type of document
   */
  TipoDocE: string;
  /**
   * Represent type of identification used in documents with FE data
   */
  IdType: string;
  /**
   * Represent number of identification used in documents with FE data
   */
  Identification: string;
  /**
   * Represent email of the business partner used in documents with FE data
   */
  Email: string;
  /**
   * Represents user-defined fields to save in the document
   */
  Udfs: IUdf[];
  /**
   * Represents document number after creation
   */
  InvoiceNumber: string;
  /**
   * Represents document number FE after creation
   */
  NumFE: string;
  /**
   * Represents document number ClaveFE after creation
   */
  ClaveFE: string;
  /**
   * Represent total of document
   */
  DocTotal?: number;
  /**
   * Represents the reference when creating credit note
   */
  DocumentReferences: IDocumentReferences[] | null;
  /**
   * Represent type de payment to Downpayment
   */
  DownPaymentType: string;
  /**
   * Represent applied percentage of document Downpayment
   */
  DownPaymentPercentage: number;
  /**
   * Represent model to create document with Downpayment
   */
  DownPaymentsToDraw: IDownPaymentsToDraw[];
  /**
   * Represent status del document
   */
  DocStatus: string;
  /**
   * Represent type of invoice
   */
  ReserveInvoice: string;
  /**
   * Represents whether document requires authorization
   */
  ConfirmationEntry: number;
  /**
   * Represents if the document is made with Down payment
   */
  IsDownPayment: boolean;
  /**
   * Represents document accumulates points
   */
  IdTranAcumular?:string;
  /**
   * Represents document redeems points
   */
  IdTranRedimir?:string;
  /**
   * Represent type of document
   */
  ObjType?: string;

  /**
   * Unique identifier of the attachment
   */
  AttachmentEntry: number | null | undefined;

  /**
   * Status of approval
   */
  Approval_Status: string| null;

  /**
   * Represents or establishes tax withholding codes, but is not mandatory
   */
  WithholdingTaxDataCollection: WithholdingTaxCode[] | null;

  /**
   * Represents or establishes list of additional expenses
   */
  DocumentAdditionalExpenses: IAdditionalExpense[] | null;

  /**
   * Represents the code of the ship to address
   */
  ShipToCode?: string;
}

/**
 * Model to map invoice to credit note
 */
export interface IDocumentReferences {
  /**
   * Represent the unique number assigned to create cretit note
   */
  RefDocEntr: number;
  /**
   * Represent number of referencie of invoice
   */
  RefDocNum: number;
  /**
   * Represent type of document base
   */
  RefObjType: string;
  /**
   * Represent comments in the document
   */
  Remark: string;
}

/**
 * Model to map list of advances to applied to invoice
 */
export interface IDownPaymentsToDraw {
  /**
   * Represents amount in colones to be applied to the invoice
   */
  AmountToDraw: number;
  /**
   * Represents amount in dollars to be applied to the invoice
   */
  AmountToDrawFC: number;
  /**
   * Represent the number to downpayment
   */
  DocEntry: number;
  /**
   * Represents type of document to which advance payment will be applied
   */
  DownPaymentType: string;
  /**
   * Represent currency in the document downpayment
   */
  DocCurrency: string;

  /**
   * Represents the balance with taxes extracted from the invoice line.
   * */
  GrossAmountToDraw: number;

  /**
   * Represents the balance with taxes extracted from the invoice line in foreign currency.
   * */
  GrossAmountToDrawFC: number;
}

/**
 * Represent model to DownPayment
 */
export interface IDownPayment {

  /**
   * Represent partial payment
   */
  IsPaymentPartial: boolean;

  /**
   *Represent list DownPayment
   */
  DownPaymentsToDraw: IDownPaymentsToDraw[];

  /**
   * Represent total downs payments
   */
  DownPaymentTotal: number;

  /**
   * Currency downpayment
   */
  Currency: string;
}

/**
 * Represents a tax withholding code.
 */
export interface WithholdingTaxCode {
  /**
   * Unique code identifying the tax withholding.
   */
  WTCode: string;

  /**
   * Represents user-defined fields to save in the document
   */
  Udfs: IUdf[];
}
