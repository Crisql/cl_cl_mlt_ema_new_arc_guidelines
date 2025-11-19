import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {PermissionService} from "@app/services/permission.service";
import {AlertsService} from "@clavisco/alerts";
import {IGeoRoleComponentResolvedData, IRoleComponentResolvedData} from "@app/interfaces/i-resolvers";
import {GeoConfigService} from "@app/services/geo-config.service";

@Injectable({
  providedIn: 'root'
})
export class GeoConfigsResolver implements Resolve<IGeoRoleComponentResolvedData | null> {
  constructor(private geoConfigService: GeoConfigService,
              private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IGeoRoleComponentResolvedData | null> {

    return  this.geoConfigService.Get()
      .pipe(
        map(callback => {
          this.alertsService.ShowAlert({Response: callback})

          return {
            GeoConfigs: callback.Data
          } as IGeoRoleComponentResolvedData;
        }),
        catchError(error => {
          this.alertsService.ShowAlert({HttpErrorResponse: error});
          return of(null);
        })
      );

  }
}
