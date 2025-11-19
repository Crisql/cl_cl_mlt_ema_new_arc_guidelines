import { SynchronizedRoutesFrom } from "src/app/common/enum";
import {IBaseEntity, ICompany} from "./companys";

export class RouteModel {

    constructor(
        public Name: string,
        public CreationDate: Date,
        public ExpirationDate: Date,
        public FrequencyId: number,
        public UserMappId: number,
        public DB: string,
        public Status: string,
        public idRouteServer: number,
        public DownloadDate: Date,
        public id: number
    ) {
    }
}

export interface RoutesMobileModel {
    Id: number;
    Name: string;
    CreationDate: Date;
    ExpirationDate: Date;
    FrequencyId?: number;
    UserMappId?: number;
    DB: string;
    Status: number;
}

/**
 * Interface representing a route entity.
 */
export interface IRoute extends IBaseEntity {
    /** Name of the route. */
    Name: string;
    /** Date when the route expires. */
    ExpirationDate: Date;
    /** Status of the route. */
    Status: number;
    /** Type of the route. */
    Type: number;
    /** Date when the route is activated. */
    ActivationDate: Date | null;
    /** Total distance covered by the route. */
    TotalDistance: number;
    /** Total duration of the route. */
    TotalDuration: number;
    /** Details about route closure. */
    CloseDetail: string;
    /** User who closed the route. */
    CloseUser: string;
    /** Date when the route was closed. */
    CloseDate: Date | null;
    /** Total estimated distance of the route. */
    TotalEstimatedDistance: number;
    /** Total estimated duration of the route. */
    TotalEstimatedDuration: number;
    /** ID of the company associated with the route. */
    CompanyId: number;
    /** ID of the frequency of the route. */
    RouteFrequencyId: number;
    /** ID of the route assignment. */
    RouteAssignmentId: number | null;
    /** Company associated with the route. */
    Company: ICompany;
    /** ID of the user assigned to the route. */
    RouteAssignmentUserId: number;
    /** Indicates whether the route was downloaded. */
    RouteWasDownloaded: boolean;
    /** Represent the date when the user synchronize the route */
    DownloadDate: Date;
}

/**
 * Interface representing a route line entity.
 */
export interface IRouteLine extends IBaseEntity {
    /** Address associated with the route line. */
    Address: string;
    /** Latitude of the address. */
    Latitude: number;
    /** Longitude of the address. */
    Longitude: number;
    /** Card code associated with the address. */
    CardCode: string;
    /** Card name associated with the address. */
    CardName: string;
    /** ID of the address line. */
    AddressLineId: number | null;
    /** Check status of the address. */
    CheckStatus: number;
    /** Status of the route line. */
    Status: number;
    /** Type of the address. */
    AddressType: number;
    /** Time for visiting the address. */
    VisitingTime: string;
    /** End time for visiting the address. */
    VisitEndTime: string;
    /** Line number of the address. */
    AddressLineNum: number;
    /** ID of the route associated with the route line. */
    RouteId: number;
    /** Route associated with the route line. */
    Route: IRoute;
    /** ID of the user who last updated the route line. */
    OrderNum?: number;
}

export interface IRouteWithLines {
    Route: IRoute;
    RouteLines: IRouteLine[];
}

export interface IRouteLinesMobileModel {
    Id: number;
    Address: string;
    Latitude: number;
    Longitude: number;
    CardCode: string;
    CardName: string;
    idRoute: number;
    LastUpdate: Date;
    CheckStatus: number;
    LineServerId: number;
    AddressType: number;
}

export interface DailyRoute extends RoutesMobileModel {
    RouteLines: IRouteLinesMobileModel[];
}

export interface ISyncronizedRoutes {
    NewRoutesQty: number;
    ActionFrom: SynchronizedRoutesFrom;
    MessageInfo?: string;
}

export interface IActRouteDestination
{
    Longitude: number;
    Latitude: number;
}