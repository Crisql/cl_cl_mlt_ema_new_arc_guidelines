export enum EnvironmentType {
  Development = 'Development',
  Testing = 'Testing',
  Production = 'Production'
}

export enum UserPageTabIndexes {
  User,
  UserAssign
}

/**
 * Enum to identify report type
 */
export enum PrintFormat {
  SaleOffer,
  SaleOrder,
  VoucherCancellation,
  Invoices,
  PinPadInvoices,
  CreditNote,
  ReceivedPayment,
  CashClosing,
  ReprintSaleOffers,
  ReprintInvoices,
  ReprintSaleOrders,
  GoodsReceipt,
  GoodsIssue,
  GoodsReceiptPO,
  GoodsReturn,
  PurchaseOrder,
  APInvoice,
  InventoryTransferRequest,
  InventoryTransfer,
  OutgoingPayment,
  CancelPayment,
  ArDownPayment,
  PinpadDownPayment,
  ReprintArDownPayment,
  ReprintReserveInvoice,
  ReserveInvoice,
  DeliveryNotes,
  Preliminary,
  ReprintPreliminary,
  ReprintDeliveryNotes,
  ApDownPayment,
  PinpadApDownPayment,
  ReprintApDownPayment,
  PinpadAPInvoice,
  ReprintCreditNotes,
  ReprintTransferRequest,
  ReprintPurchaseOrder
}

/**
 * Represent code of settings
 */
export enum SettingCode {
  PrintFormat = 'PrintFormat',
  Account = 'Account',
  ValidateInventory = 'ValidateInventory',
  ReportManager = 'ReportManager',
  Route = 'Route',
  DefaultBusinessPartner = 'DefaultBusinessPartner',
  Decimal = 'Decimal',
  Payment = 'Payment',
  LineMode = 'LineMode',
  AdjustmentInventory = 'AdjustmentInventory',
  MemoryInvoice = 'MemoryInvoice',
  Margin = 'Margin',
  PatternTypeahead = 'PatternTypeahead',
  Points = 'Points',
  FieldsConfiguredSAP = 'FieldsConfiguredSAP',
  MobileAppConfiguration = 'MobileAppConfiguration',
  SchedulingConfiguration = 'SchedulingConfiguration',
  EventViewer = 'EventViewer',
  FieldsInvoice = 'FieldsInvoice',
  ShareFolder = 'ShareFolder',
  Recaptcha = 'Recaptcha',
  FESerieDocument = 'FESerieDocument',
  FieldsPurchaseInvoice = 'FieldsPurchaseInvoice',
  UdfGroup = 'UdfGroup',
  ValidateAttachments = 'ValidateAttachments',
  AuthorizationNotifications = 'AuthorizationNotifications',
  ValidateAutomaticPrinting = 'ValidateAutomaticPrinting',
  AutoWithholding = 'AutoWithholding'
}

/**
 * Enum get table name of document type
 */
export enum DocumentType {
  Quotations = 'OQUT',
  Orders = 'ORDR',
  Invoices = 'OINV',
  Purchase = 'OPDN',
  PurchaseOrder = 'OPOR',
  PurchaseReturns = 'ORPD',
  PurchaseInvoice = 'OPCH',
  IncomingPayments = 'ORCT',
  ArDownPayments = 'ODPI',
  DeliveryNotes = 'ODLN',
  Draft = 'ODRF',
  OutgoingPayment ='OVPM',
  APDownPayments = 'ODPO',
  CreditNotes = 'ORIN',
  WithholdingTaxInvoice = 'INV5'
}
/**
 * Enum get table code of document type
 */
export enum DocumentTypeCode
{
  IncomingPayments = 24,
  CreditNotes = 14,
  InvoicesFE = 13,
  InvoicesTE = -13,
  Items = 4,
  SalesOrders = 17,
  SalesQuotations = 23,
  BusinessPartners = 2,
  Supplier = -2,
  PurchaseInvoice = 18,
  OutgoingPayment = 46,
  GoodReceiptPO = 20,
  GoodReturn = 21,
  GoodReceipt = 59,
  GoodIssue = 60,
  Delivery = 15,
  PurchaseOrder = 22,
  ArDownPayment = 203,
  ApDownPayment = 204,
  Drafts = 112,
  InventoryTransferRequest = 1250000001,
  InventoryTransfer = 67
}

/**
 * Enum to preloaded document
 */
export enum PreloadedDocumentActions {
  EDIT = 'edit',
  COPY = 'copy',
  DUPLICATE = 'duplicate',
  CREATE_FROM_DRAFT = 'draft'
}

export enum TypeInvoices {
  INVOICE = 'Invoice',
  RESERVE_INVOICE = 'ReserveInvoice'
}

/**
 * Enum to identifier document origin
 */
export enum CopyFrom {
  OPOR = 22,
  OINV = 13,
  ODPI = 203,
  OQUT = 23,
  ORDR = 17,
  OPDN = 20,
  ORPD = 21,
  OPCH = 18,
  ODPO = 204
}

/**
 * Indicates how an item is managed in inventory: by serial number, batch number, or neither.
 */
export enum ItemSerialBatch {
  NA = 1,       // Not managed by serial or batch
  Serie,        // Managed by serial number
  Lote,         // Managed by batch number
}

/**
 * Defines the type of item: service or material.
 */
export enum ItemsClass {
  Service = '1',
  Material = '2'
}

/**
 * Indicates the view context where batches are used.
 */
export enum ViewBatches {
  FACTURACION = 1,             // Billing
  TRANSFER_INVENTORY = 2,      // Inventory transfer
  INVENTORY_ENTRY = 3,   // Inventory entry
  INVENTORY_OUTPUT = 4   // Inventory output
}

/**
 * Represents the current status of a route.
 */
export enum RouteStatus {
  INACTIVE,   // Not started
  ACTIVATED,  // Currently active
  FINISHED,   // Successfully completed
  CLOSED      // Manually or automatically closed
}

/**
 * Describes the type of route operation.
 */
export enum RouteType {
  ORDER,     // Sales order route
  DELIVERY   // Delivery route
}

/**
 * Specifies different types of route checkpoints.
 */
export enum RouteCheckTypes {
  DESTINATION,
  FAILED_EXIT,
  SUCCESS_EXIT,
  AUTOMATIC_POINT,
  ARRIVAL,
  NOT_LINKED_TO_ROUTE,
  ROUTE_START,
  END_OF_ROUTE
}

/**
 * Indicates the synchronization status of a document in the system.
 */
export enum DocumentSyncStatus {
  All = '',       // All statuses
  InQueue = 'Q',  // Waiting to be processed
  Processing = 'P',
  Errors = 'E',   // Failed to sync
  Success = 'S'   // Successfully synced
}

/**
 * Represents different levels of system events.
 */
export enum Event {
  All = "",           // All event types
  Information = "I",
  Success = "S",
  Warning = "W",
  Error = "E"
}

/**
 * Defines the types of documents that can be synchronized.
 */
export enum DocumentSyncTypes {
  All = '',
  SaleOrder = 'OR',
  SaleQuotation = 'OF',
  Invoice = 'IV',
  InvoiceWithPayment = 'IP',
  IncomingPayment = 'PA'
}

/**
 * Options available in a modal shown after a sales process.
 */
export enum ModalSalesInfo {
  ACEPT = 1,
  REIMPRIMIR = 2
}

/**
 * Title labels used in sales documents and UI.
 */
export enum Titles {
  Factura = 'Factura',
  Orden = 'Orden',
  Cotizacion = 'Cotización',
  NC = 'Nota de crédito',
  ArDownPayment = 'Anticipo',
  Entrega = 'Entrega',
  ReserveInvoice = 'Factura reserva',
  Draft = 'Documento preliminar',
  ApDownPayment = 'Factura anticipo',
  ApFactura = 'Factura proveedor'
}

/**
 * Defines the type of material in a bill of materials structure.
 */
export enum ListMaterial {
  iSalesTree = 'iSalesTree',
  iIngredient = 'iIngredient',
  iNotATree = 'iNotATree'
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

export enum BPMode {
  CREACION = 'Creacion',
  EDICION = 'Edicion'
}

export enum Address {
  BILL = 'bo_BillTo',
  SHIL = 'bo_ShipTo'
}

export enum LineStatus {
  bost_Close = 'bost_Close',
  bost_Open = 'bost_Open'
}

export enum PPStoredTransaction_State {
  StateType = 'CNL' //CANCEL
}

export enum PurchaseTypeDocuments {
  purchaseDeliveryNotes = 'PurchaseDeliveryNotes',
  purchaseInvoices = 'PurchaseInvoices',
  PurchaseOrders = 'PurchaseOrders',
  Draft = 'Draft',
  PurchaseDownPayments = 'PurchaseDownPayments',
  PurchaseReturns = 'PurchaseReturns'
}

/**
 * Enum to assign controller name
 */
export enum ControllerName {
  goodReceipt = 'PurchaseDeliveryNotes',
  order = 'PurchaseOrders',
  purchaseInvoice = 'PurchaseInvoices',
  Draft ='Draft',
  APDownPayments = 'PurchaseDownPayments',
  CreditNotes = 'CreditNotes',
  Invoices = 'Invoices',
  InventoryTransferRequests= 'InventoryTransferRequests',
  PurchaseReturns = 'PurchaseReturns',
  InventoryGenExits = 'InventoryGenExits',
  InventoryGenEntries = 'InventoryGenEntries',
  StockTransfers = 'StockTransfers'
}

/**
 * Object type serial
 */
export enum ObjectType {
  Items = 4,
  BusinessPartnerVendor = -2,
  BusinessPartnerCustomer = 2
}

/**
 * Enum to identify payment term
 */
export enum Payterm {
  Credit = 1,
  Counted
}

/**
 * Represents filter values per view.
 */
export enum ItemsFilterType {
  InvntItem = 'InvntItem',
  SellItem = 'SellItem',
  PrchseItem = 'PrchseItem'
}

/**
 * Represents type of device where the document was created
 */
export enum TypeDevice {
  MOVIL = 'M',
  WEB = 'W'
}

/**
 * Represents type recurrence activities
 */
export enum RecurrencePattern {
  rpNone = 'rpNone',
  rpDaily = 'rpDaily',
  rpWeekly = 'rpWeekly',
  rpMonthly = 'rpMonthly',
  rpAnnually = 'rpAnnually'
}

export enum BoYesNo{
  tYES = 'tYES',
  tNO = 'tNO'
}

/**
 * This enum represents object SAP
 */
export enum ObjectSAP{
  ODRF = 112,
  OITM = 4
}

/**
 * This enum represents the types of the option
 */
export enum SubOption{
  roByDate = 'roByDate',
  roByWeekDay = 'roByWeekDay'
}

/**
 * This enum represents the types of the option recurrences
 */
export enum EndType{
  etNoEndDate = 'etNoEndDate',
  etByCounter = 'etByCounter',
  etByDate = 'etByDate'
}

/**
 * This enum represents the types of the recurrence sequence
 */
export enum RecurrenceSequenceSpecifier{
  rsFirst = 'rsFirst',
  rsFourth = 'rsFourth',
  rsThird = 'rsThird',
  rsLast = 'rsLast',
  rsSecond = 'rsSecond'
}

/**
 * This enum represents the types of the series
 */
export enum SerieTypes{
  Offline = 1
}

/**
 * This enum represents the types recurrence
 */
export enum RecurrenceDayOfWeek {
  rdowSun = 0,
  rdowMon = 1,
  rdowTue = 2,
  rdowWed = 3,
  rdowThu = 4,
  rdowFri = 5,
  rdowSat = 6,
  rdowDay = 7,
  rdowWeekDay = 8,
  rdowWeekendDay = 9
}

/*
 * This enum represents the keys of menu nodes
 */
export enum MenuNodesKey{
  Reports = 'I-43',
  Logout = 'J-44',
  ReportsCategory = 'I'
}

/**
 * Represent type of view sales or purchase
 */
export enum ViewType {
  Sales = "Sales",
  Purchase = "Purchase"
}


/**
 * Represent permission to edit document dates
 */
export enum PermissionEditDocumentsDates {
  //Quotations
  SalesDocumentsQuotationsChangeDocDate = "Sales_Documents_Quotations_ChangeDocDate",
  SalesDocumentsQuotationsChangeDocDueDate = "Sales_Documents_Quotations_ChangeDocDueDate",
  SalesDocumentsQuotationsChangeTaxDate = "Sales_Documents_Quotations_ChangeTaxDate",

  //Orders
  SalesDocumentsOrdersChangeDocDate = "Sales_Documents_Orders_ChangeDocDate",
  SalesDocumentsOrdersChangeDocDueDate = "Sales_Documents_Orders_ChangeDocDueDate",
  SalesDocumentsOrdersChangeTaxDate = "Sales_Documents_Orders_ChangeTaxDate",

  //Delivery
  SalesDocumentsDeliveryChangeDocDate = "Sales_Documents_Delivery_ChangeDocDate",
  SalesDocumentsDeliveryChangeDocDueDate = "Sales_Documents_Delivery_ChangeDocDueDate",
  SalesDocumentsDeliveryChangeTaxDate = "Sales_Documents_Delivery_ChangeTaxDate",

  //Down Payments
  SalesDocumentsDownPaymentsChangeDocDate = "Sales_Documents_DownPayments_ChangeDocDate",
  SalesDocumentsDownPaymentsChangeDocDueDate = "Sales_Documents_DownPayments_ChangeDocDueDate",
  SalesDocumentsDownPaymentsChangeTaxDate = "Sales_Documents_DownPayments_ChangeTaxDate",

  //Invoice
  SalesDocumentsInvoicesChangeDocDate = "Sales_Documents_Invoices_ChangeDocDate",
  SalesDocumentsInvoicesChangeDocDueDate = "Sales_Documents_Invoices_ChangeDocDueDate",
  SalesDocumentsInvoicesChangeTaxDate = "Sales_Documents_Invoices_ChangeTaxDate",

  //Reserve invoice
  SalesDocumentsReserveInvoiceChangeDocDate = "Sales_Documents_ReserveInvoice_ChangeDocDate",
  SalesDocumentsReserveInvoiceChangeDocDueDate = "Sales_Documents_ReserveInvoice_ChangeDocDueDate",
  SalesDocumentsReserveInvoiceChangeTaxDate = "Sales_Documents_ReserveInvoice_ChangeTaxDate",

  //Credit memo
  SalesDocumentsCreditMemoChangeDocDate = "Sales_Documents_CreditMemo_ChangeDocDate",
  SalesDocumentsCreditMemoChangeDocDueDate = "Sales_Documents_CreditMemo_ChangeDocDueDate",
  SalesDocumentsCreditMemoChangeTaxDate = "Sales_Documents_CreditMemo_ChangeTaxDate",

  //Purchase order
  PurchasesDocumentsOrderChangeDocDate = "Purchases_Documents_Order_ChangeDocDate",
  PurchasesDocumentsOrderChangeDocDueDate = "Purchases_Documents_Order_ChangeDocDueDate",
  PurchasesDocumentsOrderChangeTaxDate = "Purchases_Documents_Order_ChangeTaxDate",

  //Good receipt
  PurchasesDocumentsGoodReceiptChangeDocDate = "Purchases_Documents_GoodReceipt_ChangeDocDate",
  PurchasesDocumentsGoodReceiptChangeDocDueDate = "Purchases_Documents_GoodReceipt_ChangeDocDueDate",
  PurchasesDocumentsGoodReceiptChangeTaxDate = "Purchases_Documents_GoodReceipt_ChangeTaxDate",

  //Return Good
  PurchasesDocumentsReturnGoodChangeDocDate = "Purchases_Documents_ReturnGood_ChangeDocDate",
  PurchasesDocumentsReturnGoodChangeDocDueDate = "Purchases_Documents_ReturnGood_ChangeDocDueDate",
  PurchasesDocumentsReturnGoodChangeTaxDate = "Purchases_Documents_ReturnGood_ChangeTaxDate",

  //Purchase invoice
  PurchasesDocumentsInvoiceChangeDocDate = "Purchases_Documents_Invoice_ChangeDocDate",
  PurchasesDocumentsInvoiceChangeDocDueDate = "Purchases_Documents_Invoice_ChangeDocDueDate",
  PurchasesDocumentsInvoiceChangeTaxDate = "Purchases_Documents_Invoice_ChangeTaxDate",

  //Purchase invoice
  PurchasesDocumentsDownPaymentsChangeDocDate = "Purchases_Documents_DownPayments_ChangeDocDate",
  PurchasesDocumentsDownPaymentsChangeDocDueDate = "Purchases_Documents_DownPayments_ChangeDocDueDate",
  PurchasesDocumentsDownPaymentsChangeTaxDate = "Purchases_Documents_DownPayments_ChangeTaxDate",

  //Inventory entry
  InventoryDocumentsEntryChangeDocDate = "Inventory_Documents_Entry_ChangeDocDate",
  InventoryDocumentsEntryChangeDocDueDate = "Inventory_Documents_Entry_ChangeDocDueDate",
  InventoryDocumentsEntryChangeTaxDate = "Inventory_Documents_Entry_ChangeTaxDate",

  //Inventory output
  InventoryDocumentsOutputChangeDocDate = "Inventory_Documents_Output_ChangeDocDate",
  InventoryDocumentsOutputChangeDocDueDate = "Inventory_Documents_Output_ChangeDocDueDate",
  InventoryDocumentsOutputChangeTaxDate = "Inventory_Documents_Output_ChangeTaxDate",

  //Transfer request
  InventoryDocumentsTransferRequestChangeDocDate = "Inventory_Documents_TransferRequest_ChangeDocDate",
  InventoryDocumentsTransferRequestChangeDocDueDate = "Inventory_Documents_TransferRequest_ChangeDocDueDate",
  InventoryDocumentsTransferRequestChangeTaxDate = "Inventory_Documents_TransferRequest_ChangeTaxDate",
  /**
   * Enum value representing the permission to create a draft for inventory transfer requests.
   */
  InventoryDocumentsTransferRequestCreateDraft = "Inventory_Documents_TransferRequest_CreateDraft",

  //Stock transfer
  InventoryDocumentsStockTransferChangeDocDate = "Inventory_Documents_StockTransfer_ChangeDocDate",
  InventoryDocumentsStockTransferChangeTaxDate = "Inventory_Documents_StockTransfer_ChangeTaxDate",
  /**
   * Enum value representing the permission to create a draft for stock transfers.
   */
  InventoryDocumentsStockTransferCreateDraft = "Inventory_Documents_StockTransfer_CreateDraft",
}

export enum DocumentTypes {
  Quotations = 'OQUT',
  Orders = 'ORDR',
  Invoices = 'OINV',
  Purchase = 'OPDN',
  PurchaseOrder = 'OPOR',
  PurchaseReturns = 'ORPD',
  PurchaseInvoice = 'OPCH',
  InventoryEntry = 'OIGN',
  InventoryOuput = 'OIGE',
  ArDownPayments = 'ODPI',
  DeliveryNotes = 'ODLN',
  Draft = 'ODRF',
  APDownPayments = 'ODPO',
  CreditNotes = 'ORIN',
  MerchantOuput = 'ORPD',
  Transfer = 'OWTQ',
  TransferRequest = 'OWTR'
}

/**
 * Enumeración que define los diferentes permisos de visualización de columnas.
 */
export enum PermissionViewColumnsItems {
  // Quotations
  /**
   * Ver Centro de Costos en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewCCost = "W_Sales_Documents_Quotations_ViewCCost",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewLastPurchasePrice = "W_Sales_Documents_Quotations_ViewLastPurchasePrice",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewTaxOnly = "W_Sales_Documents_Quotations_ViewTaxOnly",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewCurrencyLines = "W_Sales_Documents_Quotations_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewDistNumber = "W_Sales_Documents_Quotations_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewUoMEntry = "W_Sales_Documents_Quotations_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewBinCode = "W_Sales_Documents_Quotations_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Cotizaciones
   */
  Sales_Documents_Quotations_ViewVATLiable = "W_Sales_Documents_Quotations_ViewVATLiable",

  // Orders
  /**
   * Ver Centro de Costos en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewCCost = "W_Sales_Documents_Orders_ViewCCost",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewTaxOnly = "W_Sales_Documents_Orders_ViewTaxOnly",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewLastPurchasePrice = "W_Sales_Documents_Orders_ViewLastPurchasePrice",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewCurrencyLines = "W_Sales_Documents_Orders_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewDistNumber = "W_Sales_Documents_Orders_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewUoMEntry = "W_Sales_Documents_Orders_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewBinCode = "W_Sales_Documents_Orders_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Órdenes
   */
  Sales_Documents_Orders_ViewVATLiable = "W_Sales_Documents_Orders_ViewVATLiable",

  // Invoices
  /**
   * Ver Centro de Costos en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewCCost = "W_Sales_Documents_Invoices_ViewCCost",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewTaxOnly = "W_Sales_Documents_Invoices_ViewTaxOnly",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewLastPurchasePrice = "W_Sales_Documents_Invoices_ViewLastPurchasePrice",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewCurrencyLines = "W_Sales_Documents_Invoices_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewDistNumber = "W_Sales_Documents_Invoices_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewUoMEntry = "W_Sales_Documents_Invoices_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewBinCode = "W_Sales_Documents_Invoices_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Facturas
   */
  Sales_Documents_Invoices_ViewVATLiable = "W_Sales_Documents_Invoices_ViewVATLiable",

  // ReserveInvoice
  /**
   * Ver Centro de Costos en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewCCost = "W_Sales_Documents_ReserveInvoice_ViewCCost",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewTaxOnly = "W_Sales_Documents_ReserveInvoice_ViewTaxOnly",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewLastPurchasePrice = "W_Sales_Documents_ReserveInvoice_ViewLastPurchasePrice",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewCurrencyLines = "W_Sales_Documents_ReserveInvoice_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewDistNumber = "W_Sales_Documents_ReserveInvoice_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewUoMEntry = "W_Sales_Documents_ReserveInvoice_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewBinCode = "W_Sales_Documents_ReserveInvoice_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Facturas de Reserva
   */
  Sales_Documents_ReserveInvoice_ViewVATLiable = "W_Sales_Documents_ReserveInvoice_ViewVATLiable",

  // DownPayments
  /**
   * Ver Centro de Costos en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewCCost = "W_Sales_Documents_DownPayments_ViewCCost",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewTaxOnly = "W_Sales_Documents_DownPayments_ViewTaxOnly",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewLastPurchasePrice = "W_Sales_Documents_DownPayments_ViewLastPurchasePrice",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewCurrencyLines = "W_Sales_Documents_DownPayments_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewDistNumber = "W_Sales_Documents_DownPayments_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewUoMEntry = "W_Sales_Documents_DownPayments_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewBinCode = "W_Sales_Documents_DownPayments_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Pagos Adelantados
   */
  Sales_Documents_DownPayments_ViewVATLiable = "W_Sales_Documents_DownPayments_ViewVATLiable",

  // Delivery
  /**
   * Ver Centro de Costos en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewCCost = "W_Sales_Documents_Delivery_ViewCCost",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewTaxOnly = "W_Sales_Documents_Delivery_ViewTaxOnly",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewLastPurchasePrice = "W_Sales_Documents_Delivery_ViewLastPurchasePrice",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewCurrencyLines = "W_Sales_Documents_Delivery_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewDistNumber = "W_Sales_Documents_Delivery_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewUoMEntry = "W_Sales_Documents_Delivery_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewBinCode = "W_Sales_Documents_Delivery_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Entregas
   */
  Sales_Documents_Delivery_ViewVATLiable = "W_Sales_Documents_Delivery_ViewVATLiable",

  // CreditMemo
  /**
   * Ver Centro de Costos en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewCCost = "W_Sales_Documents_CreditMemo_ViewCCost",

  /**
   * Ver Solo Impuestos en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewTaxOnly = "W_Sales_Documents_CreditMemo_ViewTaxOnly",

  /**
   * Ver Último Precio de Compra en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewLastPurchasePrice = "W_Sales_Documents_CreditMemo_ViewLastPurchasePrice",

  /**
   * Ver Líneas de Moneda en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewCurrencyLines = "W_Sales_Documents_CreditMemo_ViewCurrencyLines",

  /**
   * Ver Número de Distribución en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewDistNumber = "W_Sales_Documents_CreditMemo_ViewDistNumber",

  /**
   * Ver Entrada de UoM en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewUoMEntry = "W_Sales_Documents_CreditMemo_ViewUoMEntry",

  /**
   * Ver Código de Bin en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewBinCode = "W_Sales_Documents_CreditMemo_ViewBinCode",

  /**
   * Ver Sujeto a IVA en Documentos de Ventas - Nota de Crédito
   */
  Sales_Documents_CreditMemo_ViewVATLiable = "W_Sales_Documents_CreditMemo_ViewVATLiable",
}

/**
 * Enumeración que define los diferentes permisos de visualización de columnas para compras.
 */
export enum PermissionViewColumnsItemsPurchases {
  // Orders
  /**
   * Ver Sujeto a IVA en Documentos de Compras - Órdenes
   */
  Purchases_Documents_Order_ViewVATLiable= "W_Purchases_Documents_Order_ViewVATLiable",

  // ReturnGood
  /**
   * Ver Sujeto a IVA en Documentos de Compras - Devolución de Mercancía
   */
  Purchases_Documents_ReturnGood_ViewVATLiable = "W_Purchases_Documents_ReturnGood_ViewVATLiable",

  // Invoice
  /**
   * Ver Sujeto a IVA en Documentos de Compras - Factura
   */
  Purchases_Documents_Invoice_ViewVATLiable = "W_Purchases_Documents_Invoice_ViewVATLiable",

  // GoodReceipt
  /**
   * Ver Sujeto a IVA en Documentos de Compras - Recepción de Mercancía
   */
  Purchases_Documents_GoodReceipt_ViewVATLiable = "W_Purchases_Documents_GoodReceipt_ViewVATLiable",

  // DownPayments
  /**
   * Ver Sujeto a IVA en Documentos de Compras - Pagos Adelantados
   */
  Purchases_Documents_DownPayments_ViewVATLiable = "W_Purchases_Documents_DownPayments_ViewVATLiable",
}

/**
 * Enumeración que define los diferentes permisos de visualización de boton de preliminar.
 */
export enum PermissionValidateDraft {
  //Quotations
  /**
   * Ver boton de preliminares en Documentos de Ventas - Cotizaciones
   */
  SalesDocumentsQuotationsCreateDraft = "Sales_Documents_Quotations_CreateDraft",

  //Orders
  /**
   * Ver boton de preliminares en Documentos de Ventas - Ordenes
   */
  SalesDocumentsOrdersCreateDraft = "Sales_Documents_Order_CreateDraft",

  //Invoice
  /**
   * Ver boton de preliminares en Documentos de Ventas - Facturas
   */
  SalesDocumentsInvoicesCreateDraft = "Sales_Documents_Invoice_CreateDraft",

  //Reserve invoice
  /**
   * Ver boton de preliminares en Documentos de Ventas - Factura Reserva
   */
  SalesDocumentsReserveInvoiceCreateDraft = "Sales_Documents_ReserveInvoice_CreateDraft",

  //Purchase order
  /**
   * Ver boton de preliminares en Documentos de Compras - Orden
   */
  PurchasesDocumentsCreateDraft = "Purchases_Documents_Order_CreateDraft",

  //Purchase invoice
  /**
   * Ver boton de preliminares en Documentos de Compras - Factura proveedor
   */
  PurchasesDocumentsInvoiceCreateDraft  = "Purchases_Documents_Invoice_CreateDraft",

  //Purchase DownPayments
  /**
   * Ver boton de preliminares en Documentos de Compras - Factura anticipos
   */
  PurchasesDocumentsDownPaymentsCreateDraft  = "Purchases_Documents_DownPayments_CreateDraft",

}
