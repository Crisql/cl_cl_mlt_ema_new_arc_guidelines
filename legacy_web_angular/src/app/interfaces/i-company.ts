import {IBaseEntity} from "./i-base-entity";

/**
 * Represent a base info of a company
 */
export interface ICompany extends IBaseEntity {
  /**
   * The name of the company
   */
  Name: string;
  /**
   * The code of the database
   */
  DatabaseCode: string;
  /**
   * Represent a reference to a connection info that will be use to make Service layer requests
   */
  ConnectionId: number;
}


/**
 * Represent a model of print formats to save
 */
export interface IPrintFormatFile {
  /**
   * Sale offer file
   */
  SaleOffer: File;
  /**
   * Sale order file
   */
  SaleOrder: File;
  /**
   * Voucher cancellation file
   */
  VoucherCancellation: File;
  /**
   * Invoices file
   */
  Invoices: File;
  /**
   * PinPad invoices file
   */
  PinPadInvoices: File;
  /**
   * Credit notes file
   */
  CreditNote: File;
  /**
   * Incomming payments file
   */
  ReceivedPayment: File;
  /**
   * Cash closing file
   */
  CashClosing: File;
  /**
   * Reprint sale offers file
   */
  ReprintSaleOffers: File;
  /**
   * Reprint invoices file
   */
  ReprintInvoices: File;
  /**
   * Reprint sale orders file
   */
  ReprintSaleOrders: File;
  /**
   * Good receipt file
   */
  GoodsReceipt: File;
  /**
   * Good issue file
   */
  GoodsIssue: File;
  /**
   * Good receipt PO file
   */
  GoodsReceiptPO: File;
  /**
   * Goods return file
   */
  GoodsReturn: File;
  /**
   * Purchase order file
   */
  PurchaseOrder: File;
  /**
   * AP invoice file
   */
  APInvoice: File;
  /**
   * Inventory transfer request file
   */
  InventoryTransferRequest: File;
  /**
   * Inventory transfer file
   */
  InventoryTransfer: File;
  /**
   * Outgoing payment file
   */
  OutgoingPayment: File;
  /**
   * Cancel payment file
   */
  CancelPayment: File;
  /**
   * Ar down payment file
   */
  ArDownPayment: File;
  /**
   * PinPad down payment file
   */
  PinpadDownPayment: File;
  /**
   * Reprint Ar down payment file
   */
  ReprintArDownPayment: File;
  /**
   * Reprint reserve invoice file
   */
  ReprintReserveInvoice: File;
  /**
   * Reserve invoice file
   */
  ReserveInvoice: File;
  /**
   * Delivery notes file
   */
  DeliveryNotes: File;
  /**
   * Draft documents file
   */
  Preliminary: File;
  /**
   * Reprint draft documents file
   */
  ReprintPreliminary: File;

  /**
   * Reprint preliminary documents file
   */
  ReprintDeliveryNotes: File;
  /**
   * ApDownPayment documents file
   */
  ApDownPayment: File
  /**
   * ApDownPayment documents file
   */
  PinpadApDownPayment: File;
  /**
   * Pinpad APInvoice documents file
   */
  PinpadAPInvoice: File;

  /**
   * Reprint downpayment documents file
   */
  ReprintApDownPayment: File;

  /**
   * Reprint credit notes documents file
   */
  ReprintCreditNotes: File;

  /**
   * Reprint request inventory documents file
   */
  ReprintTransferRequest: File;

  /**
   * Reprint purchase order documents file
   */
  ReprintPurchaseOrder:File;
}

/**
 * Used to map PinPad and local API ports
 */
export interface IPorts {
  /**
   * Local API port
   */
  PortServiceLocal: string;
  /**
   * PinPan service port
   */
  PortServicePinpad: string;
}
