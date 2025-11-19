import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {SettingsService} from "../services/settings.service";
import {catchError, concatMap, forkJoin, map, Observable, of} from "rxjs";
import {ISettings} from "../interfaces/i-settings";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {ILoyaltyPlanResolveData} from "../interfaces/i-resolvers";
import {SettingCode} from "../enums/enums";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class LoyaltyPlanResolver implements Resolve<ILoyaltyPlanResolveData | null> {

  constructor(
    private settingService: SettingsService,
    private alertsService: AlertsService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ILoyaltyPlanResolveData | null> {

    return this.settingService.Get<ISettings>(SettingCode.Points).pipe(
      map(res => {
        return {Points: res.Data} as ILoyaltyPlanResolveData
      }),
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
    )
  }

}
