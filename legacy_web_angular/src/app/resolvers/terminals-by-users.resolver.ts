import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ITermsByUserResolveData} from "../interfaces/i-resolvers";
import {Observable, catchError, map, of, forkJoin, concatMap} from "rxjs";
import {TerminalsService} from "../services/terminals.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {UserService} from "../services/user.service";
import {CompanyService} from "../services/company.service";
import {ITerminals} from "../interfaces/i-terminals";
import {IUser} from "../interfaces/i-user";
import {ICompany} from "../interfaces/i-company";
import {CurrenciesService} from "@app/services/currencies.service";


@Injectable({
  providedIn: 'root'
})
export class TerminalsByUsersResolver implements Resolve<ITermsByUserResolveData | null> {

  constructor(
    private alertsService: AlertsService,
    private terminalsService: TerminalsService,
    private usersService: UserService,
    private companyService: CompanyService,
    private currenciesService: CurrenciesService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITermsByUserResolveData | null> {

    return forkJoin({
      terminals: this.terminalsService.Get<ITerminals[]>(),
      users: this.usersService.Get<IUser[]>(),
      company: this.companyService.Get<ICompany[]>( true),
      currencies: this.currenciesService.Get(false)
    }).pipe(
      map(callback => {
        return {
          Terminals: callback.terminals.Data,
          Users: callback.users.Data,
          Company: callback.company.Data,
          Currencies: callback.currencies.Data
        } as ITermsByUserResolveData
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
