import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IPrincipalComponentResolvedData} from '../interfaces/i-resolvers';
import {MenuService} from '../services/menu.service';
import {SettingsService} from "../services/settings.service";
import {StructuresService} from "@app/services/structures.service";
import {ICompany} from "@app/interfaces/i-company";
import {SharedService} from "@app/shared/shared.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {PermissionUserService} from "@app/services/permission-user.service";
import {CurrenciesService} from "@app/services/currencies.service";
import {Repository} from "@clavisco/core";
import {IUserAssign} from "@app/interfaces/i-user";
import {StorageKey} from "@app/enums/e-storage-keys";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {LocalPrinterService} from "@app/services/local-printer.service";

@Injectable({
  providedIn: 'root'
})
export class PrincipalComponentResolver implements Resolve<IPrincipalComponentResolvedData | null> {
  constructor(
    private menuService: MenuService,
    private alertsService: AlertsService,
    private settingService: SettingsService,
    private structuresService: StructuresService,
    private sharedService: SharedService,
    private permissionUserService: PermissionUserService,
    private currenciesService: CurrenciesService,
    private localPrinterService : LocalPrinterService
    ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPrincipalComponentResolvedData | null> {

    const selectedCompany = this.sharedService.OnCurrentCompanyChange() as ICompany;
    const userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;

    return forkJoin(
      {
        menuService: this.menuService.Get(),
        settingService: this.settingService.Get(),
        permission: !selectedCompany ? of(null) :  this.permissionUserService.Get<IPermissionbyUser[]>(),
        currencies: !selectedCompany ? of(null) : this.currenciesService.Get(false),
        LocalPrinter:  !selectedCompany ? of(null) : this.localPrinterService.Get<ILocalPrinter>(userAssign?.Id)
          .pipe(catchError(res => of(null))),
      }
    ).pipe(
      map((res) => {
        return {
          MenuOptions: res.menuService.Data,
          Setting: res.settingService.Data,
          Permissions: res.permission?.Data,
          Currencies: res.currencies?.Data ?? null,
          LocalPrinter: res.LocalPrinter?.Data
        } as IPrincipalComponentResolvedData;
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
        return of(null)
      })
    );

  }
}
