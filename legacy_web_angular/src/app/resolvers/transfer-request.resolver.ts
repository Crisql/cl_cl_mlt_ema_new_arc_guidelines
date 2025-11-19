import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {ITransferRequestResolveData} from "@app/interfaces/i-resolvers";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {WarehousesService} from "@app/services/warehouses.service";
import {SalesPersonService} from "@app/services/sales-person.service";
import {PreloadedDocumentActions, SettingCode} from "@app/enums/enums";
import {InventoryTrasferRequestService} from "@app/services/inventory-trasfer-request.service";
import {IFilterKeyUdf, IUdfContext, UdfSourceLine} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {ItemsService} from "@app/services/items.service";
import {IStockTransferRequest} from "@app/interfaces/i-stockTransferRequest";
import {SettingsService} from "@app/services/settings.service";
import {ISettings, IValidateAttachmentsSetting} from "@app/interfaces/i-settings";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {AttachmentsService} from "@app/services/Attachments.service";
import {Repository} from "@clavisco/core";
import {ICompany} from "@app/interfaces/i-company";
import {StorageKey} from "@app/enums/e-storage-keys";


@Injectable({
  providedIn: 'root'
})
export class TransferRequestResolver implements Resolve<ITransferRequestResolveData | null> {
  Company: number = 0;
  constructor(
    private warehousesService: WarehousesService,
    private salesPersonService: SalesPersonService,
    private inventoryTransferRequestService: InventoryTrasferRequestService,
    private udfsService: UdfsService,
    private alertsService: AlertsService,
    private itemsService: ItemsService,
    private settingService: SettingsService,
    private permissionUserService: PermissionUserService,
    private attachmentService: AttachmentsService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITransferRequestResolveData | null> {
    this.Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    let request$: Observable<any>[] = [
      this.warehousesService.Get<IWarehouse[]>(),
      this.salesPersonService.Get<ISalesPerson[]>(),
      this.settingService.Get<ISettings>(SettingCode.Payment),
      this.settingService.Get<ISettings[]>(),
      this.udfsService.Get<IUdfContext[]>('OWTQ', true, true)
        .pipe(catchError(res => of(null))),
      this.udfsService.GetUdfsDevelopment('OWTQ')
        .pipe(catchError(res => of(null))),
      this.permissionUserService.Get<IPermissionbyUser[]>()
    ];

    if (route.queryParamMap.has('DocEntry')) {
      request$.push(this.inventoryTransferRequestService.Get
      (
        +(route.queryParamMap.get('DocEntry') || 0),
        PreloadedDocumentActions.EDIT
      ))
    }

    return forkJoin(request$).pipe(
      switchMap(callback => {
        if (route.queryParamMap.has('DocEntry')) {
          let header = callback[4]?.Data as IStockTransferRequest;
          return this.itemsService.GetItemForTransferRequest(header?.FromWarehouse ?? '').pipe(
            map(res => {
              return {
                Data: callback,
                Items: res.Data
              }
            })
          )
        } else {
          return of({
            Data: callback,
            Items: []
          })
        }
      }),
      map(result => {
        let request = result.Data;
        return {
          Warehouses: request[0].Data,
          SalesPerson: request[1].Data,
          Setting: request[2].Data,
          Settings: request[3].Data,
          UdfsLines: request[4]?.Data,
          UdfsDevelopment: request[5] ? request[5].Data : null,
          Permissions:  request[6]?.Data,
          TransfersRequest: request[7] ? request[7].Data : null,
          Items: result.Items ?? []
        } as ITransferRequestResolveData;
      }),
      switchMap(callback => {
        const data = callback;
        if (callback?.TransfersRequest && callback?.UdfsLines && callback?.UdfsLines.length > 0) {
          let UdfsbyLine: UdfSourceLine[] = [];

          callback?.TransfersRequest.StockTransferLines.map((line, index) => {
            let udf = {
              Index: index.toString(),
              ValueLine: line.BaseLine.toString(),
              Value: route.queryParamMap.get('DocEntry'),
              TableId: 'OWTQ',
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
        if (callback?.TransfersRequest) {
          let udfKey = {
            DocEntry: +(route.queryParamMap.get('DocEntry') || 0),
            TypeDocument: 'OWTQ'
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
        if(data?.TransfersRequest?.AttachmentEntry!=null){
          return this.attachmentService.Get(data.TransfersRequest.AttachmentEntry)
            .pipe(
              filter(Attachments => !!Attachments.Data),
              map(x => x.Data),
              map(Attachments => ({ ...data, Attachments })),
              catchError(() => of(data))
            );
        }else{
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
      concatMap(result => {
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
