import {Injectable} from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {GetError, Structures} from '@clavisco/core';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {ICompany} from '../interfaces/i-company';
import {IRoleUserComponentResolvedData} from '../interfaces/i-resolvers';
import {IRole} from '../interfaces/i-roles';
import {IUser} from '../interfaces/i-user';
import {CompanyService} from '../services/company.service';
import {RoleService} from '../services/role.service';
import {UserService} from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RolUserResolver implements Resolve<IRoleUserComponentResolvedData | null> {
  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private alertsService: AlertsService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRoleUserComponentResolvedData | null> {

    return forkJoin({
      userResponse: this.userService.Get<IUser[]>(true),
      companysResponse:this.companyService.Get<ICompany[]>( true)
    }).pipe(
      map(x => {
        let data: IRoleUserComponentResolvedData = {
          Users: x.userResponse.Data,
          Companys: x.companysResponse.Data

        }
        return data;
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
