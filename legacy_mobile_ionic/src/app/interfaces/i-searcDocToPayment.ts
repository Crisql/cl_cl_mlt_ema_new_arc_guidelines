/**
 * This interface is used mapping to search documents 
 */
export interface ISearchDocToPayment {
    /**
     * Internal document number
     */
    DocEntry: number;
    /**
     * Document number
     */
    DocNum: number;
    /**
     * Document type
     */
    DocumentType: string;
    /**
     * Pather code
     */
    CardCode: string;
    /**
     * Pather Name
     */
    CardName: string;
    /**
     * Reference
     */
    NumAtCard: string;
    /**
     * Document currency
     */
    DocCurrency: string;
    /**
     * Document total in currency local
     */
    Total: number;
    /**
     * Document total pendient in currency local
     */
    Saldo: number;
    /**
     * Document Date
     */
    DocDate: string;
    /**
     * Document due date
     */
    DocDueDate: string;
    /**
     * Plazos
     */
    InstlmntID: number;
    /**
     * Transaction id
     */
    TransId: number;
    /**
     * Document total in currency extern
     */
    TotalUSD: number;
    /**
     * Document total pendient in currency entern
     */
    SaldoUSD: number;
    /**
     * Type object SAP
     */
    ObjType: string;
    /**
     * Symbol
     */
    Symbol:string;
    /**
     * DocTotal
     */
    DocTotal: number;
    /**
     * Saldo pendient
     */
    DocSaldo: number;
    /**
     * Selected Document
     */
    Selected: boolean;
    /**
     * Payment amount
     */
    AmountPay: number;
}
