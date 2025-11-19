import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import { ILicense } from '../interfaces/i-license';
import { ILicensesComponentResolvedData } from '../interfaces/i-resolvers';
import { LicensesService } from '../services/licenses.service';
import {CompanyService} from "../services/company.service";
import {ICompany} from "../interfaces/i-company";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class LicenseResolver implements Resolve<ILicensesComponentResolvedData | null> {
  constructor(private alertsService: AlertsService,
              private companyService: CompanyService,
              private licenseService: LicensesService)
  {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ILicensesComponentResolvedData | null> {
    return forkJoin({
      Licenses: this.licenseService.Get<ILicense[]>(),
      Companies: this.companyService.Get<ICompany[]>(true)
    })
    .pipe(
      map(callback => {
        return {
          Licenses: callback.Licenses.Data,
          Companies: callback.Companies.Data
        } as ILicensesComponentResolvedData;
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
