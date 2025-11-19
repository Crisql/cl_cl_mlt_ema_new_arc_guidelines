import {IProductPrice} from "../models/db/priceList-model";
import {BillOfMaterialModel} from "../models/db/product-model";
import {IDocumentLine} from "./i-item";

export interface IProduct
{
    IsCommited: number,
    OnOrder: number,
    WhsCode: string,
    ItemClass: string,
    ForeignName: string,
    Series: number,
    U_IVA: string,
    UnitPriceFC: number,
    BarCode: string,
    //ItemBarCodeCollection: BarCodeMasterData[],
    ItemPrices: IProductPrice[],
    TypeAheadFormat: string,
    Discount: number,
    ItemCode: string,
    ItemName: string,
    TaxCode: string,
    TaxRate: number,
    Id: number,
    State: boolean,
    Quantity: number,
    U_MaxDiscITM: number,
    ShortDescription: string,
    Family: string,
    GroupCode: number,
    UgpEntry: number,
    SuoMEntry: number,
    PriceUnit: number,
    AllowUnits: string,
    QuantityAvailable: number,
    ValidateInventory: boolean,
    InStock: number,
    InvValidated: boolean,
    Focus?: boolean,
    Price?: number,
    Freight?: boolean,
    TaxOnly: string,
    OTCXCondition?: string,
    EvalSystem?: string,
    ManBtchNum?: string,
    ManSerNum?: string,
    BinAbs?: number,
    BinCode?: string,
    BinWhsCode?: string,
    SerialAbs?: number,
    SerialNumber?: string,
    SNWhsCode?: string,
    PriceDiscount: number;
    LineTotal: number;
    TotalTax: number;
    TotalDiscount: number;
    HavePromotion: boolean;
    IsAServerLine: boolean;
    ExcededQtyAvailable?: boolean;
    LineNum?: number;
    BaseType?: number;
    BaseEntry?: number;
    BaseLine?: number;
    LineStatus?: number;
    ItemCurrency?: string;
    Hash?: string;
    AbsEntry?:number;
    BillOfMaterial: BillOfMaterialModel[];
    OnHand: number;
}

export interface ISearchProduct{
    Items: IDocumentLine[];
    BlanketAgreementName: string[];
    BatchedItems: IProduct[]
}