/**
 * This interface represents addresses of BP
 */
export interface IBpAddress {
    //Address name
    AddressName: string;
    //Street
    Street: string;
    //Block
    Block: string;
    //Zip code
    ZipCode: string;
    //City
    City: string;
    //City
    County: string;
    //Country
    Country: string;
    //State
    State: string;
    //AddressType
    AddressType: string;
    //AddressName2
    AddressName2?: string;
    //AddressName3
    AddressName3?: string;
    //BP Code
    BPCode: string;
    //Global Location Number
    GlobalLocationNumber?: string;
    //Street No
    StreetNo: string;
    //Building Floor Room
    BuildingFloorRoom: string;
    //RowNum
    RowNum: number;
    //Is Default
    IsDefault: boolean;
    //Is address registered
    InDB?: boolean;
     //Is address registered
    IsEdit?: boolean;
}