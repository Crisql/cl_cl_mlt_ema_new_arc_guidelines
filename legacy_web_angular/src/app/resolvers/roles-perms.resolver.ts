import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {map, Observable, of, catchError, forkJoin, concatMap} from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import { IRoleComponentResolvedData } from '../interfaces/i-resolvers';
import { IPermission, IRole } from '../interfaces/i-roles';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class RolesPermsResolver  implements Resolve<IRoleComponentResolvedData | null> {
  constructor(private permsService: PermissionService,
              private roleService: RoleService,
              private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRoleComponentResolvedData | null> {

    return forkJoin({
      roleResponse : this.roleService.Get<IRole[]>(true),
      permissions: this.permsService.Get<IPermission[]>()
    }).pipe(
      map(callback => ({
        Roles : callback.roleResponse?.Data,
        Permissions: callback.permissions?.Data
      } as IRoleComponentResolvedData)),
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
