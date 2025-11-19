import {Component, Inject, OnInit} from '@angular/core';
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {
  IDataForReconciliationModal,
  IInternalReconciliationRows,
  IInternalReconciliations,
  IPayInAccount
} from "@app/interfaces/i-pay-in-account";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {filter, finalize, map, Subscription, switchMap} from "rxjs";
import {OverlayService} from "@clavisco/overlay";
import {InternalReconciliationService} from "@app/services/internal-reconciliation.service";
import {CheckboxColumnSelection} from "@app/interfaces/i-table-data";
import {CLPrint, GetError, Structures} from "@clavisco/core";
import {formatDate} from "@angular/common";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {CLTofixed, GetIndexOnPagedTable} from "@app/shared/common-functions";

@Component({
  selector: 'app-reconciliation',
  templateUrl: './reconciliation.component.html',
  styleUrls: ['./reconciliation.component.scss']
})
export class ReconciliationComponent implements OnInit {

  /*TABLA INVOICES*/
  shouldPaginateRequestFacturas:boolean = false;
  TableIdInvoice: string = 'INVOICE-TABLE';
  invoicesTbMappedColumns!: MappedColumns;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  invoiceTbColumns: { [key: string]: string } = {
    DocNum: 'Documento',
    DocumentType: 'Tipo Documento',
    DateFormatted: 'Fecha de documento',
    DocCurrency: 'Moneda',
    ReconcileAmount: 'Pago',
    Saldo: 'Saldo',
    DocTotal: 'Total',
  }

  /*TABLA PAGOS*/
  shouldPaginateRequestPay: boolean = true;
  TableIdPayment: string = 'PAGO-TABLE';
  checkboxColumns: string[] = ['Selected'];
  paymentsTbMappedColumns!: MappedColumns;
  paymentTbColumns: { [key: string]: string } = {
    Selected: 'Seleccionar',
    DocNum: 'Documento',
    DocumentType: 'Tipo Documento',
    DateFormatted: 'Fecha de documento',
    DocCurrency: 'Moneda',
    ReconcileAmount: 'Pago',
    Saldo: 'Saldo',
    DocTotal: 'Total',
    ObjType: ''
  }
  documentForm!: FormGroup;
  customer!: IBusinessPartner;
  paymentTotal: number = 0;
  invoicesTotal: number = 0;
  conciliationTotal: number = 0;
  paymentTotalFC: number = 0;
  invoicesTotalFC: number = 0;
  conciliationTotalFC: number = 0;
  exchangeRate: number = 0;
  currency!: string;
  TO_FIXED_TOTALDOCUMENT: string = '';
  invoices: IPayInAccount[] = [];
  payments: IPayInAccount[] = [];
  allSubscriptions: Subscription;
  localCurrency!: ICurrencies;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IDataForReconciliationModal,
    private matDialogRef: MatDialogRef<ReconciliationComponent>,
    private alertsService: AlertsService,
    private overlayService: OverlayService,
    private internalReconciliationService: InternalReconciliationService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private fb: FormBuilder,
    private modalService: ModalService
  ) {
    this.allSubscriptions = new Subscription();
    this.invoicesTbMappedColumns = MapDisplayColumns({
      dataSource: [] as IPayInAccount[],
      inputColumns: [
        {ColumnName: 'ReconcileAmount', FieldType: 'number'}],
      renameColumns: this.invoiceTbColumns,
      ignoreColumns: ['ObjType', 'TransId', 'Selected', 'SaldoUSD', 'Total', 'TotalUSD', 'DocDate','DocEntry']
    });

    this.paymentsTbMappedColumns = MapDisplayColumns({
      dataSource: [] as IPayInAccount[],
      inputColumns: [
        {ColumnName: 'ReconcileAmount', FieldType: 'number'}],
      renameColumns: this.paymentTbColumns,
      ignoreColumns: ['ObjType', 'TransId', 'SaldoUSD', 'Total', 'TotalUSD', 'DocEntry', 'DocDate']
    });
  }

  ngOnInit(): void {
    this.documentForm = this.fb.group({
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
    });

    this.currency = this.data.Currency;
    this.localCurrency = this.data.Currencies?.find(c => c.IsLocal)!;

    Register<CL_CHANNEL>(this.TableIdInvoice, CL_CHANNEL.OUTPUT_3, this.OnTableInvoicesSelectionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.TableIdPayment, CL_CHANNEL.OUTPUT_3, this.OnTablePaymentSelectionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.TableIdPayment, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);

    if (this.data) {
      this.invoices = this.data.listInvoice?.map(x => {
        return {...x, DateFormatted: formatDate(x.DocDate, 'MMMM d, y hh:mm a', 'en')}
      }) || [];
      this.exchangeRate = this.data.ExchangeRate;

      if (this.localCurrency && (this.localCurrency.Id === this.currency)) {
        this.invoicesTotal = this.invoices?.reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
        this.invoicesTotalFC = this.invoicesTotal / this.exchangeRate;
      } else {
        this.invoicesTotalFC = this.invoices?.reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
        this.invoicesTotal = this.invoicesTotalFC * this.exchangeRate;
      }


      this.customer = this.data.Customer;
      this.TO_FIXED_TOTALDOCUMENT = `1.${this.data.DecimalDocument || 0}-${this.data.DecimalDocument || 0}`

      this.SearchDocuments();

      this.allSubscriptions.add(
        this.linkerService.Flow()?.pipe(
          StepDown<CL_CHANNEL>(this.callbacks),
        ).subscribe({
          next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
          error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  /**
   * Method to select invoice to apply internal reconciliation
   * @param _event - Event emitted from the table to select document
   * @constructor
   */
  public OnTableInvoicesSelectionActivated = (_event: ICLEvent): void => {
    let data: CheckboxColumnSelection<IPayInAccount> = JSON.parse(_event.Data);

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequestFacturas);

    if (+(data.Row.ReconcileAmount) <= 0) {
      this.InflateTableInvoice();
      return;
    }

    if (data.Row.ReconcileAmount <= this.invoices[data.RowIndex].Saldo) {

      this.invoices[INDEX].ReconcileAmount = data.Row.ReconcileAmount;

      if (this.localCurrency && (this.localCurrency.Id === this.currency)) {
        this.invoicesTotal = this.invoices?.reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
        this.conciliationTotal = this.invoicesTotal - this.paymentTotal;
        this.invoicesTotalFC = this.invoicesTotal / this.exchangeRate;
        this.paymentTotalFC = this.paymentTotal / this.exchangeRate;
        this.conciliationTotalFC = this.conciliationTotal / this.exchangeRate;
      } else {
        this.invoicesTotalFC = this.invoices?.reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
        this.conciliationTotalFC = this.invoicesTotalFC - this.paymentTotalFC;
        this.invoicesTotal = this.invoicesTotalFC * this.exchangeRate;
        this.paymentTotal = this.paymentTotalFC * this.exchangeRate;
        this.conciliationTotal = this.conciliationTotalFC * this.exchangeRate;
      }


    } else {

      this.invoices[INDEX].ReconcileAmount = 0;
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto ingresado no puede ser mayor al saldo del documento.`
      });
    }


    this.InflateTableInvoice();
  }

  /**
   * Method to select payment to apply internal reconciliation
   * @param _event - Event emitted from the table to select document
   * @constructor
   */
  public OnTablePaymentSelectionActivated = (_event: ICLEvent): void => {

    let data: CheckboxColumnSelection<IPayInAccount> = JSON.parse(_event.Data);

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequestPay);

    this.payments[INDEX].Selected = data.Row.Selected;

    if (data.EventName === 'InputField') {
      if (+(data.Row.ReconcileAmount) <= 0) {
        this.InflateTablePayment();
        return;
      }

      if (data.Row.ReconcileAmount <= this.payments[data.RowIndex].Saldo) {
        this.payments[INDEX].ReconcileAmount = data.Row.ReconcileAmount;

        if (this.localCurrency && (this.localCurrency.Id === this.currency)) {
          this.paymentTotal = this.payments.filter(_x => _x.Selected).reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
          this.conciliationTotal = this.invoicesTotal - this.paymentTotal;

          this.invoicesTotalFC = this.invoicesTotal / this.exchangeRate;
          this.paymentTotalFC = this.paymentTotal / this.exchangeRate;
          this.conciliationTotalFC = this.conciliationTotal / this.exchangeRate;

        } else {
          this.paymentTotalFC = this.payments.filter(_x => _x.Selected).reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
          this.conciliationTotalFC = this.invoicesTotalFC - this.paymentTotalFC;

          this.invoicesTotal = this.invoicesTotalFC * this.exchangeRate;
          this.paymentTotal = this.paymentTotalFC * this.exchangeRate;
          this.conciliationTotal = this.conciliationTotalFC * this.exchangeRate;
        }

      } else {
        this.payments[INDEX].ReconcileAmount = 0;
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El monto ingresado no puede ser mayor al saldo del documento.`
        });
      }

    } else {

      if (data.Row.DocTotal > 0) {
        this.payments[INDEX].ReconcileAmount = data.Row.Selected ? data.Row.Saldo : 0;


        if (this.localCurrency && (this.localCurrency.Id === this.currency)) {
          this.paymentTotal = this.payments.filter(_x => _x.Selected).reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
          this.conciliationTotal = this.invoicesTotal - this.paymentTotal;

          this.invoicesTotalFC = this.invoicesTotal / this.exchangeRate;
          this.paymentTotalFC = this.paymentTotal / this.exchangeRate;
          this.conciliationTotalFC = this.conciliationTotal / this.exchangeRate;

        } else {
          this.paymentTotalFC = this.payments.filter(_x => _x.Selected).reduce((acc, value) => acc + +(value.ReconcileAmount), 0);
          this.conciliationTotalFC = this.invoicesTotalFC - this.paymentTotalFC;

          this.invoicesTotal = this.invoicesTotalFC * this.exchangeRate;
          this.paymentTotal = this.paymentTotalFC * this.exchangeRate;
          this.conciliationTotal = this.conciliationTotalFC * this.exchangeRate;
        }

      } else {

        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Este pago no cuenta con un monto disponible.`
        });
        this.payments[INDEX].Selected = false;
      }
    }

    this.InflateTablePayment();
  }

  private InflateTablePayment(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.payments,
      RecordsCount: this.payments.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.TableIdPayment,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  private InflateTableInvoice(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.invoices,
      RecordsCount: this.invoices.length
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.TableIdInvoice,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  public Save(): void {

    if (this.conciliationTotal !== 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto de conciliación debe ser 0.`
      });
      return;
    }


    if (this.payments.some(x => x.Selected)) {

      let currencyLocal = this.data.Currencies?.find(x => x.IsLocal)?.Id;

      let isBusinessPartnerAllCurrency = this.data.Customer.Currency === '##' && this.data.Currency !== currencyLocal;

      let data = {
        CardOrAccount: 'coaCard',
        InternalReconciliationOpenTransRows: this.payments.filter(x => x.Selected)?.map((element, index) => {
          return {
            CreditOrDebit: 'codCredit',
            ReconcileAmount: isBusinessPartnerAllCurrency ? CLTofixed(this.data.DecimalDocument, +element.ReconcileAmount * this.exchangeRate) : +element.ReconcileAmount,
            ShortName: this.data.Customer?.CardCode,
            SrcObjAbs: element.DocEntry,
            SrcObjTyp: element.ObjType,
            TransId: +element.TransId,
            TransRowId: 1
          } as IInternalReconciliationRows
        })
      } as IInternalReconciliations;

      this.invoices.forEach((element, index) => {
        data.InternalReconciliationOpenTransRows.push({
          CreditOrDebit: 'codDebit',
          ReconcileAmount: isBusinessPartnerAllCurrency ? CLTofixed(this.data.DecimalDocument, +element.ReconcileAmount * this.exchangeRate)  : +element.ReconcileAmount,
          ShortName: this.data.Customer?.CardCode,
          SrcObjAbs: element.DocEntry,
          SrcObjTyp: element.ObjType,
          TransId: +element.TransId,
          TransRowId: 0
        } as IInternalReconciliationRows)
      });


      if (isBusinessPartnerAllCurrency) {

        this.overlayService.OnGet();
        this.modalService.CancelAndContinue({
          type: CLModalType.QUESTION,
          title: `Reconciliación se creará en moneda local`,
          subtitle:`Cliente es monedas todas y moneda del documento es diferente a moneda local`,
        }).pipe(
          filter(res => res),
          switchMap(res => {
            return this.internalReconciliationService.Post(data);
          }),
          finalize(() => this.overlayService.Drop())
        ).subscribe({
          next: (callback => {
            this.matDialogRef.close(callback.Data);
          }),
          error: (err) => {
            this.modalService.Continue({
              title: 'Se produjo un error creando la reconciliación',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });

      } else {

        this.overlayService.OnGet();
        this.internalReconciliationService.Post(data).pipe(
          finalize(() => this.overlayService.Drop())
        )
          .subscribe({
            next: callback => {
              this.matDialogRef.close(callback.Data);
            },
            error: (err) => {
              this.modalService.Continue({
                title: 'Se produjo un error creando la reconciliación',
                subtitle: GetError(err),
                type: CLModalType.ERROR
              });
            }
          });

      }
    } else {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No ha seleccionado ningún pago.`
      });
    }
  }

  /**
   * Method to obtain payments on account
   * @constructor
   */
  private GetDocuments = (): void => {
    let data = this.documentForm.getRawValue();
    this.overlayService.OnPost();
    this.internalReconciliationService.Get(this.data.Customer?.CardCode, this.data.Currency, data.DateFrom, data.DateTo).pipe(
      filter(res => {
        if (res.Data && res.Data.length > 0) return true;
        else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `No se obtuvieron documentos.`
          });
          return false
        }
      }),
      map(callback => callback?.Data.map(document => {
        return {...document, DateFormatted: formatDate(document.DocDate, 'MMMM d, y hh:mm a', 'en')}
      })),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: callback => {
        this.payments = callback;
        this.InflateTablePayment();
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * Method is executed after Angular initializes the component's views.
   */
  ngAfterViewInit(): void {
    this.SearchDocuments();
  }

  public SearchDocuments(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.TableIdPayment,
      Data: ''
    });
  }

  /**
   * Get selected currency symbol
   * @param _option - Section where to apply the change
   * @constructor
   */
  public GetSymbol(_option: number): string {
    if (_option === 1) {
      return this.data.Currencies?.filter(c => c.Id !== "##").find(c => c.Id !== this.currency)!.Symbol;
    } else {
      return this.data.Currencies?.find(c => c.Id === this.currency)!.Symbol;
    }
  }

  /**
   *Get totals of documentos
   * @param _option - Section where to apply the change
   * @constructor
   */
  public DisplayTotal(_option: number): number {
    if (_option === 1) {
      if (this.localCurrency?.Id === this.currency) {
        return this.paymentTotalFC;
      } else {
        return this.paymentTotal
      }
    } else if (_option === 2) {
      if (this.localCurrency?.Id === this.currency) {
        return this.invoicesTotalFC;
      } else {
        return this.invoicesTotal
      }
    } else if (_option === 3) {
      if (this.localCurrency?.Id === this.currency) {
        return this.conciliationTotalFC;
      } else {
        return this.conciliationTotal
      }
    } else if (_option === 4) {
      if (this.localCurrency?.Id === this.currency) {
        return this.paymentTotal;
      } else {
        return this.paymentTotalFC
      }
    } else if (_option === 5) {
      if (this.localCurrency?.Id === this.currency) {
        return this.invoicesTotal;
      } else {
        return this.invoicesTotalFC
      }
    } else {
      if (this.localCurrency?.Id === this.currency) {
        return this.conciliationTotal;
      } else {
        return this.conciliationTotalFC;
      }
    }
  }

}
