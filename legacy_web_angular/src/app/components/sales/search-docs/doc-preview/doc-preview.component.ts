import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {IDocumentLine} from "../../../../interfaces/i-items";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLNotificationType, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {SalesDocumentService} from "../../../../services/sales-document.service";
import {ActivatedRoute} from "@angular/router";
import {catchError, concatMap, finalize, forkJoin, map, of, Subscription} from "rxjs";
import {IDocument} from "../../../../interfaces/i-sale-document";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {CLPrint, GetError, Repository, Structures} from "@clavisco/core";
import {TAB} from "@angular/cdk/keycodes";
import {SharedService} from "../../../../shared/shared.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IPreviewDocumentDialogData} from "../../../../interfaces/i-dialog-data";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SalesPersonService} from "../../../../services/sales-person.service";
import {ISalesPerson} from "../../../../interfaces/i-sales-person";
import {SettingsService} from "@app/services/settings.service";
import {SettingCode} from "@app/enums/enums";
import {ISettings} from "@app/interfaces/i-settings";
import {ICompany} from "@app/interfaces/i-company";
import {IDecimalSetting} from "../../../../interfaces/i-settings";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IActionButton} from "@app/interfaces/i-action-button";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {WarehousesService} from "@app/services/warehouses.service";
import {IWarehouse} from "@app/interfaces/i-warehouse";

@Component({
  selector: 'app-doc-preview',
  templateUrl: './doc-preview.component.html',
  styleUrls: ['./doc-preview.component.scss']
})
export class DocPreviewComponent implements OnInit, OnDestroy {
  selectedCompany!: ICompany | null;
  document!: IDocument;
  salesPerson: ISalesPerson | undefined;
  actionButtons: IActionButton[] = [];
  DecimalTotalLine: number = 0;
  //#region Table Variables
  shouldPaginateRequest: boolean = false;
  tableId: string = 'DOC-LINES-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  documentLines: IDocumentLine[] = [];
  hasItemsSelection: boolean = false;
  renamedColumns: { [key: string]: string } = {
    "Product": 'Producto',
    "Quantity": 'Cantidad',
    "Currency": 'Moneda',
    "UnitPrice": 'Precio',
    "DiscountPercent": 'Descuento',
    "TaxCode": 'Impuesto',
    "WarehouseCode": 'Almacén',
    "LineTotal": 'Total de linea'
  };
  //#endregion

  warehouse: IWarehouse[] = [];


  allSubscriptions$: Subscription;
  documentEntry!: number;
  controllerToRequest!: string;
  documentForm!: FormGroup;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private salesDocsService: SalesDocumentService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private salesPersonService: SalesPersonService,
    @Inject(MAT_DIALOG_DATA) private data: IPreviewDocumentDialogData,
    @Inject("LinkerService") private linkerService: LinkerService,
    private matDialogRef: MatDialogRef<DocPreviewComponent>,
    private settingsService: SettingsService,
    private warehousesService: WarehousesService
  ) {
    this.mappedColumns = MapDisplayColumns({
      dataSource: this.documentLines,
      renameColumns: this.renamedColumns
    });
    this.allSubscriptions$ = new Subscription();
  }

  ngOnInit(): void {
    this.InitVariables();
  }

  InitVariables(): void {
    this.LoadForm();
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.documentEntry = this.data.DocEntry;
    this.controllerToRequest = this.data.Controller;
    this.actionButtons = [
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];

    this.allSubscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    this.allSubscriptions$.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));

    this.GetDocument();
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  GetDocument(): void {
    this.overlayService.OnGet();
    this.allSubscriptions$.add(
      this.salesDocsService.GetDocument(this.controllerToRequest, this.documentEntry)
        .pipe(
          concatMap(callback => {
            return forkJoin({
              salesPerson: this.salesPersonService.Get<ISalesPerson>(callback.Data.SalesPersonCode),
              Decimal: this.settingsService.Get<ISettings>(SettingCode.Decimal),
              Warehouse: this.warehousesService.Get<IWarehouse[]>()
            }).pipe(
              map(({salesPerson, Decimal, Warehouse}) => ({
                Document: callback,
                SalesPerson: salesPerson,
                Decimal: Decimal,
                Warehouse: Warehouse
              }))
            );
          }),
          finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});

            if (callback.Decimal && callback.Decimal.Data)
            {
              let companyDecimal = JSON.parse(callback.Decimal.Data?.Json) as IDecimalSetting[];

              let dataCompany = companyDecimal.find(x => x.CompanyId === this.selectedCompany?.Id) as IDecimalSetting;

              this.DecimalTotalLine = dataCompany.TotalLine;
            }

            this.warehouse = callback.Warehouse.Data || [];

            this.document = callback.Document.Data;

            this.salesPerson = callback.SalesPerson?.Data;

            this.documentLines = [...this.document.DocumentLines];

            this.documentForm.patchValue({
              ...this.document,
              DocTotal: `${this.document.DocCurrency} ${this.document.DocTotal}`,
              CardName: `${this.document.CardCode} - ${this.document.CardName}`,
              SalesPersonName: this.salesPerson?.SlpName || '-'
            });

            this.InflateLinesTable();
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        }));
  }

  InflateLinesTable(): void {
    const TABLE_STATE = {
      Records: this.documentLines.map(x => this.sharedService.MapTableColumns({
        ...x,
        Product: `${x.ItemCode ? `${x.ItemCode} - ` : ''}${x.ItemDescription ?? x.ItemName}`,
        WarehouseCode: x.WarehouseCode ? `${x.WarehouseCode} - ${this.warehouse.find((whs: IWarehouse) => whs.WhsCode === x.WarehouseCode)?.WhsName || ''}` : '-',
        LineTotal: this.GetLineTotal(x).toFixed(this.DecimalTotalLine),
      }, Object.keys(this.renamedColumns))),
      RecordsCount: this.documentLines.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(TABLE_STATE),
      Target: this.tableId
    });
  }

  public GetLineTotal(_item: IDocumentLine): number {
    return Number((_item.UnitPrice * _item.Quantity) - (_item.UnitPrice * _item.Quantity * (_item.DiscountPercent / 100)) +
      ((_item.UnitPrice * _item.Quantity) -
        (_item.UnitPrice * _item.Quantity * (_item.DiscountPercent / 100))) *
      (_item.TaxRate / 100) || 0);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions$.unsubscribe();
  }

  LoadForm(): void {
    this.documentForm = this.fb.group({
      CardName: [null],
      SalesPersonName: [null],
      DocDate: [null],
      DocTotal: [0],
      DocNum: [0]
    });
  }
}
