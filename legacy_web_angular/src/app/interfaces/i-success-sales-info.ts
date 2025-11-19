import {IPrintFormatSetting} from "../interfaces/i-settings";
import {PinPad} from "@clavisco/core";
import ITerminal = PinPad.Interfaces.ITerminal;
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;

export interface ISuccessSalesInfo {
  DocEntry: number;
  DocNum: number;
  NumFE: string;
  CashChange: number;
  CashChangeFC: number;
  Title: string;
  PPTransactions: IVoidedTransaction[];
  Terminals: ITerminal[];
  Accion:string;
  TypeReport: keyof IPrintFormatSetting;
}

