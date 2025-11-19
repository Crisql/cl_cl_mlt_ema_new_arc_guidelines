import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {IDBResourceResolvedData} from '../interfaces/i-resolvers';
import {DbResourcesService} from '../services/db-resources.service';
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class DbResourcesResolver implements Resolve<IDBResourceResolvedData | null> {
  constructor(private dbResourceService: DbResourcesService,
              private alertsService: AlertsService)
  {

  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IDBResourceResolvedData | null> {
    let companyId = +(route.params['Id']);

    if(isNaN(companyId))
    {
      this.alertsService.Toast({type: CLToastType.ERROR, message: 'El id de la compañía no tiene el formato correcto'});
      return of(null);
    }

    return forkJoin({
      dbResources: this.dbResourceService.GetResourcesByCompany(companyId),
      dbResourceTypes: this.dbResourceService.GetTypes()
    })
    .pipe(
      map(callback => {
        return {
          DBResources: callback.dbResources.Data,
          DBResourceTypes: callback.dbResourceTypes.Data
        } as IDBResourceResolvedData;
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
