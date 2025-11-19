import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {ISaleDocumentComponentResolvedData} from "../interfaces/i-resolvers";
import {SalesPersonService} from "../services/sales-person.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {ISalesPerson} from "../interfaces/i-sales-person";
import {ItemsService} from "../services/items.service";
import {IBusinessPartner} from "../interfaces/i-business-partner";
import {BusinessPartnersService} from "../services/business-partners.service";
import {PriceListService} from "../services/price-list.service";
import {IPriceList} from "../interfaces/i-price-list";
import {PayTermsService} from "../services/pay-terms.service";
import {IPayTerms} from "../interfaces/i-pay-terms";
import {ExchangeRateService} from "../services/exchange-rate.service";
import {IExchangeRate} from "../interfaces/i-exchange-rate";
import {TaxesService} from "../services/taxes.service";
import {ITaxe} from "../interfaces/i-taxe";
import {WarehousesService} from "../services/warehouses.service";
import {IWarehouse} from "../interfaces/i-warehouse";
import {SettingsService} from "../services/settings.service";
import {IActionDocument, ITypeDocE} from "../interfaces/i-document-type";
import {SalesDocumentService} from "../services/sales-document.service";
import {
  IDefaultBusinessPartnerSetting, IPaymentSetting,
  ISettings,
  IValidateAttachmentsSetting
} from "../interfaces/i-settings";
import {PinPad, Repository} from "@clavisco/core";
import {IUserToken} from "../interfaces/i-token";
import {StorageKey} from "../enums/e-storage-keys";
import {IUserAssign} from "../interfaces/i-user";
import {ICompany} from "../interfaces/i-company";
import {IPermissionbyUser} from "../interfaces/i-roles";
import {PermissionUserService} from '../services/permission-user.service';
import {ControllerName, DocumentType, ItemsFilterType, PreloadedDocumentActions, SettingCode} from "../enums/enums";
import {ItemSearchTypeAhead} from "../interfaces/i-item-typeahead";
import {ICurrentSession} from "../interfaces/i-localStorage";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {IFilterKeyUdf, IUdfContext, UdfSourceLine} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {ActionDocument} from "@app/shared/common-functions";
import ITerminal = PinPad.Interfaces.ITerminal;
import {CurrenciesService} from "@app/services/currencies.service";
import {JsonpClientBackend} from "@angular/common/http";
import {AttachmentsService} from "@app/services/Attachments.service";
import {WithholdingTaxService} from "@app/services/withholding-tax.service";
import {IWithholdingTax} from "@app/interfaces/i-withholding-tax";

@Injectable({
  providedIn: 'root'
})
export class  SalesDocumentResolver implements Resolve<ISaleDocumentComponentResolvedData | null> {
  User!: IUserToken | null;
  Company: number = 0;
  userAssign!: IUserAssign;

  constructor(
    private itemService: ItemsService,
    private businessPartnersService: BusinessPartnersService,
    private salesMenService: SalesPersonService,
    private PriceListService: PriceListService,
    private alertsService: AlertsService,
    private paytermsService: PayTermsService,
    private exchangeRateService: ExchangeRateService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private settingService: SettingsService,
    private salesDocumentService: SalesDocumentService,
    private permissionUserService: PermissionUserService,
    private terminalUsersService: TerminalUsersService,
    private udfsService: UdfsService,
    private currenciesService: CurrenciesService,
    private attachmentService: AttachmentsService,
    private withholdingTaxService: WithholdingTaxService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ISaleDocumentComponentResolvedData | null> {
    const segments: string[] = state.url.split('?').shift()?.split('/') || ['/'];

    const routeSegment: string = segments[segments.length - 1];

    let actionDocument = {} as IActionDocument;
    let draftDocument = {} as IActionDocument;

    let typeDocumentDevelopment: string = '';

    let docEntryParam = +(route.queryParams['DocEntry']);
    let from = route.queryParams['From'];
    let action = route.queryParams['Action'];

    actionDocument = ActionDocument(routeSegment);
    typeDocumentDevelopment = actionDocument.typeDocument;

    if (docEntryParam > 0 && action === PreloadedDocumentActions.COPY && from) {
      actionDocument = ActionDocument(from, true);
    } else if(docEntryParam > 0 && action === PreloadedDocumentActions.CREATE_FROM_DRAFT && from){
      draftDocument.typeDocument = DocumentType.Draft;
      actionDocument.controllerToSendRequest = ControllerName.Draft;

    }

    let shouldResetAttachmentEntry = [PreloadedDocumentActions.COPY, PreloadedDocumentActions.DUPLICATE, PreloadedDocumentActions.CREATE_FROM_DRAFT].includes(action);

    let preloadedDocumentObs$ = isNaN(docEntryParam) ? of(null) :
      this.salesDocumentService.GetDocument(actionDocument.controllerToSendRequest, docEntryParam)
      .pipe(
        concatMap(response => {

          if(!response.Data.AttachmentEntry) return of({Document: response, AttachmentLines: null});

          return this.attachmentService.Get(response.Data.AttachmentEntry)
            .pipe(
              map(attachmentResponse => {
                if(shouldResetAttachmentEntry)
                {
                  response.Data.AttachmentEntry = response.Data.AttachmentEntry??0;

                  attachmentResponse.Data = attachmentResponse.Data.map(attL => {
                    attL.AbsoluteEntry = attL.AbsoluteEntry??0;
                    attL.LineNum = attL.LineNum??0;
                    return attL;
                  });
                }

                return attachmentResponse;
              }),
              map(attachmentResponse => ({
                Document: response,
                AttachmentLines: attachmentResponse
              }))
            )
        }),
        catchError(res => of(null))
      );

    let udfPaymentDevelopment$ = typeDocumentDevelopment === DocumentType.Invoices ?this.udfsService.GetUdfsDevelopment('ORCT') : of(null);

    let udfsWithholding$ = typeDocumentDevelopment === DocumentType.Invoices ? this.udfsService.Get<IUdfContext[]>(DocumentType.WithholdingTaxInvoice, false, true)
    .pipe(catchError(res => of(null))) : of(null);

    this.Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session);

    const currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;

    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;

    // @ts-ignore
    return forkJoin({
      Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(currentSession.WhsCode, ItemsFilterType.SellItem).pipe(catchError(res => of(null))),
      SalesPersons: this.salesMenService.Get<ISalesPerson[]>(),
      PriceList: this.PriceListService.Get<IPriceList[]>(undefined,ItemsFilterType.SellItem),
      PayTerms: this.paytermsService.Get<IPayTerms[]>(),
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      Taxes: this.taxesService.Get<ITaxe[]>(),
      Currency: this.currenciesService.Get(false),
      Warehouse: this.warehouseService.Get<IWarehouse[]>(),
      TypeDocE: this.salesDocumentService.GetTypeDocE<ITypeDocE[]>('Invoices'),
      Settings: this.settingService.Get<ISettings[]>(),
      PreloadedDocument: preloadedDocumentObs$,
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>()
        .pipe(catchError(res => of(null))),
      Terminals: this.terminalUsersService.GetTerminals<ITerminal[]>(),
      UdfsLines: this.udfsService.Get<IUdfContext[]>(actionDocument.typeDocument, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(typeDocumentDevelopment),
      UdfsPaymentDevelopment :udfPaymentDevelopment$,
      UdfsWithholding: udfsWithholding$ 
    }).pipe(
      map(callback => ({
        Items: callback.Items?.Data,
        SalesPersons: callback.SalesPersons.Data,
        PriceList: callback.PriceList.Data,
        PayTerms: callback.PayTerms.Data,
        ExchangeRate: callback.ExchangeRate.Data,
        Taxes: callback.Taxes.Data,
        Currency: callback.Currency.Data,
        Warehouse: callback.Warehouse.Data,
        TypeDocE: callback.TypeDocE.Data,
        Settings: callback.Settings.Data,
        UserAssign: this.userAssign,
        PreloadedDocument: callback.PreloadedDocument?.Document.Data,
        AttachmentLines: callback.PreloadedDocument?.AttachmentLines?.Data,
        Permissions: callback.Permissions?.Data,
        Terminals: callback.Terminals.Data,
        UdfsLines: callback.UdfsLines?.Data,
        UdfsDevelopment: callback.UdfsDevelopment.Data,
        UdfsPaymentDevelopment: callback.UdfsPaymentDevelopment?.Data,
        UdfsWithholding: callback.UdfsWithholding?.Data
      } as ISaleDocumentComponentResolvedData)),
      switchMap(callback => {
        const data = callback;

        if (callback?.PreloadedDocument) {
          if(callback?.PreloadedDocument.CardCode){
            return this.businessPartnersService.Get<IBusinessPartner>(callback?.PreloadedDocument.CardCode)
              .pipe(
                filter(BusinessPartner => !!BusinessPartner.Data),
                map(x => x.Data),
                map(BusinessPartner => ({...data, BusinessPartner})),
                catchError(() => of(data))
              );
          } else {
            return of(data);
          }
        } else {
          //Business partner default
          if(this.userAssign?.SellerCode){
            return this.businessPartnersService.Get<IBusinessPartner>(this.userAssign.SellerCode)
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

              let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.Company) as IDefaultBusinessPartnerSetting;

              if (dataCompany && dataCompany.BusinessPartnerCustomer){
                return this.businessPartnersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerCustomer)
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
          let UdfsbyLine :UdfSourceLine[] = [];

          callback?.PreloadedDocument.DocumentLines.map((line, index) => {
            let udf = {
              Index: index.toString(),
              ValueLine: line.LineNum.toString(),
              Value: docEntryParam.toString(),
              TableId: actionDocument.typeDocument,
              Udf: callback.UdfsLines
            } as UdfSourceLine;
            UdfsbyLine.push(udf);
          });

            return this.udfsService.GetUdfsLinesData<UdfSourceLine[]>(UdfsbyLine)
              .pipe(
                filter(UdfsData => !!UdfsData.Data),
                map(x=>x.Data),
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
          let udfKey ={
            DocEntry: +(docEntryParam),
            TypeDocument: draftDocument.typeDocument? draftDocument.typeDocument: actionDocument.typeDocument,
            DraftType: draftDocument.typeDocument ? actionDocument.typeDocument : null
          } as IFilterKeyUdf;
          return this.udfsService.GetUdfsData(udfKey)
            .pipe(
              filter(UdfsDataHeader => !!UdfsDataHeader.Data),
              map(x=>x.Data),
              map(UdfsDataHeader => ({...data, UdfsDataHeader})),
              catchError(() => of(data))
            );
        } else {
          return of(data);
        }
      }),
      concatMap(result => {
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
        return of(result);
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
        const data: ISaleDocumentComponentResolvedData = callback;
        const documentsAllowedWithholding = new Set<string>([
          DocumentType.Orders,
          DocumentType.Invoices,
          DocumentType.ArDownPayments
        ]);

        const invoiceAllowedWithholding: boolean = documentsAllowedWithholding.has(typeDocumentDevelopment);

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
      catchError(err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
        return of(null);
      })
    );
  }
}
