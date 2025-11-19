/**
 * This interface is used to mapping model search documents
 */
export interface ISalesDocumentSearch {
    //Document internal number
    DocEntry: number;
    //Document number
    DocNum: number;
    //Pather code
    CardCode: string;
    //Pather name
    CardName: string;
    //Document date
    DocDate: string;
    //Document date end
    DocDueDate: string;
    //Document total
    DocTotal: number;
    //Sales person code
    SalesPersonCode: number;
    //Sales person name
    SalesPersonName:string;
    //Doc Currency
    DocCurrency: string;
    //Doc status
    DocStatus: string;
    //If cash invoice
    IsCashInvoice: boolean;
}