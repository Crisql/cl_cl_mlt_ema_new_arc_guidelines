import { ISalesQuotationRows } from "./i-documents";

/**
 * This interface is used to preview document in base64
 */
export interface IPrintPreview {
    //Base64 document
    Base64: string;
    //File Name
    FileName: any;
    //The type
    BlobType: string;
    //File extension
    FileExtension: any;
  }


  /**
 * This interface is used for synchronizing the print format
 */
export interface IPrintFormatZPLOfflineToSync {
    //serialize json with print format
    FormatZPLOffline: string;
  }


/**
 * Represents the offline ZPL print format structure.
 */
export interface IPrintFormatZPLOffline {
  /**
   * The header section of the print format, used for general documents.
   */
  Header: string;

  /**
   * The header section specific to invoice documents.
   */
  HeaderInvoice: string;

  /**
   * The body section of the print format containing line item structure.
   */
  Body: string;

  /**
   * The footer section of the print format, used for general documents.
   */
  Footer: string;

  /**
   * The footer section specific to invoice documents.
   */
  FooterInvoice: string;

  /**
   * A list of invoice document identifiers or data used for offline printing.
   */
  DocumentsInvoice: [number];
}


/**
 * Represents the data structure used to generate offline ZPL print formats.
 */
export interface IOfflineZPLData {
  /**
   * Unique code identifying the customer or business partner.
   */
  CardCode: string;

  /**
   * Full name of the customer or business partner.
   */
  CardName: string;

  /**
   * Unique electronic invoice key (Clave).
   */
  Clave: string;

  /**
   * Address of the company issuing the invoice.
   */
  CompanyDirection: string;

  /**
   * Tax identification number of the company.
   */
  CompanyId: string;

  /**
   * Name of the company issuing the invoice.
   */
  CompanyName: string;

  /**
   * Phone number of the issuing company.
   */
  CompanyPhone: string;

  /**
   * Discount applied to the total document amount.
   */
  Discount: number;

  /**
   * Currency code used for the document (e.g., "USD", "CRC").
   */
  DocCurrency: string;

  /**
   * Date the document was issued (ISO format recommended).
   */
  DocDate: string;

  /**
   * Document number (e.g., invoice or order number).
   */
  DocNum: number;

  /**
   * Total amount of the document, including tax and discounts.
   */
  DocTotal: number;

  /**
   * JSON or string representation of the document's line items.
   */
  DocumentLines: ILinesToPrint[];

  /**
   * Integer code representing the type of document (e.g., invoice, credit note).
   */
  DocumentType: number;

  /**
   * Email address of the customer.
   */
  EmailAddress: string;

  /**
   * Tax ID of the customer (Cedula or equivalent).
   */
  FederalTaxId: string;

  /**
   * Number used for electronic billing (Factura Electrónica).
   */
  NumFe: string;

  /**
   * Total amount paid for the document.
   */
  PayTotal: number;

  /**
   * Customer’s phone number.
   */
  Phone: string;

  /**
   * Name of the salesperson or user who created the document.
   */
  Salesperson: string;

  /**
   * Subtotal amount before discounts and taxes.
   */
  SubTotal: number;

  /**
   * Total tax amount applied to the document.
   */
  Tax: number;

  /**
   * Currency Symbol of the document
   */
  CurrencySymbol: string;

  /**
   * Name of the document type
   */
  DocumentLabel: string;

  /**
   * User name to create the document
   */
  UserName: string
}

/**
 * represents the properties of the lines of the document to be printed offline
 */
export interface ILinesToPrint {
  /** The currency code used for the line item, e.g., 'USD', 'EUR' */
  Currency: string;

  /** The name or description of the item or product */
  ItemName: string;

  /** The quantity of the item being invoiced */
  Quantity: number;

  /** The unit price of the item */
  UnitPrice: number;

  /** The discount percentage applied to the item (e.g., 15.00 for 15%) */
  DiscountPercent: number;

  /** The tax rate percentage applied to the item (e.g., 13.00 for 13%) */
  TaxRate: number;

  /** The total amount for the line item after discount and tax */
  LineTotal: number;

  /** Symbol of the currency*/
  CurrencySymbol: string
}
