import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {OverlayService} from "@clavisco/overlay";
import {ItemsService} from "@app/services/items.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {concatMap, finalize, Subscription} from "rxjs";
import {IStockWarehouses} from "@app/interfaces/i-stock-warehouses";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, Structures} from "@clavisco/core";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {IChangeWarehouse, IWarehouse} from "@app/interfaces/i-warehouse";
import {SeriesItemsComponent} from "@Component/sales/document/series-items/series-items.component";

@Component({
  selector: 'app-stock-warehouses',
  templateUrl: './stock-warehouses.component.html',
  styleUrls: ['./stock-warehouses.component.scss']
})
export class StockWarehousesComponent implements OnInit, OnDestroy {

  shouldPaginateRequest: boolean = false;
  tableId: string = "STOCK-TABLE";
  stockWarehouses: IStockWarehouses[] = [];
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  stockWarehousesTableColumns: { [key: string]: string } = {
    WhsCode: 'Código',
    WhsName: 'Almacén',
    OnOrder: 'Orden',
    IsCommited: 'Comprometido',
    OnHand: 'Stock'
  };
  actionButtons!: IActionButton[];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  buttons: ICLTableButton[] = [
    {
      Title: `Cambiar almacén`,
      Action: Structures.Enums.CL_ACTIONS.CONTINUE,
      Icon: `arrow_forward`,
      Color: `primary`,
      Data: ''
    }
  ]

  allSubscriptions!: Subscription;

  constructor(
    private overlayService: OverlayService,
    private itemsService: ItemsService,
    private alertsService: AlertsService,
    private matDialogRef: MatDialogRef<StockWarehousesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IChangeWarehouse,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private matDialog: MatDialog,
  ) {

    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IStockWarehouses[],
        renameColumns: this.stockWarehousesTableColumns
      }
    );
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.onLoad();
  }

  private onLoad(): void {

    this.actionButtons = [
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];
    this.registerActionButtonsEvents();
    this.registerTableEvents();

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.onActionButtonClicked));
    this.allSubscriptions.add(this.linkerService.Flow()?.pipe(
      StepDown<CL_CHANNEL>(this.callbacks),
    ).subscribe({
      next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
      error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
    }));

    this.getStockInWarehouse();
  }

  private getStockInWarehouse(): void {
    this.overlayService.OnGet();
    this.itemsService.GetStock<IStockWarehouses[]>(this.data.ItemCode).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: callback => {
        this.stockWarehouses = callback.Data ?? [];

        const NEXT_TABLE_STATE = {
          CurrentPage: 0,
          ItemsPeerPage: 5,
          Records: this.stockWarehouses.map(x => this.sharedService.MapTableColumns(x, Object.keys(this.stockWarehousesTableColumns))),
          RecordsCount: this.stockWarehouses.length,
        };

        this.linkerService.Publish({
          CallBack: CL_CHANNEL.INFLATE,
          Data: JSON.stringify(NEXT_TABLE_STATE),
          Target: this.tableId
        });
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
      },
      error: err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  public onActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'CANCELAR':
        this.matDialogRef.close();
        break;

    }
  }

  private registerActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.onActionButtonClicked, this.callbacks);
  }

  private registerTableEvents(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.onWarehouseSelected, this.callbacks);
  }

  /**
   * Method to select a warehouse
   * @param _event - Event emitted in the table button when selecting a warehouse
   * @constructor
   */
  public onWarehouseSelected = (_event: ICLEvent): void => {
    if (_event.Data) {

      const BUTTON_EVENT = JSON.parse(_event.Data);
      const SELECTED_WAREHOUSE = JSON.parse(BUTTON_EVENT.Data) as IStockWarehouses;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.CONTINUE:

          if (!this.data.isPermissionChangeWarehouse) {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `No cuenta con permiso para cambiar de almacén.`
            });
            return;
          }

          // If is a serial item we request the serial numbers for the selected warehouse
          if(this.data.SerialItem)
          {
            this.overlayService.OnGet();
            this.itemsService.GetItemSeriesByWarehouse(this.data.ItemCode, SELECTED_WAREHOUSE.WhsCode)
              .pipe(
                concatMap(callback => {
                  this.overlayService.Drop();
                  return this.matDialog.open(SeriesItemsComponent, {
                    data: callback.Data,
                    disableClose: true,
                    minWidth: '50%',
                    maxWidth: '100%',
                    height: '700px',
                    maxHeight: '80%',
                  }).afterClosed();
                }),
              )
              .subscribe({
                next: (res => {
                  SELECTED_WAREHOUSE.ItemSerie = res;
                  this.matDialogRef.close(SELECTED_WAREHOUSE);
                }),
                error: (err) => {
                  this.alertsService.ShowAlert({HttpErrorResponse: err});
                }
              });
          }
          else
          {
            this.matDialogRef.close(SELECTED_WAREHOUSE);
          }
          break;
      }




    }
  }
}
