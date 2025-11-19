import {IUdf} from "./i-udfs";
import {ISerialNumbers} from "./i-batches";
import {IBinLocation} from "./i-BinLocation";

/**
 * Represents a stock transfer request.
 */
export interface IStockTransferRequest {
    DocEntry: number;
    DocNum: number;
    DueDate: string;
    Comments: string;
    SalesPersonCode: number;
    FromWarehouse: string;
    ToWarehouse: string;
    DocStatus: string;
    StockTransferLines: IStockTransferRequestRows[];
    Udfs: IUdf[];
    DocDate: string;
    TaxDate: string;
    AttachmentEntry:number;
}


/**
 * Represents a line item in a stock transfer request.
 */
export interface IStockTransferRequestRows {
    ItemCode: string;
    ItemDescription: string;
    Quantity: number;
    Stock: number;
    SerialNumbers: ISerialNumbers[];
    WarehouseCode: string;
    FromWarehouseCode: string;
    Udfs: IUdf[];
    LineNum: number;
    BaseLine: number;
    BaseType: string;
    BaseEntry: number;
    ManSerNum: string;
    ManBtchNum: string;
    DistNumber: string;
    SysNumber: number;
    BinAbs: number;
    BinActivat: string;
    LocationsFrom: IWarehouseBinLocation[];
    LocationsTo: IBinLocation[];
    LineStatus: string;
}


/**
 * Represents a bin location in a warehouse.
 */
export interface IWarehouseBinLocation {
    OnHandQty: number;
    AbsEntry: number;
    BinCode: string;
}

/**
 * Model used for filtering inventory documents
 */
export interface ITransfersRequests
{
    DocEntry: number;
    DocNum: number;
    DocStatus: string;
    DocDate: string;
    SlpCode: number;
    SlpName: string;
}
