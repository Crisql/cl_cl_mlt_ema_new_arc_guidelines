import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {catchError, filter, finalize, map, Observable, of, Subscription, switchMap} from "rxjs";
import {CLPrint, GetError, PrintBase64File, Structures} from "@clavisco/core";
import {IDocumentForDownPayment, IDownPaymentClosed} from "@app/interfaces/i-down-payment";
import {IDownPayment, IDownPaymentsToDraw} from "@app/interfaces/i-sale-document";
import {DownPaymentService} from "@app/services/down-payment.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Titles} from "@app/enums/enums";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {ReportsService} from "@app/services/reports.service";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {CLTofixed} from "@app/shared/common-functions";
import {formatDate} from "@angular/common";
import {CheckboxColumnSelection} from "@app/interfaces/i-table-data";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IActionButton} from "@app/interfaces/i-action-button";

@Component({
  selector: 'app-down-payment',
  templateUrl: './down-payment.component.html',
  styleUrls: ['./down-payment.component.scss']
})
export class DownPaymentComponent implements OnInit, OnDestroy {
  //#region @clavisco/table Configuration
  actionButtons: IActionButton[] = [];
  shouldPaginateRequest: boolean = true;
  downPaymentTableId: string = 'DOWN-TABLE';
  checkboxColumns: string[] = ['Assigned'];
  downPaymentTbColumns: { [key: string]: string } = {
    Assigned: 'Seleccionar',
    CardName: 'Cliente',
    DocNum: 'Número de documento',
    DocCurrency: 'Moneda',
    DateFormatted: 'Fecha de factura',
    Pago: 'Pago',
    DocTotal: 'Total',
    Saldo: 'Saldo',
    DocEntry: '',
    ObjType: '',
    VatSum: ''
  }
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  mappedColumns: MappedColumns;
  hasItemsSelection: boolean = false;
  downPayment: IDownPaymentClosed[] = [];
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  searchForm!: FormGroup;
  downPaymentTotal: number = 0;
  TO_FIXED_TOTALDOCUMENT = '';
  localCurrency!: ICurrencies;

  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private downPaymentService: DownPaymentService,
    @Inject(MAT_DIALOG_DATA) public data: IDocumentForDownPayment,
    @Inject('LinkerService') private linkerService: LinkerService,
    private fb: FormBuilder, private salesDocumentService: SalesDocumentService,
    private reportsService: ReportsService,
    private matDialog: MatDialog,
    private matDialogRef: MatDialogRef<DownPaymentComponent>,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService,
    private sharedService: SharedService
  ) {
    this.mappedColumns = MapDisplayColumns(
      {
        dataSource: [] as IDownPaymentClosed[],
        renameColumns: this.downPaymentTbColumns,
        inputColumns: [
          {ColumnName: 'Pago', FieldType: 'number'}],
        ignoreColumns: ['DocEntry', 'CardCode', 'DocDate', 'DocDueDate', 'ObjType', 'VatSum']
      }
    );
    this.allSubscriptions = new Subscription();
  }

  ngAfterViewInit() {
    this.GetDownPaymentTable();
  }

  ngOnInit(): void {
    this.localCurrency = this.data.Currencies?.find(c => c.IsLocal)!;

    this.searchForm = this.fb.group({
      DocNum: [null],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
    });
    this.TO_FIXED_TOTALDOCUMENT = `1.${this.data?.Decimal || 0}-${this.data?.Decimal || 0}`;
    this.actionButtons = [
      {
        Key: 'SEARCH',
        Text: 'Buscar',
        MatIcon: 'search',
        MatColor: 'primary'
      },
      {
        Key: 'ADD',
        Text: 'Crear',
        MatIcon: 'save',
        MatColor: 'primary'
      },
      {
        Key: 'CANCEL',
        Text: 'Cancelar',
        MatIcon: 'cancel',
        MatColor: 'primary'
      }
    ];

    this.RegisterActionButtonsEvents();
    this.GetDownPaymentTable();
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
    Register<CL_CHANNEL>(this.downPaymentTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetRecords, this.callbacks);
    Register<CL_CHANNEL>(this.downPaymentTableId, CL_CHANNEL.OUTPUT_3, this.OnTableSelectionActivated, this.callbacks);

  }


  public OnActionButtonClicked(_event: IActionButton): void {
    switch (_event.Key) {
      case 'SEARCH':
        this.GetDownPaymentTable();
        break;
      case 'ADD':
        this.Save();
        break;
      case 'CANCEL':
        this.matDialogRef.close();
        break;
    }
  }

  GetDownPaymentTable(): void {


    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.downPaymentTableId,
      Data: ''
    });
  }

  /**
   * Method to update a table record
   * @param _event -Event emitted from the table to edit
   * @constructor
   */
  public OnTableSelectionActivated = (_event: ICLEvent): void => {
    let data: CheckboxColumnSelection<IDownPaymentClosed> = JSON.parse(_event.Data);

    if (!data.Row.Assigned) {
      this.downPayment[data.RowIndex].Assigned = false;
      this.downPayment[data.RowIndex].Pago = 0;
    } else {
      if (data.Row.Pago <= data.Row.DocTotal) {
        const currentTotal: number = this.downPayment
          .filter((x: IDownPaymentClosed, index: number) => x.Assigned && index !== data.RowIndex)
          .reduce((acc: number, x: IDownPaymentClosed) => acc + x.Pago, 0);

        const remainingAmount: number = this.data.DocTotal - currentTotal;

        if (remainingAmount <= 0) {
          this.downPayment[data.RowIndex].Assigned = false;
          this.downPayment[data.RowIndex].Pago = 0;
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `El total asignado ya alcanza el límite del documento.`
          });
        } else {
          this.downPayment[data.RowIndex].Assigned = true;
          this.downPayment[data.RowIndex].Pago =
            Math.min(data.EventName === 'InputField' ? data.Row.Pago : data.Row.Saldo, remainingAmount);
        }
      } else {
        this.downPayment[data.RowIndex].Assigned = false;
        this.downPayment[data.RowIndex].Pago = 0;

        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El monto ingresado no puede ser mayor al saldo del documento.`
        });
      }
    }

    this.downPaymentTotal = this.downPayment
      .filter((x: IDownPaymentClosed) => x.Assigned)
      .reduce((acc: number, x: IDownPaymentClosed) => acc + x.Pago, 0);

    this.InflateTable();
  };

  /**
   * Get advances
   * @constructor
   */
  private GetRecords = (): void => {
    this.downPayment = [];
    this.InflateTable();

    let data = this.searchForm.getRawValue();

    this.overlayService.OnGet();
    this.downPaymentService.Get(this.data.Document.CardCode , this.data.Document.DocCurrency, data.DateFrom, data.DateTo, data.DocNum ? data.DocNum : 0)
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: callback => {
        this.downPayment = (callback.Data || []).map(d => {
          return {
            ...d,
            Pago: 0,
            Saldo: CLTofixed(this.data.Decimal, d.Saldo),
            DocTotal: CLTofixed(this.data.Decimal, d.DocTotal),
            DateFormatted: formatDate(d.DocDate, 'MMMM d, y hh:mm a', 'en'),
            Assigned: false,
            CardName: `${d.CardCode} - ${d.CardName}`,
          }
        });
        this.InflateTable()
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });

  }

  InflateTable(): void {

    const NEW_TABLE_STATE = {
      Records: this.downPayment,
      RecordsCount: this.downPayment.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.downPaymentTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    });

  }


  Save(): void {
    if (!this.downPayment.some(x => x.Assigned)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No ha seleccionado anticipos`
      });
      return;
    }

    if (this.downPaymentTotal <= 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto de anticipos debe ser mayor a 0`
      });
      return;
    }
    if (this.downPaymentTotal > this.data.DocTotal) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto de anticipos supera total factura`
      });
      return;
    }

    let downPayment: IDownPaymentsToDraw[] = [];

    this.downPayment.filter(x => x.Assigned).forEach((element, index) => {
      downPayment.push({
        DocEntry: element.DocEntry,
        DownPaymentType: 'dptInvoice',
        GrossAmountToDraw  : this.localCurrency.Id === element.DocCurrency ? element.Pago : 0,
        GrossAmountToDrawFC: this.localCurrency.Id !== element.DocCurrency ? element.Pago : 0,
      } as IDownPaymentsToDraw)
    });

    this.data.Document.DownPaymentsToDraw = downPayment;

    if(this.downPaymentTotal < this.data.DocTotal){

      let IDownPayment: IDownPayment = {
        IsPaymentPartial: true,
        DownPaymentTotal: this.downPaymentTotal,
        DownPaymentsToDraw: downPayment,
        Currency: this.data.Document.DocCurrency
      }

      this.matDialogRef.close(IDownPayment);

    }else{


    this.overlayService.OnPost();
    this.salesDocumentService.Post('Invoices', this.data.Document)
      .pipe(
        switchMap(res => {
          if (res && res.Data) {
            return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
              map(print => {
                return {Document: res, Print: print};
              })
            );
          } else {
            return this.PrintInvoiceDocument(this.data.Document.DocEntry).pipe(
              map(print => {
                return {Document: {Data: this.data.Document}, Print: print};
              })
            );
          }
        }),
        map(res => {
          this.overlayService.Drop();
          return {
            DocEntry: res.Document.Data.DocEntry,
            DocNum: res.Document.Data.DocNum,
            NumFE: res.Document.Data.NumFE,
            CashChange: 0,
            CashChangeFC: 0,
            Title: Titles.Factura,
            Accion: 'creada',
            TypeReport: 'Invoices'
          } as ISuccessSalesInfo;
        }),
        switchMap(res => this.OpenDialogSuccessSales(res)),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.matDialogRef.close(callback)
      },
      error: (err) => {
        this.modalService.Continue({
          title: `Se produjo un error creando la ${Titles.Factura}`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
    }

  }

  private PrintInvoiceDocument(_docEntry: number): Observable<ICLResponse<IDownloadBase64> | null> {
    return this.reportsService.PrintReport(_docEntry, 'Invoices').pipe(
      switchMap(res => {
        if (PrinterWorker()) {
          return this.printerWorkerService.Post(res.Data.Base64)
            .pipe(
              map(printLocal => res),
              catchError((err) => {
                this.modalService.Continue({
                  title: 'Se produjo un error al imprimir',
                  subtitle: GetError(err),
                  type: CLModalType.ERROR
                });
                return of(err);
              })
            );
        } else {
          PrintBase64File({base64File: res.Data.Base64, blobType: 'application/pdf', onNewWindow: false});
          return of(res);
        }
      }),
      catchError(error => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
        return of(null);
      })
    );
  }

  private OpenDialogSuccessSales(_data: ISuccessSalesInfo): Observable<ISuccessSalesInfo> {
    return this.matDialog.open(SuccessSalesModalComponent, {
      width: '98%',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '80%',
      data: _data
    }).afterClosed().pipe(
      filter(res => res)
    )
  }

}

