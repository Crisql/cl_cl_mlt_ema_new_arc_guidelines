import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {catchError, concatMap, forkJoin, map, Observable, of} from "rxjs";
import {IPaymentReceivedResolveData} from "../interfaces/i-resolvers";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {IPermissionbyUser} from "../interfaces/i-roles";
import {SettingsService} from "@app/services/settings.service";
import {ISettings} from "@app/interfaces/i-settings";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PinPad} from "@clavisco/core";
import {UdfsService} from "@app/services/udfs.service";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {PermissionUserService} from "@app/services/permission-user.service";
import ITerminal = PinPad.Interfaces.ITerminal;
import {CurrenciesService} from "@app/services/currencies.service";


@Injectable({
  providedIn: 'root'
})
export class PaymentReceivedResolver implements Resolve<IPaymentReceivedResolveData | null> {

  constructor(
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
    private terminalUsersService: TerminalUsersService,
    private udfsService: UdfsService,
    private exchangeRateService: ExchangeRateService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPaymentReceivedResolveData | null> {

    return forkJoin({
      Currencies: this.currenciesService.Get(true),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      Terminal: this.terminalUsersService.GetTerminals<ITerminal[]>(),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('ORCT'),
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>()
    }).pipe(
      map(res => {
        return {
          Currencies: res.Currencies.Data,
          Permissions: res.Permissions.Data,
          Settings: res.Settings.Data,
          Terminals: res.Terminal.Data,
          UdfsDevelopment: res.UdfsDevelopment.Data,
          ExchangeRate: res.ExchangeRate.Data
        } as IPaymentReceivedResolveData
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
