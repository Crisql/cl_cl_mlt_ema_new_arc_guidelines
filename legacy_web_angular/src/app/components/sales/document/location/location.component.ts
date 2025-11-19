import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  IDocumentLinesBinAllocations,
  ILocationsModel,
  ILocationsSelectedModel, ISerialNumbers
} from "../../../../interfaces/i-serial-batch";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {Subscription} from "rxjs";
import {IRowByEvent} from "@clavisco/table/lib/table.space";
import {GetIndexOnPagedTable} from "@app/shared/common-functions";
import {CLPrint, Structures} from "@clavisco/core";
import {SharedService} from "@app/shared/shared.service";
import {IActionButton} from "@app/interfaces/i-action-button";
import {DocumentType} from "@app/enums/enums";


@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, OnDestroy {
  locationlist: ILocationsModel[] = [];
  actionButtons: IActionButton[] = [];
  QtySolicitada: number = 0;
  QtyAplicada: number = 0;
  permEditLocation: boolean = false;
  isValidateStock: boolean = false;

  //#region @clavisco/table Configuration
  shouldPaginateRequest: boolean = false;
  LocationtableId: string = 'LOCATION-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  checkboxColumns: string[] = ['Selected'];
  allSubscriptions: Subscription;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ILocationsSelectedModel,
    private matDialogRef: MatDialogRef<LocationComponent>,
    private alertsService: AlertsService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService
  ) {
    this.allSubscriptions = new Subscription();
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as ILocationsModel[],
        renameColumns: {Selected: 'Seleccionar', BinCode: 'Ubicación', Stock: 'Disponible'},
        ignoreColumns: ['AbsEntry', 'Quantity'],
      }
    );
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.QtySolicitada = this.data.Quantity || 0;
    this.permEditLocation = this.data.Permission || false;
    this.locationlist = this.data.Locations || [];
    this.isValidateStock = this.data.ValidateStockBatch;
    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'save',
        MatColor: 'primary',
        Text: 'Guardar'
      },
      {
        Key: 'CANCEL',
        MatIcon: 'cancel',
        MatColor: 'primary',
        Text: 'Cancelar'
      }
    ];
    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
    Register<CL_CHANNEL>(this.LocationtableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  /**
   * Method to update a table record
   * @param _event -Event emitted from the table to edit
   * @constructor
   */
  private EventColumn = (_event: ICLEvent) : void => {
    let data: IRowByEvent<ILocationsModel> = JSON.parse(_event.Data);
    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1);
    this.locationlist = this.locationlist.map(element => {
      return {
        ...element,
        Selected: false
      }
    });
    this.locationlist[INDEX].Selected = data.Row.Selected;
    this.QtyAplicada = this.QtySolicitada;
    this.InflateTableLines();
  }

  private InflateTableLines(): void {

    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.locationlist,
      RecordsCount: this.locationlist.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.LocationtableId
    });

  }

  private Save(): void {
    const LOCATION = this.locationlist.find((x) => x.Selected);

    if (LOCATION) {
      this.AvaLocationSelected(LOCATION);
    } else {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Seleccione ubicación`
      });
    }

  }

  public AvaLocationSelected(_location: ILocationsModel) {

    if (!this.permEditLocation) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No tiene permiso para cambiar el ubicación`
      });

      return;
    }

    if (this.data.TypeDocument !== DocumentType.Invoices && this.isValidateStock && _location.Stock < this.QtySolicitada) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Stock insuficiente. Solicitado: ${this.QtySolicitada}, disponible: ${_location.Stock}`
      });
      return;
    }

    let Location = [{
      SerialAndBatchNumbersBaseLine: 0,
      BinAbsEntry: _location.AbsEntry,
      Quantity: this.QtySolicitada,
      Stock: _location.Stock
    }] as IDocumentLinesBinAllocations[];

    let locations = {
      Location: Location,
      BinCode: _location.BinCode
    };

    this.matDialogRef.close(locations);
  }
}
