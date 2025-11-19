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
 * Represent the tags used to indicate what properties of a master data will be show in the typeahead input
 */
export interface ITypeaheadTag {
  /**
   * The tag code that will be show in the UI
   */
  Tag: string;
  /**
   * Represent a description for the tag code
   */
  Title: string;
  /**
   * Indicates if the tag is required to use
   */
  IsRequired: boolean;
}

/**
 * Model to map the MobileApp setting values
 */
export interface IMobileAppSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates if the mobile application will work online or online and offline at same time
   */
  OnlineOnly: boolean;
  /**
   * Indicates if the documents will be use the business partners discount in the mobile application
   */
  UseHeaderDiscount: boolean;
  /**
   * Indicates if the documents will be collect freight in the mobile application
   */
  UseFreight: boolean;
  /**
   * Represent the interval in minutes to add an automatic check point in the active route in the mobile application
   */
  CheckInTime: number;
  /**
   * Indicates if the mobile application will be validate the billing range
   */
  UseBillingRange: boolean,
  /**
   * Represent the range where a sales person can bill to a customer
   */
  BillingRange: number;
  /**
   * The time in minutes for the automatic check synchronization
   */
  CheckSynchronizationInterval: number;
}

/**
 * Model to map the Scheduling setting values
 */
export interface ISchedulingSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates if should sync company use scheduling in his routes
   */
  UseScheduling: boolean;
  /**
   * Google service account to add meetings in the user Google calendar
   */
  GmailServiceAccount: string;
  /**
   * Password to authenticate the google service account
   */
  GmailServiceAccountPassword: string;
  /**
   * URL of Outlook service for add meetings in the user MS calendar
   */
  OutlookServiceURL: string;
}
/**
 * Model to map the EventViewer setting values
 */
export interface IEventViewerSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates if should sync error events
   */
  Error: boolean;
  /**
   * Indicates if should sync success events
   */
  Success: boolean;
  /**
   * Indicates if should sync information events
   */
  Information: boolean;
  /**
   * Indicates if should sync warning events
   */
  Warning: boolean;
}

/**
 * Model to map the FieldInvoice setting values
 */
export interface IFieldsInvoiceSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates if the invoice type field is visible
   */
  DisplayTypeInvoice: boolean;
  /**
   * Indicates if application should save the invoice number
   */
  NumFactura: boolean;
  /**
   * Indicates if application should save the business partner address
   */
  SetAddressBusinessPartner: boolean;
  /**
   * Indicates if the user can change the lines currency
   */
  ChangeCurrencyLine: boolean;
}

/**
 * Model to map the SharedFolder setting values
 */
export interface IShareFolderSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Represent the SAP attachment folder path
   */
  Ruta: string;
}

/**
 * Model to map the PrintFormat setting values
 */
export interface IPrintFormatSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Represent the name of the file of SaleOffer print format
   */
  SaleOffer: string;
  /**
   * Represent the name of the file of SaleOrder print format
   */
  SaleOrder: string;
  /**
   * Represent the name of the file of VoucherCancellation print format
   */
  VoucherCancellation: string;
  /**
   * Represent the name of the file of Invoices print format
   */
  Invoices: string;
  /**
   * Represent the name of the file of PinPadInvoices print format
   */
  PinPadInvoices: string;
  /**
   * Represent the name of the file of CreditNote print format
   */
  CreditNote: string;
  /**
   * Represent the name of the file of ReceivedPayment print format
   */
  ReceivedPayment: string;
  /**
   * Represent the name of the file of CashClosing print format
   */
  CashClosing: string;
  /**
   * Represent the name of the file of ReprintSaleOffers print format
   */
  ReprintSaleOffers: string;
  /**
   * Represent the name of the file of ReprintInvoices print format
   */
  ReprintInvoices: string;
  /**
   * Represent the name of the file of ReprintSaleOrders print format
   */
  ReprintSaleOrders: string;
  /**
   * Represent the name of the file of GoodsReceipt print format
   */
  GoodsReceipt: string;
  /**
   * Represent the name of the file of GoodsIssue print format
   */
  GoodsIssue: string;
  /**
   * Represent the name of the file of GoodsReceiptPO print format
   */
  GoodsReceiptPO: string;
  /**
   * Represent the name of the file of GoodsReturn print format
   */
  GoodsReturn: string;
  /**
   * Represent the name of the file of PurchaseOrder print format
   */
  PurchaseOrder: string;
  /**
   * Represent the name of the file of APInvoice print format
   */
  APInvoice: string;
  /**
   * Represent the name of the file of InventoryTransferRequest print format
   */
  InventoryTransferRequest: string;
  /**
   * Represent the name of the file of InventoryTransfer print format
   */
  InventoryTransfer: string;
  /**
   * Represent the name of the file of OutgoingPayment print format
   */
  OutgoingPayment: string;
  /**
   * Represent the name of the file of CancelPayment print format
   */
  CancelPayment: string;
  /**
   * Represent the name of the file of ArDownPayment print format
   */
  ArDownPayment: string
  /**
   * Represent the name of the file of PinpadDownPayment print format
   */
  PinpadDownPayment: string;
  /**
   * Represent the name of the file of ReprintReserveInvoice print format
   */
  ReprintReserveInvoice: string;
  /**
   * Represent the name of the file of ReprintArDownPayment print format
   */
  ReprintArDownPayment: string;
  /**
   * Represent the name of the file of ReserveInvoice print format
   */
  ReserveInvoice: string;
  /**
   * Represent the name of the file of DeliveryNotes print format
   */
  DeliveryNotes: string;
  /**
   * Represent the name of the file of Preliminary print format
   */
  Preliminary: string;
  /**
   * Represent the name of the file of Repreliminary print format
   */
  ReprintPreliminary: string;
  /**
   * Represent the name of the file of Repreliminary print format
   */
  ReprintDeliveryNotes: string;
  /**
   * Represent the name of the file of ApDownPayment print format
   */
  ApDownPayment: string
  /**
   * Represent the name of the file of pinpad ApDownPayment print format
   */
  PinpadApDownPayment: string;
  /**
   * Represent the name of the file of pinpad APInvoice print format
   */
  PinpadAPInvoice: string;

  /**
   * Represent the name of the file of  Reprint downpayment print format
   */
  ReprintApDownPayment: string;

  /**
   * Represent the name of the file of  Reprint credit notes print format
   */
  ReprintCreditNotes: string;

  /**
   * Represent the name of the file of  Reprint inventory tranfer request print format
   */
  ReprintTransferRequest: string;

  /**
   * Represent the name of the file of  Reprint purchase order print format
   */
  ReprintPurchaseOrder: string;

}


/**
 * Model to map the Account setting values
 */
export interface IAccountSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number,
  /**
   * The subject of the Email
   */
  Subject: string,
  /**
   * The electronic email that will be use to send emails
   */
  Account: string,
  /**
   * The user of the Email, can be equal that Account
   */
  User: string,
  /**
   * The smtp server
   */
  Host: string,
  /**
   * The password of the account
   */
  Password: string,
  /**
   * The port of the smtp server
   */
  Port: string,
  /**
   * Indicates if use SSL
   */
  Ssl: string,
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
 * Model to map the ReportManager setting values
 */
export interface IReportManagerSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Represent the key of the app in report manager
   */
  AppKey: number;
  /**
   * Represent the key of the company in report manager
   */
  CompanyKey: number;
}

/**
 * Model to map the Route setting values
 */
export interface IRouteSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Local API URL
   */
  PortServiceLocal: string;
  /**
   * PinPad service URL
   */
  PortServicePinpad: string;
  /**
   * Service layer URL
   */
  PortServiceLayer: string;
  /**
   * Padrón Hacienda URL
   */
  PortServiceHacienda: string;
  /**
   * Alert message for resending preview of sales documents
   */
  MessageServiceLayer: string;
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
 * Model to map the Payment setting
 */
export interface IPaymentSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Valid until of the payment card
   */
  CardValid: string;
  /**
   * Indicates if the app for the specific company will use PinPad
   */
  Pinpad: boolean;
  /**
   * Indicates if the app for the specific company will request FE info
   */
  ConsultFE: boolean,
  /**
   * Default card number
   */
  CardNumber: number;
  /**
   * Indicates if the cash account is required to make the payment
   */
  RequiredCashAccount: boolean;
  /**
   * Indicates if the transfer account is required to make the payment
   */
  RequiredTransferAccount: boolean;
  /**
   * Indicates if the card account is required to make the payment
   */
  RequiredCardAccount: boolean;
  /**
   * Indicates whether drag and drop can be used to sort the lines
   */
  OrderLine: boolean;
  /**
   * Indicates whether the billing retention process must be enabled.
   * */
  RetentionProcess: boolean;
  /*
  * Indicates wheter the modal process must be enabled.
  * */
  ModalProcess: boolean;
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
 * Model to map the AdjustmentInventory setting
 */
export interface IAdjustmentInventorySetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * SAP account for good receipts
   */
  GoodsReceiptAccount: string;
  /**
   * The message that will be show when a good receipt is made
   */
  Comments: string;
}

/**
 * Model to map the MemoryInvoice setting
 */
export interface IMemoryInvoiceSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Label that will be show in the tabs of invoices in memories
   */
  Name: string;
  /**
   * Max quantity of invoices allowed to have in memory
   */
  Quantity: number;
}

/**
 * Model to map the Margin setting
 */
export interface IMarginSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Represent a list with the SAP documents reference that indicates what is the acceptable margin in the item price
   */
  Margin: IMargin[];
}

/**
 * Represent the acceptable margin in item prices by document
 */
export interface IMargin {
  /**
   * Table of the document to validate the margin of the item price
   */
  Table: string;
  /**
   * Represent the label that will be show in the UI
   */
  Description: string;
  /**
   * The acceptable margin of item price
   */
  Margin: number;
}

/**
 * Model to map the PatternTypeahead setting
 */
export interface ITypeaheadPatternSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Represent the item info that will be show in the typeahead of items
   */
  ItemPattern: string;
  /**
   * Represent the business partner info that will be show in the typeahead of customers
   */
  BusinessPattern: number;
}

/**
 * Model to map the PatternTypeahead setting
 */
export interface IConfiguredFieldsSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates if the company manage directions
   */
  IsCompanyDirection: boolean;
  /**
   * Business partner mapped fields
   */
  Fields: IBusinessPartnersFields[]
}

/**
 * Represent the business partners fields that can be mapped to another fields in SAP
 */
export interface IBusinessPartnersFields {
  /**
   * The name of the field
   */
  Id: string;
  /**
   * The label that will be show in the UI
   */
  Description: string;
  /**
   * Represent the field name in Service layer models
   */
  NameSL: string;
  /**
   * The type of the field
   */
  FieldType: string;
  /**
   * The value that will be set to a Service layer field
   */
  Value: string;
  /**
   * Indicates if the field will be show in the business partner info or in business partner directions
   */
  IsObjDirection: boolean;
}

/**
 * Model to map the FieldPurchaseInvoice setting values
 */
export interface IFieldsPurchaseInvoiceSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates if the invoice type field is visible
   */
  DisplayTypeInvoice: boolean;

}

/**
 * Model to map Udf group setting
 */
export interface IUdfGroupSetting {
  /**
   * Indicates whether udfs groups are to be configured
   */
  ConfigureGroups: boolean
}

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
 * Represents the automatic printing validation settings for a company.
 */
export interface IValidateAutomaticPrintingsSetting {
  /**
   * The unique identifier of the company.
   */
  CompanyId: number;

  /**
   * A list of automatic printing validation rules.
   */
  Validate: IValidateAutomaticPrinting[];
}

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
 * Represents the validation settings for an automatic printing table.
 */
export interface IValidateAutomaticPrinting {
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

/*
*Model to map notifications authorizations
 */
export interface INotificationsDraftsSetting {
  /**
   * Id of the company where this values will be applied
   */
  CompanyId: number;
  /**
   * Indicates send email notifications
   */
  ActiveNotifications: boolean;
}

/**
 * Represents an expense entry with associated tax and company information.
 */
export interface IAutoWithholdingSetting {
  /**
   * Unique code identifying the expense type.
   */
  ExpenseCode: number;

  /**
   * Code representing the tax category applied to the expense (e.g., "IVA_EXE").
   */
  TaxCode: string;

  /**
   * Identifier for the company associated with the expense.
   */
  CompanyId: number;
}