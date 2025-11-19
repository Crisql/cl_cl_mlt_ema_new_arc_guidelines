import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { AlertsService, CLToastType } from '@clavisco/alerts';
import { Structures } from '@clavisco/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ISeriesResolvedData } from '../interfaces/i-resolvers';
import { ISerie } from '../interfaces/i-serie';
import { SeriesService } from '../services/series.service';

@Injectable({
  providedIn: 'root'
})
export class SeriesResolver implements Resolve<ISeriesResolvedData | null> {
TEST:ISerie[] = [];
  constructor(private serieService: SeriesService,
    private alertsService: AlertsService){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ISeriesResolvedData | null> {

    let Id: number = route.params['Id'] ? +(route.params['Id']) : 0;

    if (Id <= 0) {
      this.alertsService.Toast({ type: CLToastType.ERROR, message: 'Debe enviar el parametro "Id"' });
    }

    return this.serieService.Get<ISerie[]>()
    .pipe(
      map(callback => {
        this.alertsService.ShowAlert({Response: callback})

        return {
          Series: callback.Data
        } as ISeriesResolvedData;
      }),
      catchError(error => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
        return of(null);
      })
    );

  }
}
