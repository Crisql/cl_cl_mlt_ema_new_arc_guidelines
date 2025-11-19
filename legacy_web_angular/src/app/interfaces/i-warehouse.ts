export interface IWarehouse {
  WhsCode: string
  WhsName: string;
  BinActivat: string;
}

/**
 * The required data for the StockWarehouseComponent modal
 */
export interface IChangeWarehouse {
  /**
   * Item whose warehouse will be changed
   */
  ItemCode: string
  /**
   * Indicates if the current user has permissions to change the warehouse for the item
   */
  isPermissionChangeWarehouse: boolean;
  /**
   * The current item warehouse
   */
  WarehouseCode: string;
  /**
   * Indicates if the item is managed by series
   */
  SerialItem: boolean;
}
