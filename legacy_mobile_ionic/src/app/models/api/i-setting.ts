export interface ISetting {
    Id: number;
    Code: string;
    View: string;
    Json: string;
    CreatedDate: string;
    CreatedBy: string;
    UpdateDate: string;
    UpdatedBy: string;
    IsActive: boolean;
}

/**
 * This interface is used to mapping the setting of Synchronizations logs
 */
export interface ILogSetting {
    //Poperty information
    Information: boolean;
    //Poperty success
    Success: boolean;
    //Poperty warnigng
    Warning: boolean;
    //Poperty error
    Error: boolean;
    //Poperty company
    CompanyId: number;
}


export interface ISpeedTestSetting
{
    /**Image Url */
    ImageUrl: string;
    /**Image size in bits */
    SizeInBits: number;
    /**Time in milliseconds */
    DownloadInterval: number;
    /**
     * Times the image is downloaded to take the average time
     */
    TimesToDownload: number;
}

/**
 * Model to map the DefaultBusinessPartner setting
 */
export interface IDefaultBusinessPartnerSetting {
    /**
     * Id of the company where this values will be applied
     */
    CompanyId: number;
    /**
     * The card code of the default customer
     */
    BusinessPartnerCustomer: string;
    /**
     * The card code of the default supplier
     */
    BusinessPartnerSupplier: string;
}

/**
 * Configuration interface for enabling or disabling attachment validation
 * for specific SAP documents at a company level.
 */
export interface IValidateAttachmentsSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Represent a list of reference to a document where the app will be validate the inventory of an item
   */
  Validate: IValidateAttachmnet[]
}

/**
 * Represents the attachment validation settings for a specific SAP document type.
 */
export interface IValidateAttachmnet {
  /**
   * SAP table to reference the document
   */
  Table: string;
  /**
   * The label that will be show in the UI
   */
  Description: string;
  /**
   * Indicates if should validate attachmnets
   */
  Active: boolean;
}

/**
 * Represents the structure of custom fields (UDFs) 
 * used for offline electronic invoicing.
 */
export interface IUdfsFEOffline {
  /**
   * Unique key identifier for the electronic invoice.
   */
  UdfClave: string;

  /**
   * Consecutive number associated with the electronic invoice.
   */
  UdfConsec: string;
}