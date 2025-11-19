import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CLPrint, Repository, Structures} from "@clavisco/core";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {MatDialogRef} from "@angular/material/dialog";
import {CurrentSessionService} from "../../../services/CurrentSession.service";
import {IWarehouse} from "../../../interfaces/i-warehouse";
import {WarehousesService} from "../../../services/warehouses.service";
import {AlertsService, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {finalize, Subscription} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {SharedService} from "../../../shared/shared.service";
import {StorageKey} from "../../../enums/e-storage-keys";
import {ICurrentSession} from "../../../interfaces/i-localStorage";
import {IActionButton} from "../../../interfaces/i-action-button";
import {LinkerEvent} from "../../../enums/e-linker-events";

@Component({
  selector: 'app-warehouse-selection',
  templateUrl: './warehouse-selection.component.html',
  styleUrls: ['./warehouse-selection.component.scss']
})
export class WarehouseSelectionComponent implements OnInit, OnDestroy {

  warehouses: IWarehouse[] = [];
  shouldPaginateRequest: boolean = false;
  tableId: string = 'WAREHOUSE-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  warehouseSelectionTableColumns: { [key: string]: string } = {
    WhsCode: 'Código',
    WhsName: 'Almacén',
  };
  buttons: ICLTableButton[] = [
    {
      Title: `Seleccionar`,
      Action: Structures.Enums.CL_ACTIONS.CONTINUE,
      Icon: `arrow_forward`,
      Color: `primary`,
      Data: ''
    }
  ]
  actionButtons!: IActionButton[];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  allSubscriptions!: Subscription;


  constructor(
    private matDialogRef: MatDialogRef<WarehouseSelectionComponent>,
    @Inject('LinkerService') private linkerService: LinkerService,
    private warehousesService: WarehousesService,
    private alertsService: AlertsService,
    private overlayService: OverlayService,
    private sharedService: SharedService,
    private currentSessionService: CurrentSessionService
  ) {

    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IWarehouse[],
        renameColumns: this.warehouseSelectionTableColumns
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

  private loadInitialData(): void {
    this.overlayService.OnGet();
    this.warehousesService.Get<IWarehouse[]>().pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.warehouses = callback.Data ?? [];

        const NEXT_TABLE_STATE = {
          CurrentPage: 0,
          ItemsPeerPage: 5,
          Records: this.warehouses.map(x => this.sharedService.MapTableColumns(x, Object.keys(this.warehouseSelectionTableColumns))),
          RecordsCount: this.warehouses.length,
        };

        this.linkerService.Publish({
          CallBack: CL_CHANNEL.INFLATE,
          Data: JSON.stringify(NEXT_TABLE_STATE),
          Target: this.tableId
        });
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
      },
      error: (err) => {
        this.alertsService.ShowAlert({
          HttpErrorResponse: err
        });
      }
    });
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

    this.loadInitialData();
  }

  public onActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'CANCELAR':
        this.matDialogRef.close();
        break;

    }
  }

  private registerTableEvents(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.OUTPUT, this.onWarehouseSelected, this.callbacks);
  }

  private registerActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.onActionButtonClicked, this.callbacks);
  }

  /**
   * Method to select a warehouse
   * @param _event - Event emitted in the table button when selecting a warehouse
   * @constructor
   */
  public onWarehouseSelected = (_event: ICLEvent): void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const SELECTED_WAREHOUSE = JSON.parse(BUTTON_EVENT.Data) as IWarehouse;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.CONTINUE:

          const data = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
          data.WhsName = SELECTED_WAREHOUSE.WhsName;
          data.WhsCode = SELECTED_WAREHOUSE.WhsCode;
          this.currentSessionService.setWhsName(data.WhsName);
          Repository.Behavior.SetStorage<ICurrentSession>(data, StorageKey.CurrentSession);
          this.matDialogRef.close(SELECTED_WAREHOUSE.WhsCode);

          break;
      }
    }
  }


}
