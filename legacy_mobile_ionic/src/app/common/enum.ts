/** 
 * Defines the different types of business documents. 
 */
export enum DocumentType {
  CreditInvoice = 1,
  AccountPayment = 2,
  ReserveInvoice = 3,
  SaleOrder = 4,
  CashInvoice = 5,
  IncommingPayment = 6,
  SaleOffer = 8,
  BusinessPartner = 9,
  Delivery = 10,
  CreditNotes = 12,
  TransferRequest = 13,
  InventoryTransfer = 14,
  CashReserveInvoice = 15,
  Draft = 16,
  CashDownInvoice = 17,
  CreditDownInvoice = 18
}

/** 
 * Represents transaction types associated with documents. 
 */
export enum TransactionType {
  BusinessPartner = "BusinessPartner",
  CreditInvoice = "CreditInvoice",
  AccountPayment = "AccountPayment",
  ReserveInvoice = "ReserveInvoice",
  SaleOrder = "SaleOrder",
  CashInvoice = "CashInvoice",
  IncommingPayment = "IncommingPayment",
  SaleOffer = "SaleOffer",
  Delivery = "Delivery",
  CreditNotes = "CreditNotes",
  DownInvoice = "DownInvoice"
}

/** 
 * Numbering series used to categorize and track documents. 
 */
export enum NumberingSeries {
  Oferta = 11,
  Orden = 12,
  FacturaFE = 13,
  FacturaTE = -13,
  FacturaReservaFE = 15,
  FacturaReservaTE = 16,
  PagoRecibido = 17,
  SocioNegocios = 18,
  Entregas = 19
}

/** 
 * System configurations for geo-validation and route management. 
 */
export enum Geoconfigs {
  MultipleChecks = 1,
  DocumentCheck = 2,
  FarFromLocationCheck = 3,
  CreateBPActive = 4,
  ShipRoutes = 5,
  BillRoutes = 6,
  AlwaysDownloadRoute = 7,
  RouteAdmin = 8,
  CreateDocumentOutOfRange = 9
}

/** 
 * Synchronization status for route history. 
 */
export enum RouteHistoryStatus {
  Synchronized,
  Unsynchronized
}

/** 
 * Types of checks used for validations and route control. 
 */
export enum CheckType {
  CheckOutFail = 0,
  CheckOutSuccess = 1,
  CheckAuto = 2,
  CheckCancel = 3,
  CheckIn = 4,
  CheckNoApply = 5,
  CheckOut = 6,
  DocumentCheck = 7,
  RouteStartCheck = 8,
  RouteFinishCheck = 9
}

/** 
 * Types of discounts applied to business partners and items. 
 */
export enum DiscountsType {
  BP = 1,
  ItemGroup,
  BPGroupXItemGroup,
  BPGroupXItem,
  BPXItemGroup,
  BPXItem,
  BPXItemFamily,
  BlanketAgreements
}

/** 
 * Types of addresses for business partners. 
 */
export enum AddressType {
  ShipTo = 'bo_ShipTo',
  BillTo = 'bo_BillTo'
}

/** 
 * Status of a sales or delivery route. 
 */
export enum RouteStatus {
  Inactive = 0,
  Active = 1,
  Finished = 2,
  Closed = 3,
  NotStarted = 4
}

/** 
 * Supported printing formats. 
 */
export enum SupportedPrintingType {
  ZPL = 1,
  PDF = 2
}

/** 
 * Types of alerts or notifications. 
 */
export enum AlertType {
  INFO = 'info',
  QUESTION = 'question',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

/** 
 * Types of log events. 
 */
export enum LogEvent {
  INFO,
  SUCCESS,
  WARNING,
  ERROR
}

/** 
 * Types of calculation methods. 
 */
export enum CalculationType {
  CALCULATED,
  ESTIMATED
}

/** 
 * Boolean values represented as Yes/No. 
 */
export enum BoYesNoEnum {
  tNO,
  tYES
}

/** 
 * Indicates if batch or serial numbers are required. 
 */
export enum BatchSerial {
  Y,
  N
}

/**
 * Enum representing SAP Business One object types.
 * Each value corresponds to an internal object type code used in SAP.
 */
export enum BoObjectTypes {
  /** Sales Orders (ORDR) */
  oOrders = 17,

  /** Sales Quotations (OQUT) */
  oQuotations = 23,

  /** A/R Invoices (OINV) */
  oInvoices = 13,

  /** Incoming Payments (ORCT) */
  oIncomingPayments = 24,

  /** Delivery Notes (ODLN) */
  oDeliveryNotes = 15,

  /** Business Partner - Customer (OCRD) */
  BusinessPartnerCustomer = 2,

  /** Item Master Data (OITM) */
  Item = 4
}

/** 
 * Represents the status of a business object. 
 */
export enum BoStatus {
  bost_Open = 0,
  bost_Close = 1,
  bost_Paid = 2,
  bost_Delivered = 3
}

/**
 * This enum represent the Pre Line status
 */
export enum PreLineStatus{
    bost_Open = 'O',
    bost_Close = 'C',
}

/**
 * This enum represent the Line status
 */
export enum LineStatus{
    bost_Open = 'bost_Open',
    bost_Close = 'bost_Close',
}

/**
 * This enum bonification
 */
export enum Bonification{
    YES = 'tYES',
    NO = 'tNO'
}

/**
 * This enum Pre bonification
 */
export enum PreBonification{
    YES = 'Y',
    NO = 'N'
}

/** 
 * Defines whether a transaction is executed offline or online. 
 */
export enum LogTransactionType {
  Offline,
  Online
}

/** 
 * Represents referenced business object types. 
 */
export enum ReferencedObjectTypeEnum {
  rot_SalesInvoice = 13,
  rot_SalesOrder = 17,
  rot_SalesQuotation = 23,
  rot_DeliveryNotes = 15
}

/** 
 * Types of link references between business objects. 
 */
export enum LinkReferenceTypeEnum {
  lrt_00
}

/** 
 * Defines query types when retrieving items. 
 */
export enum ItemQueryType {
  SYNCHRONIZATION,
  ALL_ITEMS
}

/** 
 * Local storage variable keys used by the application. 
 */
export enum LocalStorageVariables {
  Lang = 'Lang',
  IsBackingUpDocuments = 'isBackingUpDocuments',
  Session = 'Session',
  WhCode = 'WhCode',
  PermList = 'permList',
  UserId = 'UserId',
  SessionInfo = 'SessionInfo',
  IsModalRaised = 'isModalRaised',
  IsOnSyncMode = 'isOnSyncMode',
  DBName = 'DBName',
  SyncDetails = 'SyncDetails',
  ApiURL = 'ApiURL',
  ApiKey = 'API_KEY',
  PreselectedCustomerCardCode = 'PreselectedCustomerCardCode',
  CardCode = 'cardCode',
  ActiveRouteDestination = 'ActiveRouteDestination',
  BluetoothPrinter = 'bluetoothPrinter',
  UserAssignment = 'UserAssignment',
  SelectedCompany = 'SelectedCompany',
  BusinessPartner = 'BusinessPartner',
  DocumentToEdit = 'DocumentToEdit',
  IsEditionMode = 'isEditionMode',
  IsActionCopyTo = 'isActionCopyTo',
  IsActionDuplicate = 'isActionDuplicate',
  DocumentType = 'DocumentType',
  MobileAppConfiguration = "MobileAppConfiguration",
  IsUnauthorized = 'IsUnauthorized',
  IsLoginLastPath = 'IsLoginLastPath',
  IsActionDraft = 'isActionDraft'
}

/** 
 * Keys used to publish variables within the system. 
 */
export enum PublisherVariables {
  LoggedUser = 'loggedUser',
  DbName = 'dbName',
  Permissions = 'perms',
  BusinessPartnerMasterData = 'BusinessPartnerMasterData'
}

/**
 * This enum represents the type setting in table Settings
 */
export enum SettingCodes {
     /** Code used to enable or configure speed test functionality. */
    SpeedTest = 'SpeedTest',

    /** Google API key used for services such as maps or location. */
    GoogleApiKey = 'GoogleApiKey',

    /** Settings related to scheduling features (e.g., planned visits or tasks). */
    Scheduling = 'Scheduling',

    /** Flag indicating whether to use the SAP Service Layer for operations. */
    useServiceLayer = 'useServiceLayer',

    /** Flag to enable or disable inventory validation during operations. */
    ValidateInventory = 'ValidateInventory',

    /** URL used to validate or consult tax registry (padrón). */
    UrlPadron = 'UrlPadron',

    /** List or configuration of documents that do NOT require bin allocations. */
    NotBinAllocationsDocs = 'NotBinAllocationsDocs',

    /** List or configuration of documents that do NOT require serial number handling. */
    NotSerialNumberDocs = 'NotSerialNumberDocs',

    /** Settings for managing reports generated or consumed by the system. */
    ReportManager = 'ReportManager',

    /** Configuration for custom SAP fields mapped to the app. */
    FieldsConfiguredSAP = 'FieldsConfiguredSAP',

    /** Decimal precision or formatting settings for numeric values. */
    Decimal = 'Decimal',

    /** Enables or configures event logging and viewer for diagnostics. */
    EventViewer = 'EventViewer',

    /** Main configuration object for mobile application behavior. */
    MobileAppConfiguration = "MobileAppConfiguration",

    /** Determines the mode for handling document lines (e.g., single-line vs. multi-line input). */
    LineMode = "LineMode",

    /** Default business partner code used when none is selected by the user. */
    DefaultBusinessPartner = "DefaultBusinessPartner",

    /** Flag to enable validation of document attachments before processing. */
    ValidateAttachments = 'ValidateAttachments',

    /** UDFs of offline FE fields */
    UdfsFEOffline = 'UdfsFEOffline',
}

/** 
 * Represents the types of elements that can be updated or modified in the system. 
 */
export enum ChangeElement {
  BusinessPartners = 'BusinessPartners',
  Items = 'Items',
  Prices = 'Prices',
  Discounts = 'Discounts',
  Agreements = 'Agreements',
  PriceLists = 'PriceLists',
  BillOfMaterials = 'BillOfMaterials'
}

/** 
 * Defines the origin from which routes can be synchronized. 
 */
export enum SynchronizedRoutesFrom {
  Menu,
  Refresher,
  SyncPage
}

/**
 * Enum representing the categories of UDFs (User-Defined Fields) by SAP object table.
 */
export enum UdfsCategory {
    /**  Business Partner (Customer/Vendor)*/
  OCRD = 'OCRD',
   /** Inventory Transfer Request*/
  OWTQ = 'OWTQ',
   /** Inventory Transfer*/
  OWTR = 'OWTR',
   /** Item Master Data*/
  OITM = 'OITM' 
}

/**
 * The enum represents the name of the endpoint to which you are going to connect on the server
 */
export enum Controller{
    Quotations = 'Quotations',
    Orders = 'Orders',
    Invoices = 'Invoices',
    ReserveInvoices = 'GetReserveInvoice',
    DeliveryNotes = 'DeliveryNotes',
    CreditNotes = 'CreditNotes',
    /**
     * Used to indicate the controller to use in case of a draft
     */
    Draft = 'Draft',

    /**
     * Used to indicate the controller to use in case of an DownPayment
     */
    DownPayment = 'DownPayments',
}

/**
 * The enum represents the payment methods
 */
export enum MethodPayment{
    Cash = 1,
    Card = 2,
    Transfer = 3
}

/**
 * This enum is used to say for warehouse is location activate
 */
export enum BinActivatedWarehouse{
    Yes= 'Y',
    No = 'N'
}

/**
 * This enum is used to data headers
 */
export enum HeadersData{
    RecordsCount = 'Cl-Sl-Pagination-Records-Count'
}

/**
 * This enum represent types de documents for payment
 */
export enum TypeInvoiceToPayment{
    Invoice = 'it_Invoice',
    DownPayment = 'it_DownPayment',
    Factura = 'Factura',
    Anticipo = 'Anticipo'
}

/**
 * This enum is used to filter items
 */
export enum ViewType{
    SellItem = 'SellItem'
}

/**
 * State of Business parners
 */
export enum Frozen{
    Yes = 'tYES',
    No = 'tNO'
}

/**
 * This enum represent el base type when to copy documents
 */
export enum CopyFrom {
    OPOR = 22,
    OINV = 13,
    ODPI = 203,
    OQUT = 23,
    ORDR = 17,
    ODLN = 15
}

/** 
 * Defines the types of devices supported by the application. 
 */
export enum TypeDevice {
  MOVIL = 'M',
  WEB = 'W'
}

/**
 * Represent the types of series in the application
 */
export enum SeriesTypes {
    /**
     * Indicates that the series is only for online
     */
    Online,
    /**
     * Indicates that the series is only for offline
     */
    Offline,
    /**
     * Indicates that the series is for online and offline
     */
    Mixed
}

/**
 * Represent the status of the offline documents when they are synchronized
 */
export enum DocumentSyncStatus {
    /**
     * Indicates that the documents is waiting to be synchronized
     */
    InQueue = "Q",
    /**
     * Indicates that the document is being processing by the service
     */
    Processing = "P",
    /**
     * Indicates that the document has errors in its synchronization or service processing
     */
    Errors = "E",
    /**
     * Indicates that the document was successful created in SAP
     */
    Success = "S",
    /**
     * Indicates that the documents was not stores in the remote database
     */
    NotSynchronized = 'N',
    /**
     * Indicates that the document was taken by the service
     */
    Taken = 'T'
}

/**
 * Represent the acronyms of the documents types
 */
export enum DocumentTypeAcronyms {
    SaleOrder = "OR",
    SaleQuotation = "OF",
    Invoice = "IV",
    InvoiceWithPayment = "IP"
}

/** 
 * Represents SAP document type codes used in sales and delivery processes. 
 */
export enum DocumentTypeName {
  SaleOrder = "ORDR",
  SaleQuotation = "OQUT",
  Invoice = "OINV",
  DeliveryNote = "ODLN"
}

/**
 * Enum representing sub-filters for document types.
 */
export enum DocumentTypeSubFilter {
    /**
     * Represents a reserve invoice with a sub-filter value of -13.
     */
    ReserveInvoice = -13,

    /**
     * Represents a sale order with a sub-filter value of 17.
     */
    SaleOrder = 17,

    /**
     * Represents a cash invoice with a sub-filter value of 13.
     */
    CashInvoice = 13,

    /**
     * Represents a sale offer with a sub-filter value of 23.
     */
    SaleOffer = 23,

    /**
     * Represents a delivery with a sub-filter value of 15.
     */
    Delivery = 15,

    /**
     * Represents credit notes with a sub-filter value of 14.
     */
    CreditNotes = 14,
}

/**
 * Enum to identify payment invoices
 */
export enum PaymentInvoiceType {
    it_Invoice = 'it_Invoice',
    it_DownPayment = 'it_DownPayment',
    it_PurchaseInvoice = 'it_PurchaseInvoice',
    it_PurchaseDownPayment = 'it_PurchaseDownPayment'
}

/**
 * Enumeration of SAP document types using their corresponding table names.
 */
export enum DocumentSAPTypes {
  /**
   * Sales Quotations (OQUT)
   */
  Quotations = 'OQUT',

  /**
   * Sales Orders (ORDR)
   */
  Orders = 'ORDR',

  /**
   * A/R Invoices (OINV)
   */
  Invoices = 'OINV',

  /**
   * Goods Receipt PO (OPDN)
   */
  Purchase = 'OPDN',

  /**
   * Purchase Orders (OPOR)
   */
  PurchaseOrder = 'OPOR',

  /**
   * Purchase Returns (ORPD)
   */
  PurchaseReturns = 'ORPD',

  /**
   * A/P Invoices (OPCH)
   */
  PurchaseInvoice = 'OPCH',

  /**
   * Inventory Goods Receipt (OIGN)
   */
  InventoryEntry = 'OIGN',

  /**
   * Inventory Goods Issue (OIGE)
   */
  InventoryOuput = 'OIGE',

  /**
   * A/R Down Payments (ODPI)
   */
  ArDownPayments = 'ODPI',

  /**
   * Delivery Notes (ODLN)
   */
  DeliveryNotes = 'ODLN',

  /**
   * Draft Documents (ODRF)
   */
  Draft = 'ODRF',

  /**
   * A/P Down Payments (ODPO)
   */
  APDownPayments = 'ODPO',

  /**
   * Credit Notes (ORIN)
   */
  CreditNotes = 'ORIN',

  /**
   * Goods Return Request or Merchant Output (ORPD)
   */
  MerchantOuput = 'ORPD',

  /**
   * Inventory Transfer Request (OWTQ)
   */
  Transfer = 'OWTQ',

  /**
   * Inventory Transfer (OWTR)
   */
  TransferRequest = 'OWTR'
}