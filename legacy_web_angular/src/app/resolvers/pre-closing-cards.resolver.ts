import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, Observable, of} from 'rxjs';
import {map} from "rxjs/operators";
import {IClosingCardsResolvedData,} from "@app/interfaces/i-resolvers";
import {StructuresService} from "@app/services/structures.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {IPinpadTerminal} from "@app/interfaces/i-terminals";
import {TerminalUsersService} from "@app/services/terminal-users.service";

@Injectable({
  providedIn: 'root'
})
export class PreClosingCardsResolver implements Resolve<IClosingCardsResolvedData | null> {
  constructor(
    private structuresService: StructuresService,
    private terminalUsersService: TerminalUsersService,
    private alertsService: AlertsService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IClosingCardsResolvedData | null> {
    return forkJoin({
      Terminals: this.terminalUsersService.GetTerminals<IPinpadTerminal[]>(),
      ClosingCardType: this.structuresService.Get('ClosingCard')
    })
      .pipe(
        map(callback => {
          return {
            Terminals: callback.Terminals.Data,
            ClosingCardType: callback.ClosingCardType.Data
          } as IClosingCardsResolvedData;
        }),
        concatMap(result => {
          this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          return of(null);
        })
      );
  }
}

