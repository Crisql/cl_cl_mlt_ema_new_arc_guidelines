import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { ITerminalsComponentsResoveData } from "../interfaces/i-resolvers";
import {Observable, catchError, map, of, forkJoin, concatMap} from "rxjs";
import { TerminalsService } from "../services/terminals.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {CurrenciesService} from "@app/services/currencies.service";


@Injectable({
  providedIn: 'root'
})
export class TerminalsResolver implements Resolve<ITerminalsComponentsResoveData | null>{

  constructor(
    private terminalsService: TerminalsService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITerminalsComponentsResoveData | null> {
    return forkJoin([
      this.terminalsService.Get(),
      this.currenciesService.Get(false),
    ]).pipe(
      map(callback => {
        return {
          Terminals: callback[0].Data,
          Currencies:callback[1].Data
        } as ITerminalsComponentsResoveData
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
