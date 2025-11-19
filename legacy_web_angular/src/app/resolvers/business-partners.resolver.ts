import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {AlertsService, CLToastType} from '@clavisco/alerts';
import {catchError, concatMap, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {IBusinessPartnersComponentResolvedData} from '../interfaces/i-resolvers';
import {ISettings} from "../interfaces/i-settings";
import {ObjectType, SettingCode} from "../enums/enums";
import {SettingsService} from "../services/settings.service";
import {StructuresService} from "@app/services/structures.service";
import {PriceListService} from "@app/services/price-list.service";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {BusinessPartnerGroupService} from "@app/services/business-partner-group.service";
import {PayTermsService} from "@app/services/pay-terms.service";
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {CurrenciesService} from "@app/services/currencies.service";

import {CountrysService} from "@app/services/countrys.service";
import {UdfsService} from "@app/services/udfs.service";
import {Repository} from "@clavisco/core";
import {ICompany} from "@app/interfaces/i-company";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {SeriesService} from "@app/services/series.service";
import {PermissionUserService} from "@app/services/permission-user.service";

@Injectable({
  providedIn: 'root'
})
export class BusinessPartnersResolver implements Resolve<IBusinessPartnersComponentResolvedData | null> {
  constructor(
    private settingService: SettingsService,
    private structuresService: StructuresService,
    private priceListService: PriceListService,
    private businessPartnerService: BusinessPartnersService,
    private bpGroupService: BusinessPartnerGroupService,
    private payTermsService: PayTermsService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService,
    private countryService: CountrysService,
    private udfsService: UdfsService,
    private seriesService: SeriesService,
    private permissionUserService: PermissionUserService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IBusinessPartnersComponentResolvedData | null> {

    const companyId = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;
    const userAssingId = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign)?.Id ?? 0;

    return forkJoin({
      FieldsConfiguredSAP: this.settingService.Get<ISettings>(SettingCode.FieldsConfiguredSAP),
      TypeIdentification: this.structuresService.Get('TypeIdentification'),
      TypeBusinessPartner: this.structuresService.Get('TypeBusinessPartner'),
      Payterms: this.payTermsService.Get<IPayTerms[]>(),
      PriceList: this.priceListService.Get(),
      BpsCurrencies: this.currenciesService.Get(true),
      Countrys: this.countryService.GetCountrys(),
      AddressType: this.businessPartnerService.GetAddressType(),
      SocioComercial: this.businessPartnerService.GetSocioComercial(),
      Serial: this.seriesService.GetIsSerial(userAssingId, ObjectType.BusinessPartnerCustomer, companyId),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OCRD'),
      PermissionsUser: this.permissionUserService.Get(),
    })
      .pipe(
        switchMap(response => this.bpGroupService.Get(response.TypeBusinessPartner.Data.find(x => x.Default)?.Key ?? 'C').pipe(
          map(groups => {
            return {Data: response, Groups: groups};
          })
        )),
        map(callback => ({
          FieldsConfiguredSAP: callback.Data.FieldsConfiguredSAP.Data,
          TypeIdentification: callback.Data.TypeIdentification.Data,
          TypeBusinessPartner: callback.Data.TypeBusinessPartner.Data,
          BpsGroup: callback.Groups.Data,
          PayTerms: callback.Data.Payterms.Data,
          PriceList: callback.Data.PriceList.Data,
          BpCurrencies: callback.Data.BpsCurrencies.Data,
          AddressType: callback.Data.AddressType.Data,
          SocioComercial: callback.Data.SocioComercial.Data,
          Countrys: callback.Data.Countrys.Data,
          UdfsDevelopment: callback.Data.UdfsDevelopment?.Data,
          Serial: callback.Data.Serial.Data,
          PermissionsUser: callback.Data.PermissionsUser?.Data,
        } as IBusinessPartnersComponentResolvedData)),
        concatMap((result) => {
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          return of(result);
        }),
        catchError(err => {
          this.alertsService.ShowAlert({
            HttpErrorResponse: err
          });
          return of(null);
        })
      );

  }
}
