import {IBaseEntity} from "./i-base-entity";
import {Animation} from "@agm/core/directives/marker";
import {IUserAssign} from "@app/interfaces/i-user";

export interface IRoute extends IBaseEntity{
  Name: string;
  ExpirationDate: Date;
  Status: number;
  Type: number;
  ActivationDate?: Date;
  TotalDistance: number;
  TotalDuration: number;
  CloseDetail: string;
  CloseUser: string;
  CloseDate?: Date;
  TotalEstimatedDistance: number;
  TotalEstimatedDuration: number;
  CompanyId: number;
  RouteFrequencyId: number;
  RouteAssignmentId?: number;

  // Columnas asignacion de ruta
  RouteAssignmentUserId?: number;
  RouteWasDownloaded?: boolean;

  //Columnas para mostrar en tabla
  RouteAssignment?: string;
  TypeName?: string;
  FrequencyName?: string;
  CreatedDateFmt?: string;
  ExpirationDateFmt?: string;
  StatusName?: string;
}

export interface IRouteFrequency extends IBaseEntity {
  Description: string;
  Weeks: string;
  Days: string;
}

export interface IRouteAssignment {
  RouteDownloadDate?: Date;
  IMEI?: string;
  UserAssignId: number;
  RouteId: number;
}

export interface IRouteLine extends IBaseEntity {
  Address: string;
  Latitude: number;
  Longitude: number;
  CardCode: string;
  CardName: string;
  AddressLineId?: number;
  CheckStatus: number;
  Status: number;
  AddressType: number;
  VisitingTime: string;
  VisitEndTime: string;
  AddressLineNum: number;
  RouteId: number;

  // Propiedad para mostrar en modal de seleccion de ubicaciones de clientes
  TypeName?: string;
  /**Handling line animations */
  Animation: Animation;
  /**Grouping number used for segmenting lines within the same route. */
  LineGroupNum: number;
}

export interface IRouteHistory extends IBaseEntity {
  Latitude: number;
  Longitude: number;
  CheckType: number;
  Comments: string;
  CardCode: string;
  CardName: string;
  Address: string;
  AddressType: number;
  Photos: string;
  RouteLineId?: number;
  RouteId: number;

  Animation: Animation;
}

export interface IRouteCalculationDetail extends IBaseEntity {
  Type: number;
  Distance: number;
  Duration: number;
  JsonApi: string;
  Status: number;
  RouteId: number;
}

export interface IRouteWithLines
{
  Route: IRoute;
  RouteLines: IRouteLine[];
}

/**
 * Represents a group of route lines associated with a specific customer.
 *
 * @template T - The type of route lines contained in the group.
 */
export interface IRouteLinesGroupedByCustomer<T> {
  /**
   * Unique identifier for the customer (SAP CardCode).
   */
  CardCode: string;

  /**
   * Name of the customer.
   */
  CardName: string;

  /**
   * List of route lines associated with the customer.
   */
  RouteLines: T[];

  /**
   * Group number used to categorize or segment route lines.
   */
  LineGroupNum: number;
}

export interface IRouteHistoryGroupedByRouteLine extends IRouteLine
{
  RouteHistories: IRouteHistory[];
}

/**
 * This method is used to filter routes
 */
export interface IRouteFilter
{
  /**
   * Route name
   */
  RouteName?: string;
  /**
   * User assing
   */
  UserId?: IUserAssign;
  /**
   * Start date
   */
  DateFrom: Date;
  /**
   * End Date
   */
  DateTo: Date;
  /**
   * Status
   */
  Status: number;
}

export interface IRouteAdministrator
{
  RouteId: number;
  UserId: number;
}

export interface IProcessedRoute {
  Route: IRoute;
  RouteLines: IRouteLine[];
  UserAssigned: number;
  Estimate: boolean;
  EstimateJson: string;
  Status: boolean;
  Result: string;

  //Para mostrar en tabla
  Index?: number;
  Name?: string;
  StrEstimate?: string;
  Locations?: number;
}

