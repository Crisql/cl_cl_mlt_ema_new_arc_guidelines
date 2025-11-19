import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {ILocalPrinterComponentResolvedData} from "@app/interfaces/i-resolvers";
import {Repository} from "@clavisco/core";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";
import {LocalPrinterService} from "@app/services/local-printer.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";

@Injectable({
  providedIn: 'root'
})
export class LocalPrinterResolver implements Resolve<ILocalPrinterComponentResolvedData | null> {
  userAssign!: IUserAssign;

  constructor(private localPrinterService: LocalPrinterService,  private alertsService: AlertsService,
              private printerWorkerService: PrinterWorkerService,) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ILocalPrinterComponentResolvedData | null> {
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;

    return this.localPrinterService.Get<ILocalPrinter>(this.userAssign.Id).pipe(
      map(callback => ({
      LocalPriter: callback?.Data
      } as ILocalPrinterComponentResolvedData)),
      switchMap(callback => {
        if (callback?.LocalPriter && callback.LocalPriter.UseLocalPrint && callback.LocalPriter.PortServicePrintMethod) {
          return  this.printerWorkerService.Get(callback.LocalPriter.PortServicePrintMethod)
            .pipe(
              filter(res => !!res.Data),
              map(x=>x.Data),
              map(Printers => ({...callback, Printers})),
              catchError(() => of(callback))
            );
        } else {
          return of(callback);
        }
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
