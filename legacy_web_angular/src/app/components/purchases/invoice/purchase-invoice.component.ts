import {Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {IDocumentLine, IItemMasterData, ItemSearchScan} from "@app/interfaces/i-items";
import {IActionButton} from "@app/interfaces/i-action-button";
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
import {
  catchError, concatMap,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from "rxjs";
import {IAttachments2Line, IBusinessPartner} from "@app/interfaces/i-business-partner";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {IPriceList} from "@app/interfaces/i-price-list";
import {ITaxe} from "@app/interfaces/i-taxe";
import {
  IActionDocument,
  IPurchaseInvoice,
  ITypeDocE,
  IUniqueId,
  ULineMappedColumns
} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {
  DropdownElement,
  IEditableField,
  IEditableFieldConf,
  IInputColumn,
  IRowByEvent
} from "@clavisco/table/lib/table.space";
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {IPurchaseInvoiceComponentResolvedData} from "@app/interfaces/i-resolvers";
import {ActivatedRoute, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {
  IFieldsInvoiceSetting,
  IFieldsPurchaseInvoiceSetting,
  IPaymentSetting,
  IPrintFormatSetting,
  ISettings, IValidateAttachmentsSetting, IValidateAutomaticPrintingsSetting
} from "@app/interfaces/i-settings";
import {ICompany} from "@app/interfaces/i-company";
import {IDecimalSetting, IDefaultBusinessPartnerSetting} from "../../../interfaces/i-settings";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {
  ControllerName,
  CopyFrom,
  DocumentType,
  DocumentTypes,
  ItemSerialBatch,
  ItemsFilterType,
  PaymentInvoiceType,
  Payterm,
  PermissionEditDocumentsDates,
  PermissionValidateDraft,
  PermissionViewColumnsItemsPurchases,
  PreloadedDocumentActions,
  SettingCode,
  Titles,
  TypeInvoices
} from "@app/enums/enums";
import {ItemsService} from "@app/services/items.service";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {IUdf, IUdfContext, IUdfDevelopment, UdfSourceLine} from "@app/interfaces/i-udf";
import {IDocument, WithholdingTaxCode} from "@app/interfaces/i-sale-document";
import {PurchasesDocumentService} from "@app/services/purchases-document.service";
import {FeComponent} from "@Component/sales/document/fe/fe.component";
import {IFeData} from "@app/interfaces/i-padron";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {SuppliersService} from "@app/services/suppliers.service";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {
  AddDays, AddMonths,
  ActionDocument,
  CLTofixed,
  CurrentDate, FormatDate,
  GetIndexOnPagedTable,
  GetUdfsLines, MapAccountType,
  MappingDefaultValueUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines, SetDataUdfsLines,
  ValidateLines,
  ValidateUdfsLines, ZoneDate, SetUdfsLineValues
} from "@app/shared/common-functions";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {CommonService} from "@app/services/common.service";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {SalesPersonService} from "@app/services/sales-person.service";
import {PriceListService} from "@app/services/price-list.service";
import {PayTermsService} from "@app/services/pay-terms.service";
import {TaxesService} from "@app/services/taxes.service";
import {WarehousesService} from "@app/services/warehouses.service";
import {SettingsService} from "@app/services/settings.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {UdfsService} from "@app/services/udfs.service";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {CurrenciesService} from "@app/services/currencies.service";
import {IAccount, ICurrency, IPaymentHolder, IPaymentState, PaymentModalComponent} from "@clavisco/payment-modal";
import {IPaymentSetting as IPaymentModalSetting, ITransaction} from "@clavisco/payment-modal/lib/payment-modal.space";
import {AccountsService} from "@app/services/accounts.service";
import {PinPad} from "@clavisco/pinpad";
import ITerminal = PinPad.Interfaces.ITerminal;
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {IIncomingPayment, IPaymentCreditCards, IPaymentInvoices} from "@app/interfaces/i-incoming-payment";
import {IApInvoiceWithPayment, InvoiceWithPayment} from "@app/interfaces/invoice-with-payment";
import {ITransactions} from "@app/interfaces/i-pp-transactions";
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import ICLResponse = Structures.Interfaces.ICLResponse;
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {ReportsService} from "@app/services/reports.service";
import {PurchaseDownPaymentService} from "@app/services/purchase-down-payment.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {formatDate} from "@angular/common";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {AttachmentsService} from "@app/services/Attachments.service";
import {DraftService} from "@app/services/draft.service";
import { MasterDataService } from '@app/services/master-data.service';
import {IWithholdingTax, IWithholdingTaxSelected} from "@app/interfaces/i-withholding-tax";
import {
  ModalAppliedRetentionsComponent
} from "@Component/sales/document/modal-applied-retentions/modal-applied-retentions/modal-applied-retentions.component";
import {WithholdingTaxService} from "@app/services/withholding-tax.service";

@Component({
  selector: 'app-invoice',
  templateUrl: './purchase-invoice.component.html',
  styleUrls: ['./purchase-invoice.component.scss']
})
export class PurchaseInvoiceComponent implements OnInit, OnDestroy {

  /*Object*/
  currenCompany!: ICompany;
  userAssign!: IUserAssign;
  dropdownList!: DropdownList;
  feData!: IFeData;
  currentSession!: ICurrentSession;
  paymentDocument!: IDocument;
  companyReportValidateAutomaticPrinting!: IValidateAutomaticPrintingsSetting;

  DecimalUnitPrice = 0; // Decimal configurado para precio unitario
  DecimalTotalLine = 0; //Decimal configurado por compania para total de linea
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento
  currentUrl: string = '';
  documentData!: IDocument | null;
  controllerToSendRequest: string = '';
  typeDocument: string = '';
  currentReport!: keyof IPrintFormatSetting;
  paymentModalId: string = 'PaymentModalId';

  /*Formualrios*/
  documentForm!: FormGroup;
  DownPaymentPercentage: FormControl = new FormControl(100, [Validators.min(1), Validators.max(100)]);

  /*Listas*/
  uom: DropdownElement[] = [];
  currencies: ICurrencies[] = [];
  udfsLines: IUdfContext[] = [];
  actionButtons: IActionButton[] = [];
  settings: ISettings[] = [];
  lines: IDocumentLine[] = [];
  suppliers: IBusinessPartner[] = [];
  DefaultBusinessPartner!: IBusinessPartner;
  salesPerson: ISalesPerson[] = [];
  priceLists: IPriceList[] = [];
  taxes: ITaxe[] = [];
  typeDocE: ITypeDocE[] = [];
  permissions: IPermissionbyUser[] = [];
  payTerms: IPayTerms[] = [];
  items: ItemSearchTypeAhead[] = [];
  buttonsTable: ICLTableButton[] = [];
  companyDefaultBP: IDefaultBusinessPartnerSetting[] = [];
  warehouses: IWarehouse[] = [];
  companyPrintFormat: IPrintFormatSetting[] = [];
  companyValidateAutomaticPrinting: IValidateAutomaticPrintingsSetting[] = [];
  availableWithholdingTax: IWithholdingTax[] = [];
  withholdingTaxSelected: IWithholdingTaxSelected[] = [];

  /*UDFs*/
  udfs: IUdfContext[] = [];
  udfsLinesValue: UdfSourceLine[] = [];
  udfsDataHeader: IUdf[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  udfsPaymentValue: IUdf[] = [];
  udfsPaymentDevelopment: IUdfDevelopment[] = [];

  /*Tabla*/
  shouldPaginateRequest: boolean = false;
  disableDragAndDrop: boolean = false;
  dropdownDiffList: DropdownList = {};
  dropdownDiffBy = 'IdDiffBy';
  dropdownColumns: string[] = ['TaxCode', 'WarehouseCode', 'UoMEntry'];
  checkboxColumns: string[] = ['TaxOnly'];
  lineTableId: string = 'LINE-TABLE2';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  lineMappedColumns: MappedColumns;
  editableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'ItemDescription',
      Permission: {Name: 'Purchases_Documents_EditDescriptionItemLine'}
    },
    {
      ColumnName: 'UnitPrice',
      Permission: {Name: 'Purchases_Documents_EditItemPrice'}
    },
    {
      ColumnName: 'DiscountPercent',
      Permission: {Name: 'Purchases_Documents_EditItemDiscount'}
    },
    {
      ColumnName: 'CostingCode',
      Permission: {Name: 'Purchases_Documents_EditLineCostingCode'}
    },
    {
      ColumnName: 'TaxCode',
      Permission: {Name: 'Purchases_Documents_EditItemTax'}
    },
    {
      ColumnName: 'WarehouseCode',
      Permission: {Name: 'Purchases_Documents_EditItemWarehouse'}
    },
    {
      ColumnName: 'UoMEntry',
      Permission: {Name: 'Purchases_Documents_EditLineUoM'}
    },
    {
      ColumnName: 'TaxOnly',
      Permission: {Name: 'Purchases_Documents_BillDiscountedProducts'}
    }
  ];
  editableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  InputColumns: IInputColumn[] = [
    {ColumnName: 'UnitPrice', FieldType: 'number'},
    {ColumnName: 'Quantity', FieldType: 'number'},
    {ColumnName: 'DiscountPercent', FieldType: 'number'},
    {ColumnName: 'CostingCode', FieldType: 'text'},
    {ColumnName: 'ItemDescription', FieldType: 'text'},
  ];

  headerTableColumns: { [key: string]: string } = {
    Id: '#',
    ItemCode: 'Código',
    ItemDescription: 'Descripción',
    CostingCode: 'C.Costo',
    UnitPrice: 'Precio',
    Quantity: 'Cantidad',
    DiscountPercent: 'Descuento',
    TaxOnly: 'Bonificado',
    VATLiable: 'Sujeto a impuestos',
    TaxCode: 'Impuesto',
    WarehouseCode: 'Almacén',
    UoMEntry: 'U.Medida',
    Total: 'Total'
  };
  //mapped Table
  lineMappedDisplayColumns: ULineMappedColumns<IDocumentLine, IPermissionbyUser> = {
    dataSource: [] as IDocumentLine[],
    inputColumns: this.InputColumns,
    editableFieldConf: this.editableFieldConf,
    renameColumns: this.headerTableColumns,
    iconColumns: undefined,
    markAsCheckedValidation: undefined,
    stickyColumns: [
      {Name: "Total", FixOn: 'right'},
      {Name: 'Options', FixOn: 'right'}
    ],
    ignoreColumns: ['InventoryItem', 'PurchaseItem', 'SalesItem', 'ItemName', 'OnHand', 'UnitPriceFC',
      'IsCommited', 'OnOrder', 'WhsCode', 'ItemClass', 'ForeignName', 'Frozen', 'Series', 'U_IVA',
      'BarCode', 'ItemBarCodeCollection', 'ItemPrices', 'TaxRate', 'Rate', 'TotalFC',
      'LineNum', 'BaseLine', 'BaseEntry', 'BaseType', 'UnitPriceCOL', 'TotalCOL', 'LastPurchasePrice', 'UoMMasterData',
      'ManBtchNum', 'ManSerNum', 'DocumentLinesBinAllocations', 'SysNumber', 'SerialNumbers', 'DistNumber', 'BinCode', 'BatchNumbers',
      'TotalDescFC', 'TotalDescCOL', 'TotalImpFC', 'TotalImpCOL', 'UnitPriceDOL',
      'TreeType', 'BillOfMaterial', 'ManBinLocation', 'RowColor', 'FatherCode', 'LineStatus', 'Currency', 'RowMessage', 'LockedUnitPrice',
      'IdDiffBy', 'LinesCurrenciesList', 'CurrNotDefined', 'IdCurrency']
  }

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };


  /*Observables*/
  subscriptions$: Subscription;
  changeWarehouse$ = new Subject<string>();

  /*VARIABLES*/
  uniqueId!: string;
  total: number = 0;
  totalFC: number = 0;
  discount: number = 0;
  discountFC: number = 0;
  tax: number = 0;
  taxFC: number = 0;
  totalWithoutTax = 0;
  totalWithoutTaxFC: number = 0;
  TotalDiscountDownPayment: number = 0;
  TotalDiscountDownPaymentFC: number = 0;
  index: number = 0;
  totalRetention: number = 0;
  totalRetentionFC: number = 0;

  isCashCustomer = false;
  currency: string = '';
  TO_FIXED_TOTALDOCUMENT: string = '1.0-0';

  docNum: number = 0;
  docEntry: number = 0;
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = '';
  isVisible: boolean = true;
  canChangeDocDate: boolean = true;
  canChangeDocDueDate: boolean = true;
  canChangeTaxDate: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";
  isFirstBusinessPartnerSelection: boolean = false;
  hasCompanyAutomaticPrinting: boolean = false;
  retentionProcessEnabled: boolean = false;

  isPermissionChangeDowntPercentage = false;
  canChangePriceList: boolean = true;
  localCurrency!: ICurrencies;
  paymentHolder!: IPaymentHolder;
  User!: string;
  Terminals: ITerminal[] = [];
  PaymentConfiguration!: IPaymentSetting;
  currentTitle: string = '';
  displayTypeInvoice = false;
  //#region component search
  searchModalId = "searchModalId";
  searchItemModalId = "searchItemModalId";
  //#endregion
  preloadedDocActionType: PreloadedDocumentActions | undefined;
  actionDocumentFrom!: IActionDocument | null;

  documentAttachment: IDocumentAttachment = {
    AbsoluteEntry: 0,
    Attachments2_Lines: []
  } as IDocumentAttachment;
  attachmentFiles: File[] = [];
  attachmentTableId: string = "PurchaseDocumentAttachmentTableId";
  attachmentLineMappedColumns!: MappedColumns;
  attachmentLineMappedColumnsArgs = {
    dataSource: [],
    renameColumns: {
      Id: '#',
      FileName: 'Nombre archivo',
      AttachmentDate: 'Fecha del anexo',
      FreeText: 'Texto libre'
    },
    stickyColumns: [
      {Name: 'Options', FixOn: 'right'}
    ],
    inputColumns: [{ColumnName: 'FreeText', FieldType: 'text'}],
    ignoreColumns: ['AbsoluteEntry', 'FileExtension', 'Override', 'SourcePath', 'LineNum']
  };
  attachmentTableButtons: ICLTableButton[] = [
    {
      Title: `Eliminar`,
      Action: Structures.Enums.CL_ACTIONS.DELETE,
      Icon: `delete`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Descargar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `download`,
      Color: `primary`,
      Data: ''
    }
  ];
  isDrafts: boolean = false;
  preloadedDocFromType: String | undefined;
  requestingItem: boolean = false;
  private onScanCode$ = new Subject<string>();
  scannedCode: string = '';

  ValidateAttachmentsTables?: IValidateAttachmentsSetting=undefined;
  IsVisibleAttachTable:boolean=false;
  IsPartialPay:FormControl = new FormControl(false);
  canChangePartialPrice: boolean = true;

  /**
   * Contains object for print report setting
   */
  reportConfigured!:  IPrintFormatSetting;

  /**
   * is variable to know if the user has permission to create a draft
   */
  canCreateDraft: boolean = true;
  constructor(
    private alertsService: AlertsService,
    private overlayService: OverlayService,
    private matDialog: MatDialog,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private itemService: ItemsService,
    private purchaseDocService: PurchasesDocumentService,
    private suppliersService: SuppliersService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private commonService: CommonService,
    private salesMenService: SalesPersonService,
    private priceListService: PriceListService,
    private payTermsService: PayTermsService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private salesDocumentService: SalesDocumentService,
    private exchangeRateService: ExchangeRateService,
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
    private udfsService: UdfsService,
    private currenciesService: CurrenciesService,
    private modalService: ModalService,
    private router: Router,
    private accountsService: AccountsService,
    private terminalUsersService: TerminalUsersService,
    private printerWorkerService: PrinterWorkerService,
    private reportsService : ReportsService,
    private purchaseDownPaymentService: PurchaseDownPaymentService,
    private attachmentService: AttachmentsService,
    private draftService:DraftService,
    private masterDataService: MasterDataService,
    private withholdingTaxService: WithholdingTaxService,
  ) {
    this.subscriptions$ = new Subscription();
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
    this.IsPartialPay.valueChanges.subscribe(value => {
      if(value==false){
        this.documentForm.controls['PartialAmount'].setValue(0);
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.docEntry && this.docEntry > 0) {
         location.reload()
        this.router.navigate(['purchases', 'invoice']);
      }
    });
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.subscriptions$.unsubscribe();
  }

  /**
   * Method is executed after Angular initializes the component's views.
   */
  ngAfterViewInit(): void {
    if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
      this.SetUDFsValues();
    }
  }

  private OnLoad(): void {

    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;
    this.currenCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany) as ICompany;
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.InitForm();
    this.SelectPayTerms();
    this.ChangeWarehouse();
    this.RefreshRate();
    this.ReadQueryParameters();
    this.DefineDocument();
    this.HandleResolvedData();
    this.ValidatePermissionToEditDate();
    this.ValidatePermissionToAvailableDraft();
    this.ConfigSelectInRows();
    this.RegisterPaymentModalEvents();
    this.ListenScan();
    this.ValidateColumnsItems();
    this.ValidateAttachTable();
    this.ValidateListNum();


    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalItemRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);

    this.buttonsTable = [
      {
        Title: `Eliminar`,
        Action: Structures.Enums.CL_ACTIONS.DELETE,
        Icon: `delete`,
        Color: `primary`
      }
    ];

    this.subscriptions$.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
    this.subscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );


  }

  private DeleteRow(_item: IDocumentLine): void {
    if (this.lines && this.lines.length > 0) {
      this.lines.splice(_item.Id - 1, 1);
      this.uom = this.uom.filter(x => x.by !== _item.IdDiffBy);

      // Update the drop-down list by filtering only on those UDF fields, the values associated with the deleted item
      Object.keys(this.dropdownDiffList)?.filter(key => key.includes('U_'))?.forEach((key) => {
        this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== _item.IdDiffBy);
      });
      this.InflateTableLines();
      this.GetTotals();
    }

  }

  /**
   * Calculates and returns the total retention amount for an invoice.
   * @returns The total retention amount.
   */
  public DisplayRetention(): number {
    if (this.localCurrency?.Id === this.currency) {
      return this.totalRetention;
    } else {
      return this.totalRetentionFC;
    }
  };

  /**
   * Method to show total
   * @constructor
   */
  public DisplayDownPayments(): number {
    if (this.localCurrency?.Id === this.currency) {
      return this.TotalDiscountDownPayment;
    } else {
      return this.TotalDiscountDownPaymentFC;
    }
  }

  public DisplayTotal(_option: number): number {
    if (_option === 1) {
      if (this.localCurrency?.Id === this.currency) {
        return this.totalFC;
      } else {
        return this.total;
      }
    } else {
      if (this.localCurrency?.Id === this.currency) {
        return this.total;
      } else {
        return this.totalFC;
      }
    }

  }

  public DisplaySubtotal(): number {
    if (this.localCurrency?.Id === this.currency) {
      return this.totalWithoutTax;
    } else {
      return this.totalWithoutTaxFC;
    }
  }

  public DisplayDiscount(): number {
    if (this.localCurrency?.Id === this.currency) {
      return this.discount;
    } else {
      return this.discountFC;
    }
  }

  public DisplayTaxes(): number {
    if (this.localCurrency?.Id === this.currency) {
      return this.tax;
    } else {
      return this.taxFC;
    }
  }

  /**
   * Method to update a table record
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumn = (_event: ICLEvent): void => {

    try {

      let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IDocumentLine>;

      if (+(ALL_RECORDS.Row.Quantity) <= 0 || +(ALL_RECORDS.Row.UnitPrice) < 0 || +(ALL_RECORDS.Row.DiscountPercent) < 0) {
        this.InflateTableLines();
        return;
      }

      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);


      switch (ALL_RECORDS.EventName) {
        case 'Dropdown':

          if (this.lines[INDEX].UoMEntry != ALL_RECORDS.Row.UoMEntry) {

            let uom = ALL_RECORDS.Row.UoMMasterData.find(x => x.UoMEntry === ALL_RECORDS.Row.UoMEntry);

            if (uom) {
              ALL_RECORDS.Row.UnitPriceFC = uom.UnitPriceFC;
              ALL_RECORDS.Row.UnitPriceCOL = uom.UnitPrice;
              ALL_RECORDS.Row.UnitPrice = this.localCurrency.Id === this.currency ? uom.UnitPrice : uom.UnitPriceFC;
            }
          }

          let taxSelected = this.taxes.find(x => x.TaxCode === ALL_RECORDS.Row.TaxCode);
          if(this.lines[INDEX].VATLiable=='NO'){
            ALL_RECORDS.Row.TaxRate=0;
          }
          else if(taxSelected) {
            ALL_RECORDS.Row.TaxRate = taxSelected?.TaxRate || 0;
          }

          break;
        case 'InputField':

          if (ALL_RECORDS.Row.DiscountPercent > this.userAssign.Discount) {

            ALL_RECORDS.Row.DiscountPercent = 0;
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El descuento no puede ser mayor a ${this.userAssign.Discount} que es lo permitido para este usuario.`
            });

          }
          break;
        case 'Dropped':
          this.InflateTableLines();
          return;
          break;
      }

      this.lines[INDEX] = ALL_RECORDS.Row;


      this.LineTotal(INDEX);
      this.InflateTableLines();
      this.GetTotals();
    } catch (error) {
    }
  }

  /**
   * Method to edit a table
   * @param _event - Event emitted in the table button when selecting a line
   * @constructor
   */
  private OnTableActionActivated = (_event: ICLEvent): void => {

    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as IDocumentLine;
      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.DELETE:
          this.DeleteRow(ACTION);
          break;
      }
    }
  }


  /**
   * The data resulting from the payment modal is obtained
   * @param _event
   * @constructor
   */
  HandlePaymentModalResult = (_event: ICLEvent): void => {
    let data = JSON.parse(_event.Data) as IPaymentHolder;
    let currency = this.documentForm.controls['DocCurrency'].value;

    if (data.Result) {
      // Esta asignacion no es requerida, pero puede ser necesaria si
      // debe recuperarse la modal despues de un error
      this.paymentHolder.PaymentState = data.PaymentState;
      this.CreateDocumentWithPayment(this.paymentDocument, data.PaymentState, currency, this.currentSession.Rate);
    } else {
      if (data.Message) this.modalService.NextError({subtitle: data.Message, disableClose: true});
      this.paymentHolder = {} as IPaymentHolder;
      this.paymentDocument = {} as IDocument;
    }
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SAVE':
        this.isDrafts=false;
        this.OnSubmit();
        break;
      case 'CLEAN':
        this.isDrafts=false;
        this.Clear();
        break;

      case 'ADDPRE':
        this.currentTitle = 'Preliminar';
        this.isDrafts=true;
        this.OnSubmit();
    }
  }

  /**
   * Method to load data
   * @private
   */
  private RefreshData(): void {
    this.overlayService.OnGet();
     forkJoin({
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode,ItemsFilterType.PrchseItem),
      SalesMan: this.salesMenService.Get<ISalesPerson[]>(),
      PayTemrs: this.payTermsService.Get<IPayTerms[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      TypeDocE: this.salesDocumentService.GetTypeDocE<ITypeDocE[]>('Invoices'),
      PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.PrchseItem),
      Taxes: this.taxesService.Get<ITaxe[]>(),
      Warehouses: this.warehouseService.Get<IWarehouse[]>(),
      Terminals: this.terminalUsersService.GetTerminals<ITerminal[]>(),
      UdfsLine: this.udfsService.Get<IUdfContext[]>(this.typeDocument, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(this.typeDocument)
        .pipe(catchError(res => of(null))),
      Currencies: this.currenciesService.Get(false),
       UdfsPaymentDevelopment: this.udfsService.GetUdfsDevelopment(DocumentType.OutgoingPayment)
         .pipe(catchError(res => of(null))),
    }).pipe(
       switchMap(res => {
         this.taxes = res.Taxes.Data;
         this.salesPerson = res.SalesMan.Data;
         this.priceLists = res.PriceList.Data ?? [];
         this.payTerms = res.PayTemrs.Data;
         this.permissions = res.Permissions.Data;
         this.typeDocE = res.TypeDocE.Data;
         this.items = res.Items.Data;
         this.settings = res.Settings.Data;
         this.warehouses = res.Warehouses.Data;
         this.udfsLines = res.UdfsLine?.Data ?? [];
         this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
         this.currencies = res.Currencies.Data;
         this.currentSession.Rate = res.ExchangeRate.Data.Rate;
         this.Terminals = res.Terminals.Data;
         this.udfsPaymentDevelopment = res.UdfsPaymentDevelopment?.Data ?? [];

         //Business partner default
         if(this.userAssign?.BuyerCode) {
           return this.suppliersService.Get<IBusinessPartner>(this.userAssign?.BuyerCode);
         }
         else if (res.Settings.Data && res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
           let companyDefaultBusinessPartner = JSON.parse(res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

           if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

             let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.currenCompany.Id) as IDefaultBusinessPartnerSetting;

             if (dataCompany) {
               return this.suppliersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerSupplier);
             }
           }
         }
         return of(null);
       }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (res => {
        if (res && res.Data) {
          this.DefaultBusinessPartner = res.Data;
        }
        this.ResetDocument();
        this.SetInitialData();
        this.DefineDocument();


        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });

  }
  private Clear(): void {

    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: (res => {
        this.RefreshData();
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });

  }

  private ConfigDropdownDiffListTable(_item: IDocumentLine): void {

    if (_item.UoMMasterData && _item.UoMMasterData.length > 0) {
      let uom: DropdownElement[] = [];

      _item.UoMMasterData.forEach(x => {
          let value = {
            key: x.UoMEntry,
            value: x.UomName,
            by: _item.IdDiffBy
          }
          uom.push(value);
        }
      );
      this.uom.push(...uom);

      this.dropdownDiffList = {
        ... this.dropdownDiffList,
        UoMEntry: this.uom as DropdownElement[]
      };

    }
  }

  private ConfigSelectInRows(): void {
    let dropTax: DropdownElement[] = [];
    this.taxes.forEach(x => {
      let value = {
        key: x.TaxCode,
        value: x.TaxCode,
        by: ''
      }
      dropTax.push(value);
    });

    let dropWarehouse: DropdownElement[] = [];

    this.warehouses.forEach(x => {
      let value = {
        key: x.WhsCode,
        value: x.WhsName,
        by: ''
      }
      dropWarehouse.push(value);
    });

    this.dropdownList = {
      TaxCode: dropTax as DropdownElement[],
      WarehouseCode: dropWarehouse as DropdownElement[]
    };
  }

  /**
   * Initialize business partner form
   * @constructor
   * @private
   */
  private InitForm(): void {
    this.documentForm = this.fb.group({
      CardCode: ['', [Validators.required]],
      CardName: ['', [Validators.required]],
      PaymentGroupCode: ['', [Validators.required]],
      PriceList: ['', [Validators.required]],
      SalesPersonCode: ['', [Validators.required]],
      Quantity: [1, [Validators.required, Validators.min(1)]],
      TypeDocE: [''],
      DocDate: ['',[Validators.required]],
      DocDueDate: ['',[Validators.required]],
      TaxDate: ['',[Validators.required]],
      DocCurrency: ['', [Validators.required]],
      Comments: [''],
      PartialAmount: [0, [Validators.min(0)]],
    });

  }


  /**
   * Register event for payment modal
   * @constructor
   * @private
   */
  private  RegisterPaymentModalEvents(): void {
    Register<CL_CHANNEL>(this.paymentModalId, CL_CHANNEL.OUTPUT, this.HandlePaymentModalResult, this.callbacks)
  }



  /**
   *
   * @constructor
   * @private
   */
  private HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (res) => {
        const resolvedData = res['resolvedData'] as IPurchaseInvoiceComponentResolvedData;


        if (resolvedData) {
          this.taxes = resolvedData.Taxes;
          this.DefaultBusinessPartner = resolvedData.Supplier;
          this.salesPerson = resolvedData.SalesPersons;
          this.priceLists = resolvedData.PriceList ?? [];
          this.payTerms = resolvedData.PayTerms;
          this.permissions = resolvedData.Permissions;
          this.typeDocE = resolvedData.TypeDocE;
          this.items = resolvedData.Items;
          this.settings = resolvedData.Settings;
          this.warehouses = resolvedData.Warehouse;
          this.udfsLines = resolvedData.UdfsLines;
          this.udfsDevelopment = resolvedData.UdfsDevelopment;
          this.udfsLinesValue = resolvedData.UdfsData || [];
          this.udfsDataHeader = resolvedData.UdfsDataHeader || [];
          this.documentData = resolvedData?.PreloadedDocument;
          this.ValidateAttachmentsTables = resolvedData?.ValidateAttachmentsTables??undefined;
          this.documentAttachment = {
            AbsoluteEntry: 0,
            Attachments2_Lines: (resolvedData.AttachmentLines ?? []).map((attL, index) => ({ ...attL, Id: index + 1 }))
          };
          this.currencies = resolvedData.Currencies;
          this.localCurrency = this.currencies.find(c => c.IsLocal)!;
          this.currentSession.Rate = resolvedData.ExchangeRate.Rate;
          this.Terminals = resolvedData.Terminals;
          this.udfsPaymentDevelopment = resolvedData.UdfsPaymentDevelopment;
          this.availableWithholdingTax = resolvedData?.WithholdingTax || [];

          this.SetInitialData();

          if(this.settings){
            let printFormatsSetting = this.settings.find((setting) => setting.Code == SettingCode.PrintFormat);
            let validateAutomaticPrintingSetting = this.settings.find((setting) => setting.Code == SettingCode.ValidateAutomaticPrinting);

            if(printFormatsSetting){
              this.companyPrintFormat = JSON.parse(printFormatsSetting.Json || '');
            }

            if(validateAutomaticPrintingSetting){
              this.companyValidateAutomaticPrinting = JSON.parse(validateAutomaticPrintingSetting.Json || '');
            }

            if(this.companyPrintFormat && this.companyPrintFormat.length){
              let dataCompany = this.companyPrintFormat.find(x => x.CompanyId === this.currenCompany?.Id) as IPrintFormatSetting;

              if(dataCompany){
                this.reportConfigured = dataCompany
              }
            }

            if(this.companyValidateAutomaticPrinting && this.companyValidateAutomaticPrinting.length){
              let dataCompany = this.companyValidateAutomaticPrinting.find(x => x.CompanyId === this.currenCompany?.Id) as IValidateAutomaticPrintingsSetting;

              if(dataCompany){
                this.companyReportValidateAutomaticPrinting = dataCompany;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Validates if the current user has permissions to edit the document date
   * @constructor
   * @private
   */
  private ValidatePermissionToEditDate(): void {

    switch (this.currentUrl) {

      case 'invoice':
        this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsInvoiceChangeDocDate);
        this.canChangeDocDueDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsInvoiceChangeDocDueDate);
        this.canChangeTaxDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsInvoiceChangeTaxDate);

        if (!this.canChangeDocDate) {
          this.documentForm.controls['DocDate'].disable();
        }
        if (!this.canChangeDocDueDate) {
          this.documentForm.controls['DocDueDate'].disable();
        }
        if (!this.canChangeTaxDate) {
          this.documentForm.controls['TaxDate'].disable();
        }

        break;
      case 'down-payments':
        this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsDownPaymentsChangeDocDate);
        this.canChangeDocDueDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsDownPaymentsChangeDocDueDate);
        this.canChangeTaxDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsDownPaymentsChangeTaxDate);

        if (!this.canChangeDocDate) {
          this.documentForm.controls['DocDate'].disable();
        }
        if (!this.canChangeDocDueDate) {
          this.documentForm.controls['DocDueDate'].disable();
        }
        if (!this.canChangeTaxDate) {
          this.documentForm.controls['TaxDate'].disable();
        }

        break;

    }



  }


  /**
   * Set business partner to form
   */
  private LoadDataBp(_businessPartner: IBusinessPartner): void {
    if (_businessPartner) {
      let priceList = this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.ListNum;

      this.isCashCustomer = _businessPartner.CashCustomer;
      this.documentForm.patchValue({
        CardCode: _businessPartner.CardCode,
        CardName: _businessPartner.CardName,
        PaymentGroupCode: this.payTerms.find(x => x.GroupNum === _businessPartner.PayTermsGrpCode)?.GroupNum,
        SalesPersonCode: +this.userAssign?.SlpCode,
        PriceList: priceList ? priceList : this.priceLists[0]?.ListNum,
        DocCurrency:  priceList ? this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.PrimCurr : this.priceLists.find(x => x.ListNum === this.priceLists[0]?.ListNum)?.PrimCurr
      });
      this.currency = this.documentForm.controls['DocCurrency'].value;
      this.retentionProcessEnabled && this.GetWithholdingTaxByBP(_businessPartner.CardCode);
    }
  }

  /**
   * Method to define type document
   * @constructor
   * @private
   */
  private DefineDocument(): void {
    const tree: string = this.sharedService.GetCurrentRouteSegment();
    const urlSegment = tree.split('/');
    this.currentUrl = urlSegment[urlSegment.length - 1];

    switch (this.currentUrl) {

      case 'invoice':

        this.controllerToSendRequest = ControllerName.purchaseInvoice;
        this.typeDocument = DocumentType.PurchaseInvoice;
        this.currentTitle = Titles.ApFactura;
        this.currentReport = 'APInvoice';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;

        break;
      case 'down-payments':

        this.controllerToSendRequest = ControllerName.APDownPayments;
        this.typeDocument = DocumentType.APDownPayments;
        this.currentTitle = Titles.ApDownPayment;
        this.currentReport = 'ApDownPayment';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;

        break;

    }
  }

  /**
   * Method to identifier docuement to create
   * @constructor
   */
  public ReadQueryParameters(): void {

    let params = this.activatedRoute.snapshot.queryParams;

    if (params['Action']) {
      this.preloadedDocActionType = params['Action'] as PreloadedDocumentActions;
    }
    if (params['Action'] && params['From'] ) {
      this.preloadedDocFromType = params['From'];
    }
    this.DefineActionButtonByPreloadedDocAction();

    if (params['From']) {
      this.actionDocumentFrom = ActionDocument(params['From'], true);
      this.DBODataEndPoint = this.actionDocumentFrom.typeDocument;
    }


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
        next: (value) => {
          if(value){
            this.DefaultBusinessPartner = value;
            this.LoadDataBp(value);
          }
        }
      });
  }

  /**
   * Displays a modal containing the retentions applied to the current invoice.
   */
  ShowInformationModalForCurrentRetentions(): void {
    this.matDialog.open(ModalAppliedRetentionsComponent, {
      width: '100%',
      maxWidth: '80%',
      height: '100%',
      maxHeight: '80%',
      disableClose: true,
      data: {
        availableWithholdingTax: this.availableWithholdingTax,
        selectedWithholdingTax: this.withholdingTaxSelected
      }
    }).afterClosed()
      .subscribe({
        next: (result: IWithholdingTaxSelected[]) => {
          if(result){
            this.withholdingTaxSelected = result;
            this.GetTotals();
          }
        },
        error: (err) => this.alertsService.ShowAlert({ HttpErrorResponse: err })
      });
  };

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
        this.suppliers = callback.Data;

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
  OnModalItemRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    const currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.itemService.GetAllPagination<ItemSearchTypeAhead[]>(VALUE?.SearchValue, currentSession.WhsCode, ItemsFilterType.PrchseItem)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.items = callback.Data;
        this.InflateTableItems();

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
      Records: this.suppliers,
      RecordsCount: this.suppliers.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  private InflateTableItems(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.items,
      RecordsCount: this.items.length,
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchItemModalId
    });
  }



  public OnSelectItem(_item: ItemSearchTypeAhead | string): void {
    try {
      if (typeof _item === 'string') return;
      let typeSerial: number = ItemSerialBatch.NA;

      if (_item.ManSerNum === 'Y') {
        typeSerial = ItemSerialBatch.Serie
      }
      if (_item.ManBtchNum === 'Y') {
        typeSerial = ItemSerialBatch.Lote
      }
      let cant = +this.documentForm.controls['Quantity'].value;

      if (cant <= 0) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Cantidad permitida mayor a 0`
        });
        this.sharedService.EmitEnableItem();
        return;
      }


      this.overlayService.OnGet();
      this.itemService.Get<IDocumentLine>(
        _item.ItemCode,
        this.currentSession?.WhsCode || this.userAssign?.WhsCode,
        this.documentForm.controls['PriceList'].value,
        this.documentForm.controls['CardCode'].value,
        typeSerial,
        _item.SysNumber,
        'Y',
        ItemsFilterType.PrchseItem
      )
        .pipe(
          finalize(() => {
            this.sharedService.EmitEnableItem();
            this.overlayService.Drop();
          }))
        .subscribe({
          next: (callback => {
            if (callback.Data) {

              let totalLine = 0;
              let totalLineFC = 0;
              let unitPrice = 0;
              let unitPriceFC = 0;

              totalLine = +((callback.Data.UoMMasterData[0].UnitPrice * cant).toFixed(this.DecimalTotalLine));
              totalLineFC = +((callback.Data.UoMMasterData[0].UnitPriceFC * cant).toFixed(this.DecimalTotalLine));
              unitPrice = callback.Data.UoMMasterData[0].UnitPrice;
              unitPriceFC = callback.Data.UoMMasterData[0].UnitPriceFC;

              let maxIdUomEntry = this.lines && this.lines.length > 0 ? Math.max(...this.lines.map(x => (x.IdDiffBy || 0))) + 1 : 1;

              let item = {
                ItemCode: callback.Data.ItemCode,
                InventoryItem: callback.Data.InventoryItem,
                PurchaseItem: callback.Data.PurchaseItem,
                SalesItem: callback.Data.SalesItem,
                DocEntry: callback.Data.DocEntry,
                WarehouseCode: this.userAssign?.WhsCode,
                Quantity: cant,
                TaxCode: callback.Data.TaxCode,
                TaxRate: callback.Data.TaxRate,
                UnitPriceFC: unitPriceFC,
                UnitPriceCOL: unitPrice,
                UnitPrice: this.localCurrency.Id === this.currency ? unitPrice : unitPriceFC,
                UnitPriceDOL: this.localCurrency.Id === this.currency ? unitPriceFC : unitPrice,
                DiscountPercent: callback.Data.DiscountPercent ? callback.Data.DiscountPercent : 0,
                CostingCode: this.userAssign?.CenterCost,
                TotalFC: totalLineFC,
                TotalCOL: totalLine,
                Total: this.localCurrency.Id === this.currency ? totalLine : totalLineFC,
                ItemDescription: callback.Data.ItemName,
                OnHand: callback.Data.OnHand,
                UoMEntry: callback.Data.UoMMasterData[0].UoMEntry,
                UoMMasterData: callback.Data.UoMMasterData,
                SerialNumbers: _item.ManSerNum === 'Y' ? this.LoadSerial(_item.SysNumber, _item.DistNumberSerie, cant) : [],
                ManBtchNum: _item.ManBtchNum,
                ManSerNum: _item.ManSerNum,
                BatchNumbers: callback.Data.BatchNumbers ? callback.Data.BatchNumbers : [],
                SysNumber: _item.SysNumber,
                DistNumber: _item.DistNumberSerie,
                IdDiffBy: maxIdUomEntry,
                VATLiable:callback.Data.VATLiable
              } as IDocumentLine;

              if (this.udfsLines && this.udfsLines.length > 0) {

                MappingDefaultValueUdfsLines(item, this.udfsLines);
              }
              this.lines.push(item);

              if (item.TaxCode === '') {
                this.alertsService.Toast({
                  type: CLToastType.ERROR,
                  message: `Ítem ${item.ItemDescription} no cuenta con el código del impuesto`
                });
              }

              let quantity = this.lines
                .filter(
                  (y) =>
                    y.ItemCode == item.ItemCode &&
                    y.WarehouseCode == item.WarehouseCode
                )
                .reduce((p, c) => {
                  return p + c.Quantity;
                }, 0);


              this.ConfigDropdownDiffListTable(item);
              this.InflateTableLines();
              this.GetTotals();

              if (this.udfsLines?.length) {
                SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList);
              }

            }
          }),
          error: (err) => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        });
    } catch (e) {
      this.sharedService.EmitEnableItem();
    }

  }


  public SetUDFsValues(): void {
    this.linkerService.Publish({
      Target: this.UdfsId,
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.udfsDataHeader)
    });
  }


  private LoadSerial(_sysNumber: number, _distNumber: string, _cant: number): ISerialNumbers[] {
    let SerialNumbers = null;
    SerialNumbers = [{
      SystemSerialNumber: _sysNumber,
      Quantity: _cant,
      DistNumber: _distNumber
    } as ISerialNumbers];

    return SerialNumbers;
  }


  /**
   * Inflates the table lines to display additional details or expand the content.
   * This method is used to expand the table lines and show more information or details.
   */
  private InflateTableLines(): void {
    this.lines = this.lines.map((x, index) => {
      return {
        ...x,
        Id: index + 1,
        VATLiable:x.VATLiable=='1' || x.VATLiable=='SI' ? 'SI':'NO'
      }
    });

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

  /**
   * Method to calculate totals document
   * @constructor
   */
  public GetTotals(): void {

    let isDownPayment = this.controllerToSendRequest === ControllerName.APDownPayments;

    if (isDownPayment && this.DownPaymentPercentage.value <= 0) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Porcentaje anticipo debe ser superior a 0'
      });
      this.DownPaymentPercentage.setValue(100);
      return;
    } else if (isDownPayment && this.DownPaymentPercentage.value > 100) {
      this.DownPaymentPercentage.setValue(100);
    }

    this.total = 0;
    this.totalFC = 0;
    this.discount = 0;
    this.discountFC = 0;
    this.tax = 0;
    this.taxFC = 0;
    this.totalWithoutTax = 0;
    this.totalWithoutTaxFC = 0
    this.totalRetention = 0;
    this.totalRetentionFC = 0;

    const DECS = (() => +`1${`0`.repeat(this.DecimalTotalDocument)}`)();

    // Recorre toda la lista de items agregados a facturar.
    this.lines.forEach(x => {

      const FIRST_SUBTOTAL = Math.round((x.Quantity * x.UnitPriceCOL) * DECS) / DECS;
      const FIRST_SUBTOTALFC = Math.round((x.Quantity * x.UnitPriceFC) * DECS) / DECS;

      const LINE_DISCOUNT = (Math.round(((Math.round(FIRST_SUBTOTAL * DECS) / DECS) * (x.DiscountPercent / 100)) * DECS) / DECS);
      const LINE_DISCOUNTFC = (Math.round(((Math.round(FIRST_SUBTOTALFC * DECS) / DECS) * (x.DiscountPercent / 100)) * DECS) / DECS);

      const SUBTOTAL_WITH_LINE_DISCOUNT = (Math.round(((FIRST_SUBTOTAL - LINE_DISCOUNT)) * DECS) / DECS);
      const SUBTOTAL_WITH_LINE_DISCOUNTFC = (Math.round(((FIRST_SUBTOTALFC - LINE_DISCOUNTFC)) * DECS) / DECS);

      const SUBTOTAL_WITH_HEADER_DISCOUNT = SUBTOTAL_WITH_LINE_DISCOUNT;
      const SUBTOTAL_WITH_HEADER_DISCOUNTFC = SUBTOTAL_WITH_LINE_DISCOUNTFC;

      const CURRENT_TAX_RATE = x.VATLiable=='NO'? 0 : x.TaxRate / 100;
      const CURRENT_TAX_RATEFC = x.VATLiable=='NO'? 0 : x.TaxRate / 100;

      const TOTAL_TAX = SUBTOTAL_WITH_HEADER_DISCOUNT * CURRENT_TAX_RATE;
      const TOTAL_TAXFC = SUBTOTAL_WITH_HEADER_DISCOUNTFC * CURRENT_TAX_RATEFC;

      this.totalWithoutTax += SUBTOTAL_WITH_HEADER_DISCOUNT * +!x.TaxOnly;
      this.totalWithoutTaxFC += SUBTOTAL_WITH_HEADER_DISCOUNTFC * +!x.TaxOnly;

      this.discount += LINE_DISCOUNT;
      this.discountFC += LINE_DISCOUNTFC;

      this.tax += TOTAL_TAX;
      this.taxFC += TOTAL_TAXFC;

      this.total = Math.round((Math.round(this.totalWithoutTax * DECS) / DECS + Math.round(this.tax * DECS) / DECS + Number.EPSILON) * DECS) / DECS;
      this.totalFC = Math.round((Math.round(this.totalWithoutTaxFC * DECS) / DECS + Math.round(this.taxFC * DECS) / DECS + Number.EPSILON) * DECS) / DECS;

    });

    if(this.retentionProcessEnabled && this.withholdingTaxSelected){
      this.withholdingTaxSelected.forEach(holdingTax => {
        this.totalRetention += (holdingTax.Rate/100) * ((holdingTax.BaseType == 'N') ? this.totalWithoutTax : this.tax) * (holdingTax.PrctBsAmnt/100);
        this.totalRetentionFC += (holdingTax.Rate/100) * ((holdingTax.BaseType == 'N') ? this.totalWithoutTaxFC : this.taxFC) * (holdingTax.PrctBsAmnt/100);
      });
    }

    if (isDownPayment) {
      this.tax = (Math.round(((Math.round(this.tax * DECS) / DECS) * (this.DownPaymentPercentage.value / 100)) * DECS) / DECS);
      this.taxFC = (Math.round(((Math.round(this.taxFC * DECS) / DECS) * (this.DownPaymentPercentage.value / 100)) * DECS) / DECS);


      this.TotalDiscountDownPayment = (Math.round(((Math.round(this.totalWithoutTax * DECS) / DECS) * (this.DownPaymentPercentage.value / 100)) * DECS) / DECS);
      this.TotalDiscountDownPaymentFC = (Math.round(((Math.round(this.totalWithoutTaxFC * DECS) / DECS) * (this.DownPaymentPercentage.value / 100)) * DECS) / DECS);

      this.total = this.TotalDiscountDownPayment + this.tax;
      this.totalFC = this.TotalDiscountDownPaymentFC + this.taxFC;

    }

  }

  public GetSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id === this.currency)?.Symbol || '';
    //return this.currencies.find(c => c.Id === this.currency)!.Symbol;
  }

  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else
      this.SaveChanges();
  }

  /**
   * Create purchase invoice
   * @constructor
   * @private
   */
  private SaveChanges(): void {
    if (!this.DocumentLinesValidations()) return;

    if (!this.ValidateUdfsLines()) return;

    this.SetUdfsDevelopment();

    let document: IDocument = this.documentForm.getRawValue();


    if (this.DefaultBusinessPartner.CardName !== this.documentForm.controls['CardName'].value) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No es permitido cambiar el nombre a proveedor'
      });

      return;
    }
    let actionMessage = this.preloadedDocActionType === PreloadedDocumentActions.EDIT  && this.preloadedDocFromType!='Draft' &&!this.isDrafts ? 'actualizada' : !this.isDrafts ? 'creada': this.isDrafts && this.preloadedDocFromType==='Draft'?'actualizado':'creado';
    let actionMessageError = this.preloadedDocActionType === PreloadedDocumentActions.EDIT  && this.preloadedDocFromType!='Draft' &&!this.isDrafts ? 'actualizando' : 'creando';
    document.DocDate = FormatDate(document.DocDate);
    document.DocDueDate = FormatDate(document.DocDueDate);
    document.TaxDate = FormatDate(document.TaxDate);
    document.DocEntry = this.docEntry;
    document.DocNum = this.docNum;
    document.DocCurrency = this.documentForm.controls['DocCurrency'].value;
    document.DocumentLines = this.lines;
    document.Udfs = this.udfsValue;
    document.DocumentLines = this.lines.map(x => {
      return {...x, Udfs: GetUdfsLines(x, this.udfsLines), TaxOnly: x.TaxOnly ? 'tYES' : 'tNO',   VATLiable:x.VATLiable=='1' || x.VATLiable=='SI' ? 1 : 0} as IDocumentLine
    });

    if(this.retentionProcessEnabled){
      document.WithholdingTaxDataCollection = this.withholdingTaxSelected.map((withholding: IWithholdingTaxSelected) => {
        return {
          WTCode: withholding?.WTCode
        } as WithholdingTaxCode;
      });
    }

    document.DownPaymentType = 'dptInvoice';
    document.DownPaymentPercentage = this.DownPaymentPercentage.value;

    let payTerm = this.payTerms.find(x => x.GroupNum === this.documentForm.controls['PaymentGroupCode'].value);

    if (payTerm && payTerm.Type === (Payterm.Counted) && !this.isDrafts) {
      this.OpenPaymentModal(document);
    } else {

      let invoice = {
        APInvoice: document
      } as IApInvoiceWithPayment;

      let CreateDocument$: Observable<Structures.Interfaces.ICLResponse<IApInvoiceWithPayment>> | null = null;

      if (this.controllerToSendRequest == ControllerName.purchaseInvoice)
      {
        if(this.isDrafts){
          if(this.preloadedDocFromType=='Draft'){
            CreateDocument$ = this.draftService.Patch<IApInvoiceWithPayment>(this.controllerToSendRequest, invoice, this.documentAttachment, this.attachmentFiles);
          }else{
            CreateDocument$ = this.draftService.Post<IApInvoiceWithPayment>(this.controllerToSendRequest, invoice, this.documentAttachment, this.attachmentFiles);
          }
        }else{
          CreateDocument$ = this.purchaseDocService.PostDocumentWithPayment(ControllerName.purchaseInvoice, invoice, this.documentAttachment, this.attachmentFiles);
        }
      }
      else
      {
        if(this.isDrafts){
          if(this.preloadedDocFromType=='Draft'){
            CreateDocument$ = this.draftService.Patch<IApInvoiceWithPayment>(this.controllerToSendRequest, invoice, this.documentAttachment, this.attachmentFiles);
          }else{
            CreateDocument$ = this.draftService.Post<IApInvoiceWithPayment>(this.controllerToSendRequest, invoice, this.documentAttachment, this.attachmentFiles);
          }
        }else{
          CreateDocument$ = this.purchaseDownPaymentService.Post(invoice, this.documentAttachment, this.attachmentFiles);
        }
      }

    this.overlayService.OnPost();
      CreateDocument$.pipe(
        switchMap(res => {
          if (res && res.Data) {
            this.currentReport = res.Data.APInvoice.ConfirmationEntry ? 'Preliminary': this.currentReport;
            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocument(res.Data.APInvoice.DocEntry).pipe(
                map(print => {
                  return { Data: res.Data, Print: print };
                }));
            } else {
              return of({ Data: res.Data, Print: null })
            }
          } else {
            return of(null);
          }
        }),
      map(res => {
        this.overlayService.Drop();
        return {
          DocEntry: res?.Data.APInvoice.DocEntry,
          DocNum: res?.Data.APInvoice.DocNum,
          NumFE: '',
          CashChange: 0,
          CashChangeFC: 0,
          Title: res?.Data.APInvoice.ConfirmationEntry ? Titles.Draft : this.currentTitle,
          Accion: actionMessage,
          TypeReport: this.currentReport
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res)),
      switchMap(calback => {
        this.overlayService.OnGet()
        return forkJoin({
          ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
          Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode,ItemsFilterType.PrchseItem),
          SalesMan: this.salesMenService.Get<ISalesPerson[]>(),
          PayTemrs: this.payTermsService.Get<IPayTerms[]>(),
          Settings: this.settingService.Get<ISettings[]>(),
          Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
          TypeDocE: this.salesDocumentService.GetTypeDocE<ITypeDocE[]>('Invoices'),
          PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.PrchseItem),
          Taxes: this.taxesService.Get<ITaxe[]>(),
          Warehouses: this.warehouseService.Get<IWarehouse[]>(),
          UdfsLine: this.udfsService.Get<IUdfContext[]>(this.typeDocument, true, true)
            .pipe(catchError(res => of(null))),
          UdfsDevelopment: this.udfsService.GetUdfsDevelopment(this.typeDocument)
            .pipe(catchError(res => of(null))),
          Currencies: this.currenciesService.Get(false)
        });

      }),
      switchMap(res =>{
        this.taxes = res.Taxes.Data;
        this.salesPerson = res.SalesMan.Data;
        this.priceLists = res.PriceList.Data ?? [];
        this.payTerms = res.PayTemrs.Data;
        this.permissions = res.Permissions.Data;
        this.typeDocE = res.TypeDocE.Data;
        this.items = res.Items.Data;
        this.settings = res.Settings.Data;
        this.warehouses = res.Warehouses.Data;
        this.udfsLines = res.UdfsLine?.Data ?? [];
        this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
        this.currencies = res.Currencies.Data;
        this.currentSession.Rate = res.ExchangeRate.Data.Rate;

        //Business partner default
        if(this.userAssign?.BuyerCode) {
          return this.suppliersService.Get<IBusinessPartner>(this.userAssign?.BuyerCode);
        }
        else if (res.Settings.Data && res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
          let companyDefaultBusinessPartner = JSON.parse(res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

            let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.currenCompany.Id) as IDefaultBusinessPartnerSetting;

            if (dataCompany) {
              return this.suppliersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerSupplier);
            }
          }
        }
        return of(null);
      }),
      finalize(() => {
        this.overlayService.Drop();
      })
    ).subscribe({
      next: (res) => {
        if (res && res.Data) {
          this.DefaultBusinessPartner = res.Data;
        }

        this.ResetDocument();
        this.SetInitialData();

      },
      error: (err) => {
        this.modalService.Continue({
          title: `Se produjo un error ${actionMessageError} la ${this.currentTitle}`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
    }
  }
  /**
   * Method load modal payment
   * @param _document - Document to create
   * @constructor
   * @private
   */
  public OpenPaymentModal(_document: IDocument): void {
    //Consulta las cuentas por el almacen seleccionado
    this.overlayService.OnGet()
    this.LoadAccounts()
      .pipe(finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback) => {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;

          //Se inicializa
          this.paymentHolder || (this.paymentHolder = {} as IPaymentHolder);

          this.paymentHolder.PaymentSettings || (this.paymentHolder.PaymentSettings = {} as IPaymentModalSetting);
          this.paymentHolder.PaymentState || (this.paymentHolder.PaymentState = {} as IPaymentState);

          this.paymentHolder.Id = this.paymentModalId;
          //Se setea
          this.paymentHolder.PaymentSettings.User = this.User;
          //CUENTAS
          this.paymentHolder.PaymentSettings.Accounts = callback

          let currency = this.documentForm.controls['DocCurrency'].value;

          //PINPAD
          this.paymentHolder.PaymentSettings.Terminals = this.Terminals;
          this.paymentHolder.PaymentSettings.EnablePinPad = this.PaymentConfiguration?.Pinpad;
          this.paymentHolder.PaymentSettings.DefaultCardNumber = this.PaymentConfiguration?.CardNumber;
          this.paymentHolder.PaymentSettings.CanEditCardNumber = this.permissions.some(x => x.Name === 'Purchases_Documents_EditPayCardNumber');
          this.paymentHolder.PaymentSettings.DefaultCardValid = new Date(this.PaymentConfiguration?.CardValid);
          this.paymentHolder.PaymentSettings.DocumentKey = this.uniqueId;
          //TOTALES Y MONEDA
          this.paymentHolder.PaymentSettings.CardRefundAmount = 0;
          this.paymentHolder.PaymentSettings.Rate = this.currentSession.Rate;
          this.paymentHolder.PaymentSettings.DocumentCurrency = currency;
          this.paymentHolder.PaymentSettings.PaymentCurrency = currency
          this.paymentHolder.PaymentSettings.DecimalRounding = this.DecimalTotalDocument;
          this.paymentHolder.PaymentSettings.InvertRateDirection = false;
          let totalPay = this.localCurrency.Id === currency ? this.total : this.totalFC;
          this.paymentHolder.PaymentSettings.CardRefundAmount = 0;
          if(this.IsPartialPay.value &&this.documentForm.get('PartialAmount')?.value > totalPay){
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El monto del pago parcial es superior al total, por favor verifique el monto parcial`
            });
            return;
          }

          if(this.IsPartialPay.value &&this.documentForm.get('PartialAmount')?.value <= 0 || this.IsPartialPay.value &&this.documentForm.get('PartialAmount')?.value ==null){
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El monto del pago parcial debe ser superior a 0, por favor verifique el monto parcial`
            });
            return;
          }

          this.paymentHolder.PaymentSettings.DocTotal =  this.IsPartialPay.value==false? totalPay : this.documentForm.get('PartialAmount')?.value;
          this.paymentHolder.PaymentSettings.Currencies = this.currencies.map(element => {
            return {
              Name: element.Id,
              Description: element.Name,
              Symbol: element?.Symbol,
              IsLocal: element.IsLocal
            } as ICurrency
          });

          dialogConfig.data = this.paymentHolder;
          this.paymentDocument = _document;

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
        }
      });
  }

  /**
   * Method to create whith payment
   * @param _document
   * @param _paymentState
   * @param _currency
   * @param _rate
   * @constructor
   */
  public CreateDocumentWithPayment(_document: IDocument, _paymentState: IPaymentState, _currency: string, _rate: number): void {

    let isPaymentPinpad = (_paymentState && _paymentState.Transactions && _paymentState.Transactions.find(x => x.PinPadTransaction)) || false;
    this.SetUdfsPaymentDevelopment(_paymentState);

    let paymentSum: number =
      _paymentState.Cash.Total +
      _paymentState.Transfers.Total +
      _paymentState.Transactions.reduce((sum, transaction) => sum + (transaction.CreditSum || 0), 0);

    let notLocalCurrency = this.currencies.filter(c => c.Id !== '##').find(c => !c.IsLocal)!;

    let isSameDocCurrency = _document.DocCurrency === _paymentState.Currency || _document.DocCurrency == notLocalCurrency.Id;

    let incomingPayment = {
      CardCode: _document.CardCode,
      CardName: _document.CardName,
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
      PPTransactions: _paymentState.Transactions && _paymentState.Transactions.find(x => x.PinPadTransaction) ? this.LoadPPTransaction(_paymentState.Transactions) : null,
      Remarks: this.documentForm.controls['Comments'].value,
      Udfs: this.udfsPaymentValue,
      PaymentInvoices: [
        {
          InvoiceType: this.controllerToSendRequest === ControllerName.purchaseInvoice ? PaymentInvoiceType.it_PurchaseInvoice : PaymentInvoiceType.it_PurchaseDownPayment,
          DocEntry: 0,
          SumApplied: this.localCurrency.Id === _paymentState.Currency ? paymentSum : CLTofixed(this.DecimalTotalDocument, (paymentSum * _rate)),
          AppliedFC: _paymentState.Currency !== this.localCurrency.Id ? paymentSum : CLTofixed(this.DecimalTotalDocument, (paymentSum / _rate))
        } as IPaymentInvoices
      ],
    } as IIncomingPayment;


    let invoiceWithPayment = {
      APInvoice: _document,
      OutgoingPayment: incomingPayment
    } as IApInvoiceWithPayment;


    if (isPaymentPinpad) {

      if (this.controllerToSendRequest === ControllerName.purchaseInvoice) {
        this.currentReport = 'PinpadAPInvoice';
      }else{
        this.currentReport = 'PinpadApDownPayment';
      }

    }

    this.overlayService.OnPost();

    let CreateDocument$: Observable<Structures.Interfaces.ICLResponse<IApInvoiceWithPayment>> | null = null;

    if (this.controllerToSendRequest == ControllerName.purchaseInvoice)
    {
      CreateDocument$ = this.purchaseDocService.PostDocumentWithPayment(ControllerName.purchaseInvoice, invoiceWithPayment, this.documentAttachment, this.attachmentFiles);
    }
    else
    {
      CreateDocument$ = this.purchaseDownPaymentService.Post(invoiceWithPayment, this.documentAttachment, this.attachmentFiles);
    }
    let isADraftDocument = false;

    CreateDocument$.pipe(
      concatMap(res => {
        isADraftDocument = !!res.Data.APInvoice.ConfirmationEntry;

        if (isADraftDocument) {
          return this.modalService.Continue({
            type: CLModalType.INFO,
            subtitle: 'No se guardaron los datos del pago en el documento preliminar'
          }).pipe(
            map(result => res)
          );
        }

        return of(res);
      }),
      switchMap(res => {
        this.currentReport = res.Data.APInvoice.ConfirmationEntry ? 'Preliminary': this.currentReport;
          if (isPaymentPinpad) {
            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocumentPinpad(res.Data.APInvoice.DocEntry, incomingPayment.PPTransactions
              ).pipe(
                map(print => {
                  return { Document: res, Print: print }
                })
              )
            } else {
              return of({ Document: res, Print: null })
            }
          } else {
            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocument(res.Data.APInvoice.DocEntry
              ).pipe(
                map(print => {
                  return { Document: res, Print: print }
                })
              )
            } else {
              return of({ Document: res, Print: null })
            }
          }
        }
      ),
      map(res => {
        this.overlayService.Drop();

        return {
          DocEntry: res?.Document.Data.APInvoice.DocEntry,
          DocNum: res?.Document.Data.APInvoice.DocNum,
          NumFE: res?.Document.Data.APInvoice.NumFE,
          CashChange:  this.DisplayChangeAmount(this.localCurrency.Id, _paymentState.ChangeAmount),
          CashChangeFC: this.DisplayChangeAmount(notLocalCurrency.Id, _paymentState.ChangeAmount),
          Title: res?.Document.Data.APInvoice.ConfirmationEntry ? Titles.Draft : this.currentTitle,
          TypeReport: this.currentReport,
          PPTransactions: isPaymentPinpad ? incomingPayment.PPTransactions : [] ,
          Terminals: this.Terminals,
          Accion: 'creada',
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res))
    ).subscribe({
      next: () => {
        this.RefreshData();
      },
      error: (err) => {
        this.overlayService.Drop()
        this.modalService.Continue({
          title: `Se produjo un error creando la ${this.currentTitle}`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        }).subscribe(
          () => {
            this.OpenPaymentModal(_document)
          });
      }
    });
  }

  /**
   *
   * @param _paymentState
   * @constructor
   * @private
   */
  private SetUdfsPaymentDevelopment(_paymentState: IPaymentState): void {
    this.udfsPaymentValue = [];
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsPaymentValue, this.udfsPaymentDevelopment);
    MappingUdfsDevelopment<IPaymentState>(_paymentState, this.udfsPaymentValue, this.udfsPaymentDevelopment);

  }

  /**
   * Method to return changea amount
   * @param _currency - currency created the docuement
   * @param _amount - Amount received by document
   * @constructor
   * @private
   */
  private DisplayChangeAmount(_currency: string, _amount: number): number {

    if (this.localCurrency.Id === _currency) {
      return +((_amount * this.currentSession.Rate).toFixed(this.DecimalTotalDocument));
    }

    return +((_amount / this.currentSession.Rate).toFixed(this.DecimalTotalDocument));
  }

  /**
   * Method to print invoice with payment
   * @param _docEntry - Number to document to print
   * @param _pptransaction - Transacction to print
   * @constructor
   * @private
   */
  private PrintInvoiceDocumentPinpad(_docEntry: number, _pptransaction: IVoidedTransaction[]): Observable<ICLResponse<string> | null> {

    if (_pptransaction && _pptransaction.length > 0) {
      let rawData = `>count:${_pptransaction.length}`;

      _pptransaction.forEach((x, index) => {

        const EMVS_STREAM = JSON.parse(_pptransaction[index].SerializedTransaction)['EMVStreamResponse'];
        const RIGHT_SIDE = +EMVS_STREAM.salesAmount.slice(0, -2);
        const LEFT_SIDE = +`0.${EMVS_STREAM.salesAmount.slice(-2, EMVS_STREAM.salesAmount.length)}`;

        const TERMINAL = this.Terminals.find(y => y.TerminalId == _pptransaction[index].TerminalId) as ITerminal;

        const IS_QUICK_PAY = (RIGHT_SIDE + LEFT_SIDE <= TERMINAL?.QuickPayAmount)
          && (EMVS_STREAM.entryMode.includes('CLC') || EMVS_STREAM.entryMode.includes('CHP'));

        const OFFSET = index + 1;
        rawData += `>cdn${OFFSET}:${EMVS_STREAM['maskedCardNumber']}`;
        rawData += `>aut${OFFSET}:${EMVS_STREAM['authorizationNumber']}`;
        rawData += `>ref${OFFSET}:${EMVS_STREAM['referenceNumber']}`;
        rawData += `>ter${OFFSET}:${x.TerminalId}`;
        rawData += `>amt${OFFSET}:${RIGHT_SIDE + LEFT_SIDE}`;
        rawData += `>cur${OFFSET}:${TERMINAL.Currency}`;
        rawData += `>qkp${OFFSET}:${+IS_QUICK_PAY}`;
        rawData += `>ptt${OFFSET}:${EMVS_STREAM['printTags']['string']}`
        rawData += `>end${OFFSET}`;
      });

      let validatePrint = this.ValidateValueFormatSetting(this.reportConfigured,this.currentReport);
      if(validatePrint != null && validatePrint!='') {
        return this.reportsService.PrintReportPinpad(_docEntry, rawData, this.currentReport).pipe(
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
              PrintBase64File({base64File: res.Data, blobType: 'application/pdf', onNewWindow: false})
              return of(res);
            }
          }),
          catchError(error => {
            this.alertsService.ShowAlert({HttpErrorResponse: error});
            return of(null);
          })
        );
      } else {
        return of(null);
      }
    } else {
      return of(null);
    }
  }

  /**
   * Method to print invoice without pinpad
   * @param _docEntry - Number to print document
   * @constructor
   * @private
   */
  private PrintInvoiceDocument(_docEntry: number): Observable<ICLResponse<IDownloadBase64> | null> {
    let validatePrint = this.ValidateValueFormatSetting(this.reportConfigured,'CreditNote');

    if(validatePrint != null && validatePrint != ''){
      return this.reportsService.PrintReport(_docEntry, this.currentReport).pipe(
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
    } else {
      return of(null);
    }
  }

  /**
   * Load transaction pinpad
   * @param _transaction - Transaction realized with document
   * @constructor
   */
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
   * Method to obtain accounts by warehouse
   * @constructor
   */
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
            Type: MapAccountType(account.Type)
          } as IAccount
        }),
    ));

  }

  private DocumentLinesValidations(): boolean {

    let data = ValidateLines(this.lines);

    if (!data.Value) {
      this.alertsService.Toast({type: CLToastType.INFO, message: data.Message});
      return false;
    }

    if (this.lines.some(l => l.TaxOnly === (typeof l.TaxOnly === 'string' ? 'tYES' : true)) && !this.permissions.some(p => p.Name === 'Purchases_Documents_BillDiscountedProducts')) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para crear documentos con productos bonificados'
      });
      return false;
    }

    return true;
  }

  private ValidateUdfsLines(): boolean {

    let data = ValidateUdfsLines(this.lines, this.udfsLines);

    if (!data.Value) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: data.Message
      });
      return false;
    }

    return true;
  }

  public GetItems(): void {
    this.overlayService.OnGet();
    this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession.WhsCode,ItemsFilterType.PrchseItem).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (res => {
        this.items = res.Data;
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  public GetConversionSymbol(): string {
    return this.currencies.filter(c => c.Id !== "##").find(c => c.Id !== this.currency)?.Symbol || '';
  }

  private OpenDialogSuccessSales(_data: ISuccessSalesInfo): Observable<ISuccessSalesInfo> {
    return this.matDialog.open(SuccessSalesModalComponent, {
      width: '98%',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '80%',
      disableClose: true,
      data: _data
    }).afterClosed().pipe(
      filter(res => res)
    )
  }

  private ResetDocument(): void {
    this.documentAttachment = {
      AbsoluteEntry: 0,
      Attachments2_Lines: []
    };
    this.attachmentFiles = [];
    this.InflateAttachmentTable();
    this.paymentHolder = {} as IPaymentHolder;
    this.DownPaymentPercentage.setValue(100);
    this.router.navigate(['purchases', this.currentUrl])
    this.lines = [];
    this.docEntry = 0;
    this.docNum = 0;
    this.documentData = null;
    this.preloadedDocFromType=undefined;
    this.GetTotals();
    this.InflateTableLines();
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.DefineActionButtonByPreloadedDocAction();
    this.udfsValue = [];
    this.CleanFields();
    this.paymentDocument = {} as IDocument;
    this.dropdownDiffList = {};
    this.withholdingTaxSelected = [];
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

  private ChangeWarehouse(): void {
    this.subscriptions$.add(
      this.sharedService.changeWarehouse$.pipe(
        filter((value: string) => {
          return !!(value && value !== '');
        }),
        switchMap((value: string) => {
          this.currentSession.WhsCode = value;
          this.overlayService.OnGet();
          return this.itemService.GetAll<ItemSearchTypeAhead[]>(value,ItemsFilterType.PrchseItem).pipe(finalize(() => this.overlayService.Drop()))
        }),
      ).subscribe({
        next: (callback => {
          this.items = callback.Data
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })
    )
  }

  private RefreshRate(): void {
    this.sharedService.refreshRate$.pipe(
      filter((value: number) => {
        return !!(value);
      }),
      takeUntil(this.changeWarehouse$)
    ).subscribe({
      next: (value) => {
        this.currentSession.Rate = value;
      },
      error: (error) => {
      }
    });
  }

  /**
   * Open FE modal
   * @constructor
   */
  public OpenDialogFE(): void {
    this.matDialog.open(FeComponent, {
      width: '98%',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '80%',
      disableClose: true,
      data: this.feData
    }).afterClosed()
      .pipe(
        filter((result: IFeData) => !!result),
      ).subscribe({
      next: (result => {
        if (result) {
          let CardName = this.documentForm.controls['CardName'].value;
          let NameFe = result.Nombre? result.Nombre: CardName;
          this.feData = result;
          this.documentForm.controls['CardName'].setValue(NameFe);

        }
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private SetData(data: IDocument): void {

    this.documentForm.patchValue({
      CardCode: data.CardCode,
      CardName: data.CardName,
      PriceList: data.PriceList,
      SalesPersonCode: data.SalesPersonCode,
      DocCurrency: data.DocCurrency,
      Comments: data.Comments,
      PaymentGroupCode: data.PaymentGroupCode,
      DocDate: data.DocDate,
      DocDueDate: data.DocDueDate,
      TaxDate: data.TaxDate
    });
    this.currency = this.documentForm.controls['DocCurrency'].value;
    this.docEntry = data.DocEntry;
    this.docNum = data.DocNum;

    let unitPrice: number = 0;
    let unitPriceFC: number = 0;
    let totalLine: number = 0;
    let totalLineFC: number = 0;
    let totalLineDesc: number = 0;
    let totalLineDescFC: number = 0;
    let totalLineImp: number = 0;
    let totalLineImpFC: number = 0;

    //this.indexMaxUpdate = data?.DocumentLines.reduce((acc, i) => (i.LineNum > acc.LineNum ? i : acc)).LineNum || 0;
    //this.IndexMinUpdate = data?.DocumentLines.reduce((acc, i) => (i.LineNum < acc.LineNum ? i : acc)).LineNum || 0;

    this.lines = data.DocumentLines.map((x, index) => {

      unitPrice = 0;
      unitPriceFC = 0;
      totalLine = 0;
      totalLineFC = 0;
      totalLineDesc = 0;
      totalLineDescFC = 0;
      totalLineImp = 0;
      totalLineImpFC = 0;

      if (data.DocCurrency === this.localCurrency?.Id) {
        unitPrice = x.UnitPrice;
        unitPriceFC = +(((x.UnitPrice / this.currentSession.Rate)).toFixed(this.DecimalUnitPrice));
      } else {
        unitPrice = +(((x.UnitPrice * this.currentSession.Rate)).toFixed(this.DecimalUnitPrice));
        unitPriceFC = x.UnitPrice;
      }

      totalLine = +((x.UnitPrice * x.Quantity).toFixed(this.DecimalTotalLine));
      totalLineFC = +((unitPriceFC * x.Quantity).toFixed(this.DecimalTotalLine));

      totalLineDesc = +((totalLine - (totalLine * (x.DiscountPercent / 100))).toFixed(this.DecimalTotalLine));
      totalLineDescFC = +((totalLineFC - (totalLineFC * (x.DiscountPercent / 100))).toFixed(this.DecimalTotalLine));

      totalLineImp = +((totalLine + (totalLine * (x.TaxRate / 100))).toFixed(this.DecimalTotalLine));
      totalLineImpFC = +((totalLineFC + (totalLineFC * (x.TaxRate / 100))).toFixed(this.DecimalTotalLine));

      let item = {
        ItemCode: x.ItemCode,
        InventoryItem: x.InventoryItem,
        PurchaseItem: x.PurchaseItem,
        SalesItem: x.SalesItem,
        DocEntry: x.DocEntry,
        WarehouseCode: x.WarehouseCode,
        Quantity: x.Quantity,
        TaxRate: x.TaxRate,
        TaxCode: x.TaxCode,
        DiscountPercent: x.DiscountPercent,
        CostingCode: this.userAssign?.CenterCost,
        ItemDescription: x.ItemDescription,
        OnHand: x.OnHand,
        LineNum: x.LineNum,
        LineStatus: x.LineStatus,
        UoMEntry: x.UoMEntry,
        UnitPrice: data.DocCurrency === this.localCurrency.Id ? unitPrice : unitPriceFC,
        UnitPriceFC: unitPriceFC,
        UnitPriceCOL: unitPrice,
        TotalImp: data.DocCurrency === this.localCurrency.Id ? totalLineImp : totalLineImpFC,
        TotalImpCOL: totalLineImp,
        TotalImpFC: totalLineImpFC,
        TotalDesc: data.DocCurrency === this.localCurrency.Id ? totalLineDesc : totalLineDescFC,
        TotalDescCOL: totalLineDesc,
        TotalDescFC: totalLineDescFC,
        Total: data.DocCurrency === this.localCurrency.Id ? totalLine : totalLineFC,
        TotalCOL: totalLine,
        TotalFC: totalLineFC,
        IdDiffBy: index + 1,
        UoMMasterData: x.UoMMasterData ?? [],
        LockedUnitPrice: unitPrice,
        TaxOnly: x.TaxOnly === "Y",
        BaseType: x.BaseType,
        BaseEntry: this.ValidateBaseEntry(data),
        Currency: x.Currency || data.DocCurrency
      } as IDocumentLine;

      this.ConfigDropdownDiffListTable(item);

      if (this.udfsLines?.length) {
        SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList);
      }
      return item;
    });

    this.withholdingTaxSelected = this.availableWithholdingTax
      .filter((withholding: IWithholdingTax) =>
        this.documentData?.WithholdingTaxDataCollection?.some(wt => wt.WTCode === withholding.WTCode)
      ).map((withholding: IWithholdingTax) => ({ ...withholding, Selected: true } as IWithholdingTaxSelected));


    this.InflateTableLines();
    this.GetTotals();
  }

  /**
   * Calculate the total edited line
   * @param _index - The index for which the total edited lines will be calculated.
   * @constructor
   */
  public LineTotal(_index: number): void {

    const unitPrice = +this.lines[_index]?.UnitPrice ?? 0;

    let disc = this.lines[_index]?.DiscountPercent ?? 0
    const priceFC = this.localCurrency.Id !== this.currency ? unitPrice : +((unitPrice / this.currentSession?.Rate).toFixed(this.DecimalUnitPrice));
    const priceCOL = this.localCurrency.Id === this.currency ? unitPrice : +((unitPrice * this.currentSession?.Rate).toFixed(this.DecimalUnitPrice));
    const qty = +this.lines[_index].Quantity;

    let lineTotal = +((qty * priceCOL).toString());
    let lineTotalFC = +((qty * priceFC).toString());

    const taxamount = this.lines[_index].VATLiable=='NO'? 0 : ((lineTotal * ((this.lines[_index]?.TaxRate ?? 0) / 100)));
    const taxamountFC = this.lines[_index].VATLiable=='NO'? 0 : ((lineTotalFC * ((this.lines[_index]?.TaxRate ?? 0) / 100)));

    lineTotal = +((lineTotal + taxamount));
    lineTotal = +((lineTotal - lineTotal * (disc / 100)));
    lineTotal = +(lineTotal.toFixed(this.DecimalTotalLine));

    lineTotalFC = +((lineTotalFC + taxamountFC));
    lineTotalFC = +((lineTotalFC - lineTotalFC * (disc / 100)));
    lineTotalFC = +(lineTotalFC.toFixed(this.DecimalTotalLine));

    this.lines[_index].TotalCOL = lineTotal;
    this.lines[_index].TotalFC = lineTotalFC;
    this.lines[_index].Total = this.localCurrency.Id === this.currency ? lineTotal : lineTotalFC;
    this.lines[_index].UnitPrice = this.localCurrency.Id === this.currency ? priceCOL : priceFC;
    this.lines[_index].UnitPriceDOL = this.localCurrency.Id === this.currency ? priceFC : priceCOL;
    this.lines[_index].UnitPriceCOL = priceCOL;
    this.lines[_index].UnitPriceFC = priceFC;
    this.lines[_index].Quantity = qty;
  }

  public SelectCurrency(_currency: string): void {
    this.currency = _currency;
    this.lines = this.lines.map(element => {
      return {
        ...element,
        UnitPriceDOL: this.localCurrency.Id === this.currency ? element.UnitPriceFC : element.UnitPriceCOL,
        UnitPrice: this.localCurrency.Id === this.currency ? element.UnitPriceCOL : element.UnitPriceFC,
        Total: this.localCurrency.Id === this.currency ? element.TotalCOL : element.TotalFC
      }
    });
    this.InflateTableLines();
    this.GetTotals();
  }

  /**
   * Method that is executed when changing price list
   * @param _listNum -Selected price list
   * @constructor
   */
  public SelectPriceList(_listNum: number): void {
    this.documentForm.controls['DocCurrency'].setValue(this.priceLists.find(x => x.ListNum === _listNum)?.PrimCurr);
    this.currency = this.documentForm.controls['DocCurrency'].value;
  }


//#region Udfs

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
    if (this.displayTypeInvoice) {
      this.documentForm.controls['TypeDocE'].setValue(null);
    }

    MappingUdfsDevelopment<IPurchaseInvoice>(this.documentForm.value, this.udfsValue, this.udfsDevelopment);

    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);


  }

  //#endregion

  /**
   * Method to set initial data
   * @constructor
   * @private
   */
  private SetInitialData(): void {

    this.canChangePriceList = this.permissions.some(x => x.Name === 'Purchases_Documents_ChangePriceList');
    this.isPermissionChangeDowntPercentage = this.permissions.some(x => x.Name === 'Purchases_Documents_ChangeDownPaymentPercentage');
    this.canChangePartialPrice = this.permissions.some(x => x.Name === 'Purchases_Document_PartialPay');


    //#region SETEO INICIAL
    this.documentForm.reset();
    this.documentForm.controls['SalesPersonCode'].setValue(+(this.userAssign?.SlpCode));
    this.documentForm.controls['Quantity'].setValue(1);
    if (this.typeDocE && this.typeDocE.length > 0) {
      this.documentForm.controls['TypeDocE'].setValue(this.typeDocE.find((x) => x.IsDefault)?.Name);
    }

    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['DocDueDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));

    this.documentForm.controls['PartialAmount'].setValue(0);
    this.IsPartialPay.setValue(false);
    //#endregion

    //#region DEFAULT BUSINESS PARTNER
    this.LoadDataBp(this.DefaultBusinessPartner);
    //#endregion

    //#region PERMISOS DE LA TABLA
    this.editableFieldConf =
      {
        Permissions: this.permissions,
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(x => x.Name === _columnPerm.Name),
        Columns: this.editableField,

      };
    this.lineMappedDisplayColumns.editableFieldConf = this.editableFieldConf;
    //#endregion

    //#region DECIMALES
    if (this.settings.find((element) => element.Code == SettingCode.Decimal)) {
      let companyDecimal: IDecimalSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '');

      if (companyDecimal && companyDecimal.length > 0) {

       let decimalCompany = companyDecimal.find(x => x.CompanyId === this.currenCompany?.Id) as IDecimalSetting;
        if (decimalCompany) {
          this.TO_FIXED_TOTALDOCUMENT = `1.${decimalCompany.TotalDocument}-${decimalCompany.TotalDocument}`;
          this.DecimalTotalDocument = decimalCompany.TotalDocument;
          this.DecimalUnitPrice = decimalCompany.Price;
          this.DecimalTotalLine = decimalCompany.TotalLine;

        }

      }

    }
    //#endregion

    //#region DESACTIVAR EL DRAG AND DROP
    let payment = this.settings.find((element) => element.Code == SettingCode.Payment);
    if (payment && payment.Json) {
      let data = JSON.parse(payment.Json) as IPaymentSetting[];
      if (data) {
        this.disableDragAndDrop = !!data.find(x => x.CompanyId === this.currenCompany?.Id)?.OrderLine;
      }
    }
    //#endregion

    //#region PINPAD
    if (this.settings.find((element) => element.Code == SettingCode.Payment)) {

      let payment = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '') as IPaymentSetting[];

      if (payment && payment.length > 0) {

        let dataPayment = payment.find(x => x.CompanyId === this.currenCompany?.Id) as IPaymentSetting;

        if (dataPayment) {
          this.PaymentConfiguration = dataPayment;

          // Store the types of documents allowed for withholding
          const documentsAllowedWithholding = new Set<string>([
            DocumentType.PurchaseOrder,
            DocumentType.PurchaseInvoice,
            DocumentType.APDownPayments
          ]);
          this.RetentionProcessPermission(dataPayment, documentsAllowedWithholding);
        }
      }
    }
    //#endregion


    //#region AGREGAR UDFS A NIVEL DE LINEA
    if (this.udfsLines && this.udfsLines.length > 0) {
      MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns, this.dropdownColumns);
      this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
    }

    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);


    //#endregion

    //#region CARGAR DOCUMENTO
    if (this.documentData) {
      this.SetData(this.documentData);
      if (this.udfsLines?.length){
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);
      }
    }
    //#endregion

    //#region CAMPOS FACTURA
    if (this.settings.some(s => s.Code === SettingCode.FieldsPurchaseInvoice)) {
      let Settings = JSON.parse(this.settings.find(s => s.Code === SettingCode.FieldsPurchaseInvoice)?.Json || '[]') as IFieldsPurchaseInvoiceSetting[];

      let fieldsInvoiceSetting = Settings.find(s => s.CompanyId === this.currenCompany.Id) as IFieldsPurchaseInvoiceSetting;

      if (fieldsInvoiceSetting) {
        this.displayTypeInvoice = fieldsInvoiceSetting.DisplayTypeInvoice;
      }

    }
    //#endregion
  }

  private RetentionProcessPermission(dataPayment: IPaymentSetting, documentsAllowedWithholding: Set<string>) {
    const invoiceAllowedWithholding = documentsAllowedWithholding.has(this.typeDocument);

    if (!dataPayment?.RetentionProcess || !invoiceAllowedWithholding) {
      this.retentionProcessEnabled = false;
      return;
    }

    const permissionMap: Record<string, string> = {
      [DocumentType.PurchaseOrder]: 'Purchases_PurchaseOrder_RetentionProcess',
      [DocumentType.PurchaseInvoice]: 'Purchases_PurchaseInvoice_RetentionProcess',
      [DocumentType.APDownPayments]: 'Purchases_PurchaseAPDownPayments_RetentionProcess'
    };

    const requiredPermission = permissionMap[this.typeDocument];
    this.retentionProcessEnabled = this.permissions.some(permission => permission.Name === requiredPermission);
  }

  /**
   * This method is used to change the due date according to the payment terms
   * @constructor
   */
  public SelectPayTerms(): void {
    this.subscriptions$.add(this.documentForm.controls['PaymentGroupCode'].valueChanges.subscribe({
      next: (_groupNum: number) => {
        let payTerms = this.payTerms.find(x => x.GroupNum === _groupNum) as IPayTerms;
        if (payTerms) {
          if (payTerms.Days) {
            let date = AddDays(payTerms.Days);
            this.documentForm.controls['DocDueDate'].setValue(date);
          } else if (payTerms.Months) {
            let date = AddMonths(payTerms.Months);
            this.documentForm.controls['DocDueDate'].setValue(date);
          } else {
            this.documentForm.controls['DocDueDate'].setValue(new Date());
          }
        }
      },
      error: (error) => {
        this.alertsService.Toast({type: CLToastType.ERROR, message: GetError(error)});
      }
    }));
  }


  /**
   * Used to map the files to attachment lines
   * @param _event Event with the selected files
   * @constructor
   */
  OnAttachFile(_event: Event): void {
    let files = (_event.target as HTMLInputElement).files;

    if(!files) return;

    let hasDuplicatesFiles: boolean = false;

    // Remove duplicated files
    let attachmentFiles = Array.from(files).reduce((acc, val) => {
      if(![...this.attachmentFiles, ...acc].some(file => file.name == val.name))
      {
        acc.push(val);
      }
      else
      {
        hasDuplicatesFiles = true;
      }

      return acc;
    }, [] as File[]);

    this.attachmentFiles = [...this.attachmentFiles, ...attachmentFiles];

    if(this.attachmentFiles.some(file => file.name.split('.').length == 0))
    {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Hay archivos que no contienen extensión. Por favor agrégueles una extensión.`
      });
      return;
    }

    let validExtensions: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'ppt', 'xlsx', 'pptx'];

    let invalidFile = attachmentFiles.find(file => !validExtensions.includes(file.name.split('.').pop()!));

    if(invalidFile)
    {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `La extensión del archivo ${invalidFile.name} no es permitida.`
      });
      return;
    }

    attachmentFiles.forEach((file, index) => {

      let date = new Date();

      let fileExtension = file.name.split('.').pop()!;

      let fileName = file.name.replace(`.${fileExtension}`, '');

      this.documentAttachment.Attachments2_Lines.push({
        Id: this.documentAttachment.Attachments2_Lines.length === 0 ? index + 1 : this.documentAttachment.Attachments2_Lines.length + 1,
        FileName: fileName,
        FreeText: '',
        AttachmentDate: formatDate(date, "yyyy-MM-dd", 'en'),
        FileExtension: fileExtension
      } as IAttachments2Line);

    });

    (_event.target as HTMLInputElement).value = "";

    this.InflateAttachmentTable();

    if(hasDuplicatesFiles)
    {
      this.modalService.Continue({
        type: CLModalType.INFO,
        subtitle: "No es posible cargar archivos con el mismo nombre."
      })
    }
  }

  /**
   * Add records to the attachment table
   * @constructor
   * @private
   */
  private InflateAttachmentTable(): void {
    const NEXT_TABLE_STATE = {
      Records: this.documentAttachment.Attachments2_Lines,
      RecordsCount: this.documentAttachment.Attachments2_Lines.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.attachmentTableId
    });
  }

  /**
   * Used to handle the row event of the attachment table
   * @param _event Object with the event information
   * @constructor
   */
  private OnAttachmentTableRowModified = (_event: ICLEvent): void => {
    let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IAttachments2Line>;

    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1, true);

    this.documentAttachment.Attachments2_Lines[INDEX].FreeText = ALL_RECORDS.Row.FreeText;
  }

  /**
   * Handle the event of attachment table when a button is clicked
   * @param _event The object with the event information
   * @constructor
   */
  OnAttachmentTableButtonClicked = (_event: ICLEvent) => {
    const BUTTON_EVENT = JSON.parse(_event.Data);

    const ATTACHMENT_LINE = JSON.parse(BUTTON_EVENT.Data) as IAttachments2Line;

    switch(BUTTON_EVENT.Action)
    {
      case Structures.Enums.CL_ACTIONS.DELETE:
        let removedAttachmentLine = this.documentAttachment.Attachments2_Lines.splice(ATTACHMENT_LINE.Id - 1, 1)[0];

        this.documentAttachment.Attachments2_Lines = this.documentAttachment.Attachments2_Lines.map((attL, index) => {
          return {
            ...attL,
            Id: index + 1
          }
        });

        this.attachmentFiles = this.attachmentFiles?.filter(attF => attF.name != `${removedAttachmentLine.FileName}.${removedAttachmentLine.FileExtension}`);

        this.InflateAttachmentTable();
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_1:
        if(!ATTACHMENT_LINE.AbsoluteEntry)
        {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: "Este adjunto aún no ha sido guardado en SAP"
          });

          break;
        }

        this.overlayService.OnGet();

        this.attachmentService.GetFile(`${ATTACHMENT_LINE.SourcePath}\\${ATTACHMENT_LINE.FileName}.${ATTACHMENT_LINE.FileExtension}`)
          .pipe(
            finalize(() => this.overlayService.Drop())
          ).subscribe({
          next: (callback) => {
            if(callback.Data){
              DownloadBase64File(callback.Data, ATTACHMENT_LINE.FileName, 'application/octet-stream', ATTACHMENT_LINE.FileExtension);
            }
          },
          error: (error) => {
            this.alertsService.ShowAlert({HttpErrorResponse: error});
          }
        });
        break;
    }
  }

  public DefineActionButtonByPreloadedDocAction(): void {

    switch (this.preloadedDocActionType) {
      case PreloadedDocumentActions.EDIT:
        this.actionButtons = [
          {
            Key: 'SAVE',
            MatIcon: 'edit',
            Text: 'Actualizar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        break;
      case PreloadedDocumentActions.COPY:
        this.actionButtons = [
          {
            Key: 'SAVE',
            MatIcon: 'save',
            Text: 'Crear',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        break;
      case PreloadedDocumentActions.DUPLICATE:
        this.actionButtons = [
          {
            Key: 'SAVE',
            MatIcon: 'save',
            Text: 'Crear',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        break;
      default:
        this.actionButtons = [
          {
            Key: 'SAVE',
            MatIcon: 'save',
            Text: 'Crear',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false,
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        break;
    }

    if(this.preloadedDocFromType=='Draft'  && this.canCreateDraft){
      this.actionButtons=[ {
        Key: 'ADDPRE',
        MatIcon: 'draft',
        Text: 'Actualizar preliminar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },...this.actionButtons]
    }else{
      if(this.canCreateDraft) {
        this.actionButtons = [{
          Key: 'ADDPRE',
          MatIcon: 'draft',
          Text: 'Crear preliminar',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        }, ...this.actionButtons]
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  async HandleScannerInput(_event: KeyboardEvent): Promise<void>
  {
    if (_event.target instanceof HTMLInputElement) {
      return ;
    } else {
      if(this.requestingItem) return;

      if(_event.key == 'Enter')
      {
        this.onScanCode$.next(this.scannedCode);

        this.scannedCode = '';
      }
      else if(_event.key.length == 1)
      {
        this.scannedCode += _event.key;
      }
    }
  }

  ListenScan(): void
  {
    this.onScanCode$
      .pipe()
      .subscribe({
        next: (response) => {
          this.requestingItem=true;
          this.overlayService.OnGet();
          this.itemService.GetByScan<ItemSearchScan[]>(response, this.currentSession.WhsCode, ItemsFilterType.PrchseItem)
            .pipe().subscribe({
            next: (callback) => {
              if(callback.Data.length>0){
                this.items = callback.Data;
                this.OnSelectItem(callback.Data[0]);
                this.requestingItem=false;
                this.overlayService.Drop()
              }else{
                this.requestingItem=false;
                this.overlayService.Drop()
                this.alertsService.Toast({
                  type: CLToastType.INFO,
                  message: `No se encontró el artículo scaneado ${response}`
                });
              }
            },
            error: (err) => {
              this.requestingItem=false;
              this.alertsService.Toast({
                type: CLToastType.ERROR,
                message: `Error: ${err}`
              });
              this.overlayService.Drop()
            }
          })
        },
        error: (err) => {
          this.requestingItem=false;
          this.alertsService.Toast({
            type: CLToastType.ERROR,
            message: `Error: ${err}`
          });
          this.overlayService.Drop()
        }
      });
  }

  private ValidateAttachTable(): void {
    const tree: string = this.sharedService.GetCurrentRouteSegment();
    const urlSegment = tree.split('/');
    this.currentUrl = urlSegment[urlSegment.length - 1];

    switch (this.currentUrl) {
      case 'invoice':
        if (this.ValidateAttachmentsTables) {
          let setting = this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.PurchaseInvoice)
          if (setting) {
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.PurchaseInvoice);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'down-payments':
        if (this.ValidateAttachmentsTables) {
          let setting = this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.APDownPayments)
          if (setting) {
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.APDownPayments);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;
    }
  }

  private ValidateListNum (): void{
    if(this.preloadedDocActionType === PreloadedDocumentActions.COPY || this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE ||
      this.preloadedDocActionType === PreloadedDocumentActions.EDIT || this.preloadedDocActionType === PreloadedDocumentActions.CREATE_FROM_DRAFT) {
      if (this.documentData?.PriceList == undefined ||  this.documentData?.PriceList == 0 ||  this.documentData?.PriceList == null) {
        this.modalService.Continue({
          title: `No se definió la lista de precios del documento.`,
          subtitle: 'No se definió la lista de precios del documento, se utilizará la lista por defecto definida en el socio de negocio.',
          type: CLModalType.INFO
        });
        if (this.DefaultBusinessPartner.PriceListNum == 0 || this.DefaultBusinessPartner.PriceListNum == null) {
          this.modalService.Continue({
            title: `El socio de negocios no tiene lista de precios por defecto.`,
            subtitle: 'El socio de negocios no tiene lista de precios por defecto, por favor seleccione otro socio de negocios.',
            type: CLModalType.INFO
          });
        } else {
          this.documentForm.patchValue({
            PriceList: this.DefaultBusinessPartner.PriceListNum ? this.priceLists.find(x => x.ListNum === this.DefaultBusinessPartner.PriceListNum)?.ListNum : this.priceLists[0]?.ListNum
          });
        }
      }
    }
    if(this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE){
      this.documentForm.patchValue({ CardCode: '', CardName: '' });
      this.isFirstBusinessPartnerSelection = true;
    }
  }

  public ValidateBaseEntry(_data: IDocument):number{
    if(this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE){
      return 0;
    }
    else if( this.preloadedDocActionType === PreloadedDocumentActions.CREATE_FROM_DRAFT){
      if(_data.Approval_Status){
        return _data.DocEntry;
      }
      return 0;
    }else {
      return _data.DocEntry||0;
    }
  }


  /**
   * Handle the received data for format print
   * @param printSetting - Print configuration requested
   * @param key - Requested print configuration key
   * @constructor
   * @public
   * */
  public ValidateValueFormatSetting(printSetting: any, key: string): any {
    if (printSetting.hasOwnProperty(key)) {
      return printSetting[key];
    } else {
      return null;
    }
  };

  /**
   * Validates the columns/items in a specific context.
   * This method performs validation checks on the columns or items.
   */
  private ValidateColumnsItems():void{
    switch (this.currentUrl) {

      case 'invoice':
        if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItemsPurchases.Purchases_Documents_Invoice_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;

      case 'down-payments':
        if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItemsPurchases.Purchases_Documents_DownPayments_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;

    }
  }

  /**
   * Updates the available withholding taxes based on the specified Business Partner.
   * @param {string} _cardCode - The unique identifier of the Business Partner.
   */
  private GetWithholdingTaxByBP(_cardCode: string): void{
    this.overlayService.OnGet();
    this.withholdingTaxService.GetByBusinessPartner<IWithholdingTax[]>(_cardCode).pipe(
      finalize(() => {
        this.withholdingTaxSelected = [];
        this.overlayService.Drop()
      })
    ).subscribe({
      next: (callback) => {
        this.availableWithholdingTax = callback.Data;
      },
      error: (err) => this.alertsService.ShowAlert({ HttpErrorResponse: err })
    });
  };

  /**
   * Validates the user's permission to create a draft based on the current URL.
   * This function checks the user's permissions to determine if they can create a draft
   * for either an invoice or a down payment, depending on the current URL.
   * It then updates the action buttons accordingly.
   *
   * @returns {void} This function does not return a value.
   */
  private ValidatePermissionToAvailableDraft(): void {
    switch (this.currentUrl) {
      case 'invoice':
        this.canCreateDraft = this.permissions.some(x => x.Name === PermissionValidateDraft.PurchasesDocumentsInvoiceCreateDraft);
        break;
      case 'down-payments':
        this.canCreateDraft = this.permissions.some(x => x.Name === PermissionValidateDraft.PurchasesDocumentsDownPaymentsCreateDraft);
        break;
    }
    this.DefineActionButtonByPreloadedDocAction();
  }
}
