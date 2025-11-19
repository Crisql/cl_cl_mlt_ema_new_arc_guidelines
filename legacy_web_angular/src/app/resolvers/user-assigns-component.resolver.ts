import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import { ILicense } from '../interfaces/i-license';
import { IUserComponentResolvedData } from '../interfaces/i-resolvers';
import { IUser, IUserAssign } from '../interfaces/i-user';
import { AssignsService } from '../services/assigns.service';
import { CompanyService } from '../services/company.service';
import { LicensesService } from '../services/licenses.service';
import { SalesPersonService } from '../services/sales-person.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserAssignsComponentResolver implements Resolve<IUserComponentResolvedData | null> {
  constructor(private assignsService: AssignsService,
              private usersService: UserService,
              private companyService: CompanyService,
              private lincenseService: LicensesService,
              private salesMenService: SalesPersonService,
              private alertsService: AlertsService){}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUserComponentResolvedData | null> {
    return forkJoin({
      UsersAssigns: this.assignsService.Get<IUserAssign[]>(),
      Companies: this.companyService.Get<ICompany[]>(true),
      Users: this.usersService.Get<IUser[]>(),
      Licenses: this.lincenseService.Get<ILicense[]>()
    })
    .pipe(
      map(callback => ({
        Companies: callback.Companies.Data,
        Licenses: callback.Licenses.Data,
        Users: callback.Users.Data,
        UsersAssigns: callback.UsersAssigns.Data
      } as IUserComponentResolvedData)),
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
