// export class ProductModel {
//
//     constructor(
//         public Discount: number,
//         public ItemCode: string,
//         public ItemName: string,
//         public TaxCode: string,
//         public TaxRate: number,
//         public id: number,
//         public State: boolean,
//         public Quantity: number,
//         public U_MaxDiscITM: number,
//         public ShortDescription: string,
//         public Family: string,
//         public GroupCode: number,
//         public UgpEntry: number,
//         public SuoMEntry: number,
//         public PriceUnit: number,
//         public AllowUnits: string,
//         public QuantityAvailable: number,
//         public ValidateInventory: boolean,
//         public InStock: number,
//         public InvValidated: boolean,
//         public Focus?: boolean,
//         public Price?: number,
//         public Freight?: boolean,
//         public TaxOnly?: string,
//         public OTCXCondition?: string,
//         public EvalSystem?: string,
//         public ManBtchNum?: string,
//         public BinAbs?: number,
//         public BinCode?: string,
//         public BinWhsCode?: string,
//         public SerialAbs?: number,
//         public SerialNumber?: string,
//         public SNWhsCode?: string
//     ) {
//     }
// }

import {IBinLocation} from "../../interfaces/i-BinLocation";

export interface BasicInfoProduct {
    ItemCode: string;
    ItemName: string;
    BinCode: string;
    BinWhsCode: string;
    SerialNumber: string;
    DistNumberSerie?:string;
    SysNumber?:number;
    SNWhsCode: string;
    State: boolean;
    Quantity: number;
    Focus: boolean;
    IsAvailable: boolean;
    EvalSystem?: string;
    ManBtchNum?: string;
    ManSerNum?: string;
    AbsEntry?:number;
}

export interface IBatchedItem {
    ItemCode: string;
    WhsCode: string;
}

export interface IBatch {
    ItemCode: string;
    BatchNumber: string;
    WhsCode: string;
    Quantity: number;
    QuantityApplied: number;
    Index?: number;
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

export interface ILocationsModel extends IBinLocation{
    Quantity: number;
    Selected: boolean;
}


export interface IItemToBatch extends IBatchedItem {
    Batches: SLBatch[];
    ItemName: string;
    Quantity: number;
    Index?: number;
    Hash: string;
}

export interface SLBatch {
    ItemCode: string;
    BatchNumber: string;
    Quantity: number;
}

export interface IBasicBatch {
    ItemCode: string;
    WhsCode: string;
    BatchNumber: string;
}


export interface IProductWithProblems {
    ActionSheetText: string;
    Index: number;
}

export interface ICommitedStockLines {
    ItemCode: string;
    CommitedQuantity: number;
    WhCode: string;
    BinCode: string;
    SerialNumber: string;
}


export interface IItemInventoryParameter {
    ItemCode: string;
    WhCode: string;
    SerialNumber: string;
    BinCode: string;
}


export interface BillOfMaterialModel {

    Discount: number;
    ItemCode: string;
    ItemName: string;
    TaxCode: string;
    TaxRate: number;
    id: number;
    State: boolean;
    Quantity: number;
    WhsCode: string;
    U_MaxDiscITM: number;
    ShortDescription: string;
    Family: string;
    GroupCode: number;
    UgpEntry: number;
    SuoMEntry: number;
    PriceUnit: number;
    AllowUnits: string;
    QuantityAvailable: number;
    ValidateInventory: boolean;
    InStock: number;
    InvValidated: boolean;
    Focus?: boolean;
    Price?: number;
    Freight?: boolean;
    TaxOnly?: string;
    OTCXCondition?: string;
    EvalSystem?: string;
    ManBtchNum?: string;
    BinAbs?: number;
    BinCode?: string;
    BinWhsCode?: string;
    SerialAbs?: number;
    SerialNumber?: string;
    SNWhsCode?: string;

}

/**
 * Represents the model for the items of a transfer
 */
export interface IItemsTransfer {
    ItemCode: string;
    ItemName: string;
    Barcode: string;
    ManSerNum: string;
    ManBtchNum: string;
    SysNumber: number;
    DistNumber: string;
    Stock: string;
    Typehead: string;
    Quantity: number;
    State: boolean;
}