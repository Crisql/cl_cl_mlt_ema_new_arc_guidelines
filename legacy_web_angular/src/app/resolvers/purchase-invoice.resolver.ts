import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {ItemsService} from "@app/services/items.service";
import {SalesPersonService} from "@app/services/sales-person.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {PayTermsService} from "@app/services/pay-terms.service";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {TaxesService} from "@app/services/taxes.service";
import {WarehousesService} from "@app/services/warehouses.service";
import {SettingsService} from "@app/services/settings.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {UdfsService} from "@app/services/udfs.service";
import {PriceListService} from "@app/services/price-list.service";
import {SuppliersService} from "@app/services/suppliers.service";
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {IPurchaseInvoiceComponentResolvedData} from "@app/interfaces/i-resolvers";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {
  IDefaultBusinessPartnerSetting,
  IPaymentSetting,
  ISettings,
  IValidateAttachmentsSetting
} from "@app/interfaces/i-settings";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IFilterKeyUdf, IUdfContext, UdfSourceLine} from "@app/interfaces/i-udf";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {IActionDocument, ITypeDocE} from "@app/interfaces/i-document-type";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {Repository} from "@clavisco/core";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {CurrenciesService} from "@app/services/currencies.service";
import {
  ControllerName,
  DocumentType,
  ItemsFilterType,
  PreloadedDocumentActions,
  PurchaseTypeDocuments, SettingCode
} from "@app/enums/enums";
import {IDocument} from "@app/interfaces/i-sale-document";
import {PurchaseSearchDocsService} from "@app/services/purchase-search-docs.service";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PinPad} from "@clavisco/pinpad";
import ITerminal = PinPad.Interfaces.ITerminal;
import {ActionDocument} from "@app/shared/common-functions";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {ICompany} from "@app/interfaces/i-company";
import {AttachmentsService} from "@app/services/Attachments.service";
import {IUserAssign} from "@app/interfaces/i-user";
import {WithholdingTaxService} from "@app/services/withholding-tax.service";
import {IWithholdingTax} from "@app/interfaces/i-withholding-tax";


@Injectable({
  providedIn: 'root'
})
export class PurchaseInvoiceResolver implements Resolve<IPurchaseInvoiceComponentResolvedData | null> {
  Company: number = 0;
  userAssign!: IUserAssign;
  constructor(
    private suppliersService: SuppliersService,
    private itemService: ItemsService,
    private salesMenService: SalesPersonService,
    private priceListService: PriceListService,
    private payTermsService: PayTermsService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private settingService: SettingsService,
    private permissionUserService: PermissionUserService,
    private udfsService: UdfsService,
    private salesDocumentService: SalesDocumentService,
    private exchangeRateService: ExchangeRateService,
    private alertsService: AlertsService,
    private currenciesService: CurrenciesService,
    private purchaseService: PurchaseSearchDocsService,
    private terminalUsersService: TerminalUsersService,
    private attachmentService: AttachmentsService,
    private withholdingTaxService: WithholdingTaxService,
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPurchaseInvoiceComponentResolvedData | null> {
    let docEntryParam = +(route.queryParams['DocEntry']);
    let from = route.queryParams['From'];
    let action = route.queryParams['Action'];

    const segments: string[] = state.url.split('?').shift()?.split('/') || ['/'];

    const routeSegment: string = segments[segments.length - 1];

    let TypeDocument = '';
    let DraftDocument: string = '';
    let controllerToSendRequest  = ControllerName.purchaseInvoice


    switch (routeSegment) {
      case 'invoice':
        TypeDocument = DocumentType.PurchaseInvoice;
        break;

      case 'down-payments':
        TypeDocument = DocumentType.APDownPayments;
        controllerToSendRequest = ControllerName.APDownPayments;
        break;
    }
    if(docEntryParam > 0 && action === PreloadedDocumentActions.CREATE_FROM_DRAFT && from){
      DraftDocument = DocumentType.Draft;
      controllerToSendRequest = ControllerName.Draft;
    }

    const currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;

    let preloadedDocumentObs$ = isNaN(docEntryParam) ?
      of(null) :
      this.purchaseService.GetDocument<IDocument>(controllerToSendRequest, docEntryParam)
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
        );


    let Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    return forkJoin({
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(currentSession?.WhsCode,ItemsFilterType.PrchseItem),
      SalesMan: this.salesMenService.Get<ISalesPerson[]>(),
      PayTemrs: this.payTermsService.Get<IPayTerms[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      PreloadedDocument: preloadedDocumentObs$,
      TypeDocE: this.salesDocumentService.GetTypeDocE<ITypeDocE[]>('Invoices'),
      PriceList: this.priceListService.Get(undefined,ItemsFilterType.PrchseItem),
      Taxes: this.taxesService.GetTaxesAP(),
      Warehouses: this.warehouseService.Get<IWarehouse[]>(),
      Terminals: this.terminalUsersService.GetTerminals<ITerminal[]>(),
      UdfsLine: this.udfsService.Get<IUdfContext[]>(TypeDocument, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(TypeDocument)
        .pipe(catchError(res => of(null))),
      Currencies: this.currenciesService.Get(false),
      UdfsPaymentDevelopment: this.udfsService.GetUdfsDevelopment(DocumentType.OutgoingPayment)
        .pipe(catchError(res => of(null))),
    }).pipe(
      map(result => ({
          ExchangeRate: result.ExchangeRate.Data,
          Items: result.Items.Data,
          SalesPersons: result.SalesMan.Data,
          PayTerms: result.PayTemrs.Data,
          Settings: result.Settings.Data,
          Permissions: result.Permissions.Data,
          PreloadedDocument: result.PreloadedDocument?.Document.Data,
          AttachmentLines: result.PreloadedDocument?.AttachmentLines?.Data,
          TypeDocE: result.TypeDocE.Data,
          PriceList: result.PriceList.Data,
          Taxes: result.Taxes.Data,
          Warehouse: result.Warehouses.Data,
          Terminals : result.Terminals.Data,
          UdfsLines: result.UdfsLine?.Data ?? [],
          UdfsDevelopment: result.UdfsDevelopment?.Data ?? [],
          Currencies: result.Currencies?.Data ?? [],
          UdfsPaymentDevelopment: result.UdfsPaymentDevelopment?.Data
        } as IPurchaseInvoiceComponentResolvedData)
      ),

    switchMap(callback => {
      const data = callback;

      if (callback?.PreloadedDocument) {

        return this.suppliersService.Get<IBusinessPartner>(callback?.PreloadedDocument.CardCode)
          .pipe(
            filter(Supplier => !!Supplier.Data),
            map(x => x.Data),
            map(Supplier => ({...data, Supplier})),
            catchError(() => of(data))
          );
      } else {
        //Business partner default
        if(this.userAssign?.BuyerCode){
          return this.suppliersService.Get<IBusinessPartner>(this.userAssign?.BuyerCode)
            .pipe(
              filter(Supplier => !!Supplier.Data),
              map(x => x.Data),
              map(Supplier => ({...data, Supplier})),
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
                  filter(Supplier => !!Supplier.Data),
                  map(x => x.Data),
                  map(Supplier => ({...data, Supplier})),
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
              TableId: TypeDocument,
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
          let udfKey = {
            DocEntry: +(route.queryParamMap.get('DocEntry') ||0),
            TypeDocument: DraftDocument ? DraftDocument : TypeDocument,
            DraftType: DraftDocument ? TypeDocument : null
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
          let companyDefaultBusinessPartner = JSON.parse(callback.Settings.find((element) => element.Code == SettingCode.ValidateAttachments)?.Json || '') as IValidateAttachmentsSetting[];

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
      switchMap(callback => {
        const data: IPurchaseInvoiceComponentResolvedData = callback;
        const documentsAllowedWithholding = new Set<string>([
          DocumentType.PurchaseOrder,
          DocumentType.PurchaseInvoice,
          DocumentType.APDownPayments
        ]);

        const invoiceAllowedWithholding: boolean = documentsAllowedWithholding.has(TypeDocument);

        if (invoiceAllowedWithholding && callback.Settings && callback.Settings.find((element) => element.Code === SettingCode.Payment)){
          let companyDefaultBusinessPartner: IPaymentSetting[] = JSON.parse(callback.Settings.find((element) => element.Code === SettingCode.Payment)?.Json || '') as IPaymentSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length) {
            let dataCompany: IPaymentSetting = companyDefaultBusinessPartner.find(x => x.CompanyId === this.Company) as IPaymentSetting;

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
        this.alertsService.Toast({
          type:CLToastType.SUCCESS,
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
