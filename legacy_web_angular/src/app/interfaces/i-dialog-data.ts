import {IStructures} from "@app/interfaces/i-structures";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {IPriceList} from "@app/interfaces/i-price-list";
import {ITaxe} from "@app/interfaces/i-taxe";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IUser} from "@app/interfaces/i-user";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ISettings} from "@app/interfaces/i-settings";
import {ILinesGoodReceip} from "@app/interfaces/i-items";
import { IWithholdingTax, IWithholdingTaxSelected } from "./i-withholding-tax";
import { IUdfContext } from "./i-udf";

export interface IUserDialogData {
  UserId: number;
  SchedulingSetting?: ISettings;
}

export interface IIdDialogData {
  Id: number;
}

export interface ICompanyDialogData {
  RecordId: number;
  CompanyId: number;
}

export interface ITerminalsDialogData {
  Id: number;
  Currencies: ICurrencies[];
}

export interface IPreviewDocumentDialogData {
  DocEntry: number;
  Controller: string;
}

/**
 * Interface representing the data passed to the customer locations dialog component.
 */
export interface ICustomerLocationsDialogData {
  /**
   * List of available route types to be displayed in the dialog.
   */
  RoutesTypes: IStructures[];

  /**
   * Selected route type identifier.
   */
  RouteType: number;

  /**
   * Customer information related to the location.
   */
  Customer: IBusinessPartner;

  /**
   * Group number used to classify or segment customer locations.
   */
  LineGroupNum: number;
}

export interface ISyncDocumentDialogData {
  Id: number;
}

export interface IRouteAssignmentDialogData {
  RouteId: number;
  RouteAssignmentId: number;
  Permissions: IPermissionbyUser[];
}

export interface IItemDetailDialogData {
  DocType: string;
  ItemCode: string;
}

export interface ICreateItemDialogData {
  BarCode: string;
  PriceList: IPriceList;
  Taxes: ITaxe[];
  IsWithBarCode: boolean
}


export interface IHistoryFiltersDialogData
{
  RouteCheckTypes: IStructures[],
  VisibleRouteCheckTypes: IStructures[],
  RouteCustomers: IBusinessPartner[],
  RouteAssignedUsers: IUser[];
  SelectedCustomer?: IBusinessPartner;
  SelectedUser?: IUser;
  DateFrom: Date;
  DateTo: Date;
}

export interface IHistoryFiltersDialogResult
{
  VisibleRouteCheckTypes: IStructures[],
  SelectedCustomer?: IBusinessPartner,
  SelectedUserAssign?: IUser;
  DateFrom: Date;
  DateTo: Date;
}

export interface IRouteAdministratorsDialogData{
  RouteId: number;
  Permissions: IPermissionbyUser[];
}

export interface IRouteLoadsDialogData
{
  Permissions: IPermissionbyUser[];
}

export interface IEditFrequencyDialogData
{
  Permissions: IPermissionbyUser[];
  FrequencyId: number;
}

export interface ICreateGoodReceiptDialogData
{
  Lines: ILinesGoodReceip[];
  PriceList: number;
  GoodsReceiptAccount: string;
  Comments: string;
  DocCurrency: string;
  DecimalTotalDocument: number;
  Currencies: ICurrencies[];
}

export interface IEditGeoRoleDialogData
{
  GeoRoleId?: number;
}

export interface IUserAssingDialogData {
  UserAssingId: number;
}

/**
 * Represent route to closed
 */
export interface IRouteCloseDialogData{
  RouteId: number;
  Permissions: IPermissionbyUser[];
}

/**
 * Represents the data structure used within a withholding tax selection dialog.
 */
export interface IWithholdingTaxDialogData {
  /**
   * List of available withholding tax options that can be selected.
   */
  AvailableWithholdingTax: IWithholdingTax[];

  /**
   * List of withholding tax items currently selected by the user.
   */
  SelectedWithholdingTax: IWithholdingTaxSelected[];

  /**
   * User-defined fields (UDFs) associated with withholding tax entries.
   */
  UdfsWithholding: IUdfContext[];
}
