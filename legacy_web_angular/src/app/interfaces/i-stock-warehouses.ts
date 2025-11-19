import {ISerialNumbers} from "@app/interfaces/i-serial-batch";

export interface IStockWarehouses{
  WhsCode:string;
  WhsName:string;
  IsCommited:number;
  OnOrder:number;
  OnHand:number;
  BinActivat: string;
  ItemSerie?: ISerialNumbers;
}
