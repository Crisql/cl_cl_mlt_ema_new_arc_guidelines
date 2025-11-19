import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import { ICompanyComponentResolvedData } from '../interfaces/i-resolvers';
import { ISettings } from '../interfaces/i-settings';
import { CompanyService } from '../services/company.service';
import { SettingsService } from '../services/settings.service';
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class CompanyAccountResolver implements Resolve<ICompanyComponentResolvedData | null> {
  constructor(private companyService: CompanyService,
              private alertsService: AlertsService,
              private settingsService: SettingsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICompanyComponentResolvedData | null> {


    let Id: number = route.params['Id'] ? +(route.params['Id']) : 0;

    if (Id <= 0) {
      this.alertsService.Toast({ type: CLToastType.ERROR, message: 'Debe enviar el parametro "Id"' });
    }

    return forkJoin({
      companyResponse: this.companyService.Get<ICompany[]>(false,Id),
      settingsResponse: this.settingsService.Get<ISettings[]>()
    }).pipe(
      map(x => {
        return {
          Settings: x.settingsResponse.Data,
        } as ICompanyComponentResolvedData;
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
    );

  }
}
