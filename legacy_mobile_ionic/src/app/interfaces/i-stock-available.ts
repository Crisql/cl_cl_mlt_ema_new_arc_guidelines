/**
 * This interface is used for mapping model stock available
 */
export interface IStockAvailable {
    //Available
    OnHand: number;
    //Commited
    IsCommited: number;
    //Order
    OnOrder: number;
    //Warehouse
    WhsCode: string;
    //Warehouse name
    WhsName: string;
    //BinLocation
    BinActivat: string;
}