import {IBatchNumbers, IDocumentLinesBinAllocations, ISerialNumbers} from "./i-batches";
import { IDocumentLine } from "./i-item";
import { IUdf } from "./i-udfs";
import {IDocumentReference} from "./i-documentReference";

/**
 * Interface to manage the invoice header data model
 */
export interface IARInvoice {
    //internal number
    DocEntry: number;
    //document number
    DocNum: number;
    //partner code
    CardCode: string;
    //partner name
    CardName: string;
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
    //Comments
    Comments: string;
    //References document
    DocumentReferences?: IDocumentReference[];
    //Seller code
    SalesPersonCode: number;
    //Type Document
    DocumentType: number;
    //Total document amount
    DocTotal: number;
    //Payment method
    PaymentGroupCode: number;
    //Document creation series
    Series: number;
    //Document Currency
    DocCurrency: string;
    //Exchange rate
    DocRate: number;
    //Document Lines
    DocumentLines: IARInvoiceRows[];
    //Indicates whether it is a debtor invoice or reserve
    ReserveInvoice?: string;
    //Dinamics Fields
    Udfs: any[];
    //Document Approval request
    ConfirmationEntry: number;
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
     * Represents if the document is made with Down payment
     */
    IsDownPayment: boolean;

    /**
     * Bill number
     */
    InvoiceNumber: string;
}

/**
 * Interface to manage the data model of the invoice lines
 */
export interface IARInvoiceRows {
    //Line number
    LineNum: number;
    //Total amount of the line
    LineTotal: number;
    /**
     * Status of lines
     */
    LineStatus: string;
    //Item code
    ItemCode: string;
    //Description of the article
    ItemDescription: string;
    //Item price
    UnitPrice: number;
    //Quantity of item in the line
    Quantity: number;
    //tax code
    TaxCode: string;
    //Tax percentage
    TaxRate: number;
     //Tax only
     TaxOnly: string
    //Base document number
    BaseType: number;
    //Internal number of the base document
    BaseEntry?: number | null;
    //Base document line number
    BaseLine?: number | null;
    //Warehouse code
    WarehouseCode: string;
    //Discount rate
    DiscountPercent: number;
    //Id unit of measure
    UoMEntry:number;
    //Cost center
    CostingCode: string;
    //Lot quantity lines
    BatchNumbers: IBatchNumbers[];
    //Lines of the number of series
    SerialNumbers: ISerialNumbers[];
    //BOM Type
    TreeType?: string;
    //Warehouse locations
    DocumentLinesBinAllocations: IDocumentLinesBinAllocations[];
    //Dinamyc Udfs
    Udfs: any[];
}

/**
 * Interface to manage the data model of the order
 */
export interface ISalesOrder {
    //internal number
    DocEntry: number;
    //document number
    DocNum: number;
    //partner code
    CardCode: string;
    //partner name
    CardName: string;
    //References document
    DocumentReferences?: IDocumentReference[];
    //document date
    DocDate: string;
    //document end date
    DocDueDate: string;
    /** Represents the date of the document */
    TaxDate: string;
    //Comments
    Comments: string;
    //Total document amount
    DocTotal: number;
    //Seller code
    SalesPersonCode: number;
    //Payment method
    PaymentGroupCode: number;
    //Document creation series
    Series: number;
    //Document Currency
    DocCurrency: string;
    //Document lines
    DocumentLines: ISalesOrderRows[];
    //dynamic fields
    Udfs: any[]
}

/**
 * Interface to manage the data model of the order lines
 */
export interface ISalesOrderRows {
    //Line number
    LineNum: number;
    //Total amount of the line
    LineTotal: number;
    /**
     * Status of lines
     */
    LineStatus: string;
    //Item code
    ItemCode: string;
    //Description of the article
    ItemDescription: string;
    //Item price
    UnitPrice: number;
    //Quantity of item in the line
    Quantity: number;
    //tax code
    TaxCode: string;
    //Tax percentage
    TaxRate: number;
    //Base document number
    BaseType: number;
    //Internal number of the base document
    BaseEntry?: number | null;
    //Base document line number
    BaseLine?: number | null;
    //Warehouse code
    WarehouseCode: string;
    //Discount rate
    DiscountPercent: number;
    //Cost center
    CostingCode: string;
    //Lot quantity lines
    BatchNumbers: IBatchNumbers[];
    //Lines of the number of series
    SerialNumbers: ISerialNumbers[];
    //BOM Type
    TreeType?: string;
    //Warehouse locations
    DocumentLinesBinAllocations: IDocumentLinesBinAllocations[];
    //Dinamyc Udfs
    Udfs: any[];
    /**
     * Bonus item
     */
    TaxOnly: string;
    /**
     * this field stores the unique identifier of the item's sales unit of measure.
     */
    UoMEntry: number | null;
}

/**
 * Interface to manage the data model of the quotations
 */
export interface ISalesQuotation {
    //internal number
    DocEntry: number;
    //document number
    DocNum: number;
    //pather code
    CardCode: string;
    //pather name
    CardName: string;
    //doc date
    DocDate: string;
    /** 
     * Represents the date of the document
     */
    TaxDate: string;
    /**
     * Represent expiration date of the document
     */
    DocDueDate: string;
    //References document
    DocumentReferences?: IDocumentReference[];
    //Comments
    Comments: string;
    //Seller Code
    SalesPersonCode: number;
    //Payment Method
    PaymentGroupCode: number;
    //Total document
    DocTotal: number;
    //Document creation series
    Series: number;
    //Documnet currency
    DocCurrency: string;
    //Document Lines
    DocumentLines: ISalesQuotationRows[];
    //Dinamycs fields
    Udfs: any[];
    //Confirmation Entry
    ConfirmationEntry?;
}

/**
 * Interface to manage the data model of the quotations lines
 */
export interface ISalesQuotationRows {
    //Line number
    LineNum: number;
    //Total amount of the line
    LineTotal: number;
    /**
     * Status of lines
     */
    LineStatus: string;
    //Item code
    ItemCode: string;
    //Description of the article
    ItemDescription: string;
    //Item price
    UnitPrice: number;
    //Quantity of item in the line
    Quantity: number;
    //tax code
    TaxCode: string;
    //Tax percentage
    TaxRate: number;
    //Base document number
    BaseType: number;
    //Internal number of the base document
    BaseEntry?: number | null;
    //Base document line number
    BaseLine?: number | null;
    //Warehouse code
    WarehouseCode: string;
    //Discount rate
    DiscountPercent: number;
    //Cost center
    CostingCode: string;
    //Dinamyc Udfs
    Udfs: any[];
    /**
     * Bonus item
     */
    TaxOnly: string;
    /**
     * this field stores the unique identifier of the item's sales unit of measure.
     */
    UoMEntry: number | null;
}

/**
 * Interface to manage the data model of the delivery
 */
export interface IDeliveryNotes {
    //Internal number
    DocEntry: number;
    //Document number
    DocNum: number;
    //Pather code
    CardCode: string;
    //Pather name
    CardName: string;
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
    //Comments
    Comments: string;
    //Seller Code
    SalesPersonCode: number;
    //Payment Method
    PaymentGroupCode: number;
    //Total document amount
    DocTotal: number;
    //Document creation series
    Series: number;
    //Document currency
    DocCurrency: string;
    //Document lines
    DocumentLines: IDeliveryNotesRows[];
    //Dinamycs fields
    Udfs: any[];
    //Entry of the approval request
    ConfirmationEntry: number
}

/**
 * Interface to manage the data model of the delivery lines
 */
export interface IDeliveryNotesRows {
    //Line number
    LineNum: number;
    //Total amount of the line
    LineTotal: number;
    /**
     * Status of lines
     */
    LineStatus: string;
    //Item code
    ItemCode: string;
    //Description of the article
    ItemDescription: string;
    //Item price
    UnitPrice: number;
    //Quantity of item in the line
    Quantity: number;
    //tax code
    TaxCode: string;
    //Tax percentage
    TaxRate: number;
    //Base document number
    BaseType: number;
    //Internal number of the base document
    BaseEntry?: number | null;
    //Base document line number
    BaseLine?: number | null;
    //Warehouse code
    WarehouseCode: string;
    //Discount rate
    DiscountPercent: number;
    //Cost center
    CostingCode: string;
    //Dinamyc Udfs
    Udfs: any[];
    /**
     * Bonus item
     */
    TaxOnly: string;
    /**
     * this field stores the unique identifier of the item's sales unit of measure.
     */
    UoMEntry: number | null;
}

export interface ICreditNotes {
    //Internal number
    DocEntry: number;
    //Document number
    DocNum: number;
    //Pather code
    CardCode: string;
    //Pather name
    CardName: string;
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
    //Comments
    Comments: string;
    //Seller Code
    SalesPersonCode: number;
    //Payment Method
    PaymentGroupCode: number;
    //Total document amount
    DocTotal: number;
    //Document creation series
    Series: number;
    //Document currency
    DocCurrency: string;
    //Document lines
    DocumentLines: ICreditNotesRows[];
    //Dinamycs fields
    Udfs: any[];
    //Entry of the approval request
    ConfirmationEntry: number
}

export interface ICreditNotesRows {
    //Line number
    LineNum: number;
    //Total amount of the line
    LineTotal: number;
    /**
     * Status of lines
     */
    LineStatus: string;
    //Item code
    ItemCode: string;
    //Description of the article
    ItemDescription: string;
    //Item price
    UnitPrice: number;
    //Quantity of item in the line
    Quantity: number;
    //tax code
    TaxCode: string;
    //Tax percentage
    TaxRate: number;
    //Base document number
    BaseType: number;
    //Internal number of the base document
    BaseEntry?: number | null;
    //Base document line number
    BaseLine?: number | null;
    //Warehouse code
    WarehouseCode: string;
    //Discount rate
    DiscountPercent: number;
    //Cost center
    CostingCode: string;
    //Dinamyc Udfs
    Udfs: any[];
    /**
     * Bonus item
     */
    TaxOnly: string;
    /**
     * this field stores the unique identifier of the item's sales unit of measure.
     */
    UoMEntry: number | null;
}


/**
 * Interface for sales documents
 */
export interface IDocument {
    //Internal document
    DocEntry: number
    //Document number
    DocNum: number
    //Pather code
    CardCode: string
    //Pather name
    CardName: string
    //Comments
    Comments: string
    //Seller Code
    SalesPersonCode: number
    //Payment method
    PaymentGroupCode: number
    //Price List
    PriceList: number
    //Total document
    DocTotal: number
    //Creation document series
    Series: number
    //Document currency
    DocCurrency: string
    //Document Lines
    DocumentLines: IDocumentLine[]
    //Dianmycs fields
    Udfs: any
    //Document status
    DocStatus: any
    //Document type FE
    TipoDocE: string
    //Identification number
    IdType: string
    //Identificacion
    Identification: string
    //Email
    Email: string
    //Entry of the approval request
    ConfirmationEntry: number
    DocObjectCode: any;
    //Number reference
    NumAtCard: string;
    //Document key
    DocumentKey: string;
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
     * Represent applied percentage of document Downpayment
     */
    DownPaymentPercentage: number;
    /**
     * Unique identifier of the attachment
     */
    AttachmentEntry: number | null | undefined;
}


/**
 * This interface is used for paymant document
 */
export interface IIncomingPayment {
    //Number document internal
    DocEntry: number;
    //Number document
    DocNum: number;
    //Pather code
    CardCode: string;
    //Pather name
    CardName: string;
    //Type document
    DocType: string;
    //Series of document
    Series: number;
    //Commments
    Remarks: string;
    //Document date
    DocDate: string;
    //Document currency
    DocCurrency: string;
    //Exchange Rate
    DocRate: number;
    //Cash Account
    CashAccount: string;
    //Cash sum
    CashSum: number;
    //Transfer account
    TransferAccount: string;
    //Transfer sum
    TransferSum: number;
    //Transfer date
    TransferDate: string;
    //Transfer reference
    TransferReference: string;
    //Document invoices
    PaymentInvoices: IPaymentInvoices[];
    //Credit cards
    PaymentCreditCards: IPaymentCreditCards[];
    //Dinamic udfs
    Udfs: IUdf[];
  }
  
  export interface IPaymentInvoices {
     //Number document internal
    DocEntry: number;
    //Amount of currency local
    SumApplied: number;
    //Amount of currency extranjera
    AppliedFC: number;
  }
  
  export interface IPaymentCreditCards {
    //Id card
    CreditCard: number;
    //Account
    CreditAcct: string;
    //Number card
    CreditCardNumber: string;
    //Date valid card
    CardValidUntil: string;
    //Number Voucher
    VoucherNum: string;
    //Amount card
    CreditSum: number;
    //Amount received
    U_ManualEntry: string;
  }


export interface IUniqueId {
    uniqueId: string;
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
 * Interface to manage the data model of the down invoice with payment
 */
export interface IDownInvoiceWithPayment{
    /**
     *  down invoice data
     */
    ARInvoice: IARInvoice;

    /**
     * payment
     */
    IncomingPayment?: IIncomingPayment;

}