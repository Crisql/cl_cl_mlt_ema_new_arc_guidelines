export interface IPriceList {
    ItemCode: string;
    PriceList: number;
    Price: number;
    Currency: string;
    UomEntry: number;
    UpdateDateTime: Date;
}

/**
 * Represent the model of the calculated item price
 */
export interface ICalculatedPrice
{
    /**
     * The calculate price of the item
     */
    Price: number;
    /**
     * The currency of the calculated price
     */
    Currency: string;
}


/**
 * Represents the master data of a price list item.
 */
export interface IPriceListItemMD {
  /** Unique identifier for the price list. */
  ListNum: number;

  /** Descriptive name of the price list. */
  ListName: string;

  /** Primary currency of the price list. */
  PrimCurr: string;

  /** First additional currency supported by the price list. */
  AddrCurr1: string;

  /** Second additional currency supported by the price list. */
  AddrCurr2: string;
}