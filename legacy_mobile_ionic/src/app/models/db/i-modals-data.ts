import { IBlanketAgreement } from "../api/iblanket-agreement";
import { ICard } from "./card-api-model";
import { CashPayment } from "./cash-payment.model";
import { CreditCardMobile } from "./credit-card.model";
import { IDiscountGroup } from "./discount-group";
import { IDiscountHierarchy } from "./discount-hierarchy";
import { IBinRequest } from "./i-bin";
import { ITransferPayment } from "./i-transfer-payment";
import { IMeasurementUnit } from "./measurement-unit";
import { FocusItemModel } from "./product-api-model";
import { PromotionsModel } from "./promotions";
import { IWarehouse } from "./wareHouse";
import { IWarehouses } from "src/app/interfaces/i-warehouse";
import {ICurrency} from "./currency";
import {IDocumentLine} from "../../interfaces/i-item";
import {ISalesTaxes} from "../../interfaces/i-sales-taxes";
import { IDecimalSetting } from "src/app/interfaces/i-settings";
import {DocumentType} from "../../common";
import { IRouteLine } from "./route-model";

export interface IEditDocumentLineComponentData {
    item: IDocumentLine;
    wareHouseList: IWarehouses[];
    priceList: number;
    cardCode: string;
    documentTable: string;
    docType: number;
    isLocal: boolean;
    taxes: ISalesTaxes[];
    decimalCompany: IDecimalSetting;
    exchangeRate: number;
}

/**
 * Represent the required data to set up the product search component
 */
export interface IProductSearchComponentInputData
{
    /**
     * Selected price list number 
     */
    PriceListNum: number;
    /**
     * A collection of focus items
     */
    ItemFocusList: FocusItemModel[];
    /**
     * Current user warehouse
     */
    UserWarehouse: string;
    /**
     * A collection of promotions
     */
    PromotionList: PromotionsModel[];
    /**
     * A collection of measurement units
     */
    MeasurementUnits: IMeasurementUnit[];
    /**
     * A collection of discount groups
     */
    Discounts: IDiscountGroup[];
    /**
     * Discount hierarchy. In this order the discounts will be applied
     */
    DiscountHierarchy: IDiscountHierarchy[];
    /**
     * Selected customer group
     */
    CustomerGroup: number;
    /**
     * Selected customer tax code
     */
    CustomerTaxCode: string;
    /**
     * Selected customer discount
     */
    CustomerDiscount: number;
    /**
     * Selected customer discount
     */
    HeaderDiscount: number;
    /**
     * Selected customer code
     */
    CustomerCode: string;
    /**
     * A collection of taxes
     */
    TaxList: ISalesTaxes[];
    /**
     * A collection of customers blanket agreements
     */
    BlanketAgreements: IBlanketAgreement[];
    /**
     * A collection of warehouses
     */
    Warehouses: IWarehouse[];
    /**
     * Current document SAP Table name. Like: OINV, OQUT...
     */
    DocumentTable: string;
    /**
     * Current document name. Like: Invoice, Quotation...
     */
    DocTypeName: string;
    /**
     * Current document type defined in the application
     */
    DocType: DocumentType;
    /**
     * Indicates if the current document currency is the local currency
     */
    IsLocalCurrency?:boolean;
    /**
     * Currency code of the current document
     */
    Currency?:string;
    /**
     * This object should contains the quantity of decimals to preserve. Like decimals for: LinePrice, LineTotal and DocumentTotal 
     */
    DecimalCompany?:IDecimalSetting;
    /**
     * The current exchange rate
     */
    ExchangeRate: number;
}

export interface ISelectBinAllocationsComponentInputData {
    BinAllocations: IBinRequest[];
    Requested: number;
}

/**
 * Represent the required data to set up the check component
 */
export interface ICheckComponentInputData
{
    /**
     * Customer code of the route line
     */
    CardCode: string;
    /**
     * Customer name of the route line
     */
    CardName: string;
    /**
     * Current route id
     */
    RouteId: number;
    /**
     * The type of the check to create
     */
    CheckType: number;
    /**
     * Name of the address of the route line
     */
    Address: string;
    /**
     * Route line id
     */
    RouteLineId: number;
    /**
     * Type of the route line
     */
    AddressType: number;
    /**
     * Name of the check
     */
    CheckName: string;
}

/**
 * This interface is mapping payment modal
 */
export interface IPaymentComponentInputData
{
    /**
     * Document total
     */
    total: number;
    /**
     * Document total
     */
    totalFC: number;
    /**
     * Current Currecie
     */
    currency: string;
    /**
     * Cash Model
     */
    cashPayment: CashPayment;
    /**
     * Transfer model
     */
    transferPayment: ITransferPayment;
    /**
     * Cards model
     */
    cards: CreditCardMobile[];
    /**
     * Exchange Rate
     */
    exRate: number;
    /**
     * Cards
     */
    cardsTypesList: ICard[];
    /**
     *
     */
    definedTotal: boolean;
    /**
     * Business Partner currency
     */
    customerCurrency: string;
    /**
     * Currencies
     */
    currencies: ICurrency[];
    /**
     * Decimal company
     */
    decimalCompany: IDecimalSetting;
}


export interface IDocumentCurrencyComponentInputData
{
    listNum: number;
}

export interface INavigationAppsComponentInputData
{
    RouteDestination: IRouteLine;
}

/**
 * Represent the required data to set up the document create component
 */
export interface IDocumentCreateComponentInputData
{
    /**
     * The electronic bill key
     */
    FEKey: string;
    /**
     * The electronic bill consecutive number
     */
    ConsecutiveNumber: string;
    /**
     * Indicates if the information to show is of an invoice
     */
    IsInvoice: boolean;
    /**
     * Create document number
     */
    DocNum: string;
    /**
     * The type of document of the information to show
     */
    DocType: number;
    /**
     * Additional information
     */
    AdditionalInformation: string;
    /**
     * Information to print the created document
     */
    PrintInformation: string;
    /**
     * Created document entry
     */
    DocEntry: number;
    /**
     * Indicates if the users is allowed to print the document
     */
    AllowPrint: boolean;
    /**
     * Indicates if the information to show if from a create or update action
     */
    Edit: boolean;
    /**
     * Indicates if the document is preliminary
     */
    IsPreliminary: boolean;
}

/**
 * Represent the required data to set up the pay 
 */
export interface IDocumentForDownPaymentInputData {
    /**
     * Total amount of the document including taxes.
     */
    DocTotal: number;

    /**
     * Number of decimal places used for financial calculations.
     */
    Decimal: number;

    /**
     * Subtotal amount before tax is applied.
     */
    Subtotal: number;

    /**
     * Tax amount (Impuesto).
     */
    Impuesto: number;

    /**
     * Exchange rate applied to the document.
     */
    Rate: number;

    /**
     * Currency code of the document (e.g., "USD", "EUR").
     */
    Currency: string;

    /**
     * Business partner or customer code.
     */
    CardCode: string;

    /**
     * List of available currencies for selection or conversion.
     */
    Currencies: ICurrency[];
}