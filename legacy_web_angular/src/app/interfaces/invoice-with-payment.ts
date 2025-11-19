import {IDocument} from "@app/interfaces/i-sale-document";
import {IIncomingPayment} from "@app/interfaces/i-incoming-payment";

/**
 * Model to create sale invoice with payment
 */
export interface InvoiceWithPayment {
  /**
   * Model represent invoice
   */
  ARInvoice: IDocument;

  /**
   * Model represent payment
   */
  IncomingPayment: IIncomingPayment;
}

/**
 * Model to create purchase invoice with payment
 */
export interface IApInvoiceWithPayment {
  /**
   * Model represent invoice
   */
  APInvoice: IDocument;

  /**
   * Model represent payment
   */
  OutgoingPayment: IIncomingPayment;
}
