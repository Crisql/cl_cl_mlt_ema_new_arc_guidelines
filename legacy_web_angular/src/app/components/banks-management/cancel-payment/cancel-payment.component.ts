import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IActionButton} from "@app/interfaces/i-action-button";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {OverlayService} from "@clavisco/overlay";
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from "@clavisco/alerts";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {
  catchError,
  concatMap,
  filter,
  finalize,
  from,
  last,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from "rxjs";

import {CLPrint, GetError, PinPad, PinPadServices, PrintBase64File, Structures} from "@clavisco/core";
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {IPaymentForCancel} from "@app/interfaces/i-payment-for-cancel";
import {formatDate} from "@angular/common";
import {IncomingPaymentsService} from "@app/services/incoming-payments.service";
import {ICancelPaymentResolvedData} from "@app/interfaces/i-resolvers";
import {ActivatedRoute} from "@angular/router";
import {CheckboxColumnSelection, TableData} from "@app/interfaces/i-table-data";
import {MatDialog} from "@angular/material/dialog";
import {DetailPaymentComponent} from "./detail-payment/detail-payment.component";
import {IDataForDetailPay, IIncomingPaymentDetail} from "@app/interfaces/i-payment-detail";
import {PPTransactionService} from "@app/services/pp-transaction.service";
import {ReportsService} from "@app/services/reports.service";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {ITerminals} from "@app/interfaces/i-terminals";
import {IVoidedTransactions} from "@app/interfaces/i-pp-transactions";
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import ICommitedTransaction = PinPad.Interfaces.ICommitedTransaction;
import ICLResponse = Structures.Interfaces.ICLResponse;
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {GetIndexOnPagedTable} from "@app/shared/common-functions";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IStructures} from "@app/interfaces/i-structures";

@Component({
  selector: 'app-cancel-payment',
  templateUrl: './cancel-payment.component.html',
  styleUrls: ['./cancel-payment.component.scss']
})
export class CancelPaymentComponent implements OnInit, OnDestroy {


  /*Listas*/
  actionButtons: IActionButton[] = [];
  BusinessPartners: IBusinessPartner[] = [];
  documents: IPaymentForCancel[] = [];
  tableButtons: ICLTableButton[] = [];
  transactionsToVoid!: ICommitedTransaction[];
  voidedTransactions!: IVoidedTransaction[];
  Terminals!: ITerminals[];
  /*Formularios*/
  searchForm!: FormGroup;

  /*Tabla*/
  shouldPaginateRequest: boolean = true;
  docTableId: string = 'PAYMENT-CANCEL-TABLE';
  docTbMappedColumns!: MappedColumns;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  currentTransactionIndex: number = 0;
  checkboxColumns: string[] = ['Assigned'];
  allSubscriptions!: Subscription;
  docTbColumns: { [key: string]: string } = {
    Assigned: 'Seleccionar',
    DocNumOinv: 'Número factura',
    DocNumPay: 'Número de pago',
    DateFormatted: 'Fecha de pago',
    DocTotal: 'Monto pago',
    DocTotalFC: 'Monto pago dólares',
    DocCurrency: 'Moneda',
    DocStatus: 'Estado Factura',
    DocEntryOinv: '',
    DocEntryPay: '',
    DocumentKey: ''
  }

  /*Objects*/
  detailPayment!: IIncomingPaymentDetail;

  /*Variables*/
  docEntry: number = 0;
  docNumOinv: number = 0;
  docNumPay: number = 0;
  documentKey: string = '';
  DefaultBusinessPartner!: IBusinessPartner | null;
//#region component search
  searchModalId = "searchModalId";
  //#endregion

  currencies: ICurrencies[] = [];
  documentTypes!: IStructures[];
  constructor(
    private fb: FormBuilder,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private incomingPaymentService: IncomingPaymentsService,
    private matDialog: MatDialog,
    private ppTransactionService: PPTransactionService,
    private pinpadConector: PinPadServices.Connector,
    private reportsService: ReportsService,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService,
    private businessPartnerService: BusinessPartnersService
  ) {

    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.documents,
      renameColumns: this.docTbColumns,
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'}
      ],
      ignoreColumns: ['DocEntryOinv', 'DocEntryPay', 'DocDate', 'DocumentKey']
    });
  }

  ngOnInit(): void {
    this.OnLoad();

  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private OnLoad(): void {
    this.InitForm();
    this.LoadInitialData();

    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CANCELAR',
        MatIcon: 'cancel',
        Text: 'Cancelar pago',
        MatColor: 'primary'
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];

    this.tableButtons = [
      {
        Title: `Ver detalle del pago`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Icon: `info`,
        Color: `primary`,
        Data: ''
      }
    ];

    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.OUTPUT_3, this.OnTableItemSelectionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  /**
   * Load initial data required of component
   * @constructor
   * @private
   */
  private LoadInitialData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {
          const dataResolved = data['resolvedData'] as ICancelPaymentResolvedData;

          if (dataResolved) {
            this.Terminals = dataResolved.Terminals;
            this.currencies = dataResolved.Currencies;
            this.documentTypes = dataResolved.DocTypes;
            this.searchForm.patchValue({
              DocCurrency: this.currencies.find(x => x.IsLocal)?.Id
            });
            this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
          }
        }
      });
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SearchDocuments();
        break;
      case 'CANCELAR':
        this.CancelPayment();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * Method to select documents to cancel
   * @param _event - Event emitted from the table to select document
   * @constructor
   */
  public OnTableItemSelectionActivated = (_event: ICLEvent): void => {

    let data: CheckboxColumnSelection<IPaymentForCancel> = JSON.parse(_event.Data);

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequest);

    this.documents[INDEX].Assigned = data.Row.Assigned;

    this.documents = this.documents.map((d, index) => this.sharedService.MapTableColumns({
      ...d,
      Assigned: index === INDEX ? data.Row.Assigned : d.Assigned ? false : d.Assigned
    }, Object.keys(this.docTbColumns)));

    if (data.Row.Assigned) {
      this.docEntry = data.Row.DocEntryPay;
      this.docNumPay = data.Row.DocNumPay;
      this.documentKey = data.Row.DocumentKey
    } else {
      this.docEntry = 0;
      this.docNumPay = 0;
      this.documentKey = '';
    }
    this.InflateTable();
  }

  /**
   * Method to display modal with payment details
   * @param _event - Document selected
   * @constructor
   */
  private OnTableButtonClicked = (_event: ICLEvent): void => {

    let data: TableData = JSON.parse(_event.Data);

    let rowSelectDocument: IPaymentForCancel = JSON.parse(data.Data);

    switch (data.Action) {
      case Structures.Enums.CL_ACTIONS.OPTION_1:
        this.detailPayment = {} as IIncomingPaymentDetail;
        this.docNumOinv = rowSelectDocument.DocNumOinv;
        this.docNumPay = rowSelectDocument.DocNumPay;
        this.OpenDialogDetail(rowSelectDocument.DocEntryPay);
        break;

    }


  }

  private InitForm(): void {
    this.searchForm = this.fb.group({
      BusinessPartner: [null],
      DateFrom: [new Date(), [Validators.required]],
      DateTo: [new Date(), [Validators.required]],
      DocCurrency: ['', [Validators.required]],
      DocType: ['', Validators.required]
    });

    this.searchForm.get('BusinessPartner')!.valueChanges.pipe(
      map((value: string) => {
        if (value !== this.getDisplayValue(this.DefaultBusinessPartner as IBusinessPartner)) {
          this.DefaultBusinessPartner = null;
          this.searchForm.patchValue({ BusinessPartner: '' });
        }
      })
    ).subscribe();

  }

  private getDisplayValue(value: IBusinessPartner): string {
    return value ? `${value.CardCode} - ${value.CardName}` : '';
  }

  /**
   * Show business partner search modal
   * @constructor
   */
  ShowModalSearchBusinnesPartner(): void
  {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de socios de negocios',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
        TableMappedColumns: {
          IgnoreColumns: ['Id','Vendedor','GroupCode','CardType','Phone1','PayTermsGrpCode','DiscountPercent','MaxCommitment','FederalTaxID','PriceListNum','SalesPersonCode','Currency','EmailAddress','Series','CashCustomer',
            'TypeAheadFormat','TypeIdentification','Provincia','Canton','Distrito','Barrio','Direccion','Frozen','Valid','FatherType','FatherCard','ConfigurableFields','BPAddresses','Udfs','IsCompanyDirection','ShipToDefault','BilltoDefault','AttachmentEntry','CreateDate','Device'],
          RenameColumns: {
            CardCode: 'Codigo',
            CardName: 'Nombre',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed()
      .subscribe({
        next: (value: IBusinessPartner) => {
          if(value){
            this.DefaultBusinessPartner = value;
            this.searchForm.patchValue({ BusinessPartner: `${value.CardCode} - ${value.CardName}`});
          }
        }
      });
  }
  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.businessPartnerService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.BusinessPartners = callback.Data;

        this.InflateTableBusinnesPartner();

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })

  }

  /**
   * Send information to search-modal component
   * @constructor
   * @private
   */
  private InflateTableBusinnesPartner(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.BusinessPartners,
      RecordsCount: this.BusinessPartners.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }


  /**
   * Get invoices to cancel
   * @constructor
   */
  private GetDocuments = (): void => {

    let data = this.searchForm.getRawValue();

    let cardCode = this.DefaultBusinessPartner?.CardCode ?? '';

    this.overlayService.OnGet();
    this.incomingPaymentService.GetDocForCancel(cardCode, data.DateFrom, data.DateTo,data.DocCurrency,data.DocType).pipe(
      finalize(() => this.overlayService.Drop())
    )
      .subscribe({
        next: (res) => {
          this.documents = (res.Data || []).map(d => this.sharedService.MapTableColumns({
            ...d,
            DateFormatted: formatDate(d.DocDate, 'MMMM d, y hh:mm a', 'en'),
            Assigned: false
          }, Object.keys(this.docTbColumns)));

          this.InflateTable();
        },
        error: (error) => {
        }
      });
  }

  private SearchDocuments(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.docTableId,
      Data: ''
    });
  }

  private OpenDialogDetail(_docEntry: number): void {

    this.matDialog.open(DetailPaymentComponent, {
      autoFocus: false,
      data: {
        DocEntryPay: _docEntry,
        DocNumOinv: this.docNumOinv,
        DocNumPay: this.docNumPay
      } as IDataForDetailPay
    }).afterClosed().subscribe({
      next: (callback) => {
      },
      error: (error) => {
      }
    });
  }

  private InflateTable(): void {
    const NEW_TABLE_STATE = {
      Records: this.documents
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.docTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  private CancelPayment(): void {

    if (this.docEntry > 0) {

      this.overlayService.OnPost();
      this.ppTransactionService.GetPPTransactionByDocumentKey(this.documentKey).pipe(
        switchMap(callback => {
          if (callback.Data) {

            this.transactionsToVoid = callback.Data;
            this.voidedTransactions = [];
            this.currentTransactionIndex = 0;

          }
         return this.CancelPPCard();}),
        switchMap(res => this.incomingPaymentService.Cancel(this.docEntry)),
        map(res => {
          if (!this.voidedTransactions || this.voidedTransactions.length <= 0) return '';
          let rawData = `>ct:${this.voidedTransactions.length}>ct_end`;
          let appliedPinpadInvoices = ``;
          this.voidedTransactions.forEach((x, index) => {

            // make some mappings
            const EMVSTREAM = JSON.parse(x.SerializedTransaction)['EMVStreamResponse'];
            const INDEX = index + 1;
            const AMOUNT = +EMVSTREAM.salesAmount.slice(0, EMVSTREAM.salesAmount.length - 2) + "." + EMVSTREAM.salesAmount.slice(-2);
            const TERMINAL: ITerminals = this.Terminals.find(y => y.TerminalCode == x.TerminalId) || {Currency: ' '} as ITerminals;

            rawData += `>tr${INDEX}:${x.TerminalId}>tr_end${INDEX}>am${INDEX}:${AMOUNT}>am_end${INDEX}>ti${INDEX}:${x.InvoiceNumber}`;
            rawData += `>ti_end${INDEX}>st${INDEX}:${EMVSTREAM['systemTraceNumber']}>st_end${INDEX}>rn${INDEX}:${EMVSTREAM['referenceNumber']}`;
            rawData += `>rn_end${INDEX}>na${INDEX}:${EMVSTREAM['authorizationNumber']}>na_end${INDEX}>cu${INDEX}:${TERMINAL.Currency}>cu_end${INDEX}>fc${INDEX}:${x.CreationDate.toString()}>fc_end${INDEX}`;
            appliedPinpadInvoices += `${x.InvoiceNumber},`;
          });

          appliedPinpadInvoices.slice(0, -1);
          return rawData;
        }),
        switchMap(res => this.PrintVoucher(this.docEntry, res)),
        map(res => {

          return {
            DocEntry: this.docEntry,
            DocNum: this.docNumPay,
            NumFE: '',
            CashChange: 0,
            CashChangeFC: 0,
            Title: 'Pago',
            Accion: 'cancelado',
            TypeReport: (!this.voidedTransactions || this.voidedTransactions.length <= 0) ? 'CancelPayment' : 'VoucherCancellation'
          } as ISuccessSalesInfo;
        }),
        switchMap(res => {
          this.overlayService.Drop()
          return this.OpenDialogSuccessSales(res);}),
        map(res => {
          this.documents = this.documents.filter(_x => _x.DocEntryPay !== this.docEntry).map(d => this.sharedService.MapTableColumns({
            ...d,
            Assigned: false
          }, Object.keys(this.docTbColumns)));

          this.docEntry = 0;
          this.docNumPay = 0;
          this.documentKey = '';
          this.InflateTable();

        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
          next: value => {
          },
          error: err => {
            this.modalService.Continue({
              title: 'Se produjo un error al cancelar el pago',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        }
      );
    } else {
      this.alertsService.Toast({type: CLToastType.INFO, message: 'No ha seleccionado ningún pago.'});
    }


  }

  /**
   * Method to clean component
   * @private
   */
  private Clear(): void {
    this.DefaultBusinessPartner = null;
    this.documents = [];
    this.InitForm();
    this.InflateTable();
  }


  /**
   *
   * METODO PARA CANCELAR LAS TARJETAS EN PINPAD
   * @constructor
   */
  public CancelPPCard(): Observable<boolean> {

    if (this.transactionsToVoid && this.transactionsToVoid.length > 0) {
      return from(this.transactionsToVoid).pipe(
        concatMap(transaction => this.pinpadConector.VoidTransaction({
          transaction: transaction
        }).pipe(
          map(callback => {
            const EMVS_STREAM = JSON.parse(callback.Data)['EMVStreamResponse'];

            return {
              InvoiceNumber: transaction.InvoiceNumber,
              SerializedTransaction: callback.Data,
              TerminalId: transaction.TerminalId,
              TransactionId: EMVS_STREAM.transactionId
            } as IVoidedTransaction;

          }),
          concatMap((callback: IVoidedTransaction) => this.ppTransactionService.CommitCanceledCard(callback)
            .pipe(
              map(res => {
                  if (res) {
                    let voidTransaction = {
                      InvoiceNumber: res.Data.InvoiceNumber,
                      SerializedTransaction: res.Data.SerializedTransaction,
                      TerminalId: res.Data.TerminalId,
                      TransactionId: res.Data.TransactionId,
                      CreationDate: res.Data.CreatedDate.toString()
                    } as IVoidedTransactions
                    this.voidedTransactions.push(voidTransaction);
                  }
                  return res.Data;
                }
              ),
              catchError(err => {
                this.alertsService.ShowAlert({HttpErrorResponse: err});
                return of({} as IVoidedTransactions);
              }))),
        )),
        last(),
        map(res => true)
      )
    } else {
      return of(false)
    }
  }

  private PrintVoucher(_documentKey: number, _rawData: string): Observable<ICLResponse<string> | null> {

    if (!_rawData) {
      return of(null);
    }
    return this.reportsService.PrintVoucher(_documentKey, _rawData).pipe(
      switchMap(res => {
        if (PrinterWorker()) {
          return this.printerWorkerService.Post(res.Data)
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
          PrintBase64File({base64File: res.Data, blobType: 'application/pdf', onNewWindow: false});
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
      data: _data,
      disableClose: true
    }).afterClosed().pipe(
      filter(res => res)
    )
  }

  public ChangeBusinessPartner(): void {
    this.docEntry = 0;
    this.docNumPay = 0;
    this.documentKey = '';
    this.documents = [];
    this.InflateTable();
  }

  public SelectCurrency(): void {
    // this.currency = this.documentForm.controls['DocCurrency'].value;
    // if (this.localCurrency.Id === this.currency) {
    //   this.symbolCurrency = '₡';
    //
    // } else if (this.localCurrency.Id !== this.currency) {
    //   this.symbolCurrency = '$';
    // } else {
    //   let currency = this.currencies.find(x => x.IsLocal);
    //   if (currency) {
    //     this.symbolCurrency = this.currencies.find(c => c.Id === currency!.Id)?.Symbol || '';
    //   }
    // }

    // this.creditnemos = [];
    // this.documents = [];
    // this.totalInvoice = 0;
    // this.totalCreditNemo = 0;
    // this.conciliationTotal = 0;
    // this.totalInvoiceFC = 0;
    // this.totalCreditNemoFC = 0;
    // this.conciliationTotalFC = 0;
    // this.InflateTable();
    // this.InflateTableCreditNemo();
  }

  OnChangeDocumentType(_event?: any): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.docTableId,
      Data: ''
    });
  }
}
