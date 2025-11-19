export interface MobileBatches {
    ItemCode: string;
    BatchNumber: string;
    Quantity: number;
}

export interface MobileBatchesList {
    ItemCode: string;
    WarehouseCode: string;
    BatchNumbers: MobileBatches[];
}

/**
 * This interface represents model for batches
 */
export interface IBatchNumbers {
    BatchNumber: string;
    SystemSerialNumber: number;
    Quantity: number;
}

export interface IDocumentLinesBinAllocations {
    SerialAndBatchNumbersBaseLine: number;
    BinAbsEntry: number;
    Quantity: number;
}

/**
 * This interface represents model for series
 */
export interface ISerialNumbers {
    SystemSerialNumber: number;
    Quantity: number;
    DistNumber: string;
}