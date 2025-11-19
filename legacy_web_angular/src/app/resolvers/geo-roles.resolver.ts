import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, map, Observable, of} from 'rxjs';
import {RoleService} from "@app/services/role.service";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {IGeoRoleComponentResolvedData, IRoleComponentResolvedData} from "@app/interfaces/i-resolvers";
import {GeoRoleService} from "@app/services/geo-role.service";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class GeoRolesResolver implements Resolve<IGeoRoleComponentResolvedData | null> {
  constructor(
    private geoRoleService: GeoRoleService,
    private alertsService: AlertsService
  ){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IGeoRoleComponentResolvedData | null> {

    return  this.geoRoleService.Get()
      .pipe(
        map(callback => {
          return {
            GeoRoles: callback.Data
          } as IGeoRoleComponentResolvedData;
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
