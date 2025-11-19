import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, map, Observable, of} from 'rxjs';
import { IRoleComponentResolvedData } from '../interfaces/i-resolvers';
import { RoleService } from '../services/role.service';
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class RoleResolver implements Resolve<IRoleComponentResolvedData | null> {

  constructor(private roleService: RoleService,
              private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRoleComponentResolvedData | null> {

    return  this.roleService.Get()
    .pipe(
      map(callback => {
        return {
          Roles: callback.Data
        } as IRoleComponentResolvedData;
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
