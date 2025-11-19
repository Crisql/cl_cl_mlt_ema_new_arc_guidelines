import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {IPermissionsResolveData} from "@app/interfaces/i-resolvers";
import {catchError, concatMap, map, Observable, of} from "rxjs";
import {PermissionService} from "@app/services/permission.service";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {Injectable} from "@angular/core";
import {IPermission} from "@app/interfaces/i-roles";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class PermissionsResolver implements Resolve<IPermissionsResolveData | null> {

  constructor(
    private permissionsService: PermissionService,
    private alertsService: AlertsService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPermissionsResolveData | null> {

    return this.permissionsService.Get<IPermission[]>().pipe(
      map(res => {
        return {
          Permissions: res.Data
        } as IPermissionsResolveData
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
