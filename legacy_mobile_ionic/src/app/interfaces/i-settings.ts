/**
 * Represent the general setting model
 */
export interface ISettings {
    /**
     * Represent the Id of the setting
     */
    Id: number | null;
    /**
     * Represent the code of the setting must be unique
     */
    Code: string;
    /**
     * The view where the setting is used. This is optional
     */
    View: string;
    /**
     * The value of the setting
     */
    Json: string;
    /**
     * Indicates if the setting is active
     */
    IsActive: boolean;
  }

  /**
 * Model to map the Decimal setting
 */
export interface IDecimalSetting {
    /**
     * Id of the company where this values will be applied
     */
    CompanyId: number;
    /**
     * Number of decimals that will be show in the document line price
     */
    Price: number;
    /**
     * Number of decimals that will be show in the document line total
     */
    TotalLine: number;
    /**
     * Number of decimals that will be show in the document total
     */
    TotalDocument: number
  }

/**
 * Model to map the ValidateInventory setting values
 */
export interface IValidateInventorySetting {
    /**
     * Id of the company where this values will be applied
     */
    CompanyId: number;
    /**
     * Represent a list of reference to a document where the app will be validate the inventory of an item
     */
    Validate: IValidateInventory[]
}

/**
 * Represent a reference to a document where the app will be validate the inventory of an item
 */
export interface IValidateInventory {
    /**
     * SAP table to reference the document
     */
    Table: string;
    /**
     * The label that will be show in the UI
     */
    Description: string;
    /**
     * Indicates if should validate inventory
     */
    ValidateInventory: boolean;
    /**
     * Indicates if should validate batches inventory
     */
    ValidateBatchesInventory: boolean;
}

/**
 * Represents the configuration settings for a mobile application.
 */
export interface IMobileAppConfiguration {
    /**
     * Indicates whether the application should operate in online-only mode.
     */
    OnlineOnly: boolean;

    /**
     * Indicates whether the application should use header discount.
     */
    UseHeaderDiscount: boolean;

    /**
     * Indicates whether the application should use freight.
     */
    UseFreight: boolean;

    /**
     * The time interval for performing check-ins in minutes.
     */
    CheckInTime: number;

    /**
     * Indicates whether the application should use a billing range.
     */
    UseBillingRange: boolean;

    /**
     * The billing range value.
     */
    BillingRange: number;

    /**
     * The identifier of the company associated with the configuration.
     */
    CompanyId: number;

    /**
     * The time in minutes for the automatic check synchronization 
     */
    CheckSynchronizationInterval: number;
}

/**
 * Represent a document where the lines will be grouped
 */
export interface IValidateLine {
    /**
     * The reference to the document
     */
    Table: string;
    /**
     * The label that will be show in the UI
     */
    Description: string;
    /**
     * Indicates if the document lines will be order
     */
    LineMode: boolean;
    /**
     * Indicates if the document lines will be grouped
     */
    LineGroup: boolean;
}

/**
 * Model to map the LineMode setting
 */
export interface ILineModeSetting {
    /**
     * Id of the company where this values will be applied
     */
    CompanyId: number;
    /**
     * Represent a list of a documents where the lines will be grouped
     */
    Validate: IValidateLine[];
}
