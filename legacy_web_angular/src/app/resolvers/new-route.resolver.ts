import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {INewRouteResolveData} from "@app/interfaces/i-resolvers";
import {RouteService} from "@app/services/route.service";
import {RoutesFrequeciesService} from "@app/services/routes-frequecies.service";
import {IRoute, IRouteFrequency, IRouteLine} from "@app/interfaces/i-route";
import {StructuresService} from "@app/services/structures.service";
import {Structures} from "@clavisco/core";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {AlertsService, CLToastType} from "@clavisco/alerts";

@Injectable({
  providedIn: 'root'
})
export class NewRouteResolver implements Resolve<INewRouteResolveData | null> {
  constructor(
              private routesFrequenciesService: RoutesFrequeciesService,
              private routeService: RouteService,
              private userPermissionService: PermissionUserService,
              private alertsService: AlertsService,
              private structuresService: StructuresService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<INewRouteResolveData | null> {

    let routeId = +(route.queryParams['routeId']);

    return forkJoin({
      Route: !isNaN(routeId) ? this.routeService.Get<IRoute>(routeId) : of({Data: {}, Message: ''} as Structures.Interfaces.ICLResponse<IRoute>),
      RouteLines: !isNaN(routeId) ? this.routeService.GetRouteLines(routeId) : of({Data: [], Message: ''} as Structures.Interfaces.ICLResponse<IRouteLine[]>),
      Frequencies: this.routesFrequenciesService.Get<IRouteFrequency[]>(true),
      RoutesTypes: this.structuresService.Get('RouteTypes'),
      UserPermissions: this.userPermissionService.Get<IPermissionbyUser[]>()
    })
      .pipe(
        map(responses => {
          return {
            Frequencies: responses.Frequencies.Data,
            Types: responses.RoutesTypes.Data,
            Route: responses.Route.Data,
            RouteLines: responses.RouteLines.Data,
            Permissions: responses.UserPermissions.Data
          };
        }),
        concatMap(result => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          return of(null);
        })
      );
  }
}
