import {Injectable} from '@angular/core';
import {AlertType, CheckType, LogEvent, RouteStatus} from '../common';
import {LocalStorageService} from './local-storage.service';
import {CommonService} from './common.service';
import {TranslateService} from '@ngx-translate/core';
import {catchError, concatMap, filter, finalize, map, mergeMap, toArray} from 'rxjs/operators';
import {RouteCalculationService} from './route-calculation.service';
import {LogManagerService} from './log-manager.service';
import {SyncService} from './sync.service';
import {EMPTY, from, Observable, of, Subscription} from 'rxjs';
import {Network} from '@ionic-native/network/ngx';
import {CalculationType, RouteHistoryStatus, LocalStorageVariables} from '../common/enum';
import {CheckInService as ApiCheckInService} from "./check-in.service";
import {RouteService as ApiRouteService} from "./route.service";
import {LoadingController} from '@ionic/angular';
import {Repository} from './repository.service';
import {Geolocation} from "@ionic-native/geolocation/ngx";
import {ICLResponse} from "../models/responses/response";
import {IRouteHistory} from "../interfaces/i-route-history";
import {IRoute} from "../models/db/route-model";

@Injectable({
  providedIn: 'root'
})
export class CheckRouteService {

  automaticClosingRouteInterval: Subscription;
  intervalTimer: Observable<number>;

  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private translateService: TranslateService,
    private repositoryRoute: Repository.Route,
    private apiRouteService: ApiRouteService,
    private apiCheckInService: ApiCheckInService,
    private routeCalculationService: RouteCalculationService,
    private logManagerService: LogManagerService,
    private syncService: SyncService,
    private network: Network,
    private loadingController: LoadingController,
    private geolocation: Geolocation,
    private repositoryCheckIn: Repository.RouteHistory
  ) { }

  async routeDeactivationRoutine(
    routeToDeactivate: IRoute,
    newStatus: RouteStatus
  ) {
    routeToDeactivate.Status = newStatus;
    this.syncService.StopAutomaticCheckProcess(routeToDeactivate);
  }

    /**
     * Try to close the route remotely, else it will be mark as closed locally
     * @param _route The route to close
     * @param _alertCalculation Indicates if should show the calculation alert
     * @constructor
     */
  async FinalizeRoute(_route: IRoute, _alertCalculation: boolean = true): Promise<void> 
  {
    let loader: HTMLIonLoadingElement = await this.commonService.Loader();
    
    loader.present();
    
    _route.Status = RouteStatus.Finished;

    let routeTotalDistance: number = 0;
    
    let routeTotalDuration: number = 0;

    this.CreateRouteHistory(CheckType.RouteFinishCheck, _route.Id, "Cierre de ruta - Check automático")
        .pipe(
            concatMap(result => {
                if (!result)
                {
                    this.commonService.alert(
                        AlertType.WARNING,
                        this.commonService.Translate("Verifique que los servicios de ubicación esten activos", "Check if location services are enable")
                    );

                    return EMPTY;
                }
               
                return this.syncService.StopAutomaticCheckProcess(_route);
            }),
            concatMap(updateStatusResult => this.apiRouteService.UpdateRouteStatus(_route.Id, _route.Status)),
            concatMap(response => this.apiCheckInService.GetCheckListForCalculation(_route.Id)),
            concatMap(checkListResponse => {
              if(!checkListResponse.Data || !checkListResponse.Data.length) return EMPTY;
              
              return from(this.routeCalculationService.CalculateRoute(checkListResponse.Data))
                  .pipe(
                      concatMap(result => from(result))
                  )
            }),
            concatMap(result => {
              return from(result.rows)
                  .pipe(
                      mergeMap(row => {
                        return from(row.elements);
                      }),
                      filter(element => element.status === 'OK'),
                      map(element => {
                        routeTotalDistance += element.distance.value;
                        routeTotalDuration += element.duration.value;
                        
                        return element;
                      }),
                      toArray(),
                      map(elements => result)
                  )
            }),
            concatMap(distanceMatrixResponse => this.apiRouteService.UpdateRouteCalculationsDetails(_route.Id, CalculationType.CALCULATED, routeTotalDistance, routeTotalDuration, JSON.stringify(distanceMatrixResponse))),
            finalize(() => loader.dismiss())
        )
        .subscribe({
          error: (error) => {
            this.logManagerService.Log(LogEvent.ERROR, error);
          }
        });
  }

    /**
     * Try to create the route history in the remote database, if not create it in the SQL Lite database
     * @param _checkType The route history check type
     * @param _routeId The route id where this route history is associated
     * @param _comments The route history comments
     * @param _cardCode The card code of the active route line
     * @param _cardName The card name of the active route line
     * @param _address The address of the active route line
     * @param _addressType The address type of the active route line
     * @param _routeLineId The route line id of the route history
     * @param _photos The evidence photos
     * @constructor
     */
  CreateRouteHistory(
    _checkType: number,
    _routeId: number,
    _comments: string,
    _cardCode: string = "",
    _cardName: string = "",
    _address: string = "",
    _addressType: number = 0,
    _routeLineId: number = 0,
    _photos: string = ""
  ): Observable<boolean> 
  {
      let userEmail = this.localStorageService.get(LocalStorageVariables.Session).UserEmail;
      
      return from(this.geolocation.getCurrentPosition())
          .pipe(
              map(geoposition => ({
                Photos: _photos,
                RouteLineId: _routeLineId,
                AddressType: _addressType,
                IsSynchronized: false,
                CheckType: _checkType,
                RouteId: _routeId,
                Comments: _comments,
                CardCode: _cardCode,
                CardName: _cardName,
                Address: _address,
                CreatedDate: new Date(),
                Latitude: geoposition.coords.latitude,
                Longitude: geoposition.coords.longitude,
                CreatedBy: userEmail,
                UpdateDate: new Date(),
                UpdatedBy: userEmail
              } as IRouteHistory)),
              concatMap(routeHistory => this.repositoryCheckIn.StoreRouteHistory(routeHistory)),
              concatMap(response => {
                  if(![CheckType.DocumentCheck, CheckType.RouteFinishCheck, CheckType.RouteStartCheck].includes(_checkType))
                  {
                      return this.repositoryRoute.UpdateRouteLineCheckStatus(_routeLineId, _checkType);
                  }

                  return of(1);
              }),
              map(result => true),
          );
  }
}
