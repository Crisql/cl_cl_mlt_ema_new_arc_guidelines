import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IRouteListResolveData} from "@app/interfaces/i-resolvers";
import {RouteService} from "@app/services/route.service";
import {IRoute, IRouteFrequency} from "@app/interfaces/i-route";
import {IUser} from "@app/interfaces/i-user";
import {StructuresService} from "@app/services/structures.service";
import {UserService} from "@app/services/user.service";
import {RoutesFrequeciesService} from "@app/services/routes-frequecies.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {AlertsService, CLToastType} from "@clavisco/alerts";

@Injectable({
  providedIn: 'root'
})
export class RouteListResolver implements Resolve<IRouteListResolveData | null> {
  constructor(private routeService: RouteService,
              private usersService: UserService,
              private structuresService: StructuresService,
              private userPermissionService: PermissionUserService,
              private routeFrequencies: RoutesFrequeciesService,
              private alertsService: AlertsService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRouteListResolveData | null> {

    return forkJoin({
      Users: this.usersService.Get<IUser[]>(),
      RouteStates: this.structuresService.Get('RouteStates'),
      RouteTypes: this.structuresService.Get('RouteTypes'),
      Frequencies: this.routeFrequencies.Get<IRouteFrequency[]>(),
      UserPermissions: this.userPermissionService.Get<IPermissionbyUser[]>()
    }).pipe(map(responses => {
      return {
        States: responses.RouteStates.Data,
        Users: responses.Users.Data,
        RouteTypes: responses.RouteTypes.Data,
        Frequencies: responses.Frequencies.Data,
        Permissions: responses.UserPermissions.Data
      }
    }),
      concatMap(result => {
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
        return of(result);
      }),
      catchError((err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err})
        return of(null);
      }));
  }
}
