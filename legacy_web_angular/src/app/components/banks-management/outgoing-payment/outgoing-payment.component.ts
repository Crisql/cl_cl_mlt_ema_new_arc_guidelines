import {Component, Inject, OnInit} from '@angular/core';
import {
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  Subscription,
  switchMap,
} from "rxjs";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {
  ACCOUNT_TYPE,
  IAccount,
  ICurrency,
  IPaymentHolder,
  IPaymentSetting as IPaymentModalSetting,
  IPaymentState,
  PaymentModalComponent
} from "@clavisco/payment-modal";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IActionButton} from "@app/interfaces/i-action-button";
import {InvoiceOpen} from "@app/interfaces/i-invoice-payment";
import {IEditableField, IEditableFieldConf} from "@clavisco/table/lib/table.space";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {
  CL_CHANNEL,
  CL_DISPLAY,
  ICLCallbacksInterface,
  ICLEvent,
  LinkerService,
  Register,
  Run,
  StepDown
} from "@clavisco/linker";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {ActivatedRoute} from "@angular/router";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CLPrint, GetError, PinPad, Repository, Structures} from "@clavisco/core";
import {CheckboxColumnSelection} from "@app/interfaces/i-table-data";
import {IPaymentReceivedResolveData} from "@app/interfaces/i-resolvers";
import {formatDate} from "@angular/common";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IIncomingPayment, IPaymentCreditCards, IPaymentInvoices} from "@app/interfaces/i-incoming-payment";
import {PurchasesDocumentService} from "@app/services/purchases-document.service";
import {OutgoingPaymentService} from "@app/services/outgoing-payment.service";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {ISettings} from "@app/interfaces/i-settings";
import {ICompany} from "@app/interfaces/i-company";
import { IDecimalSetting, IPaymentSetting } from "../../../interfaces/i-settings";
import {environment} from "@Environment/environment";
import {PaymentInvoiceType, SettingCode} from "@app/enums/enums";
import {CommonService} from "@app/services/common.service";
import {
  CLTofixed,
  CurrentDate,
  FormatDate,
  GetIndexOnPagedTable,
  MappingUdfsDevelopment
} from "@app/shared/common-functions";
import {IUdf, IUdfContext, IUdfDevelopment} from "@app/interfaces/i-udf";
import {IUniqueId} from "@app/interfaces/i-document-type";
import {ITransaction} from "@clavisco/payment-modal/lib/payment-modal.space";
import {ITransactions} from "@app/interfaces/i-pp-transactions";
import {IUserToken} from "@app/interfaces/i-token";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {AccountsService} from "@app/services/accounts.service";
import {SuppliersService} from "@app/services/suppliers.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {SettingsService} from "@app/services/settings.service";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {UdfsService} from "@app/services/udfs.service";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import ITerminal = PinPad.Interfaces.ITerminal;
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import {CurrenciesService} from "@app/services/currencies.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";

@Component({
  selector: 'app-outgoing-payment',
  templateUrl: './outgoing-payment.component.html',
  styleUrls: ['./outgoing-payment.component.scss']
})
export class OutgoingPaymentComponent implements OnInit {
  User!: string;
  /*LISTAS*/
  udfsValue: IUdf[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  settings: ISettings[] = [];
  terminals: ITerminal[] = [];
  permissions: IPermissionbyUser[] = []
  BusinessPartners: IBusinessPartner[] = [];
  currencies: ICurrencies[] = [];
  actionButtons: IActionButton[] = [];
  documents: InvoiceOpen[] = [];
  editableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'Pago',
      Permission: {Name: 'Banks_AccountPayment_EditPayment'}
    },
  ];

  /*Formularios*/
  documentForm!: FormGroup;

  /*TABLA*/
  shouldPaginateRequest: boolean = true;
  docTableId: string = 'INVOICE-TABLE';
  docTbMappedColumns!: MappedColumns;
  editableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  checkboxColumns: string[] = ['Assigned'];
  allSubscriptions: Subscription;
  docTbColumns: { [key: string]: string } = {
    Assigned: 'Seleccionar',
    CardName: 'Proveedor',
    DocumentType: 'Tipo documento',
    DocNum: 'Número de documento',
    InstlmntID: 'Plazos',
    DocCurrency: 'Moneda',
    DateFormatted: 'Fecha de factura',
    DateFormattedV: 'Vencimiento',
    Pago: 'Pago',
    Total: 'Total',
    Saldo: 'Saldo',
    DocEntry: ''
  }

  /*VARIABLES*/
  total: number = 0;
  totalFC: number = 0;
  symbolLC: string = '';
  symbolFC: string = '';
  uniqueId: string = '';
  TO_FIXED_TOTALDOCUMENT: string = '1.0-0';
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento
  DefaultBusinessPartner!: IBusinessPartner | null;
  /*OBJECTS*/
  paymentHolder!: IPaymentHolder;
  paymentConfiguration!: IPaymentSetting;
  selectedCompany!: ICompany | null;
  currentSession!: ICurrentSession;
  paymentModalId: string = 'PaymentModalId';

  //#region Udfs
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'OVPM';
  isVisible: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || '';
  docTbMapDisplayColumnsArgs: any;
  localCurrency!: ICurrencies;

  //#region component search
  searchModalId = "searchModalId";
  //#endregion

  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private fb: FormBuilder,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private purchasesDocumentService: PurchasesDocumentService,
    private matDialog: MatDialog,
    private outgoingPaymentService: OutgoingPaymentService,
    private commonService: CommonService,
    private suppliersService: SuppliersService,
    private permissionUserService: PermissionUserService,
    private accountsService: AccountsService,
    private settingService: SettingsService,
    private terminalUsersService: TerminalUsersService,
    private udfsService: UdfsService,
    private exchangeRateService: ExchangeRateService,
    private currenciesService: CurrenciesService
  ) {


    this.allSubscriptions = new Subscription();
    this.docTbMapDisplayColumnsArgs = {
      dataSource: this.documents,
      stickyColumns: [
        {Name: 'Total', FixOn: 'right'},
        {Name: 'Saldo', FixOn: 'right'}
      ],
      inputColumns: [
        {ColumnName: 'Pago', FieldType: 'number'}],
      editableFieldConf: this.editableFieldConf,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['DocEntry', 'NumAtCard', 'ObjType']
    };
    this.docTbMappedColumns = MapDisplayColumns(this.docTbMapDisplayColumnsArgs);
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private OnLoad(): void {

    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.InitForm();
    this.PinpadConfiguration();
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'G-PAGO',
        MatIcon: 'save',
        Text: 'Crear',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'IMPRIMIR',
        MatIcon: 'print',
        Text: 'Imprimir',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar',
        MatColor: 'primary'
      },
    ]

    this.RegisterPaymentModalEvents();
    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.OUTPUT_3, this.OnTableItemSelectionActivated, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.HandleResolvedData();

  }

  private PinpadConfiguration(): void {
    Repository.Behavior.SetTokenConfiguration({token: 'Share', setting: "apiURL", value: environment.apiUrl});
    Repository.Behavior.SetTokenConfiguration({token: 'PinPad', setting: "apiURL", value: 'PinpadServicePP'});
    Repository.Behavior.SetTokenConfiguration({
      token: 'PinPad',
      setting: 'voidedVoucherPath',
      value: 'api/Reports/PrintVoucher'
    });
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SearchDocuments();
        break;
      case 'G-PAGO':
        this.OpenPaymentModal();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * Method is executed in the clear fields button
   * @constructor
   * @private
   */
  private Clear(): void {
    this.overlayService.OnGet();
    forkJoin({
      Currencies: this.currenciesService.Get(false),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      Terminals: this.terminalUsersService.GetTerminals<ITerminal[]>(),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OVPM'),
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>()
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.currencies = callback.Currencies.Data;
        this.permissions = callback.Permissions.Data;
        this.settings = callback.Settings.Data;
        this.terminals = callback.Terminals.Data;
        this.udfsDevelopment = callback.UdfsDevelopment.Data;
        this.currentSession.Rate = callback.ExchangeRate.Data.Rate;
        this.DefaultBusinessPartner = null;

        this.SetInitialData();
        this.ResetDocument();
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

  /**
   * Method to select document to apply payment
   * @param _event - Event emitted from the table to select document
   * @constructor
   */
  public OnTableItemSelectionActivated = (_event: ICLEvent): void => {

    let data: CheckboxColumnSelection<InvoiceOpen> = JSON.parse(_event.Data);

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequest);

    this.documents[INDEX].Assigned = data.Row.Assigned;

    if (data.EventName === 'InputField') {
      if (+(data.Row.Pago) <= 0) {
        this.InflateTable();
        return;
      }

      this.documents[INDEX].Pago = data.Row.Pago;

    } else {
      this.documents[INDEX].Pago = data.Row.Assigned ? data.Row.Saldo : 0;

    }

    this.total = this.documents.filter(_x => _x.Assigned)
      .reduce((acc, value) => acc + this.GetTotalByCurrency(value.Pago, value.DocCurrency), 0);

    this.totalFC = this.total / this.currentSession.Rate;

    this.InflateTable();
  }

  private GetTotalByCurrency(_pay: number, _currency: string): number {

    if (this.localCurrency.Id === _currency) {
      return +_pay;
    } else {
      return +_pay * this.currentSession.Rate;
    }
  }

  /**
   * Register event for payment modal
   * @constructor
   * @private
   */
  private  RegisterPaymentModalEvents(): void {
    Register<CL_CHANNEL>(this.paymentModalId, CL_CHANNEL.OUTPUT, this.HandlePaymentModalResult, this.callbacks)
  }
  private HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {
          const dataResolved = data['resolvedData'] as IPaymentReceivedResolveData;

          if (dataResolved) {
            this.currencies = dataResolved.Currencies;
            this.localCurrency = this.currencies.find(c => c.IsLocal)!;
            this.symbolFC = this.currencies.filter(c => c.Id !== "##").find(c => !c.IsLocal)!.Symbol;
            this.symbolLC = this.localCurrency.Symbol;
            this.permissions = dataResolved.Permissions;
            this.settings = dataResolved.Settings;
            this.terminals = dataResolved.Terminals;
            this.udfsDevelopment = dataResolved.UdfsDevelopment;
            this.currentSession.Rate = dataResolved.ExchangeRate.Rate;
            this.SetInitialData();
          }
        }
      });
  }

  /**
   * Initialize business partner form
   * @constructor
   * @private
   */
  private InitForm(): void {
    this.documentForm = this.fb.group({
      BusinessPartner: ['', [Validators.required]],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocCurrency: ['', [Validators.required]],
      Comments: [''],
      Amount: [{value: 0, disabled: true}, [Validators.required]],
      Reference: [0],
      IsPayAccount: [false]
    });

    this.documentForm.get('BusinessPartner')!.valueChanges.pipe(
      map((value: string) => {
        if (value !== this.getDisplayValue(this.DefaultBusinessPartner as IBusinessPartner)) {
          this.DefaultBusinessPartner = null;
          this.documentForm.patchValue({ BusinessPartner: '' });
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
            this.documentForm.patchValue({ BusinessPartner: `${value.CardCode} - ${value.CardName}`});
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
    this.suppliersService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
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
   * The data resulting from the payment modal is obtained
   * @param _event
   * @constructor
   */
  HandlePaymentModalResult = (_event: ICLEvent): void => {
    let data = JSON.parse(_event.Data) as IPaymentHolder;

    if (data.Result) {
      // Esta asignacion no es requerida, pero puede ser necesaria si
      // debe recuperarse la modal despues de un error
      this.paymentHolder.PaymentState = data.PaymentState;
      this.CreateOutingPayment(data.PaymentState, this.currentSession!.Rate);
    } else {
      if (data.Message) this.modalService.NextError({subtitle: data.Message, disableClose: true});
      this.paymentHolder = {} as IPaymentHolder;
    }
  }


  /**
   * Obtain invoices to apply payment
   * @constructor
   */
  private GetDocuments = (): void => {

    let data = this.documentForm.getRawValue();

    this.overlayService.OnPost();
    this.purchasesDocumentService.GetDocumentForPayment(this.DefaultBusinessPartner?.CardCode ?? '', data.DocCurrency, data.DateFrom, data.DateTo).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.documents = (callback.Data || []).map(document => this.sharedService.MapTableColumns({
          ...document,
          Pago: 0,
          Saldo: CLTofixed(this.DecimalTotalDocument, document.Saldo),
          Total: CLTofixed(this.DecimalTotalDocument, document.Total),
          DateFormatted: formatDate(document.DocDate, 'MMMM d, y hh:mm a', 'en'),
          DateFormattedV: formatDate(document.DocDueDate, 'MMMM d, y hh:mm a', 'en'),
          Assigned: false,
          CardName: `${document.CardCode} - ${document.CardName}`
        }, Object.keys(this.docTbColumns)));

        this.documentForm.controls['IsPayAccount'].setValue(false);
        this.documentForm.controls['Amount'].disable();

        this.InflateTable();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  private SearchDocuments(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.docTableId,
      Data: ''
    });
  }

  private InflateTable(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.documents,
      RecordsCount: this.documents.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.docTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  public SelectCurrency(): void {
    if (this.documentForm.controls['IsPayAccount'].value) {
      this.SetTotalPayAccount();
      return;
    }

    this.documents = [];
    this.total = 0;
    this.totalFC = 0;
    this.InflateTable();
  }

  public OpenPaymentModal(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else this.SaveChanges();
  }

  public LoadAccounts(): Observable<IAccount[]> {
    const data = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;

    return this.accountsService.Get<any[]>(data.WhsCode).pipe(map(res =>
      res.Data.map(
        account => {
          return {
            Id: account.Id,
            Account: account.AcctCode,
            AccountName: account.AcctName,
            Currency: account.ActCurr,
            Type: this.MapAccountType(account.Type)
          } as IAccount
        }),
    ));
  }

  public MapAccountType(_type: number): string {
    switch (_type) {
      case 1:
        return ACCOUNT_TYPE.CASH;
      case 2:
        return ACCOUNT_TYPE.CARD;
      case 3:
        return ACCOUNT_TYPE.TRANSFER;
      default:
        return ''
    }
  }

  private SaveChanges(): void {
    if (!this.documents.some(x => x.Assigned)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No ha seleccionado documentos`
      });
      return;
    }
    this.LoadAccounts()
      .subscribe({
        next: (callback) => {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;

          let currency: string = this.documentForm.controls['DocCurrency'].value;

          this.paymentHolder || (this.paymentHolder = {} as IPaymentHolder)
          this.paymentHolder.PaymentSettings || (this.paymentHolder.PaymentSettings = {} as IPaymentModalSetting);
          this.paymentHolder.PaymentState || (this.paymentHolder.PaymentState = {} as IPaymentState);

          this.paymentHolder.Id = this.paymentModalId;

          this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
          if (this.currentSession) {
            this.paymentHolder.PaymentSettings.Rate = this.currentSession.Rate;
          }

          this.total = CLTofixed(this.DecimalTotalDocument, this.total);
          this.paymentHolder.PaymentSettings.User = this.User;

          //CUENTAS
          this.paymentHolder.PaymentSettings.Accounts = callback;
          //PINPAD
          this.paymentHolder.PaymentSettings.Terminals = this.terminals;
          this.paymentHolder.PaymentSettings.CanEditCardNumber = this.permissions.some(x => x.Name === 'Banks_AccountPayment_EditPayCardNumber');
          this.paymentHolder.PaymentSettings.EnablePinPad = this.paymentConfiguration.Pinpad;
          this.paymentHolder.PaymentSettings.DefaultCardNumber = this.paymentConfiguration.CardNumber;
          this.paymentHolder.PaymentSettings.DefaultCardValid = new Date(this.paymentConfiguration?.CardValid);
          this.paymentHolder.PaymentSettings.DocumentKey = this.uniqueId;
          //MONEDAS Y TOTALES
          this.paymentHolder.PaymentSettings.CardRefundAmount = 0;
          this.paymentHolder.PaymentSettings.InvertRateDirection = false;
          this.paymentHolder.PaymentSettings.DecimalRounding = this.DecimalTotalDocument;
          this.paymentHolder.PaymentSettings.DocumentCurrency = currency;
          this.paymentHolder.PaymentSettings.PaymentCurrency = currency;
          this.paymentHolder.PaymentSettings.CardRefundAmount = 0;
          this.paymentHolder.PaymentSettings.DocTotal = (this.documentForm.controls['IsPayAccount'].value) ? this.documentForm.controls['Amount'].value : this.total;
          this.paymentHolder.PaymentSettings.Currencies = this.currencies.map(element => {
            return {
              Name: element.Id,
              Description: element.Name,
              Symbol: element.Symbol,
              IsLocal: element.IsLocal
            } as ICurrency
          });

          dialogConfig.data = this.paymentHolder;

          const dialogRef = this.matDialog.open(PaymentModalComponent, dialogConfig);

          dialogRef.afterOpened()
            .subscribe(() => {
              if (!callback || callback.length == 0) {
                const data = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
                this.alertsService.Toast({
                  type: CLToastType.INFO,
                  message: `El almacén (${data.WhsName}) no tiene cuentas asignadas`
                });
              }
            })
        },
        error: err => {
          this.alertsService.ShowAlert({HttpErrorResponse: err})
        }
      });

  }

  public LoadPPTransaction(_transaction: ITransaction[]): IVoidedTransaction[] {

    let transactions: IVoidedTransaction[] = [];

    _transaction.forEach(x => {
      let data: ITransactions | null = null;
      if (x.PinPadTransaction !== null) {

        data = JSON.parse(x.PinPadTransaction);

        if (data !== null) {

          const EMVS_STREAM = JSON.parse(data.CommitedResult)['EMVStreamResponse'];

          let ppTransaction = {
            DocumentKey: this.paymentHolder.PaymentSettings.DocumentKey,
            TerminalId: data.TerminalId,
            SerializedTransaction: data.CommitedResult,
            InvoiceNumber: data.InvoiceNumber,
            TransactionId: EMVS_STREAM['transactionId']
          } as IVoidedTransaction;

          transactions.push(ppTransaction);
        }
      }
    });
    return transactions;
  }

  /**
   * Method to create made payments
   * @param _paymentState - Object recived of payment modal
   * @param _rate - Company exchange rate
   * @constructor
   */
  public CreateOutingPayment(_paymentState: IPaymentState, _rate: number): void {
    let isPaymentPinpad = (_paymentState && _paymentState.Transactions && _paymentState.Transactions.find(x => x.PinPadTransaction)) || false;

    this.SetUdfsDevelopment();

    let notLocalCurrency = this.currencies.filter(c => c.Id !== '##').find(c => !c.IsLocal)!;

    let isSameDocCurrency = this.documents.filter(_x => _x.Assigned).some(x => x.DocCurrency === _paymentState.Currency || x.DocCurrency == notLocalCurrency.Id);

    let outgoingPayment = {
      CardCode: this.DefaultBusinessPartner?.CardCode,
      CardName: this.DefaultBusinessPartner?.CardName,
      DocDate: CurrentDate(),
      DocCurrency: _paymentState.Currency,
      DocRate: isSameDocCurrency ? 0 : _rate,
      CashSum: _paymentState.Cash.Total,
      CashAccount: _paymentState.Cash.Account,
      TransferSum: _paymentState.Transfers.Total,
      TransferAccount: _paymentState.Transfers.Account,
      TransferDate: FormatDate(_paymentState.Transfers.TransferDate),
      TransferReference: _paymentState.Transfers.Reference,
      PaymentCreditCards: _paymentState.Transactions.map(transaction => {
        return {
          CreditCard: transaction.CreditCard,
          CreditCardNumber: transaction.CreditCardNumber,
          CreditAcct: transaction.CreditAcct,
          CreditSum: transaction.CreditSum,
          VoucherNum: transaction.VoucherNum,
          CardValidUntil: transaction.CardValid,
          U_ManualEntry: isPaymentPinpad ? '0' : '1'
        } as IPaymentCreditCards
      }),
      PaymentInvoices: this.documents.filter(_x => _x.Assigned).map(document => {
        return {
          InvoiceType: document.DocumentType == "Factura anticipo" ? PaymentInvoiceType.it_PurchaseDownPayment : PaymentInvoiceType.it_PurchaseInvoice,
          DocEntry: document.DocEntry,
          SumApplied: this.localCurrency.Id === _paymentState.Currency ? document.Pago : CLTofixed(this.DecimalTotalDocument, (document.Pago * _rate)),
          AppliedFC: this.localCurrency.Id !== _paymentState.Currency ? document.Pago : CLTofixed(this.DecimalTotalDocument, (document.Pago / _rate))
        } as IPaymentInvoices
      }),
      PPTransactions: _paymentState.Transactions && _paymentState.Transactions.find(x => x.PinPadTransaction) ? this.LoadPPTransaction(_paymentState.Transactions) : null,
      Remarks: this.documentForm.controls['Comments'].value,
      Udfs: this.udfsValue
    } as IIncomingPayment;

    this.overlayService.OnPost();
    this.outgoingPaymentService.Post(outgoingPayment).pipe(
      switchMap(res => {
        this.overlayService.Drop();
        let infoOutgoingPayment = {
          DocEntry: res.Data.DocEntry,
          DocNum: res.Data.DocNum,
          NumFE: '',
          CashChange: this.localCurrency.Id === _paymentState.Currency ? _paymentState.ChangeAmount : this.DisplayChangeAmount(this.localCurrency.Id, _paymentState.ChangeAmount),
          CashChangeFC: _paymentState.Currency !== this.localCurrency.Id ? _paymentState.ChangeAmount : this.DisplayChangeAmount(notLocalCurrency.Id, _paymentState.ChangeAmount),
          Title: 'Pago proveedor',
          Accion: 'creado',
          TypeReport: 'OutgoingPayment'
        } as ISuccessSalesInfo;

      return this.OpenDialogSuccessSales(infoOutgoingPayment);
      }),
      switchMap(res => {
        this.overlayService.OnGet();
        return forkJoin({
          Currencies: this.currenciesService.Get(false),
          Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
          Settings: this.settingService.Get<ISettings[]>(),
          Terminals: this.terminalUsersService.GetTerminals<ITerminal[]>(),
          UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OVPM'),
          ExchangeRate: this.exchangeRateService.Get<IExchangeRate>()
        })}),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.currencies = callback.Currencies.Data;
        this.permissions = callback.Permissions.Data;
        this.settings = callback.Settings.Data;
        this.terminals = callback.Terminals.Data;
        this.udfsDevelopment = callback.UdfsDevelopment.Data;
        this.currentSession.Rate = callback.ExchangeRate.Data.Rate;
        this.DefaultBusinessPartner = null;

        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
        this.SetInitialData();
        this.ResetDocument();
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error creando el pago proveedor',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        }).subscribe(
          () => {
            this.OpenPaymentModal();
          }
        );
      }
    });
  }

  private ResetDocument(): void {
    try {
      this.paymentHolder = {} as IPaymentHolder;
      this.documents = [];
      this.InflateTable();
      this.InitForm();
      this.uniqueId = this.commonService.GenerateDocumentUniqueID();
      this.total = 0;
      this.totalFC = 0;
      this.udfsValue = [];
      this.CleanFields();
    } catch (Exception) {
      CLPrint(Exception, CL_DISPLAY.ERROR);
    }
  }

  private CleanFields(): void {
    if (this.isVisible) {
      this.linkerService.Publish({
        Target: this.UdfsId,
        Data: '',
        CallBack: CL_CHANNEL.RESET
      });
    }
  }

  private DisplayChangeAmount(_currency: string, _amount: number): number {

    if (this.localCurrency.Id === _currency) {
      return +((_amount * this.currentSession.Rate).toFixed(this.DecimalTotalDocument));
    }

    return +((_amount / this.currentSession.Rate).toFixed(this.DecimalTotalDocument));
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

  /**
   * Method that is executed when selecting payment on account
   * @constructor
   */
  public SelectAccountPayment(): void {
    if (this.documentForm.controls['IsPayAccount'].value) {
      this.documentForm.controls['Amount'].enable();
    } else {
      this.documentForm.controls['Amount'].setValue(0);
      this.documentForm.controls['Amount'].disable();
    }
    this.total = 0;
    this.totalFC = 0;
    this.documents = [];
    this.InflateTable();
  }

  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs.length > 0;
  }

  public OnClickUdfEvent = (_event: ICLEvent): void => {
    this.udfsValue = JSON.parse(_event.Data) as IUdfContext[];
    this.SaveChanges();
  }

  public GetConfiguredUdfs(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: this.UdfsId
    });
  }

  private SetUdfsDevelopment(): void {
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);
  }

  private SetInitialData(): void {

    //#region Permission
    this.editableFieldConf =
      {
        Permissions: this.permissions ?? [],
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(p => p.Name === _columnPerm.Name),
        Columns: this.editableField
      };

    this.docTbMapDisplayColumnsArgs.editableFieldConf = this.editableFieldConf;

    this.docTbMappedColumns = MapDisplayColumns(this.docTbMapDisplayColumnsArgs);
    //#endregion

    //#region DECIMALES
    if (this.settings) {
      let companyDecimal: IDecimalSetting[] = JSON.parse((this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '[]'));
      if (companyDecimal && companyDecimal.length > 0) {
        let decimalCompany = companyDecimal.find(x => x.CompanyId === this.selectedCompany?.Id) as IDecimalSetting;
        if (decimalCompany) {
          this.DecimalTotalDocument = decimalCompany.TotalDocument;
          this.TO_FIXED_TOTALDOCUMENT = `1.${this.DecimalTotalDocument}-${this.DecimalTotalDocument}`;
        }

      }
    }
    //#endregion

    //#region CONFIG DE PINPAD
    if (this.settings.some((element) => element.Code == SettingCode.Payment)) {
      let paymentSettings = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '') as IPaymentSetting[];
      if (paymentSettings && paymentSettings.length > 0) {
        let dataPayment = paymentSettings.find(x => x.CompanyId === this.selectedCompany?.Id) as IPaymentSetting;
        if (dataPayment) {
          this.paymentConfiguration = dataPayment;
        }
      }
    }
    //#endregion
  }

  public ChangeBusinessPartner(): void {
    this.documents = [];
    this.total = 0;
    this.totalFC = 0;
    this.InflateTable();
  }

  public SetTotalPayAccount(): void {
    let currency: string = this.documentForm.controls['DocCurrency'].value;
    this.total = 0;
    this.totalFC = 0;

    if (!currency || currency === '##') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Seleccione moneda`
      });
      this.documentForm.controls['Amount'].setValue(0);
      return;
    }

    let amount = +(this.documentForm.controls['Amount'].value);

    this.total = currency === this.localCurrency.Id ? amount : CLTofixed(this.DecimalTotalDocument, (amount * this.currentSession.Rate));
    this.totalFC = currency !== this.localCurrency.Id ? amount : CLTofixed(this.DecimalTotalDocument, (amount / this.currentSession.Rate));

  }
}
