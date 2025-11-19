import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {CompanyService} from "@app/services/company.service";
import {IDiscountHierarchiesResolvedData} from "@app/interfaces/i-resolvers";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class DiscountHierarchiesResolver implements Resolve<IDiscountHierarchiesResolvedData | null> {
  constructor(private companyService: CompanyService,
              private alertsService: AlertsService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IDiscountHierarchiesResolvedData | null> {

    let companyId = +(route.params["Id"]);

    if(isNaN(companyId)) return of(null);

    return this.companyService.GetDiscountHierarchy(companyId)
      .pipe(
        map(response => ({DiscountHierarchies: response.Data} as IDiscountHierarchiesResolvedData)),
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
