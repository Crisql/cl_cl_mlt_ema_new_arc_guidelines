/**
 * Represents inventory availability details for a specific item in a warehouse.
 */
export interface InventoryDetails {
  /**
   * The unique identifier of the item (SAP ItemCode).
   */
  ItemCode: string;

  /**
   * The warehouse code where the inventory is stored.
   */
  WhsCode: string;

  /**
   * The descriptive name of the warehouse.
   */
  WhsName: string;

  /**
   * The total quantity of the item currently on hand in the warehouse.
   */
  OnHand: number;

  /**
   * The quantity of the item that is committed (reserved) for sales orders or other allocations.
   */
  IsCommited: number;

  /**
   * The quantity of the item that has been ordered from suppliers but not yet received.
   */
  OnOrder: number;

  /**
   * The quantity of the item currently available for use or sale.
   */
  Available: number;

  /**
   * Toggles the expanded state of an inventory item.
   */
  Expanded: boolean;
}
