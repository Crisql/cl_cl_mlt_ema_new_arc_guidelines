import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {AlertsService} from "@clavisco/alerts";
import {IUdfResolvedData} from "../interfaces/i-resolvers";
import {UdfsService} from "../services/udfs.service";
import {IUdfCategory} from "../interfaces/i-udf";
import {SettingsService} from "@app/services/settings.service";
import {ISettings} from "@app/interfaces/i-settings";
import {SettingCode} from "@app/enums/enums";

@Injectable({
  providedIn: 'root'
})
export class UdfResolver implements Resolve<IUdfResolvedData | null>  {
  constructor(private settingService: SettingsService, private alertsService: AlertsService)
  {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUdfResolvedData | null> {

    return  this.settingService.Get<ISettings>(SettingCode.UdfGroup)
      .pipe(
        map(callback => {
          this.alertsService.ShowAlert({Response: callback})

          return {
            Setting: callback.Data
          } as IUdfResolvedData;
        }),
        catchError(error => {
          this.alertsService.ShowAlert({HttpErrorResponse: error});
          return of(null);
        })
      );

  }
}
