import {IBatchNumbers, IDocumentLinesBinAllocations, ISerialNumbers} from "./i-batches";
import {IBinLocation} from "./i-BinLocation";
import {IUdf} from "./i-udfs";
import {IItem} from "../models/i-item";
import { ItemBarCodeCollection } from "./i-barcode";

/**
 * This unit measurment
 */
export interface IUoMmasterData {
    //Uom entry
    UoMEntry: number;
    //Uom  code
    UomCode: string;
    //Uom name
    UomName: string;
    //Unit price
    UnitPrice: number;
    //Unit price fc
    UnitPriceFC: number;
}

/**
 * This interface represent model currencies
 */
export interface ILinesCurrencies {
    //Id
    Id: string;
    //Currency
    DocCurrency: string;
    //Description
    Description: string;
    //Price
    Price: number;
}
/**
 * This interface represent row line
 */
export interface IDocumentLine extends IItem {
    /**
     * Represent the document identifier of this line
     */
    DocEntry: number;
    /**
     * This field store the warehouse code of the line
     */
    WarehouseCode: string;
    /**
     * This field store the discount applied to the line
     */
    DiscountPercent: number;
    /**
     * This field store the costing code of the line
     */
    CostingCode: string;
    /**
     * This field store the total amount of the line
     */
    Total: number;
    /**
     * This field store a description of the item
     */
    ItemDescription: string;
    /**
     * This field store the unit price of the item in the foreign currency
     */
    UnitPriceFC: number;
    /**
     * This field store the total tax applied
     */
    TotalImp: number;
    /**
     * This field store the total discount applied to the item
     */
    TotalDesc: number;
    /**
     * This field store the price with the discount applied
     */
    PriceDiscount: number;
    /**
     * This field store the line number in the document
     */
    LineNum: number;
    /**
     * This field store the base document line number
     */
    BaseLine?: number;
    /**
     * This field store the base document entry
     */
    BaseEntry?: number;
    /**
     * This field store the base document type
     */
    BaseType?: number;
    /**
     * This field store a collection of locations
     */
    DocumentLinesBinAllocations?: IDocumentLinesBinAllocations[];
    /**
     * This field store the serial number used by the item
     */
    SerialNumbers?: ISerialNumbers[];
    /**
     * This field store the batches applied to the item
     */
    BatchNumbers?: IBatchNumbers[];
    /**
     * This field store the batch name
     */
    DistNumber?: string;
    /**
     * This field store a collection of user defined fields with his values
     */
    Udfs: IUdf[];
    /**
     * Indicates if the item is manage by locations
     */
    ManBinLocation?: string;
    /**
     * This field store the item code of the parent item
     */
    FatherCode?: string;
    /**
     * This field represent the line status in SAP
     */
    LineStatus: string;
    /**
     * This field store the dynamics udfs
     */
    [key: string]: any;
    /**
     * This field store the currency applied to the item
     */
    Currency?: string;
    /**
     * This field store a collection of currecies
     */
    LinesCurrenciesList: ILinesCurrencies[];

    /**
     * Aux property to show the bill of materials in the UI
     */
    IsBillOfMaterialsOpen: boolean;
    
    /**
     * Handling the total line for local currency
     */
    TotalCOL: number;

    /**
     * Handling the total line for foreign currency
     */
    TotalFC: number;

    /**
     * Handling the line price for local currency
     */
    UnitPriceCOL: number;

    /**
     * Identify if line is generate for Freight
     */
    IsAServerLine: boolean;
}

/**
 * This interface represent list of material
 */
export interface IBillOfMaterial extends IDocumentLine {

}

/**
 * Represent the required info of bill of materials to sync
 */
export interface IBillOfMaterialToSync
{
    /**
     * The code of the parent item
     */
    FatherCode: string;
    /**
     * The code of the child item
     */
    ItemCode: string;
    /**
     * The quantity of the child item to make the parent
     */
    Quantity: number;
}

/**
 * Represents the structure of selected products with related details.
 */
export interface ISelectedProducts {
    /**
     * List of document lines associated with the selected products.
     */
    Items: IDocumentLine[];

    /**
     * Array of names for blanket agreements related to the selected products.
     */
    BlanketAgreementName: string[];

    /**
     * Array of items that have been batched or grouped.
     */
    BatchedItems: [];
}


/**
 * Represents the extended item master data used in the system.
 * Extends the base IItem interface with additional information such as pricing, barcodes, and UDFs.
 */
export interface IItemMasterData extends IItem {
  /** The foreign name of the item (e.g. in another language). */
  ForeignName: string;
  
  /** The default barcode for the item. */
  BarCode: string;
  
  /** A list of prices for the item by price list. */
  ItemPrices: ItemPrice[];
  
  /** The default series number associated with the item. */
  Series: number;
  
  /** The tax code associated with the item. */
  TaxCode: string;
  
  /** A collection of additional barcodes related to the item. */
  ItemBarCodeCollection: ItemBarCodeCollection[];
  
  /** User-defined fields assigned to the item. */
  Udfs: IUdf[];
}

/**
 * Represents a price entry for an item in a specific price list.
 */
export interface ItemPrice {
  /** The ID of the price list. */
  PriceList: number;
  
  /** The price of the item in this price list. */
  Price: number;
  
  /** The currency in which the price is defined. */
  Currency: string;
}
