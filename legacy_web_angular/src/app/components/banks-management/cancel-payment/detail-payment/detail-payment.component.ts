import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {SharedService} from "../../../../shared/shared.service";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {finalize, Subscription} from "rxjs";
import {ICreditVouchersDetail, IDataForDetailPay} from "../../../../interfaces/i-payment-detail";
import {CLPrint, Structures} from "@clavisco/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {IActionButton} from "../../../../interfaces/i-action-button";
import {LinkerEvent} from "../../../../enums/e-linker-events";
import {OverlayService} from "@clavisco/overlay";
import {IncomingPaymentsService} from "../../../../services/incoming-payments.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {formatDate} from "@angular/common";


@Component({
  selector: '',
  templateUrl: './detail-payment.component.html',
  styleUrls: ['./detail-payment.component.scss']
})
export class DetailPaymentComponent implements OnInit, OnDestroy {

  /*Listas*/
  crediVouchers: ICreditVouchersDetail[] = [];
  actionButtons: IActionButton[] = [];

  /*Formularios*/
  docForm!: FormGroup;
  shouldPaginateRequest = false;
  docTableId: string = 'CREDIT-TABLE';
  docTbMappedColumns!: MappedColumns;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;
  docTbColumns: { [key: string]: string } = {
    Id: '#',
    CreditCard: 'Tarjeta',
    VoucherNum: 'Voucher',
    CreditSum: 'Monto',
    CollectionDateFormatted: 'Fecha de pago',
    CardValidFormatted: 'Fecha válida de tarjeta',
    Account: 'Cuenta'
  }

  constructor(
    private fb: FormBuilder,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: IDataForDetailPay,
    private matDialogRef: MatDialogRef<DetailPaymentComponent>,
    private overlayService: OverlayService,
    private incomingPaymentService: IncomingPaymentsService,
    private alertsService: AlertsService
  ) {

    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.crediVouchers,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['IsManualEntry']
    });
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
    this.sharedService.SetActionButtons([]);
  }

  ngOnInit(): void {
    this.onLoad();
  }

  private onLoad(): void {
    this.initForm();
    this.actionButtons = [
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar',
        MatColor: 'primary'
      }
    ];

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.loadInitialData();

  }

  private initForm(): void {
    this.docForm = this.fb.group({
      DocNumOinv: [{value: 0}],
      DocNumPay: [{value: 0}],
      CashSum: [{value: 0}],
      CashSumFC: [{value: 0}],
      TrsfrSum: [{value: 0}],
      TrsfrSumFC: [{value: 0}]
    });
  }

  /**
   *Close modal
   * @private
   */
  private closeDialog(): void {
    this.matDialogRef.close();
  }

  public onActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'CANCELAR':
        this.closeDialog();
        break;
    }
  }

  private loadInitialData(): void {
    this.overlayService.OnGet();
    this.incomingPaymentService.GetPayDetail(this.data.DocEntryPay).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: callback => {
        this.docForm.patchValue({
          DocNumOinv: this.data.DocNumOinv,
          DocNumPay: this.data.DocNumPay,
          CashSum: callback.Data.CashSum,
          CashSumFC: callback.Data.CashSumFC,
          TrsfrSum: callback.Data.TrsfrSum,
          TrsfrSumFC: callback.Data.TrsfrSumFC
        });
        this.crediVouchers = callback.Data.CreditCards;
        this.crediVouchers = this.crediVouchers.map(document => this.sharedService.MapTableColumns({
          ...document,
          CollectionDateFormatted: formatDate(document.CollectionDate, "MMMM d, y", 'en'),
          CardValidFormatted: formatDate(document.CardValid, "MMMM d, y", 'en')
        }, Object.keys(this.docTbColumns)));

        this.inflateTable();

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private inflateTable(): void {
    const NEW_TABLE_STATE = {
      Records: this.crediVouchers,
      RecordsCount: this.crediVouchers.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.docTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }


}
