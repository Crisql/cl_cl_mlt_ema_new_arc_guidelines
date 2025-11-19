import {ReferencedObjectTypeEnum} from "src/app/common/enum";
import {ITransactionType} from "../i-transaction";
import {BusinessPartnerMinified, BusinessPartnersModel} from "./business-partners-model";
import {CreditCardMobile} from "./credit-card.model";
import {LineMinified} from "./item";
import {UDFModel2} from "./udf-select-option";
import {IARInvoice, IIncomingPayment, ISalesOrder, ISalesQuotation} from "src/app/interfaces/i-documents";
import {IUdf} from "../../interfaces/i-udfs";
import {ISearchDocToPayment} from "../../interfaces/i-searcDocToPayment";
import { IDocumentLine } from "src/app/interfaces/i-item";
import {IBusinessPartners} from "../../interfaces/i-business-partners";
import {IDocumentReference} from "../../interfaces/i-documentReference";
import { IAttachments2Line } from "src/app/interfaces/i-document-attachment";

export interface DocumentSearchMobileModel {
    SlpCode?: string;
    UsrMapId: number;
    DocType: number;
    CardCode: string;
    StartDate: string;
    EndDate: string;
    DocStatus: string;
    DocCur: string;
    DocNum: number;
    Status?: string;
    Delivery?: string;
}

// modelo que devuelve la info del doc consultado
export interface DocumentFilterMobileModel {
    //numero interno del documento
    DocEntry: number;
    //nombre del cliente
    CardName: string;
    //fecha contabilizacion documento
    DocDate: Date;
    //numero de documento
    DocNum: number;
    //moneda del documento
    DocCurrency: string;
    //Symbol
    Symbol?: string;
    //monto del documento
    Total: number;
    TotalUSD: number;
    //nombre del vendedor
    SlpName: string;
    // estado del documento
    DocStatus: string;
    // comentarios del documento
    Comments: string;
    NumAtCard: string;
    Balance: number;
    Saldo: number;
    SaldoUSD: number;
    DocumentKey: string;
    PriceList: number;
    IsCashInvoice: boolean;
    DocumentLines?: DocumentLineFilterMobileModel[];
}

export interface DocumentSelectedToCreatePay extends DocumentFilterMobileModel {
    // Reconocer si el documento fue selecionado para realizarle el pago
    isSelected: boolean;
    amountToPay: number;
}

/**
 * This interface is represent document selected to pay
 */
export interface ToPay {
    docList: ISearchDocToPayment[];
    total: number;
}

export interface InvoicesPaymentModel {
    docsList: DocumentSelectedToCreatePay[];
    payment: MobilePayment;
    comments: string;
}

// modelo que devuelve las lineas  del doc consultado
export interface DocumentLineFilterMobileModel {
    ItemCode: string;
    Dscription: string;
    Quantity: number;
    Price: number;
    DiscPrcnt: number;
    LineTotal: number;
    LineNum?: number;
    LineStatus?: number;
    BaseType?: number;
    BaseEntry?: number;
    BaseLine?: number;
    PriceDiscount: number;
    TaxCode: string;
    TaxRate: number;
    TotalDiscount: number;
    TotalTax: number;
    U_MaxDiscITM: number;
    WarehouseCode: string;
    havePromotion?: boolean;
    SuoMEntry: number;
    Family: string;
    IsAServerLine: boolean;
    TaxOnly: string;
    BinCode: string;
    SerialNumber: string;
    SysNumber?: number
}

export interface IDocumentBaseModel extends ITransactionType {
    CardCode: string;
    CardName: string;
    Comments: string;
    DocCurrency: string;
    DocDate: Date;
    DocDueDate: Date;
    DocEntry: number;
    NumAtCard: string;
    PaymentGroupCode: number;
    SalesPersonCode: string;
    Series: number;
    // DocRate: number // Definido en EMA
    DocumentLines: DocumentLinesBaseModel[];
    DocNum: number;
    // DocEntry: number; // Definido en EMA
    // PriceList: number; // Definido en EMA
    // Quantity: number; // Definido en EMA - Numero de fatura para multifactura
    // TipoDocE: string; // Definido en EMA
    Udfs: UDFModel2[];
    // InvoiceNumber: string; // Definido en EMA
    BaseEntry: number;
    DocumentType: number;
    HandWritten: string;
    DocumentReferences?: IDocumentReference[];
    DiscountPercent: number;
    HasHeaderDiscount: boolean;
    ReserveInvoice: string;
    DocTotal: number;
    DocTotalFC: number
}

export interface DocumentLinesBaseModel {
    // Id: number; // Definido en EMA
    // InventoryItem: string; // Definido en EMA
    // PurchaseItem: string; // Definido en EMA
    // SalesItem: string; // Definido en EMA
    // DocEntry: string; // Definido en EMA
    WarehouseCode: string;
    Quantity: number;
    DiscountPercent: number;
    // CostingCode: string; // Definido en EMA
    // Total: number; // Definido en EMA
    // ItemDescription: string; // Definido en EMA
    // Warehouse: string; // Definido en EMA
    TaxCode: string;
    TaxOnly: string;
    // UnitPriceFC: number;
    // UnitPriceCOL: number;
    // UnitPriceDOL: number;
    // OnHand: number; // Definido en EMA
    // TotalImp: number; // Definido en EMA
    // TotalDesc: number; // Definido en EMA
    // TotalImpFC: number; // Definido en EMA
    // TotalDescFC: number; // Definido en EMA
    // TotalImpCOL: number; // Definido en EMA
    // TotalDescCOL: number; // Definido en EMA
    // TotalFC: number; // Definido en EMA
    // TotalCOL: number; // Definido en EMA
    LineNum?: number;
    BaseLine?: number;
    BaseEntry?: number;
    BaseType: number;
    // LastPurchasePrice: number; // Definido en EMA
    // LastPurchasePriceFC: number; // Definido en EMA
    // UoMMasterData: IUoMMasterData[]; // Definido en EMA
    UoMEntry: number;
    DocumentLinesBinAllocations: IBinAllocation[];
    SerialNumbers: ISerialNumber[];
    BatchNumbers: any[];
    // ManBtchNum: string; // Definido en EMA
    // ManSerNum: string; // Definido en EMA
    // DistNumber: string; // Definido en EMA
    // BinCode: string; // Definido en EMA
    // FromWarehouseCode: string; // Definido en EMA
    // FromWhsName: string; // Definido en EMA
    // BinLocationOrigin?: IBinLocation[]; // Definido en EMA
    // BinLocationDestino?: IBinLocation[]; // Definido en EMA
    // SysNumber: number; // Definido en EMA
    // TaxOnlyCheckbox: boolean; // Definido en EMA
    // IdUomEntry: number; // Definido en EMA
    // U_DescriptionItemXml: string; // Definido en EMA
    // Udfs: IUdf[]; // Definido en EMA
    // IsFocused?: boolean; // Definido en EMA
    // AccountCode: string; // Definido en EMA
    ItemCode: string;
    UnitPrice: number;
    U_sugPrice: number; // Campo se debe eliminar cuando se agreguen los UDFs dinamicos en las lineas
    LineStatus: string;
}

export interface MobSalesOrd extends IDocumentBaseModel {
}

/**
 * This interface is used for mapping model of document with payment
 */
export interface MobInvoiceWithPayment extends ITransactionType {

    ARInvoice: IARInvoice;

    IncomingPayment: IIncomingPayment;

}

export interface MobilePayment extends ITransactionType {
    DocEntry: number;
    DocNum: number;
    CardCode: string;
    CardName: string;
    // DocType: string; // Definido en EMA
    Series: number;
    Remarks: string;
    DocDate?: Date;
    DocCurrency: string;
    DocRate: number;
    CashAccount: string;
    CashSum: number;
    TransferAccount: string;
    TransferSum: number;
    // TransferDate: Date; // Definido en EMA
    TransferReference: string;
    PaymentInvoices: SLPaymentInvoice[];
    PaymentCreditCards: CreditCardMobile[];
    Udfs: UDFModel2[];
    // PPTransactions: IVoidedTransaction[]; // Definido en EMA
    DocumentType: number;
    HandWritten: string;
    CreditSum: number;
    // Transfer: ITransferPayment
}

/**
 * Represent the information that need be save when there are no internet in the document creation
 */
export interface IDocumentToSync extends ITransactionType {
    Id?: number;

    Document?: IARInvoice | ISalesOrder | ISalesQuotation;

    Payment?: IIncomingPayment;
}

export interface DocumentMinified {
    DocEntry: number;
    DocNum: number;
    Clave: string;
    Consecutivo: string;
    DocumentType: number;
    DocTypeLabel: string;
    PaymentCurrency?: string;
    AmountApplied?: number;
}

export interface DocumentToPrint {
    BusinessPartnerMinified: BusinessPartnerMinified;

    DocumentMinified: DocumentMinified;

    LinesMinified: LineMinified[];
}

/**
 * This interface is to mapping document invoices
 */
export interface SLPaymentInvoice {
    //Document number
    DocNum?:number;
    //Document number internal
    DocEntry: number;
    //Amount in currency local
    SumApplied: number;
    AppliedFC: number;
    //type document
    InvoiceType: string;
    //Document currency
    DocCurrency: string;
    //Line number
    LineNum: number;
}

/**
 * This interface is used for mapping data in document search
 */
export interface PreloadedDocument {
    /**
     * Business partner associated with the document (customer information).
     */
    Customer: IBusinessPartners;
    /**
     * List of document lines
     */
    Lines: IDocumentLine[];
    /**
     * Metadata and general information about the document
     */
    DocumentInfo: PreloadedDocumentInfo;
    /**
     * List of user-defined field (UDF) values associated with the document.
     */
    UdfsValues: IUdf[];
    /**
     * Lines of the document attachment
     */
    AttachmentLines: IAttachments2Line[];
}

/**
 * Represents information about a preloaded document.
 */
export interface PreloadedDocumentInfo {
    /**
     * The entry ID of the document.
     */
    DocEntry: number;

    /**
     * The document number.
     */
    DocNum: number;

    /**
     * Comments associated with the document.
     */
    Comments: string;

    /**
     * The name of the card associated with the document.
     */
    CardName: string;

    /**
     * Additional number at card.
     */
    NumAtCard: string;

    /**
     * The key of the document.
     */
    DocumentKey: string;

    /**
     * The price list associated with the document.
     */
    PriceList: number;

    /**
     * The currency of the document.
     */
    DocCurrency: string;

    /**
     * Optional: The object type referenced by the document.
     */
    ObjType?: ReferencedObjectTypeEnum;
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
     * Represent Payment Group Code of the document
     */
    PaymentGroupCode: number;

    /**
     * Represent applied percentage of document Downpayment
     */
    DownPaymentPercentage: number;
    /**
     * Unique identifier of the attachment
     */
    AttachmentEntry: number;
}

/**
 * Represents a bin allocation used for inventory or warehouse operations.
 */
export interface IBinAllocation {
    /** The base line number of the serial or batch item. */
    SerialAndBatchNumbersBaseLine: number;

    /** The absolute entry (ID) of the bin location. */
    BinAbsEntry: number;

    /** The quantity of items allocated to the bin. */
    Quantity: number;
}


/**
 * Represents a serial number item with a specified quantity.
 */
export interface ISerialNumber {
    /** The system-assigned serial number. */
    SystemSerialNumber: number;

    /** The quantity associated with the serial number. */
    Quantity: number;
}


/**
 * Provides metadata for document types including an identifier and a human-readable label.
 */
export interface IDocumentTypeLabel {
    /** Numeric identifier for the document type. */
    DocType: number;

    /** Descriptive label for the document type. */
    Label: string;
}


/**
 * Represents a document included in a payment, such as an invoice or credit note.
 */
export interface IDocumentInPayment {
    /** Document number. */
    DocNum: number;

    /** Amount applied to the document in local currency. */
    AmountApplied: number;

    /** Total amount applied in the document's transaction. */
    SumApplied: number;

    /** Amount applied in foreign currency. */
    AppliedFC: number;

    /** Currency code of the document (e.g., "USD"). */
    Currency: string;
}


/**
 * Represents the financial totals of a document, such as invoice or quotation.
 */
export interface IDocTotals {
    /** Total amount of the document including taxes and discounts. */
    Total: number;

    /** Subtotal amount before taxes and discounts. */
    SubTotal: number;

    /** Total amount of taxes applied to the document. */
    TaxAmount: number;

    /** Total discount amount applied to the document. */
    DiscountAmount: number;
}

/**
 * Represents a model for searching document drafts on mobile.
 * Extends the DocumentSearchMobileModel with additional properties.
 */
export interface DocumentDraftSearchMobileModel extends DocumentSearchMobileModel {
    /**
     * The type of view for the document draft.
     */
    ViewType: string;

    /**
     * The object type identifier for the document draft.
     */
    ObjType: number;
}



