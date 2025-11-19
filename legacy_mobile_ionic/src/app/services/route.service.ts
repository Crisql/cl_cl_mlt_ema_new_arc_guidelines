import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {IBaseReponse, RouteModel, RoutesMobileModel} from "src/app/models";
import { LocalStorageService } from "./local-storage.service";
import {ApiResponse, ICLResponse} from '../models/responses/response';
import {DailyRoute, IRoute, IRouteWithLines, ISyncronizedRoutes} from '../models/db/route-model';
import { Observable, Subject } from 'rxjs';
import {CalculationType, LocalStorageVariables} from '../common/enum';


@Injectable({
  providedIn: "root",
})
export class RouteService {
  SynchronizedRoutes$: Subject<ISyncronizedRoutes>;
  constructor(
    private translateService: TranslateService,
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    this.SynchronizedRoutes$ = new Subject<ISyncronizedRoutes>();
  }

  /**
   * Retrieves all assigned routes to the current user
   * @param _IMEI Device identifier
   * @constructor
   */
  GetUserRoutes(_IMEI: string): Observable<ICLResponse<IRouteWithLines[]>> 
  {
    return this.http.get<ICLResponse<IRouteWithLines[]>>(`api/Users/${this.localStorageService.get(LocalStorageVariables.Session).UserId}/Routes`, {
      params: {
        imei: _IMEI
      }
    });
  }

  /**
   * Send a request to update the route status
   * @param _routeId The id of the route to update
   * @param _newStatus The new status of the route
   * @constructor
   */
  UpdateRouteStatus(_routeId: number, _newStatus: number) 
  {
    return this.http.patch<ICLResponse<any>>(`api/Routes/${_routeId}`, null, {
      params: {
        newStatus: _newStatus.toString()
      }
    });
  }

  ResetRouteDownload(routeId: number) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        this.localStorageService.data.get("Session").access_token
      }`,
    });

    return this.http.get<IBaseReponse>(
      `${this.localStorageService.data.get(
        "ApiURL"
      )}api/Route/ResetRouteDownload?routeId=${routeId}`,
      { headers }
    );
  }

  UpdateRouteCalculationsDetails(routeId: number, type: CalculationType.CALCULATED | CalculationType.ESTIMATED, distance: number, duration: number, json: string) {
    return this.http.post<IBaseReponse>(`api/Route/PutRouteCalculationDetails`, json, {
          params: {
            routeId: routeId.toString(),
            type: CalculationType.CALCULATED.toString(),
            distance: distance.toString(),
            duration: duration.toString()
          }
        }
    );
  }

  /**
   * Send a request to retrieve all user active routes
   * @param _userId Represent current user id
   * @constructor
   */
  GetUserActiveRoutes(_userId: number): Observable<ICLResponse<IRoute[]>> 
  {
    return this.http.get<ICLResponse<IRoute[]>>(`api/Users/${_userId}/ActiveRoutes`);
  }

  GetRoute(_routeId: number, _shouldIgnoreAlerts: boolean = false): Observable<ICLResponse<IRoute>>
  {
    return this.http.get<ICLResponse<IRoute>>(`api/Routes/${_routeId}`, {
      headers: _shouldIgnoreAlerts ? new HttpHeaders({'cl-ignore-alerts': 'true'}) : undefined
    });
  }
}