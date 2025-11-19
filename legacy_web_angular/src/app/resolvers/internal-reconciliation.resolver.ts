import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IInternalReconciliationResolveData} from "@app/interfaces/i-resolvers";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {SettingsService} from "@app/services/settings.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ISettings} from "@app/interfaces/i-settings";
import {PermissionUserService} from "@app/services/permission-user.service";
import {CurrenciesService} from "@app/services/currencies.service";

@Injectable({
  providedIn: 'root'
})
export class InternalReconciliationResolver implements Resolve<IInternalReconciliationResolveData | null> {

  constructor(
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IInternalReconciliationResolveData | null> {

    let request$: Observable<any>[] = [
      this.currenciesService.Get(true),
      this.permissionUserService.Get<IPermissionbyUser[]>(),
      this.settingService.Get<ISettings[]>(),
    ];

    return forkJoin(request$).pipe(
      map(res => {
        return {
          Currencies: res[0].Data,
          Permissions: res[1].Data,
          Settings: res[2].Data,
        } as IInternalReconciliationResolveData
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
