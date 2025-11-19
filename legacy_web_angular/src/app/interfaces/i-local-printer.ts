import {IBaseEntity} from "@app/interfaces/i-base-entity";

export interface ILocalPrinter extends IBaseEntity
{
  UserAssingId: number;
  PortServicePrintMethod: string;
  PrinterName: string;
  UseLocalPrint: boolean;
}
