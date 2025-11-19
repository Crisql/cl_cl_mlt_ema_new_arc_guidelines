import {IPinpadTerminal, ITerminals} from "@app/interfaces/i-terminals";
import {IUser, IUserAssign} from "@app/interfaces/i-user";
import {IBaseEntity} from "@app/interfaces/i-base-entity";
import {PinPad, Structures} from "@clavisco/core";
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import {ICompany} from "@app/interfaces/i-company";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ISettings} from "@app/interfaces/i-settings";

export interface IPPTransaction {
  Id: number;
  DocEntry: number;
  CardName: string;
  CardNumber: string;
  AuthorizationNumber: string;
  EntryMode: string;
  ExpirationDate: string;
  ReferenceNumber: string;
  ResponseCode: string;
  InvoiceNumber: string;
  InvoiceDocument: string;
  SystemTrace: string;
  TransactionId: string;
  CharchedStatus: string;
  ChargedResponse: string;
  CanceledStatus: string;
  CanceledResponse: string;
  ReversedStatus: string;
  ReversedResponse: string;
  Currency: string;
  Amount: number | string;
  IsOnBalance: boolean;
  CreationDate: Date | string;
  LastUpDate: Date | string | null;
  QuickPayAmount: number;
  StringedResponse: string;
  TerminalId?: number;
  SerializedObject: string;
  //Terminal: ITerminal
}

export interface ITransactions {
  TerminalId: string;
  AuthorizationNumber: string;
  ReferenceNumber: string;
  SystemTrace: string;
  InvoiceNumber: string;
  SerializedTransaction: string;
  CommitedResult: string;
}

export interface IVoidedTransactions extends IVoidedTransaction, IBaseEntity {

}

export interface IPPBalance {
  id: number;
  xMLDocumentResponse: string;
  responseCode: string;
  responseCodeDescription: string;
  acqNumber: string;
  cardBrand: string;
  hotTime: string;
  hostDate: string;
  refundsAmount: string;
  refundsTransactions: string;
  salesTransactions: string;
  salesAmount: string;
  salesTax: string;
  salesTip: string;
  creationDate: string;
  modificationDate: string;
  transactionType: string;
  terminalCode: string;
}

export interface ICommittedTransaction {
  Id: number;
  DocEntry: number;
  InvoiceNumber: string;
  ReferenceNumber: string;
  AuthorizationNumber: string;
  SalesAmount: string;
  HostDate: string;
  CreationDate: string;
  ACQ: number | '';
  TransactionType: string;
  TerminalCode: string;
  BlurredBackground: string;
  TotalTransactions: number;
  RowColor?:string;
}

export interface IACQTransaction {
  Terminal: IPinpadTerminal;
  OverACQ: IPPBalance;
  BalanceRequest: IPPBalanceRequest;
}

export interface ICommitedVoidedTransaction {
  User: string;
  CreationDate: Date;
  TerminalId: string;
  ReferenceNumber: string;
  AuthorizationNumber: string;
  TransactionId: string;
  SalesAmount: string;
  InvoiceNumber: string;
  SystemTrace: string;
}


export interface ICLTerminal {
  TerminalId: string;
}

export interface IPPCashDeskClosing {
  Id: number;
  TerminalId: string;
  User: string;
  CreationDate: Date;
  SerializedTransaction: string;
  Type: string;
  Internal: number;
  IsApproved: boolean;
}

export type PinpadPayLoad = {
  DocumentKey: string;
  InvoiceNumber: string;
  User: string;
  Document: string;
  Charge: number;
  Currency: string;
  Terminal: string;
  StorageKey?: string;
}

export type StoredTransaction = {
  Id?: number;
  StorageKey: string;
  DocumentKey: string;
  Data: string;
  StateType?: string;
  TransactionUser: string;
  SyncUser?: string;
}


export type IPPBalanceRequest  = {
  // Fecha inicial del los balances
  From: Date | string;
  // Fecha final de los balances
  To: Date | string;
  // Id del terminal que se le va a consultar
  TerminalId: number;
  // Tipo de documento que se desea obtener, precierre, cierre
  DocumentType: string;
  Terminal: ITerminals;

}

export interface IFilterPPVoidTransaction {
   DateFrom : string;
   DateTo : string;
   Email : string;
   Terminal: string;
}
export interface IPPStoredTransactions extends  IBaseEntity{
  TerminalId:string;
  StorageKey: string;
  Data: string;
  StateType: string;
  TransactionType: string;
  SyncUser: string;
  DocumentKey: string;
  CompanyId: number;

  AuthorizationNumber: string;
  ReferenceNumber: string;
  SystemTrace: string;
  InvoiceNumber: string;
  SalesAmount: string;
  TransactionId: string;
}

export interface IPPStoredTransactionsDataTable extends  IPPStoredTransactions{


}

export interface IPPStoredTransactionsFilter {
  User: IUser;
  Terminal: ITerminals;
  DateFrom: Date;
  DateTo: Date;
  CompanyId: number;
}

export interface IPPStoredTransactionResolvedData {
  Users?: IUser[];
  UserPermission?: IPermissionbyUser[];
  Terminals?: ITerminals[];
  Setting: ISettings;
}
