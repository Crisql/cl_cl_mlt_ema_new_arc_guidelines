import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IFieldsConfiguredResolveData,} from "../interfaces/i-resolvers";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {ISettings} from "../interfaces/i-settings";
import {SettingCode} from "../enums/enums";
import {SettingsService} from "../services/settings.service";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class FieldsConfiguredSapResolver implements Resolve<IFieldsConfiguredResolveData | null> {

  constructor(private settingService: SettingsService,
              private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IFieldsConfiguredResolveData | null> {

    return forkJoin({
      FieldsConfiguredSAP: this.settingService.Get<ISettings>(SettingCode.FieldsConfiguredSAP).pipe( catchError(res=> of(null))),
      Fields: this.settingService.GetFieldsBusinessPartner()
    })
      .pipe(
        map(callback => ({
          FieldsConfiguredSAP: callback.FieldsConfiguredSAP?.Data,
          Fields: callback.Fields.Data,
        } as IFieldsConfiguredResolveData)),
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
