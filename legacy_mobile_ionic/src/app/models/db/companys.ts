export interface CompanyModel {
    Id: number;
    DBName: string;
    DBCode: string;
    SAPConnectionId: number;
    LogoPath: string;
    SendMails: boolean;
    Active: boolean;
    MailDataId: number;
    CheckInTime: number;
    BillingRange: number;
    HasFreight: boolean;
}

/**
 * Represents information about a company.
 */
export interface ICompanyInformation {
    /**
     * The name of the company.
     */
    CompanyName: string;

    /**
     * The address or direction of the company.
     */
    Direction: string;

    /**
     * The phone number of the company.
     */
    Phone: string;

    /**
     * Indicates whether the company uses billing range.
     */
    UseBillingRange: boolean;

    /**
     * The billing range value.
     */
    BillingRange: number;

    /**
     * Indicates whether the company has freight.
     */
    UseFreight: boolean;

    /**
     * Indicates whether the company operates in online-only mode.
     */
    OnlineOnly: boolean;

    /**
     * The identification of the company
     */
    Identification: string;

    /**
     * The number of decimal to show in the price of the line
     */
    LinePriceDecimals: number;

    /**
     * The number of decimals to show in the line total amount
     */
    LineTotalDecimals: number;

    /**
     * The number of decimals to show in the document total amount
     */
    DocumentTotalDecimals: number;

    /**
     * Company id in application database
     */
     CompanyId : number
    
    /**
     * Connection id of the company
     */
     ConnectionId : number
    
    /**
     * Data base code of the company
     */
    DatabaseCode : string
}



export interface ICompany extends IBaseEntity {
    Name: string;
    DatabaseCode: string;
    ConnectionId: number;
}

export interface IBaseEntity {
    Id: number;
    CreatedDate: Date | string;
    CreatedBy: string;
    UpdateDate: Date;
    UpdatedBy: string;
    IsActive: boolean;
}