import {IBusinessPartner} from "./i-business-partner";
import {ISalesPerson} from "./i-sales-person";
import {Validators} from "@angular/forms";
import {IEditableFieldConf, IInputColumn, IStickyColumns} from "@clavisco/table/lib/table.space";
import {IPinpadTerminal, ITerminals} from "@app/interfaces/i-terminals";
import {IStructures} from "@app/interfaces/i-structures";
import {PinPad} from "@clavisco/core";
import ITerminal = PinPad.Interfaces.ITerminal;

export interface ITypeDocE {
  Name: string;
  Description: string;
  IsDefault: boolean;
}

export interface IDocumentSearchFilter {
  Customer: IBusinessPartner;
  SalePerson: ISalesPerson;
  DocNum: number;
  DocStatus: string;
  DocType: string;
  DateFrom: Date;
  DateTo: Date;
  ObjType: string;
}

/**
 * This interfaace is used to mapping form of ther serach activities
 */
export interface ISearchDocumentsActivitiesFilter {
  /**
   * Business partner name property
   */
  CardName: string;
  /**
   * Activity code property
   */
  Code: number;
  /**
   * From date property
   */
  DateFrom: Date;
  /**
   * To date property
   */
  DateTo: Date;
}

export interface IApprovalSearchFilter {
  Customer: IBusinessPartner;
  SalePerson: ISalesPerson;
  DraftEntry: number;
  ApprovalStatus: string;
  DocType: string;
  DateFrom: Date;
  DateTo: Date;
}

export interface IPurchaseDocumentSearchFilter {
  SalesPerson: ISalesPerson,
  Customer: IBusinessPartner,
  DocNum: number,
  DocStatus: string,
  DateFrom: Date,
  DateTo: Date,
  DocType: string;
  ObjType: string;
}

export interface ULineMappedColumns<T, P> {
  dataSource?: T[];
  renameColumns?: {
    [key: string]: string;
  };
  ignoreColumns?: string[];
  iconColumns?: string[];
  markAsCheckedValidation?: (_tableRow: T, _itemToMarkAsChecked: T) => boolean;
  editableFieldConf?: IEditableFieldConf<P>;
  inputColumns?: IInputColumn[];
  stickyColumns?: IStickyColumns<T>[];
  tooltipsPosition?: { rows: 'above', cells: 'right' }
}

export interface ISearchTransferRequestFilter {
  SalesPerson: ISalesPerson,
  DocNum: number,
  DocStatus: string,
  DateFrom: Date,
  DateTo: Date,
  DocType: string,
}

export interface ITerminalSearchFilter {
  TransactionType: string;
  Terminal: IPinpadTerminal;
  DateFrom: Date;
  DateTo: Date;
}

export interface ISalesDocument {
  CardCode: string;
  CardName: string;
  PaymentGroupCode: number;
  PriceList: number;
  SalesPersonCode: number;
  DocCurrency: string;
  Comments: string;
  TipoDocE: string;
  Quantity: number;
}

export interface IInventoryEntryOutput{
  Quantity: number;
  WhsCode: string;
  PriceList: string;
  Comments: string;
}

export interface IPurchaseInvoice{
  CardCode: string;
  BusinessPartner: IBusinessPartner;
  PaymentGroupCode: number;
  PriceList: number;
  SalesPersonCode: number;
  Quantity:number;
  TypeDocE: string;
}

export interface IPurchaseDocument {
  BusinessPartner: IBusinessPartner;
  PriceList: number;
  SalesPersonCode: number;
  DocCurrency: string;
  Comments: string;
  Quantity: number;
  WareHouse: string;
  ShowItemDetail: boolean;
}

export interface IUniqueId {
  uniqueId: string;
}

export interface IUserDev {
  User: string;
}

export interface IActionDocument {
  controllerToSendRequest: string;
  typeDocument:string
}

/**
 * Represent filter to search business partner to activate
 */
export interface IBusinessPartnerSearchFilter {
  /**
   * Name business partner
   */
  Customer: string;

  /**
   * Date star to search
   */
  DateFrom: Date;

  /**
   * Date to end to search
   */
  DateTo: Date;
}

/**
 *
 */
export interface IDevice {
  Device: string;
}
