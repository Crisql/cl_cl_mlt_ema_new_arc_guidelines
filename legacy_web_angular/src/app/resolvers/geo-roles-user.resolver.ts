import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {UserService} from "@app/services/user.service";
import {RoleService} from "@app/services/role.service";
import {CompanyService} from "@app/services/company.service";
import {IGeoRoleUserComponentResolvedData, IRoleUserComponentResolvedData} from "@app/interfaces/i-resolvers";
import {IRole} from "@app/interfaces/i-roles";
import {IUser} from "@app/interfaces/i-user";
import {ICompany} from "@app/interfaces/i-company";
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {GeoRoleService} from "@app/services/geo-role.service";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class GeoRolesUserResolver implements Resolve<IGeoRoleUserComponentResolvedData | null> {
  constructor(
    private alertsService: AlertsService,
    private userService: UserService,
    private geoRoleService: GeoRoleService,
    private companyService: CompanyService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IGeoRoleUserComponentResolvedData | null> {


    return forkJoin({
      geoRoleResponse : this.geoRoleService.Get<IGeoRole[]>(true),
      userResponse : this.userService.Get<IUser[]>(),
      companysResponse : this.companyService.Get<ICompany[]>(true)
    }).pipe(
      map(x=>{
        let data : IGeoRoleUserComponentResolvedData = {
          GeoRoles : x.geoRoleResponse.Data,
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

