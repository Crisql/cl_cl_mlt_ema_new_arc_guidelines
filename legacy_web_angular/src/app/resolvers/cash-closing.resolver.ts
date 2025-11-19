import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {SettingsService} from "../services/settings.service";
import {IPaymentSetting, ISettings} from "../interfaces/i-settings";
import {SettingCode} from "../enums/enums";
import {catchError, concatMap, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {ICashClosingResolverData} from "../interfaces/i-resolvers";
import {Injectable} from "@angular/core";
import {PinPad, Repository} from "@clavisco/core";
import {ICompany} from "@app/interfaces/i-company";
import {StorageKey} from "@app/enums/e-storage-keys";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import ITerminal = PinPad.Interfaces.ITerminal;
import {CurrenciesService} from "@app/services/currencies.service";

@Injectable({
  providedIn: 'root'
})
export class CashClosingResolver implements Resolve<ICashClosingResolverData | null> {

  constructor(
    private settingService: SettingsService,
    private terminalUsersService: TerminalUsersService,
    private permissionUserService: PermissionUserService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICashClosingResolverData | null> {

    let companyId = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    return forkJoin([
      this.settingService.Get<ISettings>(SettingCode.Payment),
      this.currenciesService.Get(false),
      this.permissionUserService.Get<IPermissionbyUser[]>(),
    ]).pipe(
      switchMap(res => {
        let data: IPaymentSetting[] = JSON.parse(res[0].Data?.Json || '');
        let pinpad: boolean = false;

        if (data && data.length > 0) {
          pinpad = data.some(x =>x.CompanyId === companyId && x.Pinpad);
        }

        if (pinpad) {
          return this.terminalUsersService.GetTerminals<ITerminal[]>().pipe(
            map(terminals => {
              return {
                Setting: res[0].Data,
                Currency: res[1].Data,
                Terminals: terminals.Data,
                Permissions: res[2].Data
              }as ICashClosingResolverData
            })
          );
        } else {
          return of({
            Setting: res[0].Data,
            Currency: res[1].Data,
            Terminals: [],
            Permissions: res[2].Data
          }as ICashClosingResolverData);
        }
      }),
      concatMap(result => {
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
        return of(result);
      }),
      catchError(err => {
        this.alertsService.ShowAlert({
          HttpErrorResponse:  err
        });
        return of(null);
      })
    );
  }

}

