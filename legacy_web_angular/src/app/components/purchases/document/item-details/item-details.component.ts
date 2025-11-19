import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {AlertsService, CLToastType, NotificationPanelService} from "@clavisco/alerts";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {ItemDetail} from "@app/interfaces/i-items";
import {finalize, Subscription} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {ItemsService} from "@app/services/items.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CL_CHANNEL, ICLCallbacksInterface, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {IItemDetailDialogData} from "@app/interfaces/i-dialog-data";
import {CLPrint, Structures} from "@clavisco/core";
import {formatDate} from "@angular/common";
import {IActionButton} from "@app/interfaces/i-action-button";
import {SharedService} from "@app/shared/shared.service";

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit, AfterViewInit {

  //#region @clavisco/table Configuration
  shouldPaginateRequest: boolean = true;
  ItemDetailtableId: string = "ITEM-DETAIL-TABLE";
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  itemDetail: ItemDetail[] = [];
  actionButtons: IActionButton[] = [];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;

  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private itemService: ItemsService,
    private matDialogRef: MatDialogRef<ItemDetailsComponent>,
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: IItemDetailDialogData,
    @Inject('LinkerService') private linkerService: LinkerService
  ) {
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as ItemDetail[],
        renameColumns: {
          DocDateFormatted: 'Fecha',
          CardName: 'Proveedor',
          ItemDescription: 'Item',
          WhsName: 'Almacén',
          Quantity: 'Cantidad',
          LastPurPrc: 'Prec. Compra',
          DocTotal: 'Total de entrada',
          TaxCode: 'Impuesto',
          Comments: 'Comentario'
        },
        ignoreColumns: ['ItemCode', 'Price', 'CardCode', 'OnHand', 'Available', 'DocDate'],
      }
    );
    this.allSubscriptions = new Subscription();
  }

  ngAfterViewInit() {
    this.GetItemDetailTable();
  }


  ngOnInit(): void {
    this.actionButtons = [
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];
    this.RegisterActionButtonsEvents();
    this.GetItemDetailTable();
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(this.ItemDetailtableId, CL_CHANNEL.REQUEST_RECORDS, this.GetRecords, this.callbacks);
  }

  private GetItemDetailTable(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.ItemDetailtableId,
      Data: ''
    });
  }

  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  /**
   * Method to obtain item details
   * @constructor
   */
  private GetRecords = (): void => {

    this.overlayService.OnGet();
    this.itemService.GetItemDetail<ItemDetail>(this.data.ItemCode, this.data.DocType)
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.itemDetail = (callback.Data || []).map(item => {
          return {
            ...item,
            DocDateFormatted: formatDate(item.DocDate, 'yyyy-MM-dd', 'en')
          }
        });

        this.InflateLocationTable();
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  InflateLocationTable(): void {

    const NEW_TABLE_STATE = {
      Records: this.itemDetail,
      RecordsCount: this.itemDetail.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.ItemDetailtableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    });

  }

}
