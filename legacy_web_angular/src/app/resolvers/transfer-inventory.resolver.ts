import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {WarehousesService} from "@app/services/warehouses.service";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {catchError, concatMap, filter, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {ITransferInventoryResolveData} from "@app/interfaces/i-resolvers";
import {SalesPersonService} from "@app/services/sales-person.service";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {InventoryTrasferRequestService} from "@app/services/inventory-trasfer-request.service";
import {PreloadedDocumentActions, SettingCode} from "@app/enums/enums";
import {IFilterKeyUdf, IUdfContext, UdfSourceLine} from "@app/interfaces/i-udf";
import {UdfsService} from "@app/services/udfs.service";
import {BinLocationsService} from "@app/services/bin-locations.service";
import {IStockTransferRequest} from "@app/interfaces/i-stockTransferRequest";
import {ItemsService} from "@app/services/items.service";
import {SettingsService} from "@app/services/settings.service";
import {ISettings, IValidateAttachmentsSetting} from "@app/interfaces/i-settings";
import {PermissionUserService} from "@app/services/permission-user.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {StockTransferService} from "@app/services/stock-transfer.service";
import {AttachmentsService} from "@app/services/Attachments.service";
import {Repository} from "@clavisco/core";
import {ICompany} from "@app/interfaces/i-company";
import {StorageKey} from "@app/enums/e-storage-keys";


@Injectable({
  providedIn: 'root'
})
export class TransferInventoryResolver implements Resolve<ITransferInventoryResolveData | null> {
  Company: number = 0;
  constructor(
    private warehousesService: WarehousesService,
    private salesPersonService: SalesPersonService,
    private inventoryTransferRequestService: InventoryTrasferRequestService,
    private udfsService: UdfsService,
    private alertsService: AlertsService,
    private binLocationService: BinLocationsService,
    private itemsService: ItemsService,
    private settingService: SettingsService,
    private permissionUserService: PermissionUserService,
    private inventoryStockTransferRequestService: StockTransferService,
    private attachmentService: AttachmentsService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ITransferInventoryResolveData | null> {
    this.Company = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;
    let typeDocument = (route.queryParamMap.has('DocEntry') && route.queryParamMap.get('Action') == 'copy')? 'OWTQ' : 'OWTR';
    let request$: Observable<any>[] = [
      this.warehousesService.Get<IWarehouse[]>(),
      this.salesPersonService.Get<ISalesPerson[]>(),
      this.settingService.Get<ISettings>(SettingCode.Payment),
      this.settingService.Get<ISettings[]>(),
      this.udfsService.Get<IUdfContext[]>(typeDocument, true, true)
        .pipe(catchError(res => of(null))),
      this.udfsService.GetUdfsDevelopment(typeDocument)
        .pipe(catchError(res => of(null))),
      this.permissionUserService.Get<IPermissionbyUser[]>()
    ];

    if (route.queryParamMap.has('DocEntry')&& route.queryParamMap.has('Action')) {
      if (route.queryParamMap.get('Action') == 'copy') {
        request$.push(this.inventoryTransferRequestService.Get
        (
          +(route.queryParamMap.get('DocEntry') || 0),
          PreloadedDocumentActions.COPY
        ))
      }
    }

    if (route.queryParamMap.has('DocEntry') && (route.queryParamMap.has('Action') )) {

      if ((route.queryParamMap.get('Action') == 'duplicate' || route.queryParamMap.get('Action') == 'edit')){
        request$.push(this.inventoryStockTransferRequestService.Get
        (
          +(route.queryParamMap.get('DocEntry') || 0),
          PreloadedDocumentActions.COPY
        ))
      }
    }

    return forkJoin(request$).pipe(
      switchMap(callback => {
        if (!route.queryParamMap.has('DocEntry')) {
          return of({
            Data: callback,
            LocationsFrom: [],
            LocationsTo: [],
            Items: []
          })
        }

        let stockTransferRequest = callback[4]?.Data as IStockTransferRequest;

        return forkJoin({
          LocationFrom: this.binLocationService.GetLocationForTransfer(stockTransferRequest?.FromWarehouse ?? ''),
          LocationTo: this.binLocationService.GetLocationForTransfer(stockTransferRequest?.ToWarehouse ?? '')
        }).pipe(
          switchMap(locations => {
            if (locations?.LocationFrom?.Data && locations?.LocationFrom?.Data.length > 0) {
              return of({
                Data: callback,
                LocationsFrom: locations.LocationFrom?.Data ?? [],
                LocationsTo: locations.LocationTo?.Data ?? [],
                Items: []
              });
            }

            return this.itemsService.GetItemForTransfer(stockTransferRequest?.FromWarehouse ?? '', 0).pipe(
              map(items => {
                return {
                  Data: callback,
                  LocationsFrom: locations.LocationFrom?.Data ?? [],
                  LocationsTo: locations.LocationTo?.Data ?? [],
                  Items: items.Data
                }
              })
            )
          })
        )
      }),
      map(result => {
        let request = result.Data;
        return {
          Warehouses: request[0].Data,
          SalesPerson: request[1].Data,
          Setting: request[2].Data,
          Settings:request[3] ? request[3].Data : [],
          UdfsLines: request[4]?.Data,
          UdfsDevelopment: request[5] ? request[5].Data : null,
          Permissions:  request[6].Data,
          TransfersRequest: request[7] ? request[7].Data : null,
          LocationsFrom: result.LocationsFrom,
          LocationsTo: result.LocationsTo,
          Items: result.Items,
          StockTransfersRequest:request[7] ? request[7].Data : null,
          Attachments:[]
        } as ITransferInventoryResolveData;
      }),
      switchMap(callback => {
        const data = callback;
        if (callback?.TransfersRequest && callback?.UdfsLines && callback?.UdfsLines.length > 0) {
          let UdfsbyLine: UdfSourceLine[] = [];

          callback?.TransfersRequest.StockTransferLines.map((line, index) => {
            let udf = {
              Index: index.toString(),
              ValueLine: String(line.LineNum),
              Value: route.queryParamMap.get('DocEntry'),
              TableId: typeDocument,
              Udf: callback.UdfsLines
            } as UdfSourceLine;
            UdfsbyLine.push(udf);
          });

          return this.udfsService.GetUdfsLinesData<UdfSourceLine[]>(UdfsbyLine)
            .pipe(
              filter(UdfsData => !!UdfsData.Data),
              map(x => x.Data),
              map(UdfsData => ({ ...data, UdfsData })),
              catchError(() => of(data))
            );
        }else if (callback?.StockTransfersRequest && callback?.UdfsLines && callback?.UdfsLines.length > 0){
          let UdfsbyLine: UdfSourceLine[] = [];

          callback?.StockTransfersRequest.StockTransferLines.map((line, index) => {
            let udf = {
              Index: index.toString(),
              ValueLine: String(line.LineNum),
              Value: route.queryParamMap.get('DocEntry'),
              TableId: typeDocument,
              Udf: callback.UdfsLines
            } as UdfSourceLine;
            UdfsbyLine.push(udf);
          });

          return this.udfsService.GetUdfsLinesData<UdfSourceLine[]>(UdfsbyLine)
            .pipe(
              filter(UdfsData => !!UdfsData.Data),
              map(x => x.Data),
              map(UdfsData => ({ ...data, UdfsData })),
              catchError(() => of(data))
            );
        }
          else {
          return of(data);
        }
      }),
      switchMap(callback => {
        const data = callback;
        if (!callback?.TransfersRequest) {
          if(!callback?.StockTransfersRequest){
            return of(data);
          }
          return of(data);
        }

        let udfKey = {
          DocEntry: Number(route.queryParamMap.get('DocEntry')),
          TypeDocument: (route.queryParamMap.get('Action') == 'duplicate' || route.queryParamMap.get('Action') == 'edit') ? 'OWTR':'OWTQ'
        } as IFilterKeyUdf;

        return this.udfsService.GetUdfsData(udfKey)
          .pipe(
            filter(UdfsDataHeader => !!UdfsDataHeader.Data),
            map(x => x.Data),
            map(UdfsDataHeader => ({ ...data, UdfsDataHeader })),
            catchError(() => of(data))
          );
      }),
      switchMap(callback => {
        const data = callback;
         if(data?.StockTransfersRequest?.AttachmentEntry!=null){
           return this.attachmentService.Get(data.StockTransfersRequest.AttachmentEntry)
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
        this.alertsService.ShowAlert({ HttpErrorResponse: err });
        return of(null);
      })
    );
  }

}
