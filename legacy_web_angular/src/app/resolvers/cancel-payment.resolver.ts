import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ICancelPaymentResolvedData} from "../interfaces/i-resolvers";
import {catchError, concatMap, forkJoin, map, Observable, of} from "rxjs";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {TerminalsService} from "@app/services/terminals.service";
import {CurrenciesService} from "@app/services/currencies.service";
import {StructuresService} from "@app/services/structures.service";

@Injectable({
  providedIn: 'root'
})
export class CancelPaymentResolver implements Resolve<ICancelPaymentResolvedData | null> {

  constructor(
    private terminalsService: TerminalsService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService,
    private structuresService: StructuresService,
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICancelPaymentResolvedData | null> {

    return forkJoin({
      Terminals: this.terminalsService.Get(),
      Currencies:this.currenciesService.Get(true),
      DocTypes: this.structuresService.Get('DocTypesForCancel'),
    })
      .pipe(
        map(callback => {
          return {
            Terminals: callback.Terminals.Data,
            Currencies: callback.Currencies.Data,
            DocTypes: callback.DocTypes.Data,
          } as ICancelPaymentResolvedData;
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
