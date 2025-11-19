import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, map, Observable, of, tap} from 'rxjs';
import {UserService} from "@app/services/user.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {IPPStoredTransactionResolvedData} from "@app/interfaces/i-pp-transactions";
import {SettingCode} from "@app/enums/enums";
import {IUser} from "@app/interfaces/i-user";
import {ICompany} from "@app/interfaces/i-company";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {TerminalsService} from "@app/services/terminals.service";
import {SettingsService} from "@app/services/settings.service";
import {Repository} from "@clavisco/core";
import {StorageKey} from "@app/enums/e-storage-keys";

@Injectable({
  providedIn: 'root'
})
export class PPStoredTransactionResolver implements Resolve<IPPStoredTransactionResolvedData | null> {

  constructor(private alertsService: AlertsService,
              private usersService: UserService,
              private permissionUserService: PermissionUserService,
              private terminalsService: TerminalsService,
              private settingService: SettingsService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPPStoredTransactionResolvedData | null> {
    let companyId = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    return forkJoin({
      Users: this.usersService.Get<IUser[]>(),
      UserPermission: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Terminals: this.terminalsService.GetTerminalByCompany(companyId),
      Setting: this.settingService.Get(SettingCode.Route)
    })
      .pipe(
        map(callback => {
          return {
            Users: callback.Users.Data,
            UserPermission: callback.UserPermission.Data,
            Terminals: callback.Terminals.Data,
            Setting: callback.Setting.Data
          } as IPPStoredTransactionResolvedData;
        }),
        concatMap(result => {
          this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          return of(null);
        })
      )
  }
}
