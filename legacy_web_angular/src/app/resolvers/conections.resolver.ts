import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, map, Observable, of} from 'rxjs';
import { IConection } from '../interfaces/i-conection';
import { IConectionsResolvedData } from '../interfaces/i-resolvers';
import { ConnectionsService } from '../services/connections.service';
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class ConectionsResolver implements Resolve<IConectionsResolvedData | null> {

  constructor(private connectionsService: ConnectionsService,
              private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IConectionsResolvedData | null> {

    return this.connectionsService.Get<IConection[]>()
    .pipe(
      map(callback => {
        return {
          Conections: callback.Data
        } as IConectionsResolvedData;
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
