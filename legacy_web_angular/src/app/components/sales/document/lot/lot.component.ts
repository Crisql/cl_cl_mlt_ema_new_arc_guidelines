import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  IBatches, IBatchNumbers, IBatchResult,
  IBatchSelected,
  IDocumentLinesBinAllocations,
  ILocationsModel
} from "../../../../interfaces/i-serial-batch";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {IEditableField, IEditableFieldConf, IRowByEvent} from "@clavisco/table/lib/table.space";
import {IPermissionbyUser} from "../../../../interfaces/i-roles";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {CLPrint, Structures} from "@clavisco/core";
import {Subscription} from "rxjs";
import {IDocumentLine} from "../../../../interfaces/i-items";
import {ViewBatches} from "@app/enums/enums";
import {GetIndexOnPagedTable} from "@app/shared/common-functions";
import {IActionButton} from "@app/interfaces/i-action-button";
import {Action} from "rxjs/internal/scheduler/Action";
import {SharedService} from "@app/shared/shared.service";

@Component({
  selector: 'app-lot',
  templateUrl: './lot.component.html',
  styleUrls: ['./lot.component.scss']
})
export class LotComponent implements OnInit {

  lotesList: IBatches[] = [];
  locationlist: ILocationsModel[] = [];
  locations: IDocumentLinesBinAllocations[] = [];
  actionButtons: IActionButton[] = [];

  QtySolicitada: number = 0;
  QtyAplicada: number = 0;
  index = 0;

  displayLocations: boolean = false;
  isValidateStock: boolean = false;

  //#region @clavisco/table Configuration
  editableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  editableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'Quantity',
      Permission: {Name: 'EditQuantity'}
    },
  ];
  BatchtableId: string = 'BATCH-TABLE';
  LocationTableId: string = 'LOCATION-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns!: MappedColumns;
  mappedLocationColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  permission: IPermissionbyUser[] = [];
  buttons: ICLTableButton[] = [
    {
      Title: `Agregar ubicación`,
      Action: Structures.Enums.CL_ACTIONS.CONTINUE,
      Icon: `arrow_forward`,
      Color: `primary`,
      Data: ''
    }
  ]
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IBatchSelected,
    private matDialogRef: MatDialogRef<LotComponent>,
    private alertsService: AlertsService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService
  ) {
    this.ConfigTable();
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private ConfigTable(): void {


    if (this.data.View === ViewBatches.TRANSFER_INVENTORY) {

      this.mappedColumns = MapDisplayColumns(
        {
          dataSource: [] as IBatches[],
          inputColumns: [
            {ColumnName: 'Quantity', FieldType: 'number'}],
          editableFieldConf: this.editableFieldConf,
          renameColumns: {
            DistNumber: 'Lote',
            Disponible: 'Disponible',
            Quantity: 'Cantidad'
          },
          ignoreColumns: ['SysNumber', 'Locations', 'Stock', 'CommitQty']
        }
      );


    } else {

      this.mappedColumns = MapDisplayColumns(
        {
          dataSource: [] as IBatches[],
          inputColumns: [
            {ColumnName: 'Quantity', FieldType: 'number'}],
          editableFieldConf: this.editableFieldConf,
          renameColumns: {
            DistNumber: 'Lote',
            Stock: 'Stock',
            CommitQty: 'Comprometido',
            Disponible: 'Disponible',
            Quantity: 'Cantidad'
          },
          ignoreColumns: ['SysNumber', 'Locations']
        }
      );

    }


    this.mappedLocationColumns = MapDisplayColumns(
      {
        dataSource: [] as ILocationsModel[],
        inputColumns: [
          {ColumnName: 'Quantity', FieldType: 'number'}],
        renameColumns: {BinCode: 'Ubicación', Stock: 'Disponible', Quantity: 'Cantidad'},
        ignoreColumns: ['AbsEntry']
      }
    );
  }

  ngOnInit(): void {

    this.RegisterTableEvents();
    this.actionButtons = [
      {
        Key: 'ADD-BATCHS',
        Text: 'Guardar',
        MatIcon: 'save',
        MatColor: 'primary'
      },
      {
        Key: 'CANCEL-BATCHS',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];

    if(this.data.View === ViewBatches.INVENTORY_ENTRY){
      this.actionButtons.unshift({
        Key: 'NEW-BATCHS',
        Text: 'Nuevo',
        MatIcon: 'add',
        MatColor: 'primary'
      });
    }

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));

    this.OnLoad();

  }

  /**
   * Initial loading of the modal
   * @constructor
   * @private
   */
  private OnLoad(): void {

    this.QtySolicitada = this.data.Quantity || 0;
    this.lotesList = this.data.Lotes || [];
    this.isValidateStock = this.data.ValidateStockBatch;

    this.permission = this.lotesList?.some(x => x.Locations && x.Locations.length > 0) ? ([{Name: 'EditQuantity'}]) : [];

    this.editableFieldConf =
      {
        Permissions: this.permission,
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => _permissions?.some(x => x.Name === _columnPerm.Name),

        Columns: this.editableField,
      };

    this.mappedColumns.EditableFieldConf = this.editableFieldConf;


    if (this.data.LotesSelected && this.data.LotesSelected.length > 0) {
      this.data.LotesSelected.forEach((element, index) => {

        if (this.lotesList?.some(x => x.SysNumber === +(element.SystemSerialNumber))) {

          let lote = this.lotesList.find(x => x.SysNumber === +(element.SystemSerialNumber));

          if (lote) {
            lote.Quantity = element.Quantity;
          }
        }
      });
    }

    if (this.data.LocationsSelected && this.data.LocationsSelected.length > 0) {
      this.data.LocationsSelected.forEach(element => {

        let SysNumber: number = this.data.LotesSelected ? this.data.LotesSelected[element.SerialAndBatchNumbersBaseLine].SystemSerialNumber : 0;

        if (this.lotesList?.some(x => x.SysNumber === +(SysNumber))) {
          let data = this.lotesList.find(x => x.SysNumber === +(SysNumber))?.Locations;

          if (data)
            data.forEach((x, index) => {
              if (x.AbsEntry === Number(element.BinAbsEntry)) {
                x.Quantity = element.Quantity;
              }
            });
        }
      });
    }

    this.QtyAplicada = this.lotesList?.reduce((acumulador, valor) => acumulador + (valor.Quantity ? valor.Quantity : 0), 0);

    this.InflateBatchTable();

  }

  /**
   * Handles the save logic for batch selection and validation based on the current view.
   *
   * - If the view is for billing or inventory output:
   *   - Validates that the applied quantity matches the requested quantity when stock validation is enabled.
   *   - Ensures no batch exceeds available stock.
   *   - Builds the selected batches and associated bin locations.
   *   - Returns the result and closes the dialog with the selected data.
   * - If the view is different, delegates to `SaveBatchesForInventory`.
   *
   * Displays appropriate toast messages for validation errors.
   */
  public Save(): void {

    if (this.data.View === ViewBatches.FACTURACION || this.data.View === ViewBatches.INVENTORY_ENTRY || this.data.View === ViewBatches.INVENTORY_OUTPUT) {

      if (this.isValidateStock) {
        if (this.QtyAplicada > this.QtySolicitada) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `La cantidad aplicada no puede ser mayor a la solicitada.`
          });
          return;
        }

        if (this.QtyAplicada < this.QtySolicitada) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `La cantidad aplicada no puede ser menor que la cantidad solicitada.`
          });
          return;
        }

        let data = this.lotesList.find(x => x.Stock < x.Quantity);

        if (data) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `La cantidad ingresada para el lote ${data.DistNumber} supera el disponible.`
          });
          return;
        }
      }

      let lotesSelected: IBatchNumbers[] = this.lotesList.filter(x => x.Quantity && x.Quantity > 0).map((element: IBatches) => {
        return {
          BatchNumber: element.DistNumber,
          SystemSerialNumber: element.SysNumber,
          Quantity: element.Quantity
        }
      });

      if (this.lotesList.some(x => x.Locations && x.Locations.length > 0)) {

        if (lotesSelected.length === 1) {
          this.locations = this.lotesList.filter(x => x.SysNumber === lotesSelected[0].SystemSerialNumber)[0].Locations.filter(i => i.Quantity && i.Quantity > 0).map((element) => {
            return {
              SerialAndBatchNumbersBaseLine: 0,
              BinAbsEntry: element.AbsEntry,
              Quantity: element.Quantity,
              Stock: 0
            }
          });

        } else {
          this.lotesList.forEach((element, index) => {
            let i: number = lotesSelected.findIndex(x => x.SystemSerialNumber === element.SysNumber);

            if (i >= 0) {
              if (this.lotesList[index].Locations && this.lotesList[index].Locations.length > 0) {
                this.locations = this.locations.concat(this.lotesList[index].Locations.filter(x => x.Quantity && x.Quantity > 0).map((element) => {
                  return {
                    SerialAndBatchNumbersBaseLine: i,
                    BinAbsEntry: element.AbsEntry,
                    Quantity: element.Quantity,
                    Stock: 0
                  }
                }));
              }
            }

          });
        }

      }

      let lotes: IBatchResult = {
        Lotes: lotesSelected,
        Locations: this.locations.filter(x => x.Quantity && x.Quantity > 0)
      };

      this.matDialogRef.close(lotes);
    } else {
      this.SaveBatchesForInventory();
    }

  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD-BATCHS':
        this.Save();
        break;
      case 'ADD-LOCATIONS':
        this.SaveLocations();
        break;
      case 'CANCEL-LOCATIONS':
        this.Cancel();
        break;
      case 'CANCEL-BATCHS':
        this.matDialogRef.close();
        break;
    }
  }

  public DisplayLocation(_batch: IBatches): void {
    if (_batch.Locations && _batch.Locations.length > 0) {
      this.actionButtons = [
        {
          Key: 'ADD-LOCATIONS',
          Text: 'Guardar',
          MatIcon: 'save',
          MatColor: 'primary'
        },
        {
          Key: 'CANCEL-LOCATIONS',
          Text: 'Cancelar',
          MatIcon: 'cancel',
          MatColor: 'primary'
        }
      ];
      this.locationlist = _batch.Locations;
      this.displayLocations = true;
      this.InflateLocationTable();
    }
  }

  public RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.BatchtableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.LocationTableId, CL_CHANNEL.OUTPUT_3, this.GetRecordsEditField, this.callbacks);
    Register<CL_CHANNEL>(this.BatchtableId, CL_CHANNEL.OUTPUT_3, this.GetRecordsBatchEditField, this.callbacks);
  }

  public GetRecordsBatchEditField = (_event: ICLEvent): void => {

    const RECORD = JSON.parse(_event.Data) as IRowByEvent<IBatches>;
    let Qty: number = +(RECORD.Row.Quantity);

    if (Qty >= 0) {
      this.lotesList[RECORD.RowIndex].Quantity = Qty;
      this.QtyAplicada = this.lotesList.reduce((acumulador, valor) => acumulador + valor.Quantity, 0);
    }

  }

  public GetRecordsEditField = (_event: ICLEvent): void => {

    const data = JSON.parse(_event.Data) as IRowByEvent<ILocationsModel>;

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1);

    let Qty: number = +(data.Row.Quantity);

    if (this.isValidateStock && Qty > this.locationlist[INDEX].Stock) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `La cantidad ingresada para la ubicación ${this.locationlist[INDEX].BinCode} supera el disponible.`
      });
      this.locationlist[INDEX].Quantity = 0;
      return;
    }

    if (Qty >= 0) {
      this.locationlist[INDEX].Quantity = Qty;
    }
  }

  /**
   * Resulting events for table buttons
   * @param _event - event emitted from the table to edit
   * @constructor
   */
  public OnTableActionActivated = (_event: ICLEvent) : void => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as IBatches;
      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.CONTINUE:

          if (!ACTION.Locations) {

            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `Ítem no manejado con ubicaciones`
            });
            return;
          }

          this.lotesList.forEach((x, index) => {
            if (x.SysNumber === ACTION.SysNumber) {
              this.index = index;
            }
          });

          this.DisplayLocation(ACTION);

          break;
      }
    }
  }

  public InflateBatchTable(): void {

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.lotesList,
      RecordsCount: this.lotesList.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.BatchtableId
    });

  }

//#region locations

  public InflateLocationTable(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.locationlist,
      RecordsCount: this.locationlist.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.LocationTableId
    });
  }

  public Cancel(): void {
    this.displayLocations = false;
    this.locationlist = [];
    this.InflateBatchTable();
    this.SetButtonsBatch();
  }

  public SaveLocations(): void {

    if (this.isValidateStock && (this.locationlist.reduce((acumulador, valor) => acumulador + valor.Quantity, 0)) > this.QtySolicitada) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `La cantidad ingresada no puede ser mayor a la solicitada.`
      });
      return;
    }

    let data: ILocationsModel[] = this.locationlist.filter(x => x.Quantity);
    this.lotesList[this.index].Quantity = data.reduce((acumulador, valor) => acumulador + (valor.Quantity ? valor.Quantity : 0), 0);
    this.lotesList[this.index].Locations = this.locationlist;

    this.QtyAplicada = this.lotesList.reduce((acumulador, valor) => acumulador + valor.Quantity, 0);
    this.displayLocations = false;
    this.locationlist = [];

    this.SetButtonsBatch();
    this.InflateBatchTable();
  }

  private SaveBatchesForInventory(): void {

    if (this.QtyAplicada !== this.QtySolicitada) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `La cantidad aplicada no puede ser mayor ni menor a la solicitada.`
      });
      return;
    }

    let index = this.lotesList.findIndex(x => x.Quantity > x.Disponible)

    if (index >= 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `La cantidad ingresada para el lote ${this.lotesList[index].DistNumber} no puede ser mayor a la cantidad disponible.`
      });
      return;
    }

    let lotes = this.lotesList.filter(x => x.Quantity && x.Quantity > 0) ?? []

    this.matDialogRef.close(lotes);
  }

  private SetButtonsBatch(): void {
    this.actionButtons = [
      {
        Key: 'ADD-BATCHS',
        Text: 'Guardar',
        MatIcon: 'save',
        MatColor: 'primary'
      },
      {
        Key: 'CANCEL-BATCHS',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];

    if(this.data.View === ViewBatches.INVENTORY_ENTRY){
      this.actionButtons.unshift({
        Key: 'NEW-BATCHS',
        Text: 'Nuevo',
        MatIcon: 'add',
        MatColor: 'primary'
      });
    }
  }

  //#endregion

}
