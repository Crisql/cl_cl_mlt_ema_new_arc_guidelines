import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ICreditMemoComponentResolvedData} from "../interfaces/i-resolvers";
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {IBusinessPartner} from "../interfaces/i-business-partner";
import {ISalesPerson} from "../interfaces/i-sales-person";
import {IPriceList} from "../interfaces/i-price-list";
import {IPayTerms} from "../interfaces/i-pay-terms";
import {ITaxe} from "../interfaces/i-taxe";
import {IWarehouse} from "../interfaces/i-warehouse";
import {IDefaultBusinessPartnerSetting, ISettings, IValidateAttachmentsSetting} from "../interfaces/i-settings";
import {IPermissionbyUser} from "../interfaces/i-roles";
import {ItemsService} from "../services/items.service";
import {BusinessPartnersService} from "../services/business-partners.service";
import {SalesPersonService} from "../services/sales-person.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {PayTermsService} from "../services/pay-terms.service";
import {TaxesService} from "../services/taxes.service";
import {WarehousesService} from "../services/warehouses.service";
import {SettingsService} from "../services/settings.service";
import {SalesDocumentService} from "../services/sales-document.service";
import {PermissionUserService} from "../services/permission-user.service";
import {PriceListService} from "../services/price-list.service";
import {Repository, Structures} from "@clavisco/core";
import {StorageKey} from "../enums/e-storage-keys";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {StructuresService} from "@app/services/structures.service";
import {IFilterKeyUdf, IUdfContext, UdfSourceLine} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {CurrenciesService} from "@app/services/currencies.service";
import {ControllerName, DocumentType, ItemsFilterType, PreloadedDocumentActions, SettingCode} from "@app/enums/enums";
import {ICompany} from "@app/interfaces/i-company";
import {AttachmentsService} from "@app/services/Attachments.service";
import {IUserAssign} from "@app/interfaces/i-user";

@Injectable({
  providedIn: 'root'
})
export class CreditMemoResolver implements Resolve<ICreditMemoComponentResolvedData | null> {
  Company: number = 0;
  userAssign!: IUserAssign;
  constructor(
    private itemService: ItemsService,
    private businessPartnersService: BusinessPartnersService,
    private salesMenService: SalesPersonService,
    private priceListService: PriceListService,
    private alertsService: AlertsService,
    private payTermService: PayTermsService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private settingService: SettingsService,
    private permissionUserService: PermissionUserService,
    private documentService: SalesDocumentService,
    private structuresService: StructuresService,
    private udfsService: UdfsService,
    private currenciesService: CurrenciesService,
    private attachmentService: AttachmentsService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICreditMemoComponentResolvedData | null> {


    let currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession);
    let typeDocument = '';
    this.Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;

    if (route.queryParamMap.has('DocEntry')) {
      let controller = route.queryParamMap.get('From') ?? '';
      if (controller === ControllerName.Invoices) {
        typeDocument = DocumentType.Invoices;
      } else if(controller === ControllerName.CreditNotes) {
        typeDocument = DocumentType.CreditNotes;
      } else {
        typeDocument = DocumentType.ArDownPayments;
      }
    } else {
      typeDocument = DocumentType.CreditNotes;
    }
    let action = route.queryParams['Action'];
    let shouldResetAttachmentEntry = [PreloadedDocumentActions.COPY, PreloadedDocumentActions.DUPLICATE, PreloadedDocumentActions.CREATE_FROM_DRAFT].includes(action);
    const salesPersons$ = this.salesMenService.Get<ISalesPerson[]>();
    const priceLists$ = this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.SellItem);
    const payTerms$ = this.payTermService.Get<IPayTerms[]>()
    const taxes$ = this.taxesService.Get<ITaxe[]>();
    const wareHouses$ = this.warehouseService.Get<IWarehouse[]>();
    const settings$ = this.settingService.Get<ISettings[]>();
    const permissions$ = this.permissionUserService.Get<IPermissionbyUser[]>();
    const currency$ = this.currenciesService.Get(false);
    const items$ = this.itemService.GetAll<ItemSearchTypeAhead[]>(currentSession?.WhsCode, ItemsFilterType.SellItem);
    const typeIdentification$ = this.structuresService.Get('TypeIdentification');
    const udfLines$ = this.udfsService.Get<IUdfContext[]>(typeDocument, true, true)
      .pipe(catchError(res => of(null)));
    const udfsDevelopment$ = this.udfsService.GetUdfsDevelopment(typeDocument)
      .pipe(catchError(res => of(null)));
    let controller = route.queryParamMap.get('From') ?? '';
    let docEntryParam = +(route.queryParams['DocEntry']);
    let preloadedDocumentObs$ = isNaN(docEntryParam) ? of(null) :
      this.documentService.GetDocument(controller, docEntryParam)
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
    let data$: Observable<any>[] = [
      salesPersons$,
      priceLists$,
      payTerms$,
      taxes$,
      wareHouses$,
      settings$,
      permissions$,
      currency$,
      items$,
      typeIdentification$,
      udfLines$,
      udfsDevelopment$,
      preloadedDocumentObs$
    ];

    let Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    return forkJoin(data$).pipe(
      map(res => {
        return {
          SalesPersons: res[0].Data,
          PriceList: res[1].Data,
          PayTerms: res[2].Data,
          Taxes: res[3].Data,
          Warehouse: res[4].Data,
          Settings: res[5].Data,
          Permissions: res[6].Data,
          Currency: res[7].Data,
          Items: res[8].Data,
          TypeIdentification: res[9].Data,
          UdfsLines: res[10]?.Data,
          UdfsDevelopment: res[11] ? res[11].Data : null,
          Invoice: res[12] ? res[12]?.Document.Data : null,
          AttachmentLines: res[12] ? res[12]?.AttachmentLines?.Data : null,
        } as ICreditMemoComponentResolvedData
      }),
      switchMap(callback => {
        const data = callback;

        if (callback?.Invoice) {

          return this.businessPartnersService.Get<IBusinessPartner>(callback?.Invoice.CardCode)
            .pipe(
              filter(BusinessPartner => !!BusinessPartner.Data),
              map(x => x.Data),
              map(BusinessPartner => ({...data, BusinessPartner})),
              catchError(() => of(data))
            );
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

              let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === Company) as IDefaultBusinessPartnerSetting;

              if (dataCompany && dataCompany.BusinessPartnerCustomer) {
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
        if (callback?.Invoice && callback?.UdfsLines && callback?.UdfsLines.length > 0) {
          let UdfsbyLine: UdfSourceLine[] = [];

          callback?.Invoice.DocumentLines.map((line, index) => {
            let udf = {
              Index: index.toString(),
              ValueLine: line.LineNum.toString(),
              Value: route.queryParamMap.get('DocEntry')?.toString(),
              TableId: typeDocument,
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
        if (callback?.Invoice) {
          let udfKey = {
            DocEntry: +(route.queryParamMap.get('DocEntry') || 0),
            TypeDocument: typeDocument
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
      concatMap(result => {
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
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
      catchError(err => {
        this.alertsService.ShowAlert({
          HttpErrorResponse: err
        });
        return of(null);
      })
    );
  }


}
