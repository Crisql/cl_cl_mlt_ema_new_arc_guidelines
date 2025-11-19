/**
 * Represents the data of open invoices
 */
export interface IInvoiceOpen {
    DocEntry: number;
    DocNum: number;
    DocumentType: string;
    CardCode: string;
    CardName: string;
    NumAtCard: string;
    DocCurrency: string;
    TotalShow: number;
    Total: number;
    Saldo: number;
    SaldoShow: number;
    TotalUSD: number;
    SaldoUSD: number;
    Pago:number;
    DocDate: string;
    DocDueDate: string;
    InstlmntID: number;
    Assigned:boolean;
    TransId: number;
    ObjType : string;
}

/**
 * Represents a closed down payment document with detailed information.
 */
export interface IDownPaymentClosed {
    /** Unique identifier for the document entry. */
    DocEntry: number;

    /** Document number, typically used for reference. */
    DocNum: number;

    /** Customer or vendor code associated with the document. */
    CardCode: string;

    /** Customer or vendor name associated with the document. */
    CardName: string;

    /** Currency used in the document (e.g., USD, EUR). */
    DocCurrency: string;

    /** Total amount of the document. */
    DocTotal: number;

    /** Remaining balance for the document. */
    Saldo: number;

    /** Amount paid towards the document. */
    Pago: number;

    /** Date the document was created. */
    DocDate: string;

    /** Due date for the document payment. */
    DocDueDate: string;

    /** Indicates if the document is assigned. */
    Assigned: boolean;

    /** Transaction identifier for tracking the document. */
    TransId: number;

    /** Object type identifier, typically representing the type of document. */
    ObjType: string;

    /** Total VAT amount associated with the document. */
    VatSum: number;
}
