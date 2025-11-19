import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {catchError, concatMap, map, Observable, of} from 'rxjs';
import {ICompany} from '../interfaces/i-company';
import {ICompanyComponentResolvedData} from '../interfaces/i-resolvers';
import {CompanyService} from '../services/company.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyComponentResolver implements Resolve<ICompanyComponentResolvedData | null> {

  constructor(private companyService: CompanyService,
              private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICompanyComponentResolvedData | null> {

    return this.companyService.Get<ICompany[]>()
    .pipe(
      map(callback => {
        return {
          Companys: callback.Data
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
