import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of} from 'rxjs';
import {ICompany} from '../interfaces/i-company';
import { ICompanyConfigurationComponentResolvedData } from '../interfaces/i-resolvers';
import { ISettings } from '../interfaces/i-settings';
import { CompanyService } from '../services/company.service';
import { ItemsService } from '../services/items.service';
import { SettingsService } from '../services/settings.service';
import {StructuresService} from "@app/services/structures.service";
import {GetError} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class CompanyConfigurationsResolver implements Resolve<ICompanyConfigurationComponentResolvedData | null> {
  constructor(private alertsService: AlertsService,
              private companyService: CompanyService,
              private structuresService: StructuresService,
              private settingsService: SettingsService){}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICompanyConfigurationComponentResolvedData | null> {

    let Id: number = route.params['Id'] ? +(route.params['Id']) : 0;

    if (Id <= 0) {
      this.alertsService.Toast({ type: CLToastType.ERROR, message: 'Debe enviar el parametro "Id"' });
    }

    return forkJoin({
      companyResponse: this.companyService.Get<ICompany[]>(false,Id),
      inventoryTableResponse: this.settingsService.GetValidateInventoryTables(),
      settingsResponse: this.settingsService.Get<ISettings[]>(),
      marginTablesResponse: this.settingsService.GetMarginTables(),
      attachmentsTableResponse: this.settingsService.GetValidateAttachmentsTables(),
      automaticPrintingsTableResponse: this.settingsService.GetValidateAutomaticPrintingTables()
    }).pipe(
      map(x => {
        return {
          ValidateInventoryTables: x.inventoryTableResponse.Data,
          Settings: x.settingsResponse.Data,
          MarginTables: x.marginTablesResponse.Data,
          ValidateAttachmentsTables: x.attachmentsTableResponse.Data,
          ValidateAutomaticPrintingTables: x.automaticPrintingsTableResponse?.Data
        } as ICompanyConfigurationComponentResolvedData;
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
