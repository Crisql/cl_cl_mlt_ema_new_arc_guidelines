import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {IBusinessPartnerLocation} from "@app/interfaces/i-business-partner";
import {IRouteLine} from "@app/interfaces/i-route";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {finalize, Subscription} from "rxjs";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {CLPrint, Structures} from "@clavisco/core";
import {ICustomerLocationsDialogData} from "@app/interfaces/i-dialog-data";
import {IActionButton} from "@app/interfaces/i-action-button";

@Component({
  selector: 'app-customer-locations-modal',
  templateUrl: './customer-locations-modal.component.html',
  styleUrls: ['./customer-locations-modal.component.scss']
})
export class CustomerLocationsModalComponent implements OnInit, OnDestroy {

  tableId: string = 'CUSTOMER_LOCS_TABLE';
  mappedColumns!: MappedColumns;

  locations!: IBusinessPartnerLocation[];
  mappedRouteLines: IRouteLine[] = [];

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  actionButtons: IActionButton[] = [
    {
      Key: 'CONTINUE',
      Text: 'Guardar',
      MatIcon: 'save',
      MatColor: 'primary',
    },
    {
      Key: 'CANCEL',
      Text: 'Cancelar',
      MatIcon: 'cancel',
      MatColor: 'primary'
    }
  ]

  allSubscription$: Subscription;

  routeLinesToReturn: IRouteLine[] = [];

  constructor(
    private businessPartnerService: BusinessPartnersService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private matDialogRef: MatDialogRef<CustomerLocationsModalComponent>,
    @Inject('LinkerService') private linkerService: LinkerService,
    @Inject(MAT_DIALOG_DATA) private data: ICustomerLocationsDialogData
  ) {
    this.allSubscription$ = new Subscription();
    this.mappedColumns = MapDisplayColumns({
      dataSource: this.mappedRouteLines,
      ignoreColumns: ['Latitude', 'Longitude', 'CardCode', 'CardName', 'AddressLineId', 'CheckStatus', 'Status',
        'AddressType', 'AddressLineNum', 'RouteId', 'Active', 'IsActive', 'CreatedBy', 'Id', 'CreatedDate', 'UpdateDate', 'UpdatedBy', 'LineGroupNum'],
      renameColumns: {
        Address: 'Nombre',
        VisitingTime: 'Hora de visita',
        VisitEndTime: 'Hora fin visita',
        TypeName: 'Tipo'
      },
      inputColumns: [
        {
          ColumnName: 'VisitingTime',
          FieldType: 'time'
        },
        {
          ColumnName: 'VisitEndTime',
          FieldType: 'time'
        }
      ]
    })
  }

  ngOnInit(): void {
    Register<CL_CHANNEL>(this.tableId, CL_CHANNEL.DATA_LINE_1, this.OnRowRequested, this.callbacks);

    this.allSubscription$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.GetBusinessPartnersLocations();
  }

  /**
   * Method to obtain the selected elements from the customer locations table.
   * @param _event -Elements selected in the table
   * @constructor
   */
  OnRowRequested = (_event: ICLEvent): void => {
    if (_event) {
      this.routeLinesToReturn = JSON.parse(_event.Data) as IRouteLine[];

      if (!this.routeLinesToReturn.length) {
        this.alertsService.Toast({type: CLToastType.INFO, message: 'Debe seleccionar al menos una ubicación'});
        return;
      }
      this.routeLinesToReturn.forEach(rl => {
        if (rl.VisitEndTime === '') {
          rl.VisitEndTime = '23:59';
        }

        if (rl.VisitingTime === '') {
          rl.VisitingTime = '00:00';
        }
      });

      this.matDialogRef.close(this.routeLinesToReturn);
    }
  }

  GetBusinessPartnersLocations(): void {
    this.overlayService.OnGet();

    this.businessPartnerService.GetCustomerLocations(this.data.Customer?.CardCode, this.data.RouteType)
      .pipe(
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (response) => {
          this.alertsService.Toast({
            message: 'Componentes requeridos obtenidos',
            type: CLToastType.SUCCESS
          });
          this.locations = response.Data;

          this.mappedRouteLines = this.locations.map(l => {
            return {
              Address: l.Address,
              CardCode: this.data.Customer?.CardCode,
              AddressLineId: +(l.AddressLineId),
              AddressLineNum: l.AddressLineNum,
              AddressType: +(l.AddressType),
              CardName: this.data.Customer.CardName,
              Latitude: +(l.Latitude),
              Longitude: +(l.Longitude),
              Active: '',
              IsActive: true,
              Status: 0,
              VisitEndTime: '',
              VisitingTime: '',
              CheckStatus: 0,
              CreatedBy: '',
              RouteId: 0,
              Id: 0,
              CreatedDate: new Date(),
              UpdateDate: new Date(),
              UpdatedBy: '',
              TypeName: this.data.RoutesTypes.find(rt => rt.Key === l.AddressType.toString())?.Description ?? '-',
              LineGroupNum: this.data.LineGroupNum
            } as IRouteLine;
          });

          this.InflateTable();
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  InflateTable(): void {
    const NEW_TABLE_STATE = {
      Records: this.mappedRouteLines,
      RecordsCount: this.mappedRouteLines.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEW_TABLE_STATE),
      Target: this.tableId
    });
  }

  OnActionButtonClicked(_actionBtn: IActionButton): void {
    switch (_actionBtn.Key) {
      case 'CONTINUE':
        this.linkerService.Publish({
          CallBack: CL_CHANNEL.DATA_LINE_2,
          Target: this.tableId,
          Data: ''
        });
        break;
      case 'CANCEL':

        let linesToReturn = this.routeLinesToReturn && this.routeLinesToReturn.length ? this.routeLinesToReturn : [];
        this.matDialogRef.close(linesToReturn);
        break;
    }
  }

  ngOnDestroy(): void {
    this.allSubscription$.unsubscribe();
  }
}
