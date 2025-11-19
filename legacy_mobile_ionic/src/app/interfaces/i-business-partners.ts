import { IBpAddress } from "./i-bp-address";
import { IFieldsBusinesPartner } from "./i-company-fields-configured";
import { IUdf } from "./i-udfs";

/**
 * This interface is used to mapping bp
 */
export interface IBusinessPartners {
    /**
     * Car code
     */
    CardCode: string;
    /**
     * Card name
     */
    CardName: string;
    /**
     * card type
     */
    CardType: string;
    /**
     * Group code
     */
    GroupCode: number;
    /**
     * Phone
     */
    Phone1: string;
    /**
     * Type identification
     */
    TypeIdentification: string;
    /**
     *  Pay terms payment
     */
    PayTermsGrpCode: number;
    /**
     *Discount
     */
    DiscountPercent?: number;
    /**
     * Identification
     */
    FederalTaxID: string;
    /**
     * Price List
     */
    PriceListNum: number;
    /**
     * Provincia
     */
    Provincia?: string;
    /**
     * canton
     */
    Canton?: string;
    /**
     * distrito
     */
    Distrito?: string;
    /**
     * barrion
     */
    Barrio?: string;
    /**
     * direccion
     */
    Direccion?: string;
    /**
     * currency
     */
    Currency: string;
    /**
     * email
     */
    EmailAddress: string;
    /**
     * Configuration inputs to the difference companis
     */
    ConfigurableFields: IFieldsBusinesPartner[];
    /**
     * udfs
     */
    UDFs?: IUdf[];
    /**
     * Address default
     */
    ShipToDefault: string;
    /**
     * Address default
     */
    BilltoDefault: string;
    /**
     * frozen
     */
    Frozen: string;
    /**
     * Addresses
     */
    BPAddresses?: IBpAddress[];
    /**
     * bp  of cash or credit
     */
    CashCustomer?:boolean;

    /**
     * ID of the bp
     */
    LicTradNum: string;

     /**
     * email
     */
    Email: string;

}
