import {Component, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {Network} from "@ionic-native/network/ngx";
import {IonItemSliding, LoadingController,} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {catchError, concatMap, filter, finalize, map, switchMap} from "rxjs/operators";
import {AlertType, CheckType, RouteStatus} from "src/app/common";
import {PermissionsSelectedModel} from "src/app/models";
import {RouteCalculationService} from '../../services/route-calculation.service';
import {
    CheckInService,
    CheckRouteService,
    CommonService,
    LocalStorageService,
    LogManagerService,
    PermissionService,
    PublisherService,
    Repository,
    RouteService,
} from "src/app/services";
import {DecimalPipe} from '@angular/common';
import {CalculationType, LogEvent, PublisherVariables, SynchronizedRoutesFrom} from '../../common/enum';
import {SyncService} from "src/app/services/sync.service";
import {IRoute, IRouteWithLines, ISyncronizedRoutes} from "src/app/models/db/route-model";
import {EMPTY, from, Observable, of, Subscription} from "rxjs";
import {ICalculateDistanceDuration} from "../../interfaces/i-calculate-distance-duration";

@Component({
    selector: "app-routes",
    templateUrl: "./routes.page.html",
    styleUrls: ["./routes.page.scss"],
})
export class RoutesPage implements OnInit, OnDestroy {
    permissions: PermissionsSelectedModel[] = [];
    canSyncRoutes: boolean;
    refreshEvent: any;
    routes: IRouteWithLines[] = [];
    subscriptions: Subscription = new Subscription();

    constructor(
        private router: Router,
        private network: Network,
        private translateService: TranslateService,
        private loadingController: LoadingController,
        private localStorageService: LocalStorageService,
        private commonService: CommonService,
        private repositoryRoute: Repository.Route,
        private routeService: RouteService,
        private checkRouteService: CheckRouteService,
        private repositoryRouteHistory: Repository.RouteHistory,
        private syncService: SyncService,
        private routeCalculationService: RouteCalculationService,
        private checkInService: CheckInService,
        private decimalPipe: DecimalPipe,
        private logManagerService: LogManagerService,
        private permissionService: PermissionService,
        private publisherService: PublisherService
    ) {
    }

    ngOnInit() {
        
    }

    ionViewWillEnter() {
        this.LoadRoutes();

        this.permissions = [...this.permissionService.Permissions];

        this.SetPermissionVariables();

        this.publisherService.getObservable()
            .pipe(
                filter(p => p.Target === PublisherVariables.Permissions)
            )
            .subscribe({
                next: (callback) => {
                    if (callback) {
                        this.permissions = callback.Data;
                        this.SetPermissionVariables();
                    }
                }
            });


        //Esta subscripcion es para saber cuando se han sincronizado nuevas rutas
        this.subscriptions.add(this.routeService.SynchronizedRoutes$.subscribe({
            next: (callback: ISyncronizedRoutes) => {

                let showModalOrBlockUI = [SynchronizedRoutesFrom.Refresher, SynchronizedRoutesFrom.SyncPage].includes(callback.ActionFrom);

                this.LoadRoutes(!showModalOrBlockUI);

                if (callback.ActionFrom !== SynchronizedRoutesFrom.SyncPage)
                {
                    if (callback.NewRoutesQty > 0)
                    {
                        let newRoutesMessage: string = callback.NewRoutesQty > 1 ? this.commonService.Translate(`Hay ${callback.NewRoutesQty} rutas nuevas`, `There are ${callback.NewRoutesQty} new routes`) : this.commonService.Translate("Hay una ruta nueva", "There is a new route");

                        this.commonService.toast(newRoutesMessage, 'dark', 'bottom');
                    }
                    else
                    {
                        this.commonService.toast(callback.MessageInfo, 'dark', 'bottom');
                    }
                }
            },
            error: (err) => {
                this.refreshEvent?.target.complete();
                console.error(err);
            }
        }));

        this.subscriptions.add(this.repositoryRoute.onRouteClosed$.subscribe({
            next: (closedRoute: IRoute) => {
                this.routes.find(route => route.Route.Id == closedRoute.Id).Route.Status = RouteStatus.Closed;
            }
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    SetPermissionVariables(): void {
        this.canSyncRoutes = this.permissions.some(p => p.Name === 'M_Sync_Routes_Sync');
    }

    /**
     * Retrieves all synchronized routes and set them in the routes array
     * @param _showModals Indicates if should show the overlay
     * @constructor
     */
    async LoadRoutes(_showModals: boolean = true): Promise<void> 
    {
        this.routes = [];

        let loading: HTMLIonLoadingElement = undefined;

        if (_showModals) 
        {
            loading = await this.loadingController.create();
            loading.present();
        }

        from(this.repositoryRoute.GetRoutes())
            .pipe(
                finalize(() => {
                    loading?.dismiss();
                    this.refreshEvent?.target.complete();
                })
            )
            .subscribe({
                next: (routes) => {
                    this.routes = routes;
                }
            });
    }

    ViewRouteDestinations(_routeId: number) {
        this.router.navigate(["route-destinations", _routeId]);
    }

    async OnClickActivateRoute(_route: IRouteWithLines, _slidingRoute: IonItemSliding): Promise<void> 
    {
        let slidingRatio: number = await _slidingRoute.getSlidingRatio();

        if (slidingRatio <= -1) 
        {
            _slidingRoute.close();

            let activeRoute: IRouteWithLines = this.routes.find((route) => route.Route.Status === RouteStatus.Active);
            
            if (activeRoute && activeRoute.Route.Id !== _route.Route.Id) 
            {
                this.commonService.Alert(
                    AlertType.WARNING,
                    `No se puede activar la ruta. La ruta ${activeRoute.Route.Name} se encuentra activa`,
                        `Can't activate the route. The route ${activeRoute.Route.Name} is active`
                );
                
                return;
            }

            this.commonService.Alert(
                AlertType.QUESTION,
                "¿Deseas activar esta ruta?",
                "Do you want to activate this route?",
                "Confirmación",
                "Confirmation",
                [
                    {
                        text: this.commonService.Translate('Cancelar', 'Cancel'),
                        role: "cancel",
                    },
                    {
                        text: this.commonService.Translate('Continuar', 'Continue'),
                        handler: () => {
                            this.ActivateRoute(_route);
                        },
                    },
                ]
            );
        }
    }

    /**
     * Activate the selected route
     * @param routeToActivate The route to activate
     * @constructor
     */
    async ActivateRoute(routeToActivate: IRouteWithLines): Promise<void> 
    {
        let loading: HTMLIonLoadingElement = await this.loadingController.create();

        let createdRouteHistory$: Observable<boolean> = of(true);

        if (routeToActivate.Route.Status === RouteStatus.NotStarted) 
        {
            createdRouteHistory$ = this.checkRouteService.CreateRouteHistory(CheckType.RouteStartCheck, routeToActivate.Route.Id,"Inicio de ruta - Check automático");
        }

        loading.present();
        
        routeToActivate.Route.Status = RouteStatus.Active;
        
        createdRouteHistory$
            .pipe(
                concatMap(result => {
                    if (!result)
                    {
                        this.commonService.Alert(
                            AlertType.WARNING,
                            'Verifique que los servicios de ubicación esten activos',
                            'Check if location services are enable'
                        );
                        return EMPTY;
                    }
                   
                    return this.repositoryRoute.UpdateRouteStatus(routeToActivate.Route.Id, routeToActivate.Route.Status);
                }),
                finalize(() => loading.dismiss())
            ).subscribe({
                next: (callback) => {
                    this.commonService.toast(this.commonService.Translate("Ruta activada", "Route activated"));
                },
                error: (error) => {
                    this.commonService.alert(AlertType.ERROR, error);
                }
            });


        this.syncService.StartAutomaticCheckProcess();
    }

    /**
     * Show a modal asking to the user if he want to deactivate the route, then the route will be deactivated
     * @param _route The route to deactivate
     * @param _slidingItem Represent the button element of ionic
     * @constructor
     */
    async OnClickDeactivateRoute(_route: IRouteWithLines, _slidingItem: IonItemSliding): Promise<void> 
    {
        let slidingRatio: number = await _slidingItem.getSlidingRatio();

        if (slidingRatio >= 1) 
        {
            _slidingItem.close();

            if (_route.RouteLines && _route.RouteLines.length > 0 && _route.RouteLines.some((rLine) => rLine.CheckStatus == CheckType.CheckIn)) 
            {
                this.commonService.Alert(
                    AlertType.WARNING,
                     'No se puede desactivar la ruta, posee un check in activo',
                        'Unable to deactivated the route, has an active check in'
                );
                
                return;
            }

            this.commonService.Alert(
                AlertType.QUESTION,
                "¿Desea desactivar esta ruta?",
                "Do you want to deactivate this route?",
                "Confirmación",
                "Confirmation",
                [
                    {
                        text: this.commonService.Translate('Cancelar','Cancel'),
                        role: "cancel",
                    },
                    {
                        text: this.commonService.Translate('Continuar','Continue'),
                        handler: () => {
                            this.DeactivateRoute(_route.Route);
                        },
                    },
                ],
            );
        }
    }

    /**
     * Change the route status in the local and remote database
     * @param _routeToDeactivate The route to update
     * @constructor
     */
    async DeactivateRoute(_routeToDeactivate: IRoute) : Promise<void>
    {
        let loading: HTMLIonLoadingElement = await this.loadingController.create();
        
        loading.present();
        
        _routeToDeactivate.Status = RouteStatus.Inactive;
        
        this.syncService.StopAutomaticCheckProcess(_routeToDeactivate)
            .pipe(
                finalize(() => loading.dismiss())
            ).subscribe({
                next: (callback) => {
                    this.commonService.toast(this.commonService.Translate('Desactivada con éxito', 'Deactivated successfully'));
                },
                error: (error) => {
                    this.logManagerService.Log(LogEvent.ERROR, error, "routes");
                    
                    this.commonService.alert(AlertType.ERROR, error);
                }
            });
    }

    /**
     * Show the progress of the route
     * @param _route The route to show the progress
     * @param _slidingItem Represent the button element of ionic
     * @constructor
     */
    async ViewRoutePercent(_route: IRouteWithLines, _slidingItem: IonItemSliding): Promise<void> 
    {
        let slidingRatio: number = await _slidingItem.getSlidingRatio();

        if (slidingRatio <= -1) 
        {
            let percent: string = '0';
            
            _slidingItem.close();
            
            if (_route.RouteLines && _route.RouteLines.length > 0) 
            {
                let progressCount = _route.RouteLines.filter(element => element.CheckStatus == CheckType.CheckOutFail || element.CheckStatus == CheckType.CheckOutSuccess || element.CheckStatus == CheckType.CheckCancel)
                    .reduce((acc) => acc++, 0);
                
                if (progressCount > 0)
                    percent = ((progressCount * 100) / _route.RouteLines.length).toFixed(2);

                this.commonService.Alert(AlertType.INFO, `${percent}% completado`, `${percent}% completed`, 'Progreso', 'Progress');
            }
        }
    }

    /**
     * Show a modal asking to the user he want finalize the route, then the finalize route method will be executed
     * @param _route The route to finalize
     * @param _slidingItem Represent the button element of ionic
     * @constructor
     */
    async OnClickFinalizeRoute(_route: IRoute, _slidingItem: IonItemSliding): Promise<void> {
        let slidingRatio: number = await _slidingItem.getSlidingRatio();

        if (slidingRatio >= 1) 
        {
            _slidingItem.close();

            this.commonService.Alert(
                AlertType.QUESTION,
                "¿Finalizar ruta? Quedará totalmente deshabilitada",
                "Finalize route? It will be totally disabled",
                "Confirmación",
                "Confirmation",
                [
                    {
                        text: this.commonService.Translate('Cancelar','Cancel'),
                        role: "cancel",
                    },
                    {
                        text: this.commonService.Translate('Continuar','Continue'),
                        handler: () => {
                            this.FinalizeRoute(_route);
                        },
                    },
                ],
            );
        }
    }

    /**
     * This method calculate distance y duraration
     * @param _response
     * @constructor
     * @private
     */
    private CalculateDistanceDuration(_response: google.maps.DistanceMatrixResponse[]): ICalculateDistanceDuration {

        let totalDistance: number = 0;
        let totalDuration: number = 0;
        try {
            _response.forEach(matrix => {
                if (matrix.rows) {
                    matrix.rows.forEach(row => {
                        row.elements.forEach(element => {
                            if (element.status === 'OK') {
                                totalDistance += element.distance.value;
                                totalDuration += element.duration.value;
                            }
                        });
                    });
                }
            });

        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error);
        }

        return {
            Distance: totalDistance,
            Duration: totalDuration,
            Data: _response
        } as ICalculateDistanceDuration
    }


    /**
     * Send a request to finalize the selected route
     * @param _route The route to finalize
     * @param _alertCalculation Indicates if should show the calculation details alert
     * @constructor
     */
    async FinalizeRoute(_route: IRoute): Promise<void> 
    {
        let shouldShowCalculationAlert = true;
        
        let loader = await this.loadingController.create({
            message: this.commonService.Translate('Procesando...','Processing...')
        });
        
        loader.present();

        _route.Status = RouteStatus.Finished;

        let alertSubTitle: string = "";
        
        this.checkRouteService.CreateRouteHistory(CheckType.RouteFinishCheck, _route.Id,"Finalización de ruta - Check automático")
            .pipe(
                concatMap((result => {
                    if (!result)
                    {
                        this.commonService.alert(AlertType.WARNING, this.commonService.Translate("Verifique que los servicios de ubicación esten activos", "Check if location services are enable"));

                        return EMPTY;
                    }
                    
                    return this.repositoryRoute.UpdateRouteStatus(_route.Id, _route.Status);
                })),
                concatMap(response => {
                    if(![this.network.Connection.UNKNOWN, this.network.Connection.NONE].includes(this.network.type))
                    {
                        return this.repositoryRouteHistory.GetRouteHistories(_route.Id)
                            .pipe(
                                filter(routeHistories => routeHistories && routeHistories.length > 0),
                                switchMap(routeHistories => from(this.routeCalculationService.CalculateRoute(routeHistories))),
                                map(response => this.CalculateDistanceDuration(response)),
                                switchMap(response => this.routeService.UpdateRouteCalculationsDetails(_route.Id, CalculationType.CALCULATED, response.Distance, response.Duration, JSON.stringify(response.Data))
                                    .pipe(
                                        map(callback => response)
                                    )
                                ),
                                catchError(error => {
                                    shouldShowCalculationAlert = false;
                                    alertSubTitle = error;
                                    return of(true);
                                })
                            );
                    }
                   
                    shouldShowCalculationAlert = false;
                    
                    return of(true);
                }),
                concatMap(result => this.repositoryRouteHistory.GetRouteHistories(_route.Id)
                    .pipe(
                        concatMap(histories => {
                            let synchronizedHistories = histories.filter(history => history.IsSynchronized);
                            
                            if(synchronizedHistories)
                            {
                                return from(synchronizedHistories)
                                    .pipe(
                                        concatMap(history => this.repositoryRouteHistory.DeleteRouteHistory(history.Id)),
                                        map(deleteResult => result)
                                    );
                            }
                            
                            return of(result);
                        })
                    )),
                finalize(() => loader.dismiss())
            )
            .subscribe({
                next: (response) => {
                    if (shouldShowCalculationAlert && typeof response != 'boolean') 
                    {
                        alertSubTitle = this.commonService.Translate(
                            `<p>Distancia: ${this.decimalPipe.transform(response.Distance / 1000, '1.2-2')} Km<p><p>Duración: ${this.decimalPipe.transform(response.Duration / 60 / 60, '1.2-2')} horas<p>`,
                            `<p>Distance: ${this.decimalPipe.transform(response.Distance / 1000, '1.2-2')} Km<p><p>Duration: ${this.decimalPipe.transform(response.Duration / 60 / 60, '1.2-2')} horas<p>`
                        );
                    }
                    else
                    {
                        alertSubTitle = this.commonService.Translate("No se realizaron cálculos de ruta", "No route calculations were performed.");
                    }
                    
                    this.commonService.alert(
                        AlertType.INFO, 
                        alertSubTitle,
                        this.commonService.Translate('Ruta completada','Route completed')
                    );
                },
                error: (error) => {
                    this.logManagerService.Log(LogEvent.ERROR, error);
                    this.commonService.alert(AlertType.ERROR, error);
                }
            });
    }

    async OnClickRouteMap(_routeId: number, _slidingRoute: IonItemSliding): Promise<void> {
        let slidingRatio: number = await _slidingRoute.getSlidingRatio();

        if (slidingRatio <= -1) {
            _slidingRoute.close();

            this.router.navigate(["route-map", _routeId]);
        }
    }
    OnRefreshRoutes(_event: any): void {
        this.refreshEvent = _event;
        this.syncService.SyncRoutes(true);
    }
}
