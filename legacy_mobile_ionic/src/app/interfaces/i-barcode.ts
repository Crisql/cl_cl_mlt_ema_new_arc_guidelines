/**
 * Represents an alternative or additional barcode associated with an item.
 */
export interface ItemBarCodeCollection {
  /** Unique identifier of the barcode record. */
  Id: number;

  /** The actual barcode value. */
  Barcode: string;

  /** Optional free text or description for the barcode. */
  FreeText: string;

  /** The Unit of Measure (UoM) entry associated with this barcode. */
  UoMEntry: number;

  /** Absolute entry or internal reference ID from SAP. */
  AbsEntry: number;
}
