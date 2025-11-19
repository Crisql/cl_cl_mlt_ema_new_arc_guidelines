import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import { IConection } from '../interfaces/i-conection';
import { ICompanyConectionComponentResolvedData } from '../interfaces/i-resolvers';
import { ISettings } from '../interfaces/i-settings';
import { CompanyService } from '../services/company.service';
import { ConnectionsService } from '../services/connections.service';
import { SettingsService } from '../services/settings.service';
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class CompanyGeneralResolver implements Resolve<ICompanyConectionComponentResolvedData | null> {
  constructor(private companyService: CompanyService,
              private settingsService: SettingsService,
              private connectionsService: ConnectionsService,
              private alertsService: AlertsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICompanyConectionComponentResolvedData | null> {


    let Id: number = route.params['Id'] ? +(route.params['Id']) : 0;

    if (Id <= 0) {
      this.alertsService.Toast({ type: CLToastType.ERROR, message: 'Debe enviar el parametro "Id"' });
    }

    return forkJoin({
      companyResponse: this.companyService.Get<ICompany[]>(false,Id),
      conectionResponse: this.connectionsService.Get<IConection[]>()
    }).pipe(
      map(x => {
        return {
          Companys: x.companyResponse.Data,
          Conections: x.conectionResponse.Data
        } as ICompanyConectionComponentResolvedData;
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
