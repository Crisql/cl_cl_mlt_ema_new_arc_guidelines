import {IBaseEntity} from "./db/companys";
import {IBillOfMaterial, IUoMmasterData} from "../interfaces/i-item";
import {IBatchNumbers, IDocumentLinesBinAllocations, ISerialNumbers} from "../interfaces/i-batches";

/**
 * Represent the model of the item used in the application
 */
export interface IItem extends IBaseEntity {
    /**
     * A custom identifier
     */
    Id: number;
    /**
     * This field stores the tax code associated with the item, which determines the tax rate applied to transactions involving this item.
     */
    TaxCode: string;
    /**
     * This field store the tax rate percent
     */
    TaxRate: number;
    /**
     * This field specifies the maximum discount allowed for the item, usually expressed as a percentage.
     */
    MaxDiscount: number;
    /**
     * This field contains a brief description or abbreviation of the item.
     */
    ShortDescription: string;
    /**
     * It represents the group code to which the item belongs. It can be a number or null if the item doesn't belong to any specific group.
     */
    GroupCode: number | null;
    /**
     * This field stores the unique identifier (entry) of the item's unit of measure group. It's used to manage units of measure conversion for the item.
     */
    UgpEntry: number;
    /**
     * Similar to UgpEntry, this field stores the unique identifier of the item's sales unit of measure.
     */
    UoMEntry: number | null;
    /**
     * It specifies the price per unit of the item.
     */
    PriceUnit: number;
    /**
     * This field categorizes the item into a specific family or group of related items.
     */
    Family: string;
    /**
     * It indicates whether the item is subject to freight charges.
     */
    Freight: boolean;
    /**
     * This field specifies the allowed units of measure for the item.
     */
    AllowUnits: string;
    /**
     * It indicates whether the item is liable for value-added tax (VAT).
     */
    VATLiable: boolean;
    /**
     * This field stores the OTCX (Over the Counter Exchange) condition for the item.
     */
    OTCXCondition: string;
    /**
     * Indicates if the item use batches
     */
    EvalSystem: string;
    /**
     * This field stores the absolute entry of the bin location where the item is stored.
     */
    BinAbs: number | null;
    /**
     * It stores the serial number associated with the item.
     */
    SerialNumber: string;
    /**
     * This field specifies the warehouse code where the item's serial number is stored.
     */
    SNWhsCode: string;
    /**
     * It stores the absolute entry of the bin location where the item's serial number is stored.
     */
    SerialBinAbs: number | null;
    /**
     * The code of the item
     */
    ItemCode: string;
    /**
     * The name of the item
     */
    ItemName: string;
    /**
     * Represents the distribution rule for serial numbers for an item
     */
    DistNumberSerie: any;
    /**
     * Serie identifier
     */
    SysNumber: number;
    /**
     * Indicates whether batch numbers are managed manually for an item
     */
    ManBtchNum: string;
    /**
     * Indicates whether serial numbers for an item are managed manually
     */
    ManSerNum: string;
    /**
     * Indicates the bin location associated with an item in inventory
     */
    BinCode: string;
    /**
     * Allocation Identifier
     */
    AbsEntry: number;
    /**
     * Indicates if the item is selected
     */
    State: boolean;
    /**
     * The quantity of this item used in the application
     */
    Quantity: number;
    /**
     * This field indicates if the item is an inventory item
     */
    InventoryItem: string;
    /**
     * This field indicates if the item is an purchase item
     */
    PurchaseItem: string;
    /**
     * This field indicates if the item is a sales item
     */
    SalesItem: string;
    /**
     * This field store the warehouse code of the item
     */
    WhsCode: string;
    /**
     * This field store the warehouse name
     */
    WhsName: string;
    /**
     * This field indicates whether the item is discounted
     */
    TaxOnly: string;
    /**
     * This field store the stock of the item
     */
    OnHand: number;
    /**
     * This field store the last purchase price of the item in the local currency
     */
    LastPurchasePrice: number;
    /**
     * This field store the last purchase price of the item in the foreign currency
     */
    LastPurchasePriceFC: number;
    /**
     * This field store the mesurement units for the item
     */
    UoMMasterData: IUoMmasterData[];
    /**
     * This field indicates if the item is a material item
     */
    TreeType?: string;
    /**
     * This field store the material items
     */
    BillOfMaterial?: IBillOfMaterial[];
    /**
     * The price of the item
     */
    UnitPrice: number;
    /**
     * The discount of the item
     */
    DiscountPercent: number;
}
