import {IBatchNumbers, IBinLocation, ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {IUdf} from "@app/interfaces/i-udf";
import {IWarehouseBinLocation} from "@app/interfaces/i-stockTransferRequest";


export interface IStockTransfer {
  DocEntry: number,
  DocNum: number,
  Comments: string;
  SalesPersonCode: number;
  StockTransferLines: IStockTransferRows[];
  FromWarehouse: string;
  ToWarehouse: string;
  Udfs: IUdf[];
  /**
   * Represents the date of the document
   */
  DocDate?: string;
  /**
   * Represents the date of the document
   */
  TaxDate?: string;
  AttachmentEntry:number;
}

export interface IStockTransferRows extends IStockStatusRows{
  LineNum: number;
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

export interface IStockStatusRows{
  RowColor?: string;
  RowMessage?: string;
}
