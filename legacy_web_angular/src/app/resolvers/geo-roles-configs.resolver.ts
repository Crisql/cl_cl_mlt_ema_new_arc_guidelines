import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {PermissionService} from "@app/services/permission.service";
import {RoleService} from "@app/services/role.service";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {IGeoRoleComponentResolvedData, IRoleComponentResolvedData} from "@app/interfaces/i-resolvers";
import {IPermission, IRole} from "@app/interfaces/i-roles";
import {GeoConfigService} from "@app/services/geo-config.service";
import {GeoRoleService} from "@app/services/geo-role.service";
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {IGeoConfig} from "@app/interfaces/i-geo-config";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class GeoRolesConfigsResolver implements Resolve<IGeoRoleComponentResolvedData | null> {
  constructor(
    private geoConfigService: GeoConfigService,
    private geoRoleService: GeoRoleService,
    private alertsService: AlertsService
  ){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IGeoRoleComponentResolvedData | null> {

    return forkJoin({
      geoRoleResponse : this.geoRoleService.Get<IGeoRole[]>(),
      geoConfigResponse : this.geoConfigService.Get<IGeoConfig[]>()
    }).pipe(
      map(x=>{
        let data : IGeoRoleComponentResolvedData = {
          GeoRoles : x.geoRoleResponse.Data,
          GeoConfigs: x.geoConfigResponse.Data
        }
        return data;
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
