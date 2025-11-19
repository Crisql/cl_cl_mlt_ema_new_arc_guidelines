import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {IPurchaseDocumentComponentResolvedData} from "../interfaces/i-resolvers";
import {Repository} from "@clavisco/core";
import {StorageKey} from "../enums/e-storage-keys";
import {IUserToken} from "../interfaces/i-token";
import {IBusinessPartner} from "../interfaces/i-business-partner";
import {ISalesPerson} from "../interfaces/i-sales-person";
import {IPriceList} from "../interfaces/i-price-list";
import {IExchangeRate} from "../interfaces/i-exchange-rate";
import {ITaxe} from "../interfaces/i-taxe";
import {ICurrencies} from "../interfaces/i-currencies";
import {IWarehouse} from "../interfaces/i-warehouse";
import {
  IDefaultBusinessPartnerSetting,
  IPaymentSetting,
  ISettings,
  IValidateAttachmentsSetting
} from "../interfaces/i-settings";
import {ItemsService} from "../services/items.service";
import {SalesPersonService} from "../services/sales-person.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {ExchangeRateService} from "../services/exchange-rate.service";
import {TaxesService} from "../services/taxes.service";
import {WarehousesService} from "../services/warehouses.service";
import {SettingsService} from "../services/settings.service";
import {SalesDocumentService} from "../services/sales-document.service";
import {AssignsService} from "../services/assigns.service";
import {PriceListService} from "../services/price-list.service";
import {SuppliersService} from "../services/suppliers.service";
import {PermissionUserService} from "../services/permission-user.service";
import {IPermissionbyUser} from "../interfaces/i-roles";
import {IDocument} from "../interfaces/i-sale-document";
import {PurchaseSearchDocsService} from "../services/purchase-search-docs.service";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {IFilterKeyUdf, IUdfContext, UdfSourceLine} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {
  ControllerName,
  DocumentType, ItemsFilterType,
  PreloadedDocumentActions,
  PurchaseTypeDocuments, SettingCode
} from "@app/enums/enums";
import {CurrenciesService} from "@app/services/currencies.service";
import {ICompany} from "@app/interfaces/i-company";
import {AttachmentsService} from "@app/services/Attachments.service";
import {IUserAssign} from "@app/interfaces/i-user";
import {WithholdingTaxService} from "@app/services/withholding-tax.service";
import {IWithholdingTax} from "@app/interfaces/i-withholding-tax";

@Injectable({
  providedIn: 'root'
})
export class PurchasesDocumentResolver implements Resolve<IPurchaseDocumentComponentResolvedData | null> {

  User!: IUserToken | null;
  Company: number = 0;
  userAssign!: IUserAssign;

  constructor(
    private itemService: ItemsService,
    private suppliersService: SuppliersService,
    private salesMenService: SalesPersonService,
    private PriceListService: PriceListService,
    private exchangeRateService: ExchangeRateService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private settingService: SettingsService,
    private purchaseService: PurchaseSearchDocsService,
    private permissionUserService: PermissionUserService,
    private udfsService: UdfsService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService,
    private attachmentService: AttachmentsService,
    private withholdingTaxService: WithholdingTaxService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPurchaseDocumentComponentResolvedData | null> {
    const segments: string[] = state.url.split('?').shift()?.split('/') || ['/'];

    const routeSegment: string = segments[segments.length - 1];

    let docEntryParam = +(route.queryParams['DocEntry']);
    let action = route.queryParams['Action'];
    let from = route.queryParams['From'];

    let controllerToSendRequest : string = '';
    let typeDocument: string = '';
    let draftDocument : string = ''

    switch (routeSegment) {
      case 'good-receipt':
        typeDocument = DocumentType.Purchase;
        if(docEntryParam > 0 && from == PurchaseTypeDocuments.PurchaseOrders){
          controllerToSendRequest = ControllerName.order
        }else{
          controllerToSendRequest = ControllerName.goodReceipt
        }
        break;
      case 'return-good':
        typeDocument = DocumentType.PurchaseReturns;
        controllerToSendRequest = ControllerName.PurchaseReturns
        break;
      case 'order':
        typeDocument = DocumentType.PurchaseOrder;
        controllerToSendRequest = ControllerName.order
        break;
    }

    if(docEntryParam > 0 && from == PurchaseTypeDocuments.Draft){
      draftDocument = DocumentType.Draft;
      controllerToSendRequest = from;
    }


    const currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;
    let Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    let preloadedDocumentObs$ = route.queryParamMap.has('DocEntry') ? this.purchaseService.GetDocument<IDocument>(controllerToSendRequest, +(route.queryParamMap.get('DocEntry') ||0))
      .pipe(
        concatMap(documentResponse => {
          if(!documentResponse.Data.AttachmentEntry) return of({Document: documentResponse, AttachmentLines: null});

          return this.attachmentService.Get(documentResponse.Data.AttachmentEntry)
            .pipe(
              map(attachmentResponse => {
                documentResponse.Data.AttachmentEntry = documentResponse.Data.AttachmentEntry??0;

                attachmentResponse.Data = attachmentResponse.Data.map(attL => ({
                  ...attL,
                  LineNum: attL.LineNum??0,
                  AbsoluteEntry:  attL.AbsoluteEntry??0
                }));

                return {
                  Document: documentResponse,
                  AttachmentLines: attachmentResponse
                };
              })
            )
        })
      )  : of(null);

    return forkJoin({
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      SalesPersons:  this.salesMenService.Get<ISalesPerson[]>(),
      PriceList: this.PriceListService.Get<IPriceList[]>(undefined,ItemsFilterType.PrchseItem),
      Taxes: this.taxesService.GetTaxesAP(),
      Currency: this.currenciesService.Get(false),
      Warehouse: this.warehouseService.Get<IWarehouse[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(currentSession?.WhsCode, ItemsFilterType.PrchseItem),
      UdfsLines: this.udfsService.Get<IUdfContext[]>(action === 'copy' ? DocumentType.PurchaseOrder : typeDocument, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(typeDocument)
        .pipe(catchError(res => of(null))),
      PreloadedDocument: preloadedDocumentObs$
    })
      .pipe(
        map(callback => ({
          ExchangeRate: callback.ExchangeRate.Data,
          SalesPersons: callback.SalesPersons.Data,
          PriceList: callback.PriceList.Data,
          Taxes: callback.Taxes.Data,
          Currency: callback.Currency.Data,
          Warehouse: callback.Warehouse.Data,
          Settings: callback.Settings.Data,
          Permissions: callback.Permissions.Data,
          Items: callback.Items.Data,
          UdfsLines: callback.UdfsLines?.Data ,
          UdfsDevelopment: callback.UdfsDevelopment?.Data,
          PreloadedDocument: callback.PreloadedDocument?.Document.Data,
          AttachmentLines: callback.PreloadedDocument?.AttachmentLines?.Data,
        } as IPurchaseDocumentComponentResolvedData)),

    switchMap(callback => {
      const data = callback;

      if (callback?.PreloadedDocument) {

        return this.suppliersService.Get<IBusinessPartner>(callback?.PreloadedDocument.CardCode)
          .pipe(
            filter(BusinessPartner => !!BusinessPartner.Data),
            map(x => x.Data),
            map(BusinessPartner => ({...data, BusinessPartner})),
            catchError(() => of(data))
          );
      } else {
        //Business partner default
        if(this.userAssign?.BuyerCode){
          return this.suppliersService.Get<IBusinessPartner>(this.userAssign.BuyerCode)
            .pipe(
              filter(BusinessPartner => !!BusinessPartner.Data),
              map(x => x.Data),
              map(BusinessPartner => ({...data, BusinessPartner})),
              catchError(() => of(data))
            );
        }
        else if (callback.Settings && callback.Settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
          let companyDefaultBusinessPartner = JSON.parse(callback.Settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

            let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === Company) as IDefaultBusinessPartnerSetting;

            if (dataCompany) {
              return this.suppliersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerSupplier)
                .pipe(
                  filter(BusinessPartner => !!BusinessPartner.Data),
                  map(x => x.Data),
                  map(BusinessPartner => ({...data, BusinessPartner})),
                  catchError(() => of(data))
                );
            }
          }
        }
      }
      return of(data);
    }),
        switchMap(callback => {
          const data = callback;
          if (callback?.PreloadedDocument && callback?.UdfsLines && callback?.UdfsLines.length > 0) {
            let UdfsbyLine: UdfSourceLine[] = [];

            callback?.PreloadedDocument.DocumentLines.map((line, index) => {
              let udf = {
                Index: index.toString(),
                ValueLine: line.LineNum.toString(),
                Value: route.queryParamMap.get('DocEntry')?.toString(),
                TableId: action === 'copy' ? DocumentType.PurchaseOrder : typeDocument,
                Udf: callback.UdfsLines
              } as UdfSourceLine;
              UdfsbyLine.push(udf);
            });

            return this.udfsService.GetUdfsLinesData<UdfSourceLine[]>(UdfsbyLine)
              .pipe(
                filter(UdfsData => !!UdfsData.Data),
                map(x => x.Data),
                map(UdfsData => ({...data, UdfsData})),
                catchError(() => of(data))
              );
          } else {
            return of(data);
          }
        }),
        switchMap(callback => {
          const data = callback;
          if (callback?.PreloadedDocument) {

            let documentType: string = '';
            if(action === 'copy'){
              documentType =  DocumentType.PurchaseOrder
            }else{
              documentType = draftDocument ? draftDocument : typeDocument
            }

            let udfKey = {
              DocEntry: +(route.queryParamMap.get('DocEntry') || 0),
              TypeDocument: documentType,
              DraftType: draftDocument ? typeDocument : null
            } as IFilterKeyUdf;
            return this.udfsService.GetUdfsData(udfKey)
              .pipe(
                filter(UdfsDataHeader => !!UdfsDataHeader.Data),
                map(x => x.Data),
                map(UdfsDataHeader => ({...data, UdfsDataHeader})),
                catchError(() => of(data))
              );
          } else {
            return of(data);
          }
        }),
        switchMap(callback => {
          const data = callback;
          if (callback.Settings && callback.Settings.find((element) => element.Code == SettingCode.ValidateAttachments)) {
            let companyValidateAttachmentsSetting = JSON.parse(callback.Settings.find((element) => element.Code == SettingCode.ValidateAttachments)?.Json || '') as IValidateAttachmentsSetting[];

            if (companyValidateAttachmentsSetting && companyValidateAttachmentsSetting.length > 0) {

              let dataCompany = companyValidateAttachmentsSetting.find(x => x.CompanyId === Company) as IValidateAttachmentsSetting;
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
        switchMap(callback => {
          const data: IPurchaseDocumentComponentResolvedData = callback;
          const documentsAllowedWithholding = new Set<string>([
            DocumentType.PurchaseOrder,
            DocumentType.PurchaseInvoice,
            DocumentType.APDownPayments
          ]);

          const invoiceAllowedWithholding: boolean = documentsAllowedWithholding.has(typeDocument);

          if (invoiceAllowedWithholding && callback.Settings && callback.Settings.find((element) => element.Code === SettingCode.Payment)){
            let companyDefaultBusinessPartner: IPaymentSetting[] = JSON.parse(callback.Settings.find((element) => element.Code === SettingCode.Payment)?.Json || '') as IPaymentSetting[];

            if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length) {
              let dataCompany: IPaymentSetting = companyDefaultBusinessPartner.find(x => x.CompanyId === Company) as IPaymentSetting;

              if (dataCompany && dataCompany?.RetentionProcess) {
                if (data?.PreloadedDocument) {
                  return this.withholdingTaxService.GetByBusinessPartner<IWithholdingTax[]>(callback?.PreloadedDocument?.CardCode || '')
                    .pipe(
                      filter(WithholdingTax => !!WithholdingTax.Data),
                      map(x => x.Data),
                      map(WithholdingTax => ({ ...data, WithholdingTax })),
                      catchError(() => of(data))
                    );
                } else {
                  //Business partner default
                  if(this.userAssign?.SellerCode){
                    return this.withholdingTaxService.GetByBusinessPartner<IWithholdingTax[]>(this.userAssign.SellerCode)
                      .pipe(
                        filter(WithholdingTax => !!WithholdingTax.Data),
                        map(x => x.Data),
                        map(WithholdingTax => ({ ...data, WithholdingTax })),
                        catchError(() => of(data))
                      );
                  }
                }
              }
            }
          }

          return of(data);
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
