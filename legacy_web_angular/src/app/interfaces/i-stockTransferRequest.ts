import {IBinLocation, ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {IUdf} from "@app/interfaces/i-udf";

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
  /**
   * Represents the date of the document
   */
  DocDate: string;
  /**
   * Represents the date of the document
   */
  TaxDate: string;
  AttachmentEntry:number;
}

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

export interface IWarehouseBinLocation {
  OnHandQty: number;
  AbsEntry: number;
  BinCode: string;
}



