import {IBinLocation} from "./i-BinLocation";
import {IWarehouseBinLocation} from "./i-stock-transfer-request";
import {IBatchNumbers, ISerialNumbers} from "./i-batches";
import {IUdf} from "./i-udfs";
import {IBatches} from "../models/db/product-model";

export interface IStockTransfer {
    DocEntry: number,
    DocNum: number,
    Comments: string;
    SalesPersonCode: number;
    StockTransferLines: IStockTransferRows[];
    FromWarehouse: string;
    ToWarehouse: string;
    Udfs: IUdf[];
    DocDate?: string;
    TaxDate?: string;
    AttachmentEntry:number;
}

export interface IStockTransferRows{
    ItemCode: string;
    ItemDescription: string;
    Quantity: number;
    WarehouseCode: string;
    FromWarehouseCode: string;
    SerialNumbers: ISerialNumbers[];
    BatchNumbers: IBatchNumbers[];
    BaseType?: string;
    BaseLine?: number;
    BaseEntry?: number;
    StockTransferLinesBinAllocations: IStockTransferLinesBinAllocations[];
    LineStatus: string;
    Udfs: IUdf[];

    [key: string]: any;
}

export interface IStockTransferLinesBinAllocations {
    BinActionType: string;
    BinAbsEntry: number;
    Quantity: number;
    BaseLineNumber: number;
    SerialAndBatchNumbersBaseLine: number;
}

export interface IStockTransferRowsSelected extends IStockTransferRows {
    Id?: number;
    FromNameWhsCode: string;
    ToNameWarehouse: string;
    SysNumber: number;
    DistNumber: string;
    Stock: number;
    ManSerNum: string;
    ManBtchNum: string;
    LineNum: number;
    BinActivat: string;
    BinAbsOrigin?: number;
    BinAbsDestino?: number;
    LocationsFrom: IBinLocation[];
    LocationsTo: IBinLocation[];
    OnHandByBin?: IWarehouseBinLocation[];
    IdBinLocation?: number;
}

export interface IStockTransferRowsWithBatches extends IStockTransferRowsSelected {
    Batches : IBatches[];
}
