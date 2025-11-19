export interface ItemSearchTypeAhead {
  /** Unique item code identifier. */
  ItemCode: string;

  /** Name or description of the item. */
  ItemName: string;

  /** Barcode associated with the item. */
  BarCode: string;

  /** Preformatted string used for type-ahead display. */
  TypeAheadFormat: string;

  /** Distribution series number for tracking purposes. */
  DistNumberSerie: string;

  /** Indicates if the item is batch-managed ("Y" or "N"). */
  ManBtchNum: string;

  /** Indicates if the item is serial number-managed ("Y" or "N"). */
  ManSerNum: string;

  /** System-assigned unique identifier for tracking. */
  SysNumber: number;

  /** Batch or lot number for the item. */
  DistNumberLote: string;

  // /** Stock quantity available (commented out in current version). */
  // Stock: number;

  /** Bin (storage location) code where the item is located. */
  BinCode: string;

  /** Optional absolute entry number, often used for system references. */
  AbsEntry?: number;

  /** Quantity of the item available in stock. */
  OnHand: number;

  /**
   * Optional default warehouse assigned to the item
   * (from master data settings).
   */
  DefaultWarehouse?: string;
}
