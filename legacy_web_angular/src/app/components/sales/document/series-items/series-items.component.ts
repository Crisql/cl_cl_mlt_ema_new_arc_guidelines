import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ULineMappedColumns} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {Subscription} from "rxjs";
import {CLPrint, Structures} from "@clavisco/core";
import {SharedService} from "@app/shared/shared.service";
import {IRowByEvent} from "@clavisco/table/lib/table.space";
import {GetIndexOnPagedTable} from "@app/shared/common-functions";
import {IActionButton} from "@app/interfaces/i-action-button";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {LinkerEvent} from "@app/enums/e-linker-events";

@Component({
  selector: 'app-series-items',
  templateUrl: './series-items.component.html',
  styleUrls: ['./series-items.component.scss']
})
export class SeriesItemsComponent implements OnInit, OnDestroy {

  QtySolicitada: number = 1;
  QtyAplicada: number = 0;

  /*TABLA*/
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  shouldPaginateRequest: boolean = false;
  lineTableId: string = 'LINE-TABLE-SERIES-ITEMS';
  lineMappedColumns: MappedColumns;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  headerTableColumns: { [key: string]: string } = {
    Assigned: 'Seleccionar',
    SystemSerialNumber: 'Serie',
    DistNumber: 'Nombre',
    Quantity: 'Cantidad',
  };
  lineMappedDisplayColumns: ULineMappedColumns<ISerialNumbers, IPermissionbyUser> = {
    dataSource: [] as ISerialNumbers[],
    renameColumns: this.headerTableColumns,
    ignoreColumns: ['BinCode']
  }
  checkboxColumns: string[] = ['Assigned'];
  allSubscriptions: Subscription;

  /*LISTAS*/
  lines: ISerialNumbers[] = [];
  actionButtons: IActionButton[] = [];


  constructor(
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    public dialogRef: MatDialogRef<SeriesItemsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISerialNumbers[],
    private alertsService: AlertsService
  ) {

    this.allSubscriptions = new Subscription();
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  private OnLoad(): void {

    this.actionButtons = [
      {
        Key: 'SAVE',
        MatIcon: 'save',
        Text: 'Guardar',
        MatColor: 'primary'
      },
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.lines = this.data;
  }

  /**
   * Method to update a table record
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumn = (_event: ICLEvent) : void => {
    let data: IRowByEvent<ISerialNumbers> = JSON.parse(_event.Data);
    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1);
    this.lines = this.lines.map(element => {
      return {
        ...element,
        Assigned: false
      }
    });
    this.lines[INDEX].Assigned = data.Row.Assigned;
    this.QtyAplicada = this.lines.filter(x => x.Assigned)?.length;
    this.InflateTableLines();
  }

  private InflateTableLines(): void {

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.lines,
      RecordsCount: this.lines.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.lineTableId
    });

  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'SAVE':
        let data = this.lines.find(x => x.Assigned);
        if (data) {
          this.dialogRef.close(data);
        } else {
          this.alertsService.Toast({type: CLToastType.INFO, message: 'No se seleccionó ningúna serie.'});
        }
        break;
      case 'CANCELAR':
        this.dialogRef.close(null);
        break;
    }
  }


}
