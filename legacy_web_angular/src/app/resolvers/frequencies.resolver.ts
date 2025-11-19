import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {RoutesFrequeciesService} from "@app/services/routes-frequecies.service";
import {IRouteFrequenciesResolvedData} from "@app/interfaces/i-resolvers";
import {IRouteFrequency} from "@app/interfaces/i-route";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class FrequenciesResolver implements Resolve<IRouteFrequenciesResolvedData | null> {
  constructor(private frequenciesService: RoutesFrequeciesService,
              private userPermissionService: PermissionUserService,
              private alertsService: AlertsService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRouteFrequenciesResolvedData | null> {
    return forkJoin({
      Frequencies: this.frequenciesService.Get<IRouteFrequency[]>(),
      RouteFrequenciesWeeks: this.frequenciesService.GetRouteFrequenciesWeeks(),
      UserPermissions: this.userPermissionService.Get<IPermissionbyUser[]>()
    })
      .pipe(
        map(responses => {
          return {
            Frequencies: responses.Frequencies.Data,
            FrequenciesWeeks: responses.RouteFrequenciesWeeks.Data,
            Permissions: responses.UserPermissions.Data
          } as IRouteFrequenciesResolvedData;
        }),
        concatMap(result => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({HttpErrorResponse:err});
          return of(null)
        }));
  }
}
