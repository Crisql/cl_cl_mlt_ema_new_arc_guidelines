import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import { IUserComponentResolvedData } from '../interfaces/i-resolvers';
import { UserService } from '../services/user.service';
import {SettingsService} from "@app/services/settings.service";
import {ISettings} from "@app/interfaces/i-settings";
import {SettingCode} from "@app/enums/enums";

@Injectable({
  providedIn: 'root'
})
export class UserComponentResolver implements Resolve<IUserComponentResolvedData | null> {
  constructor(private userService: UserService,
              private settingService: SettingsService,
              private alertsService: AlertsService){}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUserComponentResolvedData | null> {

    return forkJoin({
      SchedulingSetting: this.settingService.Get<ISettings>(SettingCode.SchedulingConfiguration),
      Users: this.userService.Get()
    })
    .pipe(
      map(responses => {
        return {
          Users: responses.Users.Data,
          SchedulingSetting: responses.SchedulingSetting.Data
        } as IUserComponentResolvedData;
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
