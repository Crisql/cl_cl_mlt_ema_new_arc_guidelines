export interface IItemWarehouseInventory extends IInventoryInfo {
    WhName: string;
    WhCode: string;
    
}

export interface IInventoryInfo
{
    Stock: number;
    Commited: number;
    Requested: number;
    Available: number;
}

export interface IItemInventoryInfo extends IInventoryInfo
{
    ItemCode: string;
    WhsCode: string;
    SerialNumber: string;
    BinCode:  string;
    ValidateInventory: boolean;
}