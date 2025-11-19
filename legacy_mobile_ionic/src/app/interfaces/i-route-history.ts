import {IBaseEntity} from "../models/db/companys";
import {CheckType, RouteHistoryStatus} from "../common";

/**
 * Model representing route history.
 */
export interface IRouteHistory extends IBaseEntity {
    /** Latitude of the route history location. */
    Latitude: number;

    /** Longitude of the route history location. */
    Longitude: number;

    /** Type of check of the route history. */
    CheckType: CheckType;

    /** Comments associated with the route history. */
    Comments: string;

    /** Card code associated with the route history. */
    CardCode: string;

    /** Card name associated with the route history. */
    CardName: string;

    /** Address associated with the route history. */
    Address: string;

    /** Address type of the route history. */
    AddressType: number;

    /** Photos associated with the route history. */
    Photos?: string;

    /** ID of the route line associated with the route history. */
    RouteLineId?: number | null;

    /** ID of the route associated with the route history. */
    RouteId: number;
    
    /** Indicates if the route history is synchronized */
    IsSynchronized: boolean;
}
