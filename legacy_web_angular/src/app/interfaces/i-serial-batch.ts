export interface IDocumentLinesBinAllocations {
  SerialAndBatchNumbersBaseLine: number;
  BinAbsEntry: number;
  Quantity: number;
  Stock?: number;

}

export interface IBatchNumbers {
  BatchNumber: string;
  SystemSerialNumber: number;
  Quantity: number;

}

export interface ISerialNumbers {
  SystemSerialNumber: number;
  Quantity: number;
  DistNumber?: string;
  BinCode?: string;
  Assigned?: boolean
}

export interface IBinLocation {
  AbsEntry: number;
  BinCode: string;
}

export interface ILocationsModel {
  AbsEntry: number;
  BinCode: string;
  Stock: number;
  Quantity: number;
  Selected: boolean;
}

export interface ILocationsSelectedModel {
  Permission?: boolean;
  Locations: ILocationsModel[];
  Quantity?: number;
  ValidateStockBatch: boolean;
  BinCode?: string;
  TypeDocument: string;
}

export interface IBatches {
  SysNumber: number;
  DistNumber: string;
  Stock: number;
  Quantity: number;
  CommitQty: number;
  Disponible: number;
  Locations: ILocationsModel[];
}


export interface IBatchSelected {
  Permission?: boolean;
  Lotes: IBatches[];
  LotesSelected?: IBatchNumbers[];
  LocationsSelected?: IDocumentLinesBinAllocations[];
  Quantity?: number;
  ValidateStockBatch: boolean;
  View: number;
}

export interface IBatchResult {
  Lotes: IBatchNumbers[],
  Locations: IDocumentLinesBinAllocations[]
}

export interface IBatchPermission {
  IBatchSelected: IBatchSelected;
  Permisison: string [];
}
