import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {catchError, concatMap, forkJoin, Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {ISearchPurchaseDocumentsResolvedData, ISearchTransfersRequestResolvedData} from "@app/interfaces/i-resolvers";
import {SalesPersonService} from "@app/services/sales-person.service";
import {StructuresService} from "@app/services/structures.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import { PermissionUserService } from '../services/permission-user.service';
import { IPermissionbyUser } from "@app/interfaces/i-roles";
import {SettingsService} from "@app/services/settings.service";
import {ISettings} from "@app/interfaces/i-settings";

@Injectable({
  providedIn: 'root'
})
export class SearchTransferRequestResolver implements Resolve<ISearchTransfersRequestResolvedData | null> {

  constructor(
    private salesPersonsService: SalesPersonService,
    private structuresService: StructuresService,
    private alertsService: AlertsService,
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ISearchTransfersRequestResolvedData | null> {
    return forkJoin({
      SalesPersons: this.salesPersonsService.Get(),
      DocStates: this.structuresService.Get('DocStates'),
      DocTypes: this.structuresService.Get('DocTypesForSearchDocsInventory'),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>()
        .pipe(catchError(res => of(null))),
      Settings: this.settingService.Get<ISettings[]>(),
    })
      .pipe(
        map(callback => {
          return {
            SalesPersons: callback.SalesPersons.Data,
            DocStates: callback.DocStates.Data,
            DocTypes: callback.DocTypes.Data,
            Permissions: callback.Permissions?.Data,
            Settings: callback.Settings?.Data,
          } as ISearchPurchaseDocumentsResolvedData;
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
