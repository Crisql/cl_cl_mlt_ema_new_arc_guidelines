import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {WarehousesService} from "@app/services/warehouses.service";
import {PriceListService} from "@app/services/price-list.service";
import {ItemsService} from "@app/services/items.service";
import {IInventoryOuputResolveData} from "@app/interfaces/i-resolvers";
import {catchError, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {Repository} from "@clavisco/core";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {IPriceList} from "@app/interfaces/i-price-list";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {SettingsService} from "@app/services/settings.service";
import {ISettings, IValidateAttachmentsSetting} from "@app/interfaces/i-settings";
import {ItemsFilterType, SettingCode} from "@app/enums/enums";
import {IUdfContext} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {CurrenciesService} from "@app/services/currencies.service";
import {ICompany} from "@app/interfaces/i-company";


@Injectable({
  providedIn: 'root'
})
export class InventoryOuputResolver implements Resolve<IInventoryOuputResolveData | null> {
  Company: number = 0;
  constructor(
    private warehouseService: WarehousesService,
    private priceListService: PriceListService,
    private itemsService: ItemsService,
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
    private udfsService: UdfsService,
    private exchangeRateService: ExchangeRateService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IInventoryOuputResolveData | null> {

    const segments: string[] = state.url.split('?').shift()?.split('/') || ['/'];
    this.Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;
    const routeSegment: string = segments[segments.length - 1];
    let typeDocument = '';
    switch (routeSegment) {
      case 'output':
        typeDocument = 'OIGE';
        break;
      case 'entry':
        typeDocument = 'OIGN';
        break;
    }
    let currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession);

    return forkJoin({
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      Warehouses: this.warehouseService.Get<IWarehouse[]>(),
      PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.InvntItem),
      Items: this.itemsService.GetAll<ItemSearchTypeAhead[]>(currentSession?.WhsCode),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      UdfsLines: this.udfsService.Get<IUdfContext[]>(typeDocument, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(typeDocument)
        .pipe(catchError(res => of(null))),
      Currencies: this.currenciesService.Get(false)
    }).pipe(
      map(res => {

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });

        return {
          ExchangeRate: res.ExchangeRate.Data,
          Warehouse: res.Warehouses.Data,
          PriceList: res.PriceList.Data,
          Items: res.Items.Data,
          Permissions: res.Permissions.Data,
          Setting: res.Settings.Data,
          UdfsLines: res.UdfsLines?.Data ?? [],
          UdfsDevelopment: res.UdfsDevelopment?.Data ?? [],
          Currencies: res.Currencies.Data
        } as IInventoryOuputResolveData
      }),
      switchMap(callback => {
        const data = callback;
        if (callback.Setting && callback.Setting.find((element) => element.Code == SettingCode.ValidateAttachments)) {
          let companyDefaultBusinessPartner = JSON.parse(callback.Setting.find((element) => element.Code == SettingCode.ValidateAttachments)?.Json || '') as IValidateAttachmentsSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

            let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.Company) as IValidateAttachmentsSetting;

            if (dataCompany) {
              dataCompany.Validate.forEach(element => {
                let validate =  dataCompany.Validate.find((x) => x.Table == element.Table);
                if (validate) {
                  element.Active = validate.Active;
                }
              });
              // Aquí puedes retornar tu objeto ValidateAttachmentsTables con la información necesaria
              const ValidateAttachmentsTables: IValidateAttachmentsSetting= {
                Validate:dataCompany.Validate,
                CompanyId:dataCompany.CompanyId
              };

              return of({...data, ValidateAttachmentsTables});
            }
          }
        }

        return of(data);
      }),
      catchError((err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
        return of(null);
      })
    );
  }
}
