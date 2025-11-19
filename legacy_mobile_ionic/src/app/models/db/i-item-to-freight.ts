/**
 * Represents an item to be included in freight calculations.
 */
export interface IItemToFreight {
  /** The unique code identifying the item. */
  ItemCode: string;

  /** The name or description of the item. */
  ItemName: string;

  /** The tax code applicable to the item. */
  TaxCode: string;

  /** The customer or supplier code associated with the item. */
  CardCode: string;

  /** The quantity of the item. */
  Quantity: number;

  /** The unit price of the item. */
  Price: number;

  /** The warehouse code where the item is stored. */
  WhsCode: string;

  /** The unit of measurement entry identifier. */
  SUoMEntry: number;

  /** The tax rate applied to the item. */
  TaxRate: number;
}

