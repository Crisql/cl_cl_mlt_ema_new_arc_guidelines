import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, Observable, of} from 'rxjs';
import {ISearchDocumentsResolvedData} from "../interfaces/i-resolvers";
import {SalesPersonService} from "../services/sales-person.service";
import {BusinessPartnersService} from "../services/business-partners.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {map} from "rxjs/operators";
import {StructuresService} from "../services/structures.service";
import {TerminalsService} from "@app/services/terminals.service";
import { PermissionUserService } from '../services/permission-user.service';
import { IPermissionbyUser } from "@app/interfaces/i-roles";
import {SettingsService} from "@app/services/settings.service";
import {ISettings} from "@app/interfaces/i-settings";

@Injectable({
  providedIn: 'root'
})
export class SearchDocsResolver implements Resolve<ISearchDocumentsResolvedData | null> {
  constructor(
    private salesPersons: SalesPersonService,
    private businessPartnerService: BusinessPartnersService,
    private structuresService: StructuresService,
    private terminalsService: TerminalsService,
    private alertsService: AlertsService,
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ISearchDocumentsResolvedData | null> {
    return forkJoin({
      SalesPersons: this.salesPersons.Get(),
      DocTypes: this.structuresService.Get('DocTypesForSearchDocs'),
      DocStates: this.structuresService.Get('DocStates'),
      Terminals: this.terminalsService.Get(),
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
            Terminals: callback.Terminals.Data,
            Permissions: callback.Permissions?.Data,
            Settings: callback.Settings?.Data,
          } as ISearchDocumentsResolvedData;
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
