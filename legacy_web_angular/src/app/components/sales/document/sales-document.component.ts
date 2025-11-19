import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Copy, PrinterWorker, SharedService} from "@app/shared/shared.service";
import {CLPrint, DownloadBase64File, GetError, PinPad, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ActivatedRoute, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {
  catchError,
  concatMap,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  from,
  last,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  toArray
} from "rxjs";
import {ISaleDocumentComponentResolvedData} from "@app/interfaces/i-resolvers";
import {IDocumentLine, IItemMasterData, ILinesCurrencies, ILinesGoodReceip, ItemSearchScan} from "@app/interfaces/i-items";
import {ItemsService} from "@app/services/items.service";
import {IAttachments2Line, IBPAddresses, IBusinessPartner} from "@app/interfaces/i-business-partner";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {IActionButton} from '@app/interfaces/i-action-button';
import {IDocument, IDownPayment, IDownPaymentsToDraw, WithholdingTaxCode} from '@app/interfaces/i-sale-document';
import {SalesDocumentService} from "@app/services/sales-document.service";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {IPriceList} from "@app/interfaces/i-price-list";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {ITaxe} from "@app/interfaces/i-taxe";
import {
  DropdownElement,
  IEditableField,
  IEditableFieldConf,
  IInputColumn,
  IRowByEvent
} from "@clavisco/table/lib/table.space";
import {
  IActionDocument,
  ISalesDocument,
  ITypeDocE,
  IUniqueId,
  ULineMappedColumns
} from "@app/interfaces/i-document-type";
import {ICompany} from "@app/interfaces/i-company";
import {
  IAdjustmentInventorySetting,
  IAutoWithholdingSetting,
  IDecimalSetting,
  IDefaultBusinessPartnerSetting,
  IFieldsInvoiceSetting,
  ILineModeSetting,
  IMemoryInvoiceSetting,
  IPaymentSetting,
  IPrintFormatSetting,
  ISettings,
  IUdfGroupSetting, IValidateAttachmentsSetting, IValidateAutomaticPrintingsSetting,
  IValidateInventory,
  IValidateInventorySetting,
  IValidateLine
} from "../../../interfaces/i-settings";
import {
  CopyFrom,
  DocumentType, DocumentTypes,
  ItemsClass,
  ItemSerialBatch,
  ItemsFilterType,
  LineStatus,
  ListMaterial,
  PaymentInvoiceType,
  Payterm, PermissionEditDocumentsDates, PermissionValidateDraft, PermissionViewColumnsItems,
  PreloadedDocumentActions,
  SettingCode,
  Titles,
  TypeInvoices,
  ViewBatches
} from "@app/enums/enums";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {IFeData} from "@app/interfaces/i-padron";
import {CommonService} from "@app/services/common.service";
import {IUdf, IUdfContext, IUdfDevelopment, IUdfGroup, UdfSourceLine} from "@app/interfaces/i-udf";
import {StockWarehousesComponent} from "@Component/sales/stock-warehouses/stock-warehouses.component";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";

import {
  IBatches,
  IBatchSelected,
  IDocumentLinesBinAllocations,
  ILocationsModel,
  ILocationsSelectedModel,
  ISerialNumbers
} from "@app/interfaces/i-serial-batch";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {LocationComponent} from "@Component/sales/document/location/location.component";
import {BinLocationsService} from "@app/services/bin-locations.service";
import {BatchesService} from "@app/services/batches.service";
import {LotComponent} from "@Component/sales/document/lot/lot.component";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {FeComponent} from "@Component/sales/document/fe/fe.component";
import {
  ACCOUNT_TYPE,
  IAccount,
  ICurrency,
  IPaymentHolder,
  IPaymentSetting as IPaymentModalSetting,
  IPaymentState,
  IPointsSettings,
  PaymentModalComponent,
  PointsModalComponent
} from "@clavisco/payment-modal";
import {IIncomingPayment, IPaymentCreditCards, IPaymentInvoices} from "@app/interfaces/i-incoming-payment";
import {InvoiceWithPayment} from "@app/interfaces/invoice-with-payment";
import {IUserToken} from "@app/interfaces/i-token";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {ReportsService} from "@app/services/reports.service";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {environment} from "@Environment/environment";
import {
  IFacturaObj,
  IInvoicePointsBase,
  IInvoiceRedeemPoint,
  ILealtoConfigBase,
  ILineasFactura,
  IProductsTapp,
  ITappCloseInvoice,
  ITappConfigBase
} from "@app/interfaces/i-loyalty-plan";
import {
  ActionDocument,
  AddDays, AddMonths,
  CLTofixed,
  FormatDate,
  GetIndexOnPagedTable,
  GetUdfsLines,
  MappingDefaultValueUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines,
  SetDataUdfsLines, SetUdfsLineValues,
  ValidateUdfsLines,
  ZoneDate,
  ApplyBlanketAgreements
} from "@app/shared/common-functions";
import {ICardSettings, ITransaction} from "@clavisco/payment-modal/lib/payment-modal.space";
import {ITransactions} from "@app/interfaces/i-pp-transactions";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {InventoyEntryComponent} from "@Component/sales/document/inventoy-entry/inventoy-entry.component";
import {ICreateGoodReceiptDialogData, IWithholdingTaxDialogData} from "@app/interfaces/i-dialog-data";
import {IStockWarehouses} from "@app/interfaces/i-stock-warehouses";
import {SalesPersonService} from "@app/services/sales-person.service";
import {PayTermsService} from "@app/services/pay-terms.service";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {TaxesService} from "@app/services/taxes.service";
import {WarehousesService} from "@app/services/warehouses.service";
import {SettingsService} from "@app/services/settings.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {AccountsService} from "@app/services/accounts.service";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {PriceListService} from "@app/services/price-list.service";
import {SeriesItemsComponent} from "@Component/sales/document/series-items/series-items.component";
import {OrdersServicePreviewService} from "@app/services/orders-service-preview.service";
import {ISalesServicePreview} from "@app/interfaces/i-orders-preview";
import {DownPaymentComponent} from "@Component/sales/document/down-payment/down-payment.component";
import {IDocumentForDownPayment} from "@app/interfaces/i-down-payment";
import {UdfsService} from "@app/services/udfs.service";
import {LealtoService} from "@app/services/lealto.service";
import {TappService} from "@app/services/tapp.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {CurrenciesService} from "@app/services/currencies.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {formatDate} from "@angular/common";
import {AttachmentsService} from "@app/services/Attachments.service";
import ICLResponse = Structures.Interfaces.ICLResponse;
import ITerminal = PinPad.Interfaces.ITerminal;
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import CL_DISPLAY = Structures.Enums.CL_DISPLAY;
import {MatTabGroup} from "@angular/material/tabs";
import {DraftService} from "@app/services/draft.service";
import { MasterDataService } from '@app/services/master-data.service';
import {DimensionsService} from "@app/services/dimensions.service";
import {DimensionsComponent} from "@Component/sales/document/dimensions/dimensions.component";
import {IDimensions, IDimensionsSelected} from "@app/interfaces/i-dimensions";
import {BlanketAgreementsService} from "@app/services/blanket-agreements.service";
import {IBlanketAgreements} from "@app/interfaces/i-blanket-agreements.ts";
import {
  ModalAppliedRetentionsComponent
} from "@Component/sales/document/modal-applied-retentions/modal-applied-retentions/modal-applied-retentions.component";
import {IWithholdingTax, IWithholdingTaxSelected} from "@app/interfaces/i-withholding-tax";
import {WithholdingTaxService} from "@app/services/withholding-tax.service";
import { IAdditionalExpense } from '@app/interfaces/i-additional-expense';


@Component({
  selector: 'app-sales-document',
  templateUrl: './sales-document.component.html',
  styleUrls: ['./sales-document.component.scss']
})
export class SalesDocumentComponent implements OnInit, AfterViewInit, OnDestroy {

  /*FORMULARIOS*/
  documentForm!: FormGroup;
  DownPaymentPercentage: FormControl = new FormControl(100, [Validators.min(1), Validators.max(100)]);

  /*OBSERVABLES*/
  subscriptions$: Subscription;
  changeWarehouse$ = new Subject<string>();

  /*OBJECTS*/
  memoryInvoice!: IMemoryInvoiceSetting;
  DefaultBusinessPartner!: IBusinessPartner | null ;
  currentSession!: ICurrentSession;
  actionDocumentFrom!: IActionDocument | null;
  currentReport!: keyof IPrintFormatSetting;
  PaymentConfiguration!: IPaymentSetting;
  feData!: IFeData;
  vldLineMode!: IValidateLine;
  userLogged!: IUserAssign;
  exchangeRate!: IExchangeRate;
  preloadedDocActionType: PreloadedDocumentActions | undefined;
  preloadedDocument: IDocument | undefined | null;
  selectedCompany!: ICompany | null;
  DecimalUnitPrice = 0; // Decimal configurado para precio unitario
  DecimalTotalLine = 0; //Decimal configurado por compania para total de linea
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento
  vldInventoryvldInventory!: IValidateInventory;
  tappSettings!: ITappConfigBase;
  lealtoSettings!: ILealtoConfigBase;
  pointsSettings!: IPointsSettings | null;
  paymentHolder!: IPaymentHolder;
  paymentDocument!: IDocument;
  companyReportValidateAutomaticPrinting!: IValidateAutomaticPrintingsSetting;
  deliveryAddressSelected!: IBPAddresses;
  
  /*VARIABLES NUMBER*/
  index: number = 0;
  currentIndex: number = 0;
  TotalDiscountDownPayment: number = 0;
  TotalDiscountDownPaymentFC: number = 0;
  indexMaxUpdate: number = 0;
  IndexMinUpdate: number = 0;
  docEntry: number = 0;
  docNum: number = 0;
  total: number = 0;
  totalFC: number = 0;
  discount: number = 0;
  discountFC: number = 0;
  tax: number = 0;
  taxFC: number = 0;
  totalWithoutTax = 0;
  totalWithoutTaxFC: number = 0;
  DownPaymentPartialTotal : number = 0;
  DownPaymentPartialTotalFC : number = 0;
  totalRetention: number = 0;
  totalRetentionFC: number = 0;
  totalAutRetention: number = 0;
  totalAutRetentionFC: number = 0;
  AutoWithholdingExpenseCode: number | null = null;

  /*VARIABLES STRING*/
  uniqueId!: string;
  currentTitle: string = '';
  currentAction: string = 'creada';
  currentActionError: string = 'creando la';
  currentUrl: string = '';
  User!: string;
  currentCurrency: string = '';
  MsgPreviewDocument: string = '';
  controllerToSendRequest: string = '';
  typeDocument: string = '';
  typeInvoice: string = '';
  TO_FIXED_TOTALDOCUMENT: string = '';
  lineTableId: string = 'LINE-TABLE';
  docDueDateLabel: string = 'Fecha de vencimiento';
  paymentModalId: string = 'PaymentModalId';
  preloadedDocFromType: String | undefined;
  AutoWithholdingTaxCode: string | null = null;


  /*VARIABLES BOOLEAN*/
  generateInvoice: boolean = false;
  isCashCustomer = false;
  reintent: boolean = false;
  displayTypeInvoice = false;
  changeCurrencyLines: boolean = false;
  isPermissionChangeCurrency = true;
  isPermissionChangeDowntPercentage = false;
  isEditDocument: boolean = false;
  hasActiveLoyalty: boolean = false;
  tappActive: boolean = false;
  lealtoActive: boolean = false;
  canChangePriceList: boolean = true;
  canChangeDocDate: boolean = true;
  canChangeDocDueDate: boolean = true;
  canChangeTaxDate: boolean = true;
  shouldPaginateRequest: boolean = false;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  disableDragAndDrop: boolean = false;
  isFirstBusinessPartnerSelection: boolean = false;
  hasCompanyAutomaticPrinting: boolean = false;
  retentionProcessEnabled: boolean = false;
  modalProcessEnabled: boolean = false;
  canChangeDeliveryAddres: boolean = false;

  //#region listas
  settings: ISettings[] = [];
  stockWarehouses: IStockWarehouses[] = [];
  businessPartners: IBusinessPartner[] = [];
  items: ItemSearchTypeAhead[] = [];
  salesPerson: ISalesPerson[] = [];
  priceList: IPriceList[] = [];
  warehouse: IWarehouse[] = [];
  payTerms: IPayTerms[] = [];
  currencies: ICurrencies[] = [];
  taxes: ITaxe[] = [];
  typeDocE: ITypeDocE[] = [];
  userPermissions: IPermissionbyUser[] = [];
  documentInMemories: IDocument[] = [];
  Terminals: ITerminal[] = [];
  ICompanyValidateLine: ILineModeSetting[] = [];
  linesGoodReceipt: ILinesGoodReceip[] = [];
  vldInventoryCompany: IValidateInventorySetting[] = [];
  dropdownColumns: string[] = ['TaxCode', 'UoMEntry', 'IdCurrency'];
  checkboxColumns: string[] = ['TaxOnly'];
  lines: IDocumentLine[] = [];
  ItemCodeToSearchAvailability: string = '';
  companyPrintFormat: IPrintFormatSetting[] = [];
  companyValidateAutomaticPrinting: IValidateAutomaticPrintingsSetting[] = [];
  availableWithholdingTax: IWithholdingTax[] = [];
  withholdingTaxSelected: IWithholdingTaxSelected[] = [];
  //#endregion

  //#region @clavisco/table Configuration
  lineMappedColumns: MappedColumns;
  dropdownList!: DropdownList;
  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `edit`,
      Color: `primary`,
      Options: [
        {
          Title: `Ubicación`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_2,
          Icon: `edit`,
          Color: `primary`,
          Data: 'BinCode'
        },
        {
          Title: `Lotes`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_3,
          Icon: `edit`,
          Color: `primary`,
          Data: 'Lote'
        },
        {
          Title: `Series`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_4,
          Icon: `edit`,
          Color: `primary`,
          Data: 'Serie'
        },
        {
          Title: `Dimensiones`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_5,
          Icon: `edit`,
          Color: `primary`,
          Data: 'Dimension'
        }
      ],
      Data: 'Test'
    },
    {
      Title: `Ver stock`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `inventory`,
      Color: `primary`,
      Data: ''
    },
    {
      Title: `Eliminar`,
      Action: Structures.Enums.CL_ACTIONS.DELETE,
      Icon: `delete`,
      Color: `primary`,
      Data: ''
    }
  ]
  editableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'ItemDescription',
      Permission: {Name: 'Sales_Documents_EditDescriptionItemLine'}
    },
    {
      ColumnName: 'UnitPrice',
      Permission: {Name: 'Sales_Documents_EditItemPrice'}
    },
    {
      ColumnName: 'DiscountPercent',
      Permission: {Name: 'Sales_Documents_EditItemDiscount'}
    },
    {
      ColumnName: 'CostingCode',
      Permission: {Name: 'Sales_Documents_EditLineCostingCode'}
    },
    {
      ColumnName: 'TaxCode',
      Permission: {Name: 'Sales_Documents_EditItemTax'}
    },
    {
      ColumnName: 'UoMEntry',
      Permission: {Name: 'Sales_Documents_EditLineUoM'}
    },
    {
      ColumnName: 'IdCurrency',
      Permission: {Name: 'Sales_Documents_EditLineCurrency'}
    },
    {
      ColumnName: 'TaxOnly',
      Permission: {Name: 'Sales_Documents_BillDiscountedProducts'}
    }
  ];
  editableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  headerTableColumns: { [key: string]: string } = {
    Id: '#',
    ItemCode: 'Código',
    ItemDescription: 'Descripción',
    CostingCode: 'C.Costo',
    UnitPrice: 'Precio',
    LastPurchasePrice:'Precio costo',
    IdCurrency: 'Moneda',
    Quantity: 'Cantidad',
    DiscountPercent: 'Descuento',
    TaxOnly: 'Bonificado',
    TaxCode: 'Impuesto',
    WhsName: 'Almacén',
    UoMEntry: 'U.Medida',
    DistNumber: 'Serie',
    BinCode: 'Ubicación',
    Total: 'Total',
    VATLiable: 'Sujeto a impuestos'
  };
  InputColumns: IInputColumn[] = [
    {ColumnName: 'UnitPrice', FieldType: 'number'},
    {ColumnName: 'Quantity', FieldType: 'number'},
    {ColumnName: 'DiscountPercent', FieldType: 'number'},
    {ColumnName: 'CostingCode', FieldType: 'text'},
    {ColumnName: 'ItemDescription', FieldType: 'text'},
  ];
  actionButtons!: IActionButton[];
  dropdownDiffList: DropdownList = {};
  dropdownDiffBy = 'IdDiffBy';
  IgnoreColumns!: string[];
  PropertysIgnoreColumns: string[] = [];
  uom: DropdownElement[] = [];
  curr: DropdownElement[] = [];
  //#endregion


  //mapped Table
  lineMappedDisplayColumns: ULineMappedColumns<IDocumentLine, IPermissionbyUser> = {
    dataSource: [] as IDocumentLine[],
    inputColumns: this.InputColumns,
    editableFieldConf: this.editableFieldConf,
    renameColumns: this.headerTableColumns,
    tooltipsPosition: {rows: 'above', cells: 'right'},
    iconColumns: undefined,
    markAsCheckedValidation: undefined,
    stickyColumns: [
      {Name: 'Total', FixOn: 'right'},
      {Name: 'Options', FixOn: 'right'}
    ],

    ignoreColumns: ['InventoryItem', 'PurchaseItem', 'SalesItem', 'ItemName', 'OnHand',
      'UnitPriceFC', 'IsCommited', 'OnOrder', 'WhsCode', 'ItemClass',
      'ForeignName', 'Frozen', 'Series', 'U_IVA', 'BarCode', 'ItemBarCodeCollection',
      'ItemPrices', 'Rate', 'TotalFC', 'LineNum', 'BaseLine', 'BaseEntry', 'BaseType',
      'UnitPriceCOL', 'TotalCOL', 'UoMMasterData', 'ManBtchNum',
      'ManSerNum', 'DocumentLinesBinAllocations', 'SysNumber', 'SerialNumbers', 'BatchNumbers',
      'TotalDescFC', 'TotalDescCOL', 'TotalImpFC', 'TotalImpCOL', 'WarehouseCode', 'TaxRate',
      'IdDiffBy', 'LineTotal', 'Udfs', 'LastPurchasePriceFC', 'TreeType', 'BillOfMaterial',
      'ManBinLocation', 'RowColor', 'FatherCode', 'LineStatus', 'RowMessage', 'LockedUnitPrice',
      'LinesCurrenciesList', 'CurrNotDefined', 'Currency','QuantityOriginal','HideComp','HasGroup',
      'CostingCode2', 'CostingCode3', 'CostingCode4', 'CostingCode5','IsAServerLine','Freight','ShipToCode']
  }

  //#region Udfs
  udfsDataHeader: IUdf[] = [];
  udfsLinesValue: UdfSourceLine[] = [];
  udfsValue: IUdf[] = [];
  udfsPaymentValue: IUdf[] = [];
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsPaymentDevelopment: IUdfDevelopment[] = [];
  udfsLines: IUdfContext[] = [];
  udfGroups : IUdfGroup[] = [];
  udfsWithholding: IUdfContext[] = [];

  configureUdfGroup: boolean = false;
  UdfWithoutGroupId: string = 'UdfWithoutGroup';
  Title: string = 'Udfs';
  ConfiguredUdfEndPoint: string = `Udfs/GetUdfConfigured`;
  Category: string = 'OINV';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = '';
  hasUdfsWithGroup: boolean[] = [];
  hasUdfsWithoutGroup: boolean = true;
  lastUdfGroupTarget: string = '';
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || '';
  localCurrency!: ICurrencies;

  //#endregion

  //#region component search
  searchModalId = "searchModalId";
  searchWarehouseModalId = "searchWarehouseModalId";
  searchItemModalId = "searchItemModalId";
  //#endregion
  DownPaymentsToDraw: IDownPaymentsToDraw[] = [];

  documentAttachment: IDocumentAttachment = {
    AbsoluteEntry: 0,
    Attachments2_Lines: []
  } as IDocumentAttachment;
  attachmentFiles: File[] = [];
  attachmentTableId: string = "DocumentAttachmentTableId";
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
  ValidateAttachmentsTables?: IValidateAttachmentsSetting=undefined;
  IsVisibleAttachTable:boolean=false;

  /**
   * Contains object for print report setting
   */
  reportConfigured!:  IPrintFormatSetting;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  isDrafts: boolean = false;
  requestingItem: boolean = false;
  private onScanCode$ = new Subject<string>();
  scannedCode: string = '';
  IsPartialPay:FormControl = new FormControl(false);
  canChangePartialPrice: boolean = true;
  blanketAgreements :IBlanketAgreements[] = [];
  /**
   * is variable to know if the user has permission to create a draft
   */
  canCreateDraft: boolean = true;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private businessPartnersService: BusinessPartnersService,
    private overlayService: OverlayService,
    private router: Router,
    private alertsService: AlertsService,
    private itemService: ItemsService,
    private dimensionService: DimensionsService,
    private salesDocumentService: SalesDocumentService,
    private modalService: ModalService,
    private commonService: CommonService,
    private matDialog: MatDialog,
    private binLocationsService: BinLocationsService,
    private batchesService: BatchesService,
    private reportsService: ReportsService,
    private salesMenService: SalesPersonService,
    private priceListService: PriceListService,
    private paytermsService: PayTermsService,
    private exchangeRateService: ExchangeRateService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private settingService: SettingsService,
    private permissionUserService: PermissionUserService,
    private accountsService: AccountsService,
    private terminalUsersService: TerminalUsersService,
    private ordersServicePreviewService: OrdersServicePreviewService,
    private udfsService: UdfsService,
    private lealtoService: LealtoService,
    private tappService: TappService,
    private printerWorkerService: PrinterWorkerService,
    private currenciesService: CurrenciesService,
    private attachmentService: AttachmentsService,
    private draftService:DraftService,
    private masterDataService: MasterDataService,
    private agreementsService:BlanketAgreementsService,
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

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.subscriptions$.unsubscribe();
  }

  ngAfterViewInit() {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.docEntry && this.docEntry > 0) {
        this.router.navigateByUrl('/').then(() => {
          this.router.navigate(['sales', 'documents', this.currentUrl])
        })
      }
    });
    this.OnLoad();
  }

  //#region totales
  public GetTotals(): void {

    try {
      let isDownPayment = this.controllerToSendRequest === 'DownPayments';

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
      this.totalWithoutTaxFC = 0;
      this.totalRetention = 0;
      this.totalRetentionFC = 0;
      this.totalAutRetention = 0;
      this.totalAutRetentionFC = 0;

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
          if(holdingTax.WithholdingType == 'AUT'){
            this.totalAutRetention = ((Math.round(this.totalAutRetention + ((holdingTax.Rate/100) * ((holdingTax.BaseType == 'N') ? this.totalWithoutTax : this.tax) * (holdingTax.PrctBsAmnt/100)) * DECS) / DECS + Number.EPSILON) * DECS) / DECS;
            this.totalAutRetentionFC = ((Math.round(this.totalAutRetentionFC + ((holdingTax.Rate/100) * ((holdingTax.BaseType == 'N') ? this.totalWithoutTaxFC : this.taxFC) * (holdingTax.PrctBsAmnt/100)) * DECS) / DECS + Number.EPSILON) * DECS) / DECS;
          }

          this.totalRetention = ((Math.round(this.totalRetention + ((holdingTax.Rate/100) * ((holdingTax.BaseType == 'N') ? this.totalWithoutTax : this.tax) * (holdingTax.PrctBsAmnt/100)) * DECS) / DECS + Number.EPSILON) * DECS) / DECS;
          this.totalRetentionFC = ((Math.round(this.totalRetentionFC + ((holdingTax.Rate/100) * ((holdingTax.BaseType == 'N') ? this.totalWithoutTaxFC : this.taxFC) * (holdingTax.PrctBsAmnt/100)) * DECS) / DECS + Number.EPSILON) * DECS) / DECS;
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

      this.total = this.total - this.totalRetention;
      this.totalFC = this.totalFC - this.totalRetention;

    } catch (e) {
      console.log(e);
    }

  }

  public DisplayTotal(_option: number): number {
    if (_option === 1) {
      if (this.localCurrency?.Id === this.currentCurrency) {
        return this.totalFC;
      } else {
        return this.total;
      }
    } else {
      {
        if (this.localCurrency?.Id === this.currentCurrency) {
          return this.total;
        } else {
          return this.totalFC;
        }
      }
    }
  }

  public DisplaySubtotal(): number {
    if (this.localCurrency?.Id === this.currentCurrency) {
      return this.totalWithoutTax;
    } else {
      return this.totalWithoutTaxFC;
    }
  }

  public DisplayDiscount(): number {
    if (this.localCurrency?.Id === this.currentCurrency) {
      return this.discount;
    } else {
      return this.discountFC;
    }
  }

  public DisplayTaxes(): number {
    if (this.localCurrency?.Id === this.currentCurrency) {
      return this.tax;
    } else {
      return this.taxFC;
    }
  }

  /**
   * Calculates and returns the total retention amount for an invoice.
   * @returns The total retention amount.
   */
  public DisplayRetention(): number {
    if (this.localCurrency?.Id === this.currentCurrency) {
      return this.totalRetention;
    } else {
      return this.totalRetentionFC;
    }
  };

  public DisplayDownPayments(): number {
    if (this.localCurrency?.Id === this.currentCurrency) {
      return this.TotalDiscountDownPayment;
    } else {
      return this.TotalDiscountDownPaymentFC;
    }
  }
  public DisplayDownPaymentsPartial(): number {
    if (this.localCurrency?.Id === this.currentCurrency) {
      return this.DownPaymentPartialTotal;
    } else {
      return this.DownPaymentPartialTotalFC;
    }
  }

  public GetSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id === this.documentForm.controls['DocCurrency'].value)?.Symbol || '';
  }

  public GetConversionSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id !== this.documentForm.controls['DocCurrency'].value)?.Symbol || '';
  }

  /**
   * Metodo redondeo cantidades de items con decimales
   * @param num
   * @returns
   */
  private Decimal(num: number): number {

    let m: number = +((Math.abs(num) * 100).toPrecision(15));

    return Math.round(m) / 100 * Math.sign(num);

  }

  /**
   * Calculate the total edited line
   * @param _index - The index for which the total edited lines will be calculated.
   * @constructor
   */
  public LineTotal(_index: number): void {

    const priceCOL = +this.lines[_index]?.UnitPriceCOL ?? 0;
    const priceFC = +this.lines[_index]?.UnitPriceFC ?? 0;

    let disc = this.lines[_index]?.DiscountPercent ?? 0;

    const qty = +this.lines[_index].Quantity;

    let lineTotal = +((qty * priceCOL).toString());
    let lineTotalFC = +((qty * priceFC).toString());

    const taxamount =  this.lines[_index].VATLiable=='NO'? 0 :((lineTotal * ((this.lines[_index]?.TaxRate ?? 0) / 100)));
    const taxamountFC =  this.lines[_index].VATLiable=='NO'? 0 :((lineTotalFC * ((this.lines[_index]?.TaxRate ?? 0) / 100)));

    lineTotal = +((lineTotal + taxamount));
    lineTotal = +((lineTotal - lineTotal * (disc / 100)));
    lineTotal = +(lineTotal.toFixed(this.DecimalTotalLine));

    lineTotalFC = +((lineTotalFC + taxamountFC));
    lineTotalFC = +((lineTotalFC - lineTotalFC * (disc / 100)));
    lineTotalFC = +(lineTotalFC.toFixed(this.DecimalTotalLine));

    this.lines[_index].TotalCOL = lineTotal;
    this.lines[_index].TotalFC = lineTotalFC;
    this.lines[_index].Total = this.localCurrency.Id === this.currentCurrency ? lineTotal : lineTotalFC;
    this.lines[_index].Quantity = qty;

  }

  //#endregion

  //#region loadData

  private OnLoad(): void {
    Repository.Behavior.SetTokenConfiguration({token: 'Share', setting: 'apiURL', value: ''});
    Repository.Behavior.SetTokenConfiguration({
      token: 'Tapp',
      settings: {getURL: 'api/Tapp/', postURL: 'api/Tapp/'},
      override: true
    });
    Repository.Behavior.SetTokenConfiguration({
      token: 'Lealto',
      settings: {getURL: 'api/Lealto/', postRedeemURL: 'api/Lealto/Redimir/', postAccumulateURL: 'api/Lealto/'},
      override: true
    });

    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);

    this.PinpadConfiguration();
    this.LoadForm();
    this.SelectPayTerms();
    this.HandleResolvedData();
    this.DefineDocument();
    this.LoadSubscriptions();
    this.ValidatePermissionToAvailableDraft();
    this.ReadQueryParameters();
    this.SetInitialData();
    this.ConfigDropdownInTable();
    this.RegisterActionButtonsEvents();
    this.RegisterPaymentModalEvents();
    this.RegisterUdfEventsWithoutGroup();
    this.LoadUdfsGroups();
    this.RegisterTableEvents();
    this.InitDocument();
    this.ChangeWarehouse();
    this.RefreshRate();
    this.LoadDataUdfGroup();
    this.ValidatePermissionToEditDate();
    this.ValidateAttachTable();
    this.ListenScan();
    this.ValidateColumnsItems();
    this.FilterButtonsByPermission();
    this.ValidateListNum();
  }

  private PinpadConfiguration(): void {

    Repository.Behavior.SetTokenConfiguration({token: 'Share', setting: 'apiURL', value: environment.apiUrl});
    Repository.Behavior.SetTokenConfiguration({token: 'PinPad', setting: 'apiURL', value: 'PinpadServicePP'});
    Repository.Behavior.SetTokenConfiguration({
      token: 'PinPad',
      setting: 'voidedVoucherPath',
      value: 'api/Reports/PrintVoucher'
    });
  }

  private LoadForm(): void {
    this.documentForm = this.fb.group({
      CardCode: ['', [Validators.required]],
      CardName: ['', [Validators.required]],
      PaymentGroupCode: ['', [Validators.required]],
      PriceList: ['', [Validators.required]],
      SalesPersonCode: ['', [Validators.required]],
      DocCurrency: [''],
      Comments: ['',],
      TipoDocE: [''],
      DocDate: ['',[Validators.required]],
      DocDueDate: ['',[Validators.required]],
      TaxDate: ['',[Validators.required]],
      Quantity: [1, [Validators.min(1)]],
      PartialAmount: [0, [Validators.min(0)]],
      IsDownPayment: [false],
      IsModalProcess: [false],
    });
  }

  private DefineDocument(): void {

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;
    this.IgnoreColumns = this.lineMappedColumns.IgnoreColumns || [];
    this.PropertysIgnoreColumns = [];

    if(urlSegment?.length > 0 && urlSegment[2]){
      this.currentUrl = urlSegment[2].path;
    }
    if(!this.userPermissions.some(persmision=>persmision.Name=='Sales_Document_ViewPriceCost')){
      this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
    }
    if(!this.userPermissions.some(permission => permission.Name == 'Sales_Document_ViewSeriesColumn')){
      this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
    }

    switch (this.currentUrl) {

      case 'quotations':

        this.controllerToSendRequest = 'Quotations';
        this.typeDocument = DocumentType.Quotations;
        this.PropertysIgnoreColumns = ['BinCode', 'DistNumber'];
        for (let prp of this.PropertysIgnoreColumns) {
          this.IgnoreColumns?.push(prp);
        }
        this.lineMappedDisplayColumns.ignoreColumns = this.IgnoreColumns;
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        this.currentTitle = Titles.Cotizacion;
        this.currentReport = 'SaleOffer';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;
        this.docDueDateLabel = 'Válido hasta'
        this.canChangeDeliveryAddres = this.userPermissions.some(permission => permission.Name === 'W_Sales_Quotations_ChangeDeliveryAddress');
       

        break;
      case 'orders':

        this.controllerToSendRequest = 'Orders';
        this.typeDocument = DocumentType.Orders;
        let IgnoreColumns = this.lineMappedColumns.IgnoreColumns;
        let PropertysIgnoreColumns = ['BinCode'];
        for (let prp of PropertysIgnoreColumns) {
          IgnoreColumns?.push(prp);
        }
        this.lineMappedDisplayColumns.ignoreColumns = IgnoreColumns
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        this.currentTitle = Titles.Orden;
        this.currentReport = 'SaleOrder';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;
        this.docDueDateLabel = 'Fecha de entrega'

        //Disable control when edit order
        if(this.preloadedDocActionType == PreloadedDocumentActions.EDIT){
          this.documentForm.controls['CardName'].disable();
        }
        this.canChangeDeliveryAddres = this.userPermissions.some(permission => permission.Name === 'W_Sales_Orders_ChangeDeliveryAddress');

        break;
      case 'invoices':
        this.controllerToSendRequest = 'Invoices';
        this.typeDocument = DocumentType.Invoices;
        this.typeInvoice = TypeInvoices.INVOICE;
        this.currentTitle = Titles.Factura;
        this.currentReport = 'Invoices';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;
        this.canChangeDeliveryAddres = this.userPermissions.some(permission => permission.Name === 'W_Sales_Invoices_ChangeDeliveryAddress');

        break;
      case 'down-payments':

        this.controllerToSendRequest = 'DownPayments';
        this.typeDocument = DocumentType.ArDownPayments;
        this.currentTitle = Titles.ArDownPayment;
        this.currentReport = 'ArDownPayment';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;
        this.canChangeDeliveryAddres = this.userPermissions.some(permission => permission.Name === 'W_Sales_DownPayments_ChangeDeliveryAddress');


        break;

      case 'reserve-invoice':
        this.controllerToSendRequest = 'Invoices';
        this.typeDocument = DocumentType.Invoices;
        this.typeInvoice = TypeInvoices.RESERVE_INVOICE;
        this.currentTitle = Titles.ReserveInvoice;
        this.currentReport = 'ReserveInvoice';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;
        this.canChangeDeliveryAddres = this.userPermissions.some(permission => permission.Name === 'W_Sales_ReserveInvoice_ChangeDeliveryAddress');


        break;

      case 'delivery':
        this.controllerToSendRequest = 'DeliveryNotes';
        this.typeDocument = DocumentType.DeliveryNotes;
        this.currentTitle = Titles.Entrega;
        this.currentReport = 'DeliveryNotes';
        this.DBODataEndPoint = this.DBODataEndPoint ? this.DBODataEndPoint : this.typeDocument;
        this.canChangeDeliveryAddres = this.userPermissions.some(permission => permission.Name === 'W_Sales_Delivery_ChangeDeliveryAddress');

        break;

    }
  }

  private LoadSubscriptions(): void {
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

  private HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {

          const resolvedData: ISaleDocumentComponentResolvedData = this.activatedRoute.snapshot.data['resolvedData'];

          if (resolvedData) {

            this.currentSession.Rate = resolvedData.ExchangeRate.Rate;
            this.DefaultBusinessPartner = resolvedData.BusinessPartner;
            this.userLogged = resolvedData.UserAssign;
            this.items = resolvedData.Items;
            this.salesPerson = resolvedData.SalesPersons;
            this.payTerms = resolvedData.PayTerms;
            this.priceList = resolvedData.PriceList ?? [];
            this.warehouse = resolvedData.Warehouse;
            this.taxes = resolvedData.Taxes;
            this.currencies = resolvedData.Currency;
            this.localCurrency = this.currencies.find(c => c.IsLocal)!;
            this.typeDocE = resolvedData.TypeDocE;
            this.exchangeRate = resolvedData.ExchangeRate;
            this.userPermissions = resolvedData.Permissions;
            this.preloadedDocument = resolvedData.PreloadedDocument;
            this.ValidateAttachmentsTables = resolvedData?.ValidateAttachmentsTables??undefined;
            this.documentAttachment = {
              AbsoluteEntry: this.preloadedDocument?.AttachmentEntry ?? 0,
              Attachments2_Lines: (resolvedData.AttachmentLines ?? []).map((attL, index) => ({...attL, Id: index + 1}))
            };
            this.settings = resolvedData.Settings;
            this.Terminals = resolvedData.Terminals;
            this.udfsLines = resolvedData.UdfsLines;
            this.userLogged.SlpCode = +this.userLogged?.SlpCode;
            this.udfsDevelopment = resolvedData.UdfsDevelopment;
            this.udfsLinesValue = resolvedData.UdfsData || [];
            this.udfsDataHeader = resolvedData.UdfsDataHeader || [];
            this.udfsPaymentDevelopment = resolvedData.UdfsPaymentDevelopment;
            this.availableWithholdingTax = resolvedData?.WithholdingTax || [];
            this.udfsWithholding = resolvedData.UdfsWithholding;

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
                let dataCompany = this.companyPrintFormat.find(x => x.CompanyId === this.selectedCompany?.Id) as IPrintFormatSetting;

                if(dataCompany){
                  this.reportConfigured = dataCompany
                }
              }

              if(this.companyValidateAutomaticPrinting && this.companyValidateAutomaticPrinting.length){
                let dataCompany = this.companyValidateAutomaticPrinting.find(x => x.CompanyId === this.selectedCompany?.Id) as IValidateAutomaticPrintingsSetting;

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

      case 'quotations':
        this.canChangeDocDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsQuotationsChangeDocDate);
        this.canChangeDocDueDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsQuotationsChangeDocDueDate);
        this.canChangeTaxDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsQuotationsChangeTaxDate);
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
      case 'orders':
        this.canChangeDocDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsOrdersChangeDocDate);
        this.canChangeDocDueDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsOrdersChangeDocDueDate);
        this.canChangeTaxDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsOrdersChangeTaxDate);
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
      case 'invoices':
        this.canChangeDocDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsInvoicesChangeDocDate);
        this.canChangeDocDueDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsInvoicesChangeDocDueDate);
        this.canChangeTaxDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsInvoicesChangeTaxDate);
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
        this.canChangeDocDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsDownPaymentsChangeDocDate);
        this.canChangeDocDueDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsDownPaymentsChangeDocDueDate);
        this.canChangeTaxDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsDownPaymentsChangeTaxDate);
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

      case 'reserve-invoice':
        this.canChangeDocDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsReserveInvoiceChangeDocDate);
        this.canChangeDocDueDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsReserveInvoiceChangeDocDueDate);
        this.canChangeTaxDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsReserveInvoiceChangeTaxDate);
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

      case 'delivery':
        this.canChangeDocDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsDeliveryChangeDocDate);
        this.canChangeDocDueDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsDeliveryChangeDocDueDate);
        this.canChangeTaxDate = this.userPermissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsDeliveryChangeTaxDate);
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
   * Load document information in view
   * @private
   */
  private setData(): void {


    this.documentForm.patchValue({
      ...this.preloadedDocument
    });


    this.isCashCustomer = this.DefaultBusinessPartner?.CashCustomer || false;
    this.isEditDocument = this.preloadedDocActionType === PreloadedDocumentActions.EDIT;

    this.feData = {
      IdType: this.preloadedDocument?.IdType,
      Identification: this.preloadedDocument?.Identification,
      Email: this.preloadedDocument?.Email,
      Nombre: this.preloadedDocument?.CardName
    } as IFeData;

    this.currentCurrency = this.documentForm.controls['DocCurrency'].value;

    this.docEntry = this.preloadedDocument?.DocEntry ?? 0;
    this.docNum = this.preloadedDocument?.DocNum ?? 0;


    this.indexMaxUpdate = this.preloadedDocument?.DocumentLines.reduce((acc, i) => (i.LineNum > acc.LineNum ? i : acc)).LineNum || 0;
    this.IndexMinUpdate = this.preloadedDocument?.DocumentLines.reduce((acc, i) => (i.LineNum < acc.LineNum ? i : acc)).LineNum || 0;

    this.lines = Copy<IDocumentLine[]>(this.preloadedDocument?.DocumentLines ?? []);

    this.withholdingTaxSelected = this.availableWithholdingTax
      .filter((withholding: IWithholdingTax) =>
        this.preloadedDocument?.WithholdingTaxDataCollection?.some(wt => wt.WTCode === withholding.WTCode)
      ).map((withholding: IWithholdingTax) => ({ ...withholding, Selected: true } as IWithholdingTaxSelected));

    if (this.preloadedDocActionType === PreloadedDocumentActions.COPY) {
      this.lines = this.lines.filter(x => x.LineStatus != 'C');
    }
    let HasGroup="";
    let HideComp:string |undefined="";
    this.lines.forEach((x, index: number) => {
      //En caso de que no tenga moneda la linea, se le asigna la de la cabecera
      x.Currency = x.Currency || this.preloadedDocument?.DocCurrency;

      if(x.TreeType==ListMaterial.iSalesTree || x.TreeType==undefined){
        HasGroup = this.generateHash(8);
        x.HasGroup=HasGroup;
        HideComp=x.HideComp;
        x.QuantityOriginal=x.Quantity;
      }else{
        if(x.TreeType==ListMaterial.iIngredient) {
          x.HasGroup = HasGroup;
          x.HideComp = HideComp;
          x.QuantityOriginal = x.Quantity;
        }
      }
      let unitPrice = this.localCurrency.Id === (x.Currency ?? '') ? x.UnitPrice : CLTofixed(this.DecimalTotalDocument, (x.UnitPrice * this.currentSession.Rate));
      let unitPriceFC = this.localCurrency.Id !== x.Currency ? x.UnitPrice : CLTofixed(this.DecimalTotalDocument , (x.UnitPrice / this.currentSession.Rate));
      x.UoMEntry = +x.UoMEntry;
      x.IdDiffBy = index + 1;
      x.UoMMasterData = x.UoMMasterData ?? [];
      x.UnitPriceFC = unitPriceFC;
      x.UnitPriceCOL = unitPrice;
      x.WhsName = this.warehouse.find(y => y.WhsCode === x.WarehouseCode)?.WhsName || '';
      x.BaseEntry = this.ValidateBaseEntry( this.preloadedDocument!);
      x.BaseLine = x.LineNum;
      x.ManBinLocation = this.warehouse.find(y => y.WhsCode === x.WarehouseCode)?.BinActivat ?? ''
      x.BaseType = this.GetBaseType();
      x.SerialNumbers = x.ManSerNum === 'Y' ? this.LoadSerial(x.SysNumber, x.DistNumber, x.Quantity) : [];
      x.TaxOnly = x.TaxOnly === 'Y';
      x.LinesCurrenciesList = this.GetLinesCurrencies(x);
      x.CurrNotDefined = this.CurrLinesDifined(x);
      x.IdCurrency = x.LinesCurrenciesList.find(y => y.DocCurrency === x.Currency)?.Id ?? '0';
      x.LineStatus = this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE ? 'O' : x.LineStatus;
      this.ConfigDropdownDiffListTable(x);
      this.LineTotal(index);
      if (this.udfsLines?.length) {
        SetUdfsLineValues(this.udfsLines, x, this.dropdownDiffList);
      }
    });

    if (this.lines.some(x => x.Currency !== this.preloadedDocument?.DocCurrency)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Existen líneas con moneda diferente a el encabezado del documento'
      });
    }
  }

  private GetBaseType(): number {

    let baseType: number = -1;

    if (this.preloadedDocActionType === PreloadedDocumentActions.COPY) {
      switch (this.actionDocumentFrom?.typeDocument) {
        case DocumentType.Invoices:
          baseType = CopyFrom.OINV;
          break;
        case DocumentType.Orders:
          baseType = CopyFrom.ORDR;
          break;
        case DocumentType.Quotations:
          baseType = CopyFrom.OQUT;
          break;
      }
    }

    return baseType;
  }

  private GetRowColorMessage(_item: IDocumentLine): void {
    let message = '';
    let color = '';

    let canBillWithZeroPrice = this.userPermissions.some(p => p.Name === 'Sales_Documents_BillWithZeroPrice');

    let currency = this.changeCurrencyLines ? _item.Currency : this.currentCurrency;


    if (_item.TreeType != ListMaterial.iSalesTree && this.localCurrency.Id === currency) {
      if (+_item.UnitPrice <= +_item.LastPurchasePrice && +_item.UnitPrice !== 0) {
        color = RowColors.BeigePink;
        message = `Costo del artículo es mayor o igual al precio de venta. Precio venta: ${+_item.UnitPrice} Precio costo: ${+_item.LastPurchasePrice}`;
      } else if (+_item.UnitPrice == 0 && !canBillWithZeroPrice) {
        color = RowColors.BeigePink;
        message = 'No tiene precio';
      }
    }

    if (_item.TreeType != ListMaterial.iSalesTree && this.localCurrency.Id !== currency) {
      if (+_item.UnitPrice <= +_item.LastPurchasePriceFC && +_item.UnitPrice !== 0) {
        color = RowColors.BeigePink;
        message = `Costo del artículo es mayor o igual al precio de venta. Precio venta: ${+_item.UnitPrice} Precio costo: ${+_item.LastPurchasePriceFC}`;
      } else if (+_item.UnitPriceFC == 0 && !canBillWithZeroPrice) {
        color = RowColors.BeigePink;
        message = 'No tiene precio';
      }
    }


    const QUANTITYTOTAL = this.lines
      .filter(
        (y) =>
          y.ItemCode == _item.ItemCode &&
          _item.InventoryItem === 'Y' &&
          y.WarehouseCode == _item.WarehouseCode &&
          _item.ItemClass != ItemsClass.Service &&
          y.DistNumber === _item.DistNumber &&
          y.BinCode === _item.BinCode
      )
      .reduce((p, c) => {
        return p + c.Quantity;
      }, 0);

    if (this.vldInventoryvldInventory.ValidateInventory &&
      _item.OnHand < (this.Decimal(+QUANTITYTOTAL)) &&
      _item.InventoryItem === 'Y' &&
      _item.ItemClass != ItemsClass.Service
    ) {
      color = RowColors.BeigePink;
      message = `Sin stock almacén ${_item.WhsName
      }, solicitado: ${(this.Decimal(+QUANTITYTOTAL))}, disponible: ${_item.OnHand
      }`;
    }
    if (_item.TreeType === ListMaterial.iIngredient) {
      color = RowColors.PaleBlue;
    } else if (_item.TreeType === ListMaterial.iSalesTree) {
      color = RowColors.LightBlue;
    } else if (_item.LineStatus === 'C') {
      color = RowColors.LightGray;
      message = 'Línea estado cerrada'
    }
    _item.RowMessage = message;
    _item.RowColor = color;

  }


  private ConfigDropdownInTable(): void {
    let dropTax: DropdownElement[] = [];
    this.taxes.forEach(x => {
      let value = {
        key: x.TaxCode,
        value: x.TaxCode,
        by: ''
      }
      dropTax.push(value);
    });

    this.dropdownList = {
      TaxCode: dropTax as DropdownElement[]
    };
  }

  /**
   * Load business partner selected
   * @param _businessPartner
   * @constructor
   * @private
   */
  private LoadDataBp(_businessPartner: IBusinessPartner): void {
    let priceList = this.priceList.find(x => x.ListNum === _businessPartner?.PriceListNum)?.ListNum;

    if (_businessPartner) {
      this.isCashCustomer = _businessPartner.CashCustomer;

      let slpCode = this.salesPerson.find(x => x.SlpCode === this.userLogged.SlpCode)?.SlpCode;

      this.documentForm.patchValue({
        CardName: _businessPartner.CardName,
        CardCode: _businessPartner.CardCode,
        PriceList: _businessPartner?.PriceListNum ? this.priceList.find(x => x.ListNum === _businessPartner?.PriceListNum)?.ListNum : this.priceList[0]?.ListNum,
        DocCurrency: priceList ? this.priceList.find(x => x.ListNum === _businessPartner?.PriceListNum)?.PrimCurr : this.priceList.find(x => x.ListNum === this.priceList[0]?.ListNum)?.PrimCurr,
        PaymentGroupCode: this.payTerms.find(x => x.GroupNum === _businessPartner.PayTermsGrpCode)?.GroupNum,
        SalesPersonCode: (slpCode != -1) ? slpCode : _businessPartner.SalesPersonCode
      });
      
      this.currentCurrency = this.documentForm.controls['DocCurrency'].value;
      this.LoadBlankeetAgrements(_businessPartner.CardCode, _businessPartner);
      this.retentionProcessEnabled && this.GetWithholdingTaxByBP(_businessPartner.CardCode);
    }
  }

//#endregion

  //#region table lines
  private RegisterActionButtonsEvents(): void {
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
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
   * Method to registrer udf events
   * @constructor
   * @private
   */
  private RegisterUdfEventsWithoutGroup(): void {

    Register(this.UdfWithoutGroupId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfWithoutGroupId, CL_CHANNEL.OUTPUT_2, this.ContentUdfWithoutGroup, this.callbacks);
  }

  /**
   * Method to registrer udf events
   * @constructor
   * @private
   */
  private RegisterUdfEventsWithGroup(): void {

    let index = 0;
    for (index; index < this.udfGroups.length; index++) {
      Register(index.toString(), CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    }

    index = 0;
    for (index; index < this.udfGroups.length; index++) {
      Register<CL_CHANNEL>(index.toString(), CL_CHANNEL.OUTPUT_2, this.ContentUdfGroup, this.callbacks);
    }
  }

  /**
   * Method to registrer table events
   * @constructor
   * @private
   */
  private RegisterTableEvents(): void {
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.GetRecordsEditField, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalItemRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchWarehouseModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalShowWarehouseRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);
  }

  public GetRecordsEditField = (_event: ICLEvent): void => {
    try {


      let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IDocumentLine>;

      if (+(ALL_RECORDS.Row.Quantity) <= 0 || +(ALL_RECORDS.Row.UnitPrice) < 0 || +(ALL_RECORDS.Row.DiscountPercent) < 0) {
        this.InflateTableLines();
        return;
      }
      // Check item with serie quantity
      if(ALL_RECORDS.Row.ManSerNum === 'Y' && ALL_RECORDS.Row.Quantity > 1)
      {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Solo se permite cantidad 1 para artículos con serie, ${ALL_RECORDS.Row.ItemCode} - ${ALL_RECORDS.Row.ItemName}`
        });
        // Inflate the table to not make updates to lines
        this.InflateTableLines();
        return;
      }

      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);

      if (ALL_RECORDS.Row.LineStatus === 'C') {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'No se puede modificar ítem en estado cerrado.'
        });
        this.InflateTableLines();
        return;
      }

      //#region LISTA DE MATERIALES para los  hijos del material
      if (ALL_RECORDS.Row.TreeType === ListMaterial.iIngredient) {
          if((this.lines[INDEX].UnitPrice != ALL_RECORDS.Row.UnitPrice ||this.lines[INDEX].DiscountPercent != ALL_RECORDS.Row.DiscountPercent||
            this.lines[INDEX].CostingCode != ALL_RECORDS.Row.CostingCode) && ALL_RECORDS.Row.HideComp=="Y"){
            this.InflateTableLines();
            return;
          }else{
            if(this.lines[INDEX].Quantity != ALL_RECORDS.Row.Quantity){
              this.lines[INDEX] = ALL_RECORDS.Row;
              this.LineTotal(INDEX);
              this.InflateTableLines();
              this.GetTotals();
            }
          }
      }


      //#region LISTA DE MATERIALES
      if (ALL_RECORDS.Row.TreeType === ListMaterial.iSalesTree && ALL_RECORDS.EventName === 'InputField') {
        if((this.lines[INDEX].UnitPrice != ALL_RECORDS.Row.UnitPrice ||this.lines[INDEX].DiscountPercent != ALL_RECORDS.Row.DiscountPercent||
          this.lines[INDEX].CostingCode != ALL_RECORDS.Row.CostingCode) && ALL_RECORDS.Row.HideComp=="N"){
          this.InflateTableLines();
          return;
        }
        this.lines.forEach(line => {
          if(line.HasGroup==ALL_RECORDS.Row.HasGroup){
            line.Quantity=ALL_RECORDS.Row.Quantity * line.QuantityOriginal;
          }
        });

        this.lines[INDEX] = ALL_RECORDS.Row;
        this.LineTotal(INDEX);
        this.InflateTableLines();
        this.GetTotals();
        return;
      }
      //#endregion

      // Establezco moneda de documento a linea si esta no tiene una
      if (!ALL_RECORDS.Row.Currency) {
        ALL_RECORDS.Row.Currency = this.currentCurrency;
      }

      switch (ALL_RECORDS.EventName) {
        case 'Dropdown':

          //#region CAMBIO LA SELECCION DE UNIDADES DE MEDIDA
          if (this.lines[INDEX].UoMEntry != ALL_RECORDS.Row.UoMEntry) {

            let uom = ALL_RECORDS.Row.UoMMasterData.find(x => x.UoMEntry === ALL_RECORDS.Row.UoMEntry);

            if (uom) {
              ALL_RECORDS.Row.UnitPriceFC = uom.UnitPriceFC
              ALL_RECORDS.Row.UnitPriceCOL = uom.UnitPrice;
              ALL_RECORDS.Row.UnitPrice = this.localCurrency.Id === (ALL_RECORDS?.Row?.Currency ?? '') ? uom.UnitPrice : uom.UnitPriceFC;
            }
          }
          //#endregion

          //#region CAMBIO LA SELECCION DE IMPUESTOS
          if (this.lines[INDEX].TaxCode != ALL_RECORDS.Row.TaxCode) {
            let taxSelected = this.taxes.find(x => x.TaxCode === ALL_RECORDS.Row.TaxCode);
            if(this.lines[INDEX].VATLiable=='NO'){
              ALL_RECORDS.Row.TaxRate=0;
            }
            else if (taxSelected) {
              ALL_RECORDS.Row.TaxRate = taxSelected?.TaxRate || 0;
            }
          }
          //#endregion

          //#region  CAMBIAR DE MONEDA EN LAS LINEAS
          if (this.changeCurrencyLines) {
            if (ALL_RECORDS.Row.IdCurrency != this.lines[INDEX].IdCurrency) {
              if (!ALL_RECORDS.Row.CurrNotDefined) {
                let data = ALL_RECORDS.Row.LinesCurrenciesList.find(x => x.Id === ALL_RECORDS.Row.IdCurrency);
                ALL_RECORDS.Row.Currency = data?.DocCurrency;
                ALL_RECORDS.Row.UnitPrice = data?.Price ?? 0;

                if (ALL_RECORDS.Row.Currency !== this.currentCurrency) {
                  this.alertsService.Toast({
                    type: CLToastType.INFO,
                    message: 'La moneda es diferente a la del encabezado del documento.'
                  });
                }
              }
              ALL_RECORDS.Row.UnitPriceFC = ALL_RECORDS.Row.Currency !== this.localCurrency.Id ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.exchangeRate.Rate).toFixed(this.DecimalUnitPrice));
              ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === (ALL_RECORDS?.Row?.Currency ?? '') ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.exchangeRate.Rate).toFixed(this.DecimalUnitPrice));
            }
          }
          //#endregion

          break;
        case 'InputField':

          ALL_RECORDS.Row.UnitPriceFC = ALL_RECORDS.Row.Currency !== this.localCurrency.Id ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.exchangeRate.Rate).toFixed(this.DecimalUnitPrice));
          ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === (ALL_RECORDS?.Row?.Currency ?? '') ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.exchangeRate.Rate).toFixed(this.DecimalUnitPrice));

          if (ALL_RECORDS.Row.DiscountPercent > this.userLogged.Discount) {
            ALL_RECORDS.Row.DiscountPercent = 0;
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El descuento no puede ser mayor a ${this.userLogged.Discount} que es lo permitido para este usuario.`
            });
          }

          ALL_RECORDS.Row.ManBtchNum !== 'Y' && ALL_RECORDS.Row.DocumentLinesBinAllocations && ALL_RECORDS.Row.DocumentLinesBinAllocations.length > 0 ? ALL_RECORDS.Row.DocumentLinesBinAllocations[0].Quantity = ALL_RECORDS.Row.Quantity : [];

          break;
        case 'Dropped':
          this.InflateTableLines();
          return;
      }

      ALL_RECORDS.Row.ManBinLocation = this.warehouse.find(x => x.WhsCode === ALL_RECORDS.Row.WarehouseCode)?.BinActivat ?? ''
      this.lines[INDEX] = ALL_RECORDS.Row;
      this.LineTotal(INDEX);
      this.InflateTableLines();
      this.GetTotals();

    } catch (error) {

    }
  }

  public RequestAllRecords = (): void => {
    try {
      const EVENT = {
        CallBack: CL_CHANNEL.DATA_LINE_4,
        Target: this.lineTableId,
      } as ICLEvent;

      this.linkerService.Publish(EVENT);
    } catch (error) {
      console.log(error);
    }
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
  /**
   * Method to update a table record
   * @param _event - event emitted from the table to edit
   * @constructor
   */
  public OnTableActionActivated = (_event: ICLEvent) : void  => {
    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as IDocumentLine;

      if (ACTION.LineStatus === 'C') {

        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'No se puede modificar ítem en estado cerrado.'
        });
        return;
      }

      switch (BUTTON_EVENT.Action) {

        case Structures.Enums.CL_ACTIONS.DELETE:

          if (ACTION.TreeType === ListMaterial.iSalesTree) {

            //Elimina el padre
            this.lines.splice(ACTION.Id - 1, 1);
            if (this.vldLineMode?.LineGroup) {
              //Elimina los hijos
              let billOfMAterial = this.lines.filter(x => x.FatherCode === ACTION.ItemCode);
              billOfMAterial?.forEach((material) => {
                let index = this.lines.findIndex(x => x.ItemCode === material.ItemCode);
                if (index >= 0) {
                  this.lines.splice(index, 1);
                }

              });
            }else{
              //Elimina los hijos
              let billOfMAterial = this.lines.filter(x => x.HasGroup === ACTION.HasGroup);
              billOfMAterial?.forEach((material) => {
                let index = this.lines.findIndex(x => x.HasGroup === material.HasGroup);
                if (index >= 0) {
                  this.lines.splice(index, 1);
                }

              });
            }

          } else if (ACTION.TreeType === ListMaterial.iIngredient) {

            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'El ítem no se puede eliminar, es un subordinado de una lista de material, si desea eliminarlo borre al ítem padre.'
            });
          } else {
            this.lines.splice(ACTION.Id - 1, 1);
          }

          this.uom = this.uom.filter(x => x.by !== ACTION.IdDiffBy);
          this.curr = this.curr.filter(x => x.by !== ACTION.IdDiffBy);

          // Update the drop-down list by filtering only on those UDF fields, the values associated with the deleted item
          Object.keys(this.dropdownDiffList)?.filter(key => key.includes('U_'))?.forEach((key) => {
            this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== ACTION.IdDiffBy);
          });

          this.InflateTableLines();
          this.GetTotals();

          break;
        case Structures.Enums.CL_ACTIONS.OPTION_1:
          this.OpenDialogStock(ACTION.Id - 1, ACTION.ItemCode, ACTION.WarehouseCode, ACTION.ManSerNum === 'Y');
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_2:
          this.GetBinAllocations(ACTION, ACTION.Id - 1, false).subscribe();
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_3:
          this.GetBatches(ACTION, ACTION.Id - 1).subscribe();
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_4:
          this.OpenDialogSeriesItems(ACTION.Id - 1, ACTION);
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_5:
          this.OpenDialogDimensionsItems(ACTION.Id - 1, ACTION);
          break;
      }
    }
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key)
    {
      case 'ADD':
        this.isDrafts=false;
        if (this.documentForm.invalid) {
          this.documentForm.markAllAsTouched();
          return;
        }

        this.RequestAllRecords();
        this.OnClickCreateOrUpdateDocument();
        break;
      case 'CLEAN':
        this.isDrafts=false;
        this.Clear();
        break;
      case 'UPDATE':
        this.isDrafts=false;
        if (this.documentForm.invalid) {
          this.documentForm.markAllAsTouched();
          return;
        }

        this.RequestAllRecords();
        this.OnClickCreateOrUpdateDocument();
        break;

      case 'ADDPRE':
        this.isDrafts=true;
        this.currentTitle = 'Preliminar';
        this.OnClickCreateOrUpdateDocument();

        break;
    }
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
      this.CreateDocumentWithPayment(this.paymentDocument, data.PaymentState, this.currentCurrency, this.currentSession.Rate);
    } else {
      if (data.Message) this.modalService.NextError({subtitle: data.Message, disableClose: true});
      this.paymentHolder = {} as IPaymentHolder;
      this.DownPaymentsToDraw = [];
      this.DownPaymentPartialTotal  = 0;
      this.DownPaymentPartialTotalFC = 0;
      this.paymentDocument = {} as IDocument;

    }
  }

  private Clear(): void {

    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: (callback => {
        this.RefreshData();
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
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

  private ValidateStockLinesList(): Observable<boolean> {


    if (this.vldInventoryvldInventory.ValidateInventory) {

      const AVAILABLE_INV =
        this.lines.find((x) => x.InventoryItem === 'Y' && x.ManBtchNum === 'N' && x.ManSerNum === 'N' &&
          (this.Decimal(+x.OnHand)) < (this.Decimal((this.lines
            .filter((y) => y.ItemCode === x.ItemCode &&
                y.DistNumber === x.DistNumber &&
              y.WarehouseCode === x.WarehouseCode &&
            y.BinCode === x.BinCode)
            .reduce((p, c) => {
              return p + c.Quantity;
            }, 0))))
        );

      this.linesGoodReceipt = [];

      if (AVAILABLE_INV) {

        if (this.controllerToSendRequest === 'Invoices') {

          let isPermissionCreateGoodReceipt = this.userPermissions.some(x => x.Name === 'Sales_Documents_CreateGoodReceipt');

          if (isPermissionCreateGoodReceipt) {

            let filterLines = this.lines.filter(
              (x) => x.InventoryItem === 'Y' && x.ManBtchNum === 'N' && x.ManSerNum === 'N' && +x.OnHand <
                this.Decimal(this.lines.filter((y) => y.ItemCode === x.ItemCode && y.WarehouseCode == x.WarehouseCode

                    )
                  .reduce((p, c) => {
                    return p + c.Quantity;
                  }, 0))
            );

            let filterLinesGroup = filterLines.filter((item, index) => {
              return (
                filterLines.findIndex((x) => x.ItemCode == item.ItemCode && x.WarehouseCode == item.WarehouseCode && x.BinCode == item.BinCode) == index
              );
            });


            this.overlayService.OnPost();
            return this.itemService.GetDataForGoodReceiptInvoice(filterLinesGroup.map((i) => encodeURIComponent(i.ItemCode))).pipe(
              map(res => {
                if (res && res.Data) {

                  filterLinesGroup.forEach((x) => {
                    let value = res.Data.find((i) => decodeURIComponent(i.ItemCode) === x.ItemCode);
                    let cantidad = this.lines
                      .filter(
                        (y) =>
                          y.ItemCode == x.ItemCode &&
                          y.WarehouseCode == x.WarehouseCode && y.BinCode == x.BinCode
                      )
                      .reduce((p, c) => {
                        return p + c.Quantity;
                      }, 0);

                    const LINE = {} as ILinesGoodReceip;
                    LINE.ItemCode = x.ItemCode;
                    LINE.ItemDescription = x.ItemDescription;
                    LINE.Quantity = +cantidad - x.OnHand;
                    LINE.OnHand = x.OnHand;
                    LINE.Solicited = +cantidad;
                    LINE.TaxCode = x.TaxCode;
                    LINE.UnitPrice = value ? value.LastPrice : 0;
                    LINE.DiscountPercent = x.DiscountPercent;
                    LINE.TaxRate = x.TaxRate;
                    LINE.Total = value ? +((value.LastPrice * (cantidad - x.OnHand)).toFixed(this.DecimalTotalLine)) : 0;
                    LINE.WarehouseCode = x.WarehouseCode;
                    LINE.AVGPrice = value ? value.AVGPrice : 0;
                    LINE.LastPurchasePrice = value ? value.LastPrice : 0;
                    LINE.DeviationStatus = value ? value.DeviationStatus : 0;
                    LINE.Message = value ? value.Message : '';
                    LINE.BinCode = x.BinCode;
                    LINE.DocumentLinesBinAllocations = x.DocumentLinesBinAllocations;
                    LINE.ManBinLocation = x.ManBinLocation;
                    LINE.WhsName = x.WhsName;
                    LINE.IdDiffBy = x.IdDiffBy;
                    LINE.CostingCode = x.CostingCode;
                    LINE.CostingCode2 = x.CostingCode2;
                    LINE.CostingCode3 = x.CostingCode3;
                    LINE.CostingCode4 = x.CostingCode4;
                    LINE.CostingCode5 = x.CostingCode5;

                    this.linesGoodReceipt.push(LINE);
                  });

                }
                return !!res;
              }),
              finalize(() => this.overlayService.Drop())
            )
          } else {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `Existen artículos que no cuentan con inventario, elimínelos para crear la factura.`
            });
            return of(false);
          }

        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `Sin stock, no hay cantidad solicitada para el producto ${AVAILABLE_INV.ItemCode}-${AVAILABLE_INV.ItemDescription}, disponible:${AVAILABLE_INV.OnHand}`
          });
          return of(false);
        }
      }
    }
    return of(true);


  }

  private DocumentLinesValidations(): boolean {

    if (this.lines.length === 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No se han ingresado líneas'
      });
      return false;
    }

    if (this.lines.some(l => l.TaxOnly === (typeof l.TaxOnly === 'string' ? 'tYES' : true)) && !this.userPermissions.some(p => p.Name === 'Sales_Documents_BillDiscountedProducts')) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para crear documentos con productos bonificados'
      });
      return false;
    }

    let hasLinesWithPriceLessThanZero = this.lines.some(l => +l.UnitPrice < 0);

    if (hasLinesWithPriceLessThanZero) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Hay líneas que tienen un precio menor a cero, por favor corríjalas'
      });
      return false;
    }

    let index: number = this.lines.findIndex(x => !x.TaxCode || x.TaxCode === '' && (!x.TreeType || x.TreeType === '' || x.TreeType !== ListMaterial.iIngredient));

    if (index >= 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Por favor agregue el impuesto a la línea ${(index + 1)} columna Impuesto`
      });
      return false;
    }

    if (this.lines.some(l => +l.UnitPrice === 0 && l.TreeType !== ListMaterial.iSalesTree) && !this.userPermissions.some(p => p.Name === 'Sales_Documents_BillWithZeroPrice')) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tiene permiso para crear documentos con líneas con precio cero'
      });
      return false;
    }

    const CORRUPTED_QUANTITY = this.lines.find((x) => x.Quantity <= 0 && (!x.TreeType || x.TreeType === '' || x.TreeType !== ListMaterial.iSalesTree));

    if (CORRUPTED_QUANTITY) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Cantidad del producto   ${CORRUPTED_QUANTITY.ItemCode}-${CORRUPTED_QUANTITY.ItemDescription}, debe ser mayor a 0`
      });

      return false;
    }


    if (!([DocumentType.Quotations.toString(), DocumentType.Orders.toString()].includes(this.typeDocument)) && this.typeInvoice !== TypeInvoices.RESERVE_INVOICE ) {
      let indexSerie = this.lines.findIndex(x => x.TreeType !== ListMaterial.iSalesTree && (!x.SerialNumbers || x.SerialNumbers.length === 0) && x.ManSerNum === 'Y');

      if (indexSerie >= 0) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El ítem en la línea ${(indexSerie + 1)} es manejado por serie, seleccione la serie en la columna opciones.`
        });
        return false;
      }
    }

    if (this.typeDocument === DocumentType.Invoices) {
      let indexBin = this.lines.findIndex(x => x.BaseEntry && x.TreeType !== ListMaterial.iSalesTree && (!x.DocumentLinesBinAllocations || x.DocumentLinesBinAllocations.length === 0) && x.ManBinLocation === 'Y' && x.ManSerNum === 'N' && x.ManBtchNum === 'N');

      if (indexBin >= 0) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El ítem en la línea ${(indexBin + 1)} es manejado por ubicación, seleccione la ubicación en la columna opciones.`
        });

        return false;
      }
    }


    if ( !([DocumentType.Quotations.toString(), DocumentType.Orders.toString()].includes(this.typeDocument)) && this.typeInvoice !== TypeInvoices.RESERVE_INVOICE) {
      return this.ValidateQtyLotes();
    }

    return true;
  }

  /**
   * Inflates the table lines to display additional details or expand the content.
   * This method is used to expand the table lines and show more information or details.
   */
  private InflateTableLines(): void {
    this.lines = this.lines.map((x, index) => {
      this.GetRowColorMessage(x);
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


  //#endregion

  //#region save documents

  private SetUdfsDevelopment(): void {
    if (this.displayTypeInvoice) {
      this.documentForm.controls['TipoDocE'].setValue(null);
    }

    MappingUdfsDevelopment<ISalesDocument>(this.documentForm.value, this.udfsValue, this.udfsDevelopment);

    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);

    if (this.feData) {
      MappingUdfsDevelopment<IFeData>(this.feData, this.udfsValue, this.udfsDevelopment);
    }
  }

  private SetUdfsPaymentDevelopment(_paymentState: IPaymentState): void {
    this.udfsPaymentValue = [];
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsPaymentValue, this.udfsPaymentDevelopment);
    MappingUdfsDevelopment<IPaymentState>(_paymentState, this.udfsPaymentValue, this.udfsPaymentDevelopment);

  }

  private async OnClickCreateOrUpdateDocument(): Promise<void> {
    if(this.hasUdfsWithoutGroup || this.hasUdfsWithGroup.some(udf => udf)){
      this.generateInvoice = true;
      this.hasUdfsWithGroup.forEach((udfGroupActive, index)=>{
        if(udfGroupActive){
          this.GetConfiguredUdfs(index.toString());
        }
      })
      if (this.hasUdfsWithoutGroup) {
        this.GetConfiguredUdfs(this.UdfWithoutGroupId);
      }

    }else{
      this.SaveChanges();
    }

  }

  /**
   * Method to create document
   * @constructor
   * @private
   */
  private SaveChanges(): void {
    if (!this.DocumentLinesValidations()) return;

    if (!this.ValidateUdfsLines()) return;

    this.SetUdfsDevelopment();


    let document: IDocument = this.documentForm.getRawValue();

    if (!this.isCashCustomer && (this.DefaultBusinessPartner?.CardName !== this.documentForm.controls['CardName'].value)) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No es permitido cambiar el nombre a clientes de crédito'
      });

      return;
    }

    document.DocDate = FormatDate(document.DocDate);
    document.DocDueDate = FormatDate(document.DocDueDate);
    document.TaxDate = FormatDate(document.TaxDate);
    document.Udfs = this.udfsValue;
    document.DocEntry = this.docEntry;
    document.DocNum = this.docNum;
    document.DownPaymentType = 'dptInvoice';
    document.ReserveInvoice = this.typeInvoice === TypeInvoices.RESERVE_INVOICE ? 'tYES' : 'tNO';
    document.DownPaymentPercentage = this.DownPaymentPercentage.value;
    document.DownPaymentsToDraw = this.DownPaymentsToDraw;
    document.DocTotal = this.DisplayTotal(2);
    document.ShipToCode = this.deliveryAddressSelected?.AddressName ?? '';

    let IsUpdate = false;
    if (document.DocEntry > 0 && this.preloadedDocActionType === PreloadedDocumentActions.EDIT) {
      IsUpdate = true;
      if ((this.lines.length - 1) < this.IndexMinUpdate) {
        this.indexMaxUpdate = -1;
      }
    }
    document.DocumentLines = this.lines.map(x => {
      x.LineNum == -1 ? this.indexMaxUpdate = this.indexMaxUpdate + 1 : this.indexMaxUpdate;
      return {
        ...x, Udfs: GetUdfsLines(x, this.udfsLines),
        LineNum: IsUpdate ? x.LineNum == -1 ? this.indexMaxUpdate : x.LineNum : x.LineNum,
        TaxOnly: x.TaxOnly ? 'tYES' : 'tNO',
        LineStatus: x.LineStatus === 'C' ? LineStatus.bost_Close : LineStatus.bost_Open,
        CostingCode: x.CostingCode,
        CostingCode2: x.CostingCode2 ,
        CostingCode3: x.CostingCode3,
        CostingCode4: x.CostingCode4,
        CostingCode5: x.CostingCode5,
        VATLiable:x.VATLiable=='1' || x.VATLiable=='SI' ? 1 : 0,
        ShipToCode: this.deliveryAddressSelected?.AddressName ?? ''
      } as IDocumentLine
    });

    if(this.retentionProcessEnabled){
      document.WithholdingTaxDataCollection = this.withholdingTaxSelected.map((withholding: IWithholdingTaxSelected) => {
        return {
          WTCode: withholding?.WTCode,
          Udfs: GetUdfsLines(withholding, this.udfsWithholding)
        } as WithholdingTaxCode;
      });

      if(this.withholdingTaxSelected.some((withholding: IWithholdingTaxSelected) => withholding.WithholdingType == 'AUT')){
        document.DocumentAdditionalExpenses = [{
          ExpenseCode: this.AutoWithholdingExpenseCode,
          TaxCode: this.AutoWithholdingTaxCode,
          LineTotal:  CLTofixed(this.DecimalTotalDocument, this.totalAutRetention),
          LineTotalFC: CLTofixed(this.DecimalTotalDocument, this.totalAutRetentionFC)
        } as IAdditionalExpense];
      }
    }

    this.currentAction = this.preloadedDocActionType === PreloadedDocumentActions.EDIT && this.preloadedDocFromType!='Draft' &&!this.isDrafts ? 'actualizada' : !this.isDrafts ? 'creada': this.isDrafts && this.preloadedDocFromType==='Draft'?'actualizado':'creado';
    this.currentActionError = this.preloadedDocActionType === PreloadedDocumentActions.EDIT && this.preloadedDocFromType!='Draft' &&!this.isDrafts  ? 'actualizando' : 'creando';

    let payTerm = this.payTerms.find(x => x.GroupNum === this.documentForm.controls['PaymentGroupCode'].value);

    if (payTerm && payTerm.Type === (Payterm.Counted) && this.controllerToSendRequest === 'Invoices' && (this.typeInvoice === TypeInvoices.INVOICE ||this.typeInvoice === TypeInvoices.RESERVE_INVOICE )&&!this.isDrafts)
    {
      this.ValidateStockLinesList().pipe(
        filter(res => res),
        switchMap((res: boolean) => {
          if (res && this.linesGoodReceipt && this.linesGoodReceipt.length > 0 && this.typeInvoice !== TypeInvoices.RESERVE_INVOICE) {
            return this.OpenDialogGoodReceipt().pipe(
              switchMap((res: IDocumentLine[]) => {
                if (res && res.length > 0) {
                  this.overlayService.OnGet();
                  return from(res).pipe(
                    concatMap(item => {
                      if (item.DocumentLinesBinAllocations && item.DocumentLinesBinAllocations.length > 0) {
                        return this.binLocationsService.Get<ILocationsModel[]>(item.ItemCode, item.WarehouseCode).pipe(
                          switchMap(callback => {
                            if (callback && callback.Data) {
                              let locationSelected = item.DocumentLinesBinAllocations[0];
                              let location = callback.Data.find(y => y.AbsEntry === locationSelected.BinAbsEntry);

                              if (location) {
                                this.lines.forEach((line, index) => {
                                  if (line.ItemCode === item.ItemCode && line.WarehouseCode === item.WarehouseCode && line.ManBinLocation && (line.IdDiffBy === line.IdDiffBy)) {
                                    this.lines[index].OnHand = location?.Stock || 0;
                                    this.lines[index].DocumentLinesBinAllocations = item.DocumentLinesBinAllocations;
                                    this.lines[index].BinCode = item.BinCode;
                                  }
                                });
                              }
                            }
                            return of(null);
                          })
                        );
                      } else {
                        return this.itemService.GetStock<IStockWarehouses[]>(item.ItemCode).pipe(
                          switchMap(callback => {
                            if (callback && callback.Data) {
                              let warehouse = callback.Data.find(y => y.WhsCode === item.WarehouseCode);

                              if (warehouse) {
                                this.lines.forEach((line, index) => {
                                  if (line.ItemCode === item.ItemCode && line.WarehouseCode === item.WarehouseCode) {
                                    this.lines[index].OnHand = warehouse?.OnHand || 0;
                                  }
                                });
                              }
                            }
                            return of(null);
                          })
                        );
                      }
                    }),
                    last(),
                    concatMap(res => {
                      this.InflateTableLines();
                      return of(res)
                    })
                  );
                } else {
                  return of(null);
                }
              }),
              finalize(() => this.overlayService.Drop())
            );
          } else {
            if (!this.documentForm.controls['IsDownPayment'].value) {
              if (this.DownPaymentsToDraw && this.DownPaymentsToDraw.length > 0) {
                this.OpenPaymentModal(document);
              } else {
                const isModal = this.documentForm.controls['IsModalProcess'].value === true;
                if (!this.modalProcessEnabled || isModal) {
                  this.PreviewSLDocument(document);
                } else {
                  this.ProcessDocument(document);
                }
              }
              return of(null);
            } else {
              if (!this.userPermissions.some(p => p.Name === 'Sales_Documents_BillWithDownPayments')) {
                this.alertsService.Toast({
                  type: CLToastType.INFO,
                  message: 'No tienes permisos para realizar pagos con anticipos'
                });

                return of(null);
              }

              let downPayment = {
                Document: document,
                DocTotal: this.currentCurrency === this.localCurrency.Id ? this.total : this.totalFC,
                Decimal: this.DecimalTotalDocument,
                Subtotal: this.currentCurrency === this.localCurrency.Id ? this.totalWithoutTax : this.totalWithoutTaxFC,
                Impuesto: this.currentCurrency === this.localCurrency.Id ? this.tax : this.taxFC,
                Rate: this.currentSession.Rate,
                Currencies: this.currencies
              } as IDocumentForDownPayment;

              this.matDialog.open(DownPaymentComponent, {
                disableClose: true,
                minWidth: '50%',
                maxWidth: '100%',
                height: 'auto',
                maxHeight: '80%',
                autoFocus: false,
                data: downPayment
              }).afterClosed()
                .pipe(
                  filter(x => x),
                )
                .subscribe({
                  next: (callback: IDownPayment) => {
                    if (callback && callback.IsPaymentPartial) {

                      this.documentForm.controls['IsDownPayment'].setValue(0);
                      this.DownPaymentsToDraw = callback.DownPaymentsToDraw;

                      this.DownPaymentPartialTotal = this.localCurrency.Id === callback.Currency ? callback.DownPaymentTotal : CLTofixed(this.DecimalTotalDocument, (callback.DownPaymentTotal * this.currentSession.Rate));
                      this.DownPaymentPartialTotalFC = callback.Currency !== this.localCurrency.Id ? callback.DownPaymentTotal : CLTofixed(this.DecimalTotalDocument, (callback.DownPaymentTotal / this.currentSession.Rate));

                      this.SaveChanges();

                    } else {
                      this.RefreshData();
                    }
                  },
                  error: (error) => {
                    this.alertsService.ShowAlert({HttpErrorResponse: error});
                  }
                });

              return of(null);
            }
          }
        }),
        catchError(error => {
          this.alertsService.ShowAlert({HttpErrorResponse: error});
          return of(null);
        })
      ).subscribe();


    }
    else if (this.controllerToSendRequest === 'DownPayments'&&!this.isDrafts)
    {
      if (payTerm && payTerm.Type === (Payterm.Counted)&&!this.isDrafts)
      {
        const isModal = this.documentForm.controls['IsModalProcess'].value === true;
        if (!this.modalProcessEnabled || isModal) {
          this.OpenPaymentModal(document);
        } else {
          this.ProcessDown(document);
        }
      }
      else
      {
        this.ProcessDown(document);
      }
    }
    else if (this.controllerToSendRequest === 'Invoices' && this.typeInvoice === TypeInvoices.RESERVE_INVOICE&&!this.isDrafts)
    {
      if (payTerm && payTerm.Type === (Payterm.Counted)&&!this.isDrafts)
      {
        const isModal = this.documentForm.controls['IsModalProcess'].value === true;
        if (!this.modalProcessEnabled || isModal) {
          this.OpenPaymentModal(document);
        } else {
          this.ProcessDown(document);
        }
      }
      else
      {
        this.ProcessDocument(document);
      }
    }
    else
    {
      this.ProcessDocument(document);
    }
  }

  /**
   *METODO PARA REDIMIR PUNTOS EN LEALTO
   * @param _invoice
   * @constructor
   * @private
   */
  private RedeemPoints(_document: IDocument, _paymentState: IPaymentState): Observable<boolean> {

    let puntosRedimir = _paymentState?.Transactions.find(x => x.Id === -1);

    if (puntosRedimir) {
      let data = {
        id_usuario: this.pointsSettings?.IdUsuario ?? 0,
        id_sucursal: this.pointsSettings?.IdSucursal ?? 0,
        monto: puntosRedimir.CreditSum,
        numero_factura: _document?.DocEntry.toString(),
        factura_obj: {
          numero_factura: _document?.DocEntry.toString(),
          subtotal: this.totalWithoutTax,
          impuestos: this.tax,
          total: this.total,
          fecha: _document?.DocDate.toString(),
          lineas_factura: this.lines.map(element => {
            return {
              sku_producto: element.ItemCode,
              nombre_producto: element.ItemDescription,
              impuestos_producto: element.TaxRate,
              precio_producto: element.UnitPrice,
              cantidad_producto: element.Quantity
            }
          })
        } as IFacturaObj
      } as IInvoiceRedeemPoint;

      return this.lealtoService.RedeemPoints(data).pipe(
        map(res => true),
        catchError(error => {
          this.alertsService.ShowAlert({HttpErrorResponse: error});
          return of(false);
        })
      )
    } else {
      return of(false);
    }

  }

  /**
   *METODO PARA ACUMULAR PUNTOS EN LEALTO
   * @param _document
   * @param _paymentState
   * @constructor
   * @private
   */
  private AccumulatePoints(_document: IDocument, _paymentState: IPaymentState): Observable<boolean> {

    let puntosRedimir = _paymentState?.Transactions.find(x => x.Id === -1);
    let amountPuntos = puntosRedimir ? puntosRedimir.CreditSum : 0;
    amountPuntos = (this.total - amountPuntos);

    if (amountPuntos) {
      let data = {
        id_usuario: this.pointsSettings?.IdUsuario ?? 0,
        id_sucursal: this.pointsSettings?.IdSucursal ?? 0,
        monto: amountPuntos,
        numero_factura: _document?.DocEntry.toString(),
        codigos_cupon_array: null,
        factura_obj: {
          numero_factura: _document?.DocEntry.toString(),
          subtotal: this.totalWithoutTax,
          impuestos: this.tax,
          total: this.total,
          fecha: _document?.DocDate.toString(),
          lineas_factura: this.lines.map((x) => {
            return {
              sku_producto: x.ItemCode,
              nombre_producto: x.ItemDescription,
              impuestos_producto: x.TaxRate,
              precio_producto: x.UnitPrice,
              cantidad_producto: x.Quantity
            } as ILineasFactura
          })
        }
      } as IInvoicePointsBase;

      return this.lealtoService.AccumulatePoints(data).pipe(
        map(res => true),
        catchError(error => {
          this.alertsService.ShowAlert({HttpErrorResponse: error});
          return of(true)
        })
      );
    } else {
      return of(true);
    }

  }

  private PointsTapp(_document: IDocument, _paymentState: IPaymentState): Observable<boolean> {

    let puntosRedimir = _paymentState?.Transactions.find(x => x.Id === -1);
    let amountPuntos = puntosRedimir ? puntosRedimir.CreditSum : 0;

    let date = new Date(_document.DocDate);
    let dateFormat = `${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}-${date.getFullYear()}`;

    // Define products for points
    let products: IProductsTapp[] = this.lines.map(line => ({
      product_code: line.ItemCode,
      product_description: line.ItemDescription,
      quantity: line.Quantity,
      subtotal: line.UnitPrice
    }));

    const body = {
      tapp_bridge_id: this.uniqueId,
      invoice_id: _document.DocEntry.toString(),
      invoiceDate: dateFormat,
      pos_user_id: _document.SalesPersonCode.toString(),
      invoice_amount: this.total,
      redeemed_points: amountPuntos,
      products: products,
      rewards_given: []
    } as ITappCloseInvoice;

    return this.tappService.CloseTappInvoice(body).pipe(
      map(res => true),
      catchError(error => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
        return of(false)
      })
    );
  }

  public PreviewSLDocument(_document: IDocument): void {
    const DocumentPreview = {
      Document: {
        CardCode: _document.CardCode,
        DocumentLines: _document.DocumentLines
      }
    } as ISalesServicePreview;

    this.overlayService.OnPost();
    this.ordersServicePreviewService.Post(DocumentPreview).pipe(
      catchError((error) => {
        this.ResendPreview(_document, error.error?.Message);
        return of(error);
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe( {
      next: (res => {
        if (res?.Data) {
          this.total = +(res.Data.DocTotal.toFixed(this.DecimalTotalDocument));
          this.totalFC = +(res.Data.DocTotalSys.toFixed(this.DecimalTotalDocument));
          this.OpenPaymentModal(_document);
        }
      }),
        error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  public ResendPreview(_document: IDocument, _err: string): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `${this.MsgPreviewDocument}`,
      subtitle: `Error: ${_err}`
    }).pipe(
      catchError((err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
        return of(err);
      })
    ).subscribe({
      next: (callback => {
        if (callback) {
          this.PreviewSLDocument(_document);

        } else {
          this.OpenPaymentModal(_document);
        }
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  /**
   * Method create document without payment
   * @param _document - Document to create
   * @constructor
   * @private
   */
  private ProcessDocument(_document: IDocument): void {
    this.ValidateStockLinesList()
      .pipe(
        filter(res => res),
        switchMap(res =>
          (this.controllerToSendRequest === 'Invoices' && res && this.linesGoodReceipt && this.linesGoodReceipt.length > 0)
            ? this.processDialogOpenDialogGoodReceipt()
            : of(true)
        ),
        filter(res => res),
        switchMap((res) => {
          this.overlayService.OnPost();

          if (!_document.DocEntry || _document.DocEntry === 0 || this.preloadedDocActionType === PreloadedDocumentActions.COPY || this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE
            || (this.preloadedDocActionType === PreloadedDocumentActions.CREATE_FROM_DRAFT) || this.isDrafts)
          {
            if (this.isDrafts&& this.preloadedDocFromType!='Draft') {
              return this.draftService.Post<IDocument>(this.controllerToSendRequest, _document, this.documentAttachment, this.attachmentFiles);
            }else if(this.isDrafts && this.preloadedDocFromType=='Draft'){
              return  this.draftService.Patch<IDocument>(this.controllerToSendRequest, _document, this.documentAttachment, this.attachmentFiles);
            }else{
              return this.salesDocumentService.Post(this.controllerToSendRequest, _document, this.documentAttachment, this.attachmentFiles);
            }
          }
          else
          {
              return this.salesDocumentService.Patch(this.controllerToSendRequest, _document, this.documentAttachment, this.attachmentFiles);
          }
        }),
        switchMap(res => {
          if (res && res.Data) {
            this.currentReport = res.Data.ConfirmationEntry ? 'Preliminary': this.currentReport;

            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
                map(print => {
                  return {Document: res, Print: print};
                })
              );
            } else {
              return of({ Document: res, Print: null });
            }
          } else {
            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocument(_document.DocEntry).pipe(
                map(print => {
                  return {Document: {Data: _document}, Print: print};
                })
              );
            } else {
              return of({Document: {Data: _document}, Print: null })
            }
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
          Title: res.Document.Data.ConfirmationEntry ? Titles.Draft : this.currentTitle,
          Accion: this.currentAction,
          TypeReport: this.currentReport
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
          title: `Se produjo un error ${this.currentActionError} ${this.currentTitle}`,
          subtitle: decodeURIComponent(escape(GetError(err))),
          type: CLModalType.ERROR
        });
      }
    });
  }

//#endregion;

  //#region Business Partner

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.businessPartnersService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.businessPartners = callback.Data;

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

    this.itemService.GetAllPagination<ItemSearchTypeAhead[]>(VALUE?.SearchValue, currentSession.WhsCode, ItemsFilterType.SellItem)
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
      Records: this.businessPartners,
      RecordsCount: this.businessPartners.length,
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

  /**
   * Load business partner seleted
   * @param _businessPartner
   * @constructor
   */
  public OnSelectBusinessPartner(_businessPartner: IBusinessPartner): void {
    this.LoadDataBp(_businessPartner);
    this.isFirstBusinessPartnerSelection ? this.isFirstBusinessPartnerSelection = false : this.ChangeBp();
    this.AlertDifferentCurrency(_businessPartner.Currency);
  }

  private ChangeBp(): void {
    this.pointsSettings = null;
    this.lines = [];
    this.uom = [];
    this.curr = [];
    this.dropdownDiffList = {};
    this.GetTotals();
    this.InflateTableLines();
  }




  private SetItem(_data: IDocumentLine, _item: ItemSearchTypeAhead, _location: IDocumentLinesBinAllocations[], _cant: number, _isChildren: boolean = false): IDocumentLine {
    try {
      let unitPrice = 0;
      let unitPriceFC = 0;

      if (!_isChildren && _data.HideComp=="Y" || _isChildren && _data.HideComp=="N" || !_isChildren && _data.HideComp==undefined) {
        unitPrice = _data.UoMMasterData[0].UnitPrice;
        unitPriceFC = _data.UoMMasterData[0].UnitPriceFC;
      } 
      // Applied to get the price on Inducolcarnes, we review this to validate with BOM
      else if(!_isChildren && _data.HideComp=="N"){
        unitPrice = _data.UoMMasterData[0].UnitPrice;
        unitPriceFC = _data.UoMMasterData[0].UnitPriceFC;
      }
      else {
        unitPrice = 0;
        unitPriceFC = 0;
      } 

      let currency = this.documentForm.controls['DocCurrency'].value;
      let maxIdUomEntry = this.lines && this.lines.length > 0 ? Math.max(...this.lines.map(x => (x.IdDiffBy || 0))) + 1 : 1;

      let item = {
        ItemCode: _data.ItemCode,
        InventoryItem: _data.InventoryItem,
        PurchaseItem: _data.PurchaseItem,
        SalesItem: _data.SalesItem,
        DocEntry: _data.DocEntry,
        WarehouseCode: _item?.DefaultWarehouse || this.currentSession.WhsCode,
        WhsName: this.warehouse.find(warehouse => warehouse.WhsCode === _item?.DefaultWarehouse)?.WhsName || this.currentSession.WhsName,
        Quantity: _cant,
        TaxCode: _data.TaxCode ?? '',
        TaxRate: _data.TaxRate ?? 0,
        UnitPrice: currency === this.localCurrency.Id ? unitPrice : unitPriceFC,
        UnitPriceFC: unitPriceFC,
        UnitPriceCOL: unitPrice,
        DiscountPercent: _data.DiscountPercent ? _data.DiscountPercent : 0,
        CostingCode: this.userLogged?.CenterCost,
        ItemDescription: _data.ItemName,
        OnHand:  _location && _location.length > 0 ? _location[0].Stock : _data.OnHand,
        UoMMasterData: _data.UoMMasterData,
        UoMEntry: _data.UoMMasterData[0].UoMEntry,
        DocumentLinesBinAllocations: !_isChildren ? ((_item.ManBtchNum === 'N' && _item.ManSerNum === 'N') ? _location : []) : _location,
        SerialNumbers: !_isChildren ? (_item.ManSerNum === 'Y' ? this.LoadSerial(_item.SysNumber, _item.DistNumberSerie, _cant) : []) : [],
        ManBtchNum: _item.ManBtchNum,
        ManSerNum: _item.ManSerNum,
        ManBinLocation: _isChildren ? this.warehouse.find(x => x.WhsCode === _data.WarehouseCode)?.BinActivat ?? '' : '',
        BatchNumbers: _data.BatchNumbers ? _data.BatchNumbers : [],
        SysNumber: _item.SysNumber,
        DistNumber: _item.DistNumberSerie,
        BinCode: _item.BinCode,
        IdDiffBy: maxIdUomEntry,
        LastPurchasePrice: _data?.LastPurchasePrice,
        LastPurchasePriceFC: _data?.LastPurchasePriceFC,
        LineNum: -1,
        TreeType: _isChildren ? ListMaterial.iIngredient : (_data.TreeType && _data.TreeType === 'S' ? ListMaterial.iSalesTree : ''),
        BillOfMaterial: _isChildren ? [] : _data.BillOfMaterial,
        FatherCode: _isChildren ? _item.ItemCode : '',
        IdCurrency: _data.LinesCurrenciesList.find(x => x.DocCurrency == this.currentCurrency)?.Id ?? '0',
        LinesCurrenciesList: this.GetLinesCurrencies(_data),
        CurrNotDefined: this.CurrLinesDifined(_data),
        Currency: this.currentCurrency,
        QuantityOriginal:_data?.Quantity??0,
        VATLiable:_data.VATLiable
      } as IDocumentLine;


      if (this.changeCurrencyLines) {
        let dataCurrency = _data.LinesCurrenciesList.find(x => x.Id == item.IdCurrency);
        if (dataCurrency) {
          if (!_isChildren && _data.HideComp=="Y" ||_isChildren && _data.HideComp=="N" ||!_isChildren && _data.HideComp==undefined) {
            item.Currency = dataCurrency.DocCurrency;
            if (this.localCurrency.Id === item.Currency) {
              item.UnitPrice = dataCurrency.Price;
              item.UnitPriceFC = +((dataCurrency.Price / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
              item.UnitPriceCOL = dataCurrency.Price;
            } else if (this.localCurrency.Id !== item.Currency) {
              item.UnitPrice = dataCurrency.Price;
              item.UnitPriceFC = dataCurrency.Price;
              item.UnitPriceCOL = +((dataCurrency.Price * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            }
          } else {
            item.UnitPrice = unitPrice;
            item.UnitPriceFC = unitPriceFC;
            item.UnitPriceCOL = unitPrice;
          }
        }
      }


      return item;
    } catch (e) {
      return {} as IDocumentLine
    }

  }

  /**
   * ESTE METODO MAPEA LAS MONEDAS A NIVEL DE LINEA
   * @param _data
   * @constructor
   * @private
   */
  private GetLinesCurrencies(_data: IDocumentLine): ILinesCurrencies[] {
    if (this.changeCurrencyLines) {
      if (_data.LinesCurrenciesList && _data.LinesCurrenciesList.length > 0) {
        return _data.LinesCurrenciesList;
      } else {
        let curr = this.currencies.find(x => x.Id === this.currentCurrency);
        if (curr) {
          return [{
            Id: '0',
            DocCurrency: curr?.Id,
            Description: `${curr?.Id} - Moneda primaria`,
            Price: _data.UnitPrice
          } as ILinesCurrencies];
        } else {
          return [];
        }
      }
    } else {
      return [];
    }
  }

  private CurrLinesDifined(_data: IDocumentLine): boolean {
    if (this.changeCurrencyLines) {

      if (_data.LinesCurrenciesList && _data.LinesCurrenciesList.length > 0) {
        return false;
      } else {
        let curr = this.currencies.find(x => x.Id === this.currentCurrency);
        if (curr) {
          return true;
        } else {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  //#endregion

  //#region Items
  public OnSelectItem(_item: ItemSearchTypeAhead | string): void {
    try {

      if (typeof _item === 'string') return;

      let cant = +this.documentForm.controls['Quantity'].value;

      if (cant <= 0) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Cantidad permitida mayor a 0`
        });
        this.sharedService.EmitEnableItem();
        return;
      }

      if (_item.ManSerNum === 'Y' && cant > 1) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Solo se permite cantidad 1 para artículos con serie, ${_item.ItemCode} - ${_item.ItemName}`
        });
        this.sharedService.EmitEnableItem();
        return;
      }

      const SERIEQUANTITY = this.lines.find((x) => x.ItemCode === _item.ItemCode && x.ManSerNum === 'Y' && x.SysNumber === _item.SysNumber);

      if (_item.ManSerNum === 'Y' && SERIEQUANTITY) {

        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El artículo ${SERIEQUANTITY.ItemCode} ya fue agregado con la serie ${SERIEQUANTITY.DistNumber}, por favor seleccione otra serie.`
        });
        this.sharedService.EmitEnableItem();


        return;
      }

      if (this.vldLineMode?.LineGroup) {
        let index: number = this.lines.findIndex((x) => x.ItemCode === _item.ItemCode &&
          x.WarehouseCode === (_item.DefaultWarehouse || this.currentSession.WhsCode) && x.ManSerNum !== 'Y' && x.BinCode === _item.BinCode
        );

        if (index != -1) {
          this.lines[index].Quantity += cant;
          this.lines.forEach(line => {
            if(line.FatherCode==_item.ItemCode){
              line.Quantity=this.lines[index].Quantity * line.QuantityOriginal;
            }
          });
          this.LineTotal(index);
          this.InflateTableLines();
          this.GetTotals();
          this.sharedService.EmitEnableItem();
          return;
        }
      }

      let Location: IDocumentLinesBinAllocations[] = [];

      _item.AbsEntry || 0 > 0 ?
        Location = [{
          SerialAndBatchNumbersBaseLine: 0,
          BinAbsEntry: _item.AbsEntry,
          Quantity: cant,
          Stock: _item.OnHand
        } as IDocumentLinesBinAllocations] : [];

      let ITEM: number = ItemSerialBatch.NA;

      if (_item.ManSerNum === 'Y') {
        ITEM = ItemSerialBatch.Serie
      }
      if (_item.ManBtchNum === 'Y') {
        ITEM = ItemSerialBatch.Lote
      }

      const priceList: number = +(this.documentForm.controls['PriceList'].value);

      this.overlayService.OnGet();
      this.itemService.Get<IDocumentLine>(_item.ItemCode, _item?.DefaultWarehouse || this.currentSession.WhsCode, priceList,
        this.documentForm.controls['CardCode'].value, ITEM, _item.SysNumber, 'N',  ItemsFilterType.SellItem)
        .pipe(
          finalize(() => {
            this.sharedService.EmitEnableItem();
            this.overlayService.Drop()
          }))
        .subscribe({
          next: (callback => {
            if (callback.Data) {
              let item = this.SetItem(callback.Data, _item, Location, +this.documentForm.controls['Quantity'].value);
              //Se documenta temporalmente por que esta incompleto
              // ApplyBlanketAgreements(this.blanketAgreements,item,this.localCurrency.Id,this.currentSession.Rate,this.DecimalTotalDocument);
              item.HideComp=callback.Data.HideComp;

              let HideComp = item.HideComp;
              let HasGroup = this.generateHash(8);
              item.HasGroup=HasGroup;
              if (this.udfsLines && this.udfsLines.length > 0) {
                MappingDefaultValueUdfsLines(item, this.udfsLines);
                SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList);
              }

              if(item.TreeType != ListMaterial.iIngredient){
                this.vldLineMode?.LineMode ? this.lines.push(item) : this.lines.unshift(item);
                this.vldLineMode?.LineMode ? this.LineTotal(this.lines.length - 1) : this.LineTotal(0);
              }else{
                this.lines.push(item);
                this.LineTotal(this.lines.length - 1)
              }

              this.ConfigDropdownDiffListTable(item);

              if (callback.Data.BillOfMaterial && callback.Data.BillOfMaterial.length > 0) {
                callback.Data.BillOfMaterial.forEach(element => {

                  element.WarehouseCode = _item?.DefaultWarehouse || this.currentSession.WhsCode;
                  element.HideComp = HideComp;

                  let data = {
                    ManBtchNum: element.ManBtchNum,
                    ManSerNum: element.ManSerNum,
                    SysNumber: element.SysNumber,
                    DistNumberSerie: element.DistNumber,
                    ItemCode: _item.ItemCode,
                    BinCode: '',
                    DefaultWarehouse: _item.DefaultWarehouse
                  } as ItemSearchTypeAhead

                  item = this.SetItem(element, data, [], element.Quantity*this.documentForm.controls['Quantity'].value, true);
                  item.HideComp=HideComp;
                  item.HasGroup=HasGroup;
                  if (this.udfsLines && this.udfsLines.length > 0) {
                    MappingDefaultValueUdfsLines(item, this.udfsLines);
                  }

                  if(item.TreeType != ListMaterial.iIngredient){
                    this.vldLineMode?.LineMode ? this.lines.push(item) : this.lines.unshift(item);
                    this.vldLineMode?.LineMode ? this.LineTotal(this.lines.length - 1) : this.LineTotal(0);
                  }else{
                    this.lines.push(item);
                    this.LineTotal(this.lines.length - 1)
                  }

                  this.ConfigDropdownDiffListTable(item);

                });

              }

              if (item.TaxCode === '') {
                this.alertsService.Toast({
                  type: CLToastType.INFO,
                  message: `Ítem ${item.ItemCode} - ${item.ItemDescription ? item.ItemDescription : ''} no cuenta con el código del impuesto`
                });
              }

              let totalQuantityInUse = this.lines
                .filter(
                  (y) =>
                    y.ItemCode == _item.ItemCode &&
                    item.InventoryItem === 'Y' &&
                    y.WarehouseCode == item.WarehouseCode &&
                    item.ItemClass != ItemsClass.Service &&
                    y.DistNumber === item.DistNumber
                )
                .reduce((p, c) => {
                  return p + c.Quantity;
                }, 0);

              if (this.vldInventoryvldInventory.ValidateInventory &&
                totalQuantityInUse > +item.OnHand
              ) {
                this.alertsService.Toast({
                  type: CLToastType.INFO,
                  message: `Sin stock, total solicitado en el almacén: ${totalQuantityInUse} disponible: ${item.OnHand}`
                });
              }
            }

            this.InflateTableLines();
            this.GetTotals();
          }),
          error: (err) => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        });

    } catch (e) {
      this.sharedService.EmitEnableItem();
    }

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

      if (this.changeCurrencyLines) {
        if (_item.LinesCurrenciesList && _item.LinesCurrenciesList.length > 0) {

          let curr: DropdownElement[] = [];

          _item.LinesCurrenciesList.forEach(x => {
              let value = {
                key: x.Id,
                value: x.Description,
                by: _item.IdDiffBy
              }
              curr.push(value);

            }
          );
          this.curr.push(...curr);
        }
      }


      this.dropdownDiffList = {
        ...this.dropdownDiffList,
        UoMEntry: this.uom as DropdownElement[],
        IdCurrency: this.curr as DropdownElement[] ?? []
      };

    }


  }

  //#endregion

  public ReadQueryParameters(): void {

    let params = this.activatedRoute.snapshot.queryParams

    if (params['Action']) {
      this.preloadedDocActionType = params['Action'] as PreloadedDocumentActions;
    }

    if (params['Action']&&params['From'] ) {
      this.preloadedDocFromType = params['From'];
    }

    this.DefineActionButtonByPreloadedDocAction();

    if (params['From'] &&this.preloadedDocActionType!=PreloadedDocumentActions.CREATE_FROM_DRAFT) {
      this.actionDocumentFrom = ActionDocument(params['From'], true);
      this.DBODataEndPoint = this.actionDocumentFrom.typeDocument;
    }


  }

  public DefineActionButtonByPreloadedDocAction(): void {
    switch (this.preloadedDocActionType) {
      case PreloadedDocumentActions.EDIT:
        this.actionButtons = [
          {
            Key: 'UPDATE',
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
            Key: 'ADD',
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
            Key: 'ADD',
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
            Key: 'ADD',
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
    }
    if(this.typeDocument===DocumentType.Quotations||this.typeDocument===DocumentType.Orders||this.typeDocument===DocumentType.Invoices){
      if(this.preloadedDocFromType=='Draft' && this.canCreateDraft){
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
  }

  //#region DOCUMENTOS EN MEMORIA

  /**
   * ANADIR DOCUMENTOS A LA MEMORIA
   *
   */
  public AddDocument(): void {
    try {


      if (!this.lines || this.lines.length === 0) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Para guardar el documento debe agregar líneas.`
        });
        return;
      }

      if (this.documentInMemories.length === +(this.memoryInvoice.Quantity)) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Número máximo de documentos en espera alcanzado.`
        });
        return;
      }

      //Esta variable me indica que obtien el valor de los udfs pero cuando guardo en memoria y no cuando voy a crear documentos
      this.generateInvoice = false;

      //Obtengo los valores
      this.hasUdfsWithGroup.forEach((udfGroupActive, index)=>{
        if(udfGroupActive){
          this.GetConfiguredUdfs(index.toString());
        }
      })

      if (this.hasUdfsWithoutGroup) {
        this.GetConfiguredUdfs(this.UdfWithoutGroupId);
      }

      const newDocument = {...this.documentForm.getRawValue()} as IDocument;
      newDocument.Udfs = this.udfsValue ?? [];
      newDocument.IdType = this.feData?.IdType;
      newDocument.Identification = this.feData?.Identification;
      newDocument.Email = this.feData?.Email;
      newDocument.DocumentLines = this.lines.map(x => {
        return {...x}
      });

      this.documentInMemories[this.currentIndex] = newDocument;

      //Reseteo
      this.feData = {} as IFeData;
      this.documentForm.reset();
      this.CleanFields();
      this.udfsValue = [];
      this.LoadDataBp(this.DefaultBusinessPartner as IBusinessPartner);
      this.lines = [];

      //Se inicializa el formulario
      if (this.typeDocE && this.typeDocE.length > 0) {
        this.documentForm.controls['TipoDocE'].setValue(this.typeDocE.find((x) => x.IsDefault)?.Name);
      }
      this.documentForm.controls['Quantity'].setValue(1);
      this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
      this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));
      this.documentForm.controls['DocDueDate'].setValue(new Date(ZoneDate()));

      if(this.typeDocument == DocumentType.Quotations){

        this.documentForm.controls['DocDueDate'].setValue(this.GetAdjustedDate());
      }


      //Genero un nuevo documento
      const firstDocument = {...this.documentForm.getRawValue()} as IDocument;
      firstDocument.DocumentLines = [];
      this.documentInMemories.push(firstDocument);

      this.dropdownDiffList = {};
      this.uom = [];
      this.curr = [];

      //Reseteo totales y tabla
      this.GetTotals();
      this.InflateTableLines();

      //Almaceno
      this.SetInMemory();

      this.currentIndex = this.documentInMemories.length - 1;

    } catch (error) {
    }

  }


  /**
   * Sum days of tha current date
   * @constructor
   */
  GetAdjustedDate(): Date {
    const adjustedDate = new Date(ZoneDate());
    adjustedDate.setMonth(adjustedDate.getMonth() + 1);
    return adjustedDate;
  }

  /**
   * DOCUMENTO POR DEFECTO O DOCUMENTO INICIA
   * @private
   */
  private InitDocument(): void {
    if (this.typeDocument === DocumentType.Invoices && this.typeInvoice === TypeInvoices.INVOICE && !this.actionDocumentFrom) {
      try {
        const data = Repository.Behavior.GetStorageObject<IDocument[]>(StorageKey.DocumentInMemories);
        if (data && data.length > 0) {
          this.documentInMemories = [];
          this.documentInMemories = data;
          this.currentIndex = 0;
          const document = this.documentInMemories[this.currentIndex];
          this.documentForm.patchValue(document);
          this.currentCurrency = document.DocCurrency;
          this.lines = document.DocumentLines;
          this.udfsDataHeader = document.Udfs;
          if (this.udfsLines?.length) {
            this.lines.forEach((element) => {
              this.ConfigDropdownDiffListTable(element);
              SetUdfsLineValues(this.udfsLines, element, this.dropdownDiffList);
            });
          } else {
            this.lines.forEach((element) => {
              this.ConfigDropdownDiffListTable(element);
            });
          }
          this.GetTotals();
          this.InflateTableLines();
        } else {
          const firstDocument = {...this.documentForm.getRawValue()} as IDocument;
          firstDocument.DocumentLines = this.lines;
          this.documentInMemories.push(firstDocument);
          this.currentIndex = 0;
          this.GetTotals();
          this.InflateTableLines();
        }
      } catch (error) {
      }
    }


  }

  /**
   * GENERAR LA FACTURA EN MEMORIA, SIMPLEMENTE SETEA LA DATA DEL DOCUMENTO SELECCIONADO
   * @param _document
   * @param _index
   */
  public GenerateInvoice(_document: IDocument, _index: number): void {
    try {
      if (this.currentIndex === _index) return;

      //Esta variable me indica que obtien el valor de los udfs pero cuando guardo en memoria y no cuando voy a crear documentos
      this.generateInvoice = false;

      //Obtengo los valores
      this.hasUdfsWithGroup.forEach((udfGroupActive, index)=>{
        if(udfGroupActive){
          this.GetConfiguredUdfs(index.toString());
        }
      })

      if (this.hasUdfsWithoutGroup) {
        this.GetConfiguredUdfs(this.UdfWithoutGroupId);
      }

      //Focus is applied to the first tab on the left
      this.tabGroup.selectedIndex = this.tabGroup._tabs.get(0)?.position;

      const newDocument = {...this.documentForm.getRawValue()} as IDocument;
      newDocument.Udfs = this.udfsValue ?? [];
      newDocument.IdType = this.feData?.IdType;
      newDocument.Identification = this.feData?.Identification;
      newDocument.Email = this.feData?.Email;
      newDocument.DocumentLines = this.lines.map(x => {
        return {...x}
      });

      //Reseteo la data
      this.CleanFields();
      this.udfsValue = [];

      //Completo con la nueva info

      this.documentForm.patchValue(_document);
      this.feData = {
        IdType: _document?.IdType,
        Identification: _document?.Identification,
        Email: _document.Email,
        Nombre: _document?.CardName
      } as IFeData;
      this.udfsDataHeader = _document.Udfs;
      this.SetUDFsValues(this.UdfWithoutGroupId);
      this.LoadDataUdfGroup();
      this.lines = [];
      this.lines = _document.DocumentLines;
      this.currentCurrency = _document.DocCurrency;

      //Manejo de unidades de medida
      this.dropdownDiffList = {};
      this.uom = [];
      this.curr = [];
      if (this.udfsLines?.length) {
        this.lines.forEach((element) => {
          this.ConfigDropdownDiffListTable(element);
          SetUdfsLineValues(this.udfsLines, element, this.dropdownDiffList);
        });
      } else {
        this.lines.forEach((element) => {
          this.ConfigDropdownDiffListTable(element);
        });
      }

      //Vemos los acuerdos globales
      this.documentInMemories[this.currentIndex] = newDocument;

      //Actualizo el indice
      this.currentIndex = _index;

      //Refresco la memory
      this.SetInMemory();

      //Actualizo totales y tabla
      this.GetTotals();
      this.InflateTableLines();


    } catch (error) {

    }
  }

  /**
   * ELIMINA DOCUMENTOS
   */
  public DeleteDocument(_index: number): void {

    try {
      if (this.typeDocument === DocumentType.Invoices) {

        if (!this.actionDocumentFrom) {

          if (this.documentInMemories.length > 1) {
            //Logica para eliminar si hay mas de un documento
            this.documentInMemories.splice(_index, 1);
            this.currentIndex = _index > 0 ? this.currentIndex - 1 : 0;
            const document = this.documentInMemories[this.currentIndex];
            this.documentForm.patchValue(document);

            //Carga de el tipo de moneda del documento
            this.currentCurrency = document.DocCurrency;

            //Refresco la lista
            this.lines = [];
            this.lines = document.DocumentLines;

            //Valores de udfs
            this.udfsDataHeader = document.Udfs;
            this.SetUDFsValues(this.UdfWithoutGroupId);
            this.LoadDataUdfGroup();

            //Manejo de unidades de medida
            this.dropdownDiffList = {};
            this.uom = [];
            this.curr = [];
            if (this.udfsLines?.length) {
              this.lines.forEach((element) => {
                this.ConfigDropdownDiffListTable(element);
                SetUdfsLineValues(this.udfsLines, element, this.dropdownDiffList);
              });
            } else {
              this.lines.forEach((element) => {
                this.ConfigDropdownDiffListTable(element);
              });
            }

            //Refresco la memory
            this.SetInMemory();

            //Refresco tabla y totales
            this.GetTotals();
            this.InflateTableLines();
          } else {
            //Si solo hay un documento

            //Reseteo el documento
            this.documentInMemories = [];
            this.dropdownDiffList = {};
            this.withholdingTaxSelected = [];
            this.curr = [];
            this.uom = [];
            this.currentIndex = 0;
            this.lines = [];
            this.SetInMemory();

            //Valores inicailaes
            const firstDocument = {...this.documentForm.getRawValue()} as IDocument;
            firstDocument.DocumentLines = this.lines;
            this.documentInMemories.push(firstDocument);

            //Actualizo totales
            this.GetTotals();
            this.InflateTableLines();
          }
        } else {
          this.actionDocumentFrom = null;
          this.InitDocument();
        }

      }
    } catch (error) {
      CLPrint(error, CL_DISPLAY.ERROR);
    }

  }

  /**
   * GUARDA EN EL LOCAL STAORAGE
   * @private
   */
  private SetInMemory(): void {
    Repository.Behavior.SetStorage<IDocument[]>(this.documentInMemories, StorageKey.DocumentInMemories);
  }

  //#endregion


  //#region Currency
  public SelectCurrency(): void {

    this.currentCurrency = this.documentForm.controls['DocCurrency'].value;

    let _currency = this.DefaultBusinessPartner?.Currency;
    this.AlertDifferentCurrency(_currency ?? '');

    if (!this.lines || this.lines.length <= 0) return;

    if (this.changeCurrencyLines) {//Esto es una confi en company que si no esta chekeada no maneja nada a nivel de linea
      this.lines.forEach((x, index) => {
        x.IdCurrency = x.CurrNotDefined ? '0' : x.IdCurrency;
        x.LinesCurrenciesList = x.CurrNotDefined ? this.currencies.filter(x => x.Id === this.currentCurrency).map((element, index) => {
          return {
            Id: '0',
            DocCurrency: element?.Id.toString(),
            Description: `${element?.Id} - Moneda primaria`,
            Price: x.UnitPrice
          } as ILinesCurrencies
        }) ?? [] : x.LinesCurrenciesList;
        x.UnitPrice = x.CurrNotDefined ? (this.localCurrency.Id === this.currentCurrency ? x.UnitPriceCOL : x.UnitPriceFC) : x.UnitPrice;
        x.Total = this.localCurrency.Id === this.currentCurrency ? x.TotalCOL : x.TotalFC;
        x.Currency = x.CurrNotDefined ? this.currentCurrency : x.Currency;
        if (x.CurrNotDefined) {
          let i = this.curr.findIndex(y => y.by === x.IdDiffBy);
          this.curr[i].key = x.LinesCurrenciesList[0].Id;
          this.curr[i].value = x.LinesCurrenciesList[0].Description;
        }
      });
    } else {
      this.lines.forEach(x => {
        x.Currency = this.currentCurrency;
        x.UnitPrice = this.localCurrency.Id === x.Currency ? x.UnitPriceCOL : x.UnitPriceFC;
        x.Total = this.localCurrency.Id === x.Currency ? x.TotalCOL : x.TotalFC;
      });
    }

    this.InflateTableLines();
    this.GetTotals();

  }

  /**
   * METODO MUESTRA UNA ALERTA CUANDO LA MONEDA DEL SOCIO ES DISTINTO A LA SELECCIONADA DEL DOCUMENTO
   * @constructor
   * @private
   */
  private AlertDifferentCurrency(_currency: string): void {
    if (_currency && _currency !== '##') {
      if (this.currentCurrency !== _currency) {
        this.alertsService.Toast({
          type: CLToastType.WARNING,
          message: 'El socio de negocio no soporta la moneda seleccionada en el encabezado del documento.'
        });
      }
    }
  }


  //#endregion

  //#region Lista de precios
  public SelectPriceList(): void {

    const priceList: number = +(this.documentForm.controls['PriceList'].value);

    this.documentForm.patchValue({
      DocCurrency: this.priceList.find(x => x.ListNum === priceList)?.PrimCurr
    });

    this.currentCurrency = this.documentForm.controls['DocCurrency'].value;

  }

  //#endregion

  /**
   * METODO PARA OBTENER LOS ITEMS DEL NUEVO ALMACEN
   * @private
   */
  private ChangeWarehouse(): void {
    this.subscriptions$.add(this.sharedService.changeWarehouse$.pipe(
      filter((value: string) => {
        return !!(value && value !== '');
      }),
      switchMap((value: string) => {
        this.currentSession.WhsCode = value;
        this.currentSession.WhsName = this.warehouse.find(x => x.WhsCode === value)?.WhsName ?? '';
        this.overlayService.OnGet();
        return this.itemService.GetAll<ItemSearchTypeAhead[]>(value, ItemsFilterType.SellItem).pipe(finalize(() => {
          this.overlayService.Drop()
        }));
      }),
    ).subscribe({
      next: (callback => {
        this.items = callback.Data
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    }));
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
   * Load udf groups on base of setting
   * @constructor
   */
  LoadUdfsGroups(): void{
    let udfGroup = this.settings.find(setting => setting.Code == SettingCode.UdfGroup)?.Json || '';
    this.configureUdfGroup = udfGroup ? (JSON.parse(udfGroup ) as IUdfGroupSetting)?.ConfigureGroups || false : false;
    if(this.configureUdfGroup){
      this.overlayService.OnGet();
      this.udfsService.GetUdfsGroups(this.DBODataEndPoint)
        .pipe(finalize(()=> this.overlayService.Drop()))
        .subscribe({
          next: (callback => {
            if(callback.Data){
              this.udfGroups = callback.Data || [];
              //An array of booleans is created to validate the visibility of each group
              this.hasUdfsWithGroup = Array.from({ length: this.udfGroups.length }, () => true);

              this.RegisterUdfEventsWithGroup();

            }
          }),
          error: (error => this.alertsService.ShowAlert({HttpErrorResponse: error}))
        })
    }



  }

  /**
   * This method is used to see what is available in the warehouses of an item.
   * @param _index parameter index in list
   * @param _itemCode parameter _itemCode in list
   * @param _warehouseCode parameter _warehouseCode in list
   * @param _serialItem parameter _serialItem in list
   * @constructor
   * @private
   */
  private OpenDialogStock(_index: number, _itemCode: string, _warehouseCode: string, _serialItem: boolean): void {
    let canChangeWarehouse = this.userPermissions.some(x => x.Name === 'Sales_Documents_EditItemWarehouse');
    let viewStock = this.userPermissions.some(x => x.Name === 'Sales_Documents_ViewItemWarehouse');

    if (!viewStock) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para ver el stock.'
      });
      return;
    }

    this.ItemCodeToSearchAvailability = _itemCode;


        this.matDialog.open(SearchModalComponent, {
          width: '65%',
          height: "80%",
          data: {
            Id: this.searchWarehouseModalId,
            ModalTitle: 'Cambiar almacén',
            MinInputCharacters: 2,
            InputDebounceTime: 200,
            ShouldPaginateRequest : true,
            TableMappedColumns: {
              IgnoreColumns: ['BinActivat'],
              RenameColumns: {
                WhsCode: 'Código',
                WhsName: 'Almacén',
                OnOrder: 'Orden',
                IsCommited: 'Comprometido',
                OnHand: 'Stock'
              }
            }
          } as ISearchModalComponentDialogData<IStockWarehouses>
        }).afterClosed()
          .pipe(
            switchMap(res => {
              // If is a serial item we request the serial numbers for the selected warehouse
              if (_serialItem) {
                this.overlayService.OnGet();
                return this.itemService.GetItemSeriesByWarehouse(_itemCode, res?.WhsCode)
                  .pipe(
                    concatMap(callback => {
                      this.overlayService.Drop();
                      return this.matDialog.open(SeriesItemsComponent, {
                        data: callback.Data,
                        disableClose: true,
                        minWidth: '50%',
                        maxWidth: '100%',
                        height: '700px',
                        maxHeight: '80%',
                      }).afterClosed()
                        .pipe(
                          map(callback => {
                            res.ItemSerie = callback;
                            return res;
                          }),
                          catchError(err => {
                            this.alertsService.ShowAlert({ HttpErrorResponse: err });
                            return EMPTY;
                          })
                        );
                    })
                  );
              } else {
                return of(res);
              }
            }),
            concatMap((result:IStockWarehouses)=>{
                if (result) {
                  if (!canChangeWarehouse) {
                    this.alertsService.Toast({
                      type: CLToastType.INFO,
                      message: `No cuenta con permiso para cambiar de almacén.`
                    });
                    return of(null);
                  }

                    this.lines[_index].WarehouseCode = result.WhsCode;
                    this.lines[_index].WhsName = result.WhsName;
                    this.lines[_index].OnHand = result.OnHand;
                    this.lines[_index].BatchNumbers = [];
                    this.lines[_index].DocumentLinesBinAllocations = [];
                    this.lines[_index].BinCode = '';
                    this.lines[_index].ManBinLocation = this.warehouse.find(x => x.WhsCode === result.WhsCode)?.BinActivat ?? '';
                    // Properties for item series
                    if (result.ItemSerie) {
                      this.lines[_index].DistNumber = result.ItemSerie.DistNumber!;
                      this.lines[_index].SysNumber = result.ItemSerie.SystemSerialNumber;
                      this.lines[_index].SerialNumbers = [result.ItemSerie];
                    }
                    this.InflateTableLines();

                    if (this.lines[_index].ManBinLocation === 'Y' && this.lines[_index].ManBtchNum.toUpperCase() === 'N' && this.lines[_index].ManSerNum.toUpperCase() === 'N') {
                      return this.GetBinAllocations(this.lines[_index], _index, false);
                    }

                    if (this.lines[_index].ManBtchNum.toUpperCase() === 'Y') {
                      return this.GetBatches(this.lines[_index], _index);
                    }

                  return EMPTY;
                }
              return EMPTY;
            })
          )
          .subscribe();


  }
  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalShowWarehouseRequestRecords = (_event: ICLEvent): void => {

    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.itemService.GetbyFilter<IStockWarehouses[]>(this.ItemCodeToSearchAvailability ,VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.stockWarehouses = callback.Data;

        this.InflateTableWarehouse();

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
   * Send information to search-modal warehouses component
   * @constructor
   * @private
   */
  private InflateTableWarehouse(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.stockWarehouses,
      RecordsCount: this.stockWarehouses.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchWarehouseModalId
    });
  }

  //#region Udfs
  /**
   * Load values in the udfs
   * @param _udfId Id of the udf to add values
   * @constructor
   */
  public SetUDFsValues(_udfId: string): void {
    this.linkerService.Publish({
      Target: _udfId,
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.udfsDataHeader)
    });
  }

  /**
   * Validation if there are udfs group to show
   * @constructor
   */
  public ContentUdfGroup = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.hasUdfsWithGroup[+_event.Target] = udfs.length > 0;

    if(udfs.length > 0){
      this.lastUdfGroupTarget = _event.Target
    }

    if (this.udfsDataHeader && this.udfsDataHeader.length > 0 && udfs.length > 0) {
      this.SetUDFsValues(_event.Target);
    }

    //Focus is applied to the first tab on the left
    this.tabGroup.selectedIndex = this.tabGroup._tabs.get(0)?.position;
  }

  /**
   * Validation if there are udfs without group to show
   * @constructor
   */
  public ContentUdfWithoutGroup = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.hasUdfsWithoutGroup = udfs.length > 0;

    if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
      this.SetUDFsValues(this.UdfWithoutGroupId);
    }

    //Focus is applied to the first tab on the left
    this.tabGroup.selectedIndex = this.tabGroup._tabs.get(0)?.position;
  }


  /**
   * Load data in udfs group
   * @constructor
   */
  LoadDataUdfGroup(): void{
    if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
      // The group index is used as the udf id
      let index = 0;
      for (index; index < this.udfGroups.length; index++) {
        this.SetUDFsValues(index.toString());
      }
    }
  }



  public OnClickUdfEvent = (_event: ICLEvent): void => {
    let index;
    (JSON.parse(_event.Data) as IUdfContext[]).forEach(udfValue=>{
      index = this.udfsValue.findIndex(udf => udf.Name == udfValue.Name);
      if(index !== -1){
        this.udfsValue[index] = udfValue;
      }else{
        this.udfsValue.push(udfValue);
      }
    });

    if(this.generateInvoice) {
      if(this.hasUdfsWithoutGroup){

        if(_event.Target == this.UdfWithoutGroupId){
          this.SaveChanges()
        }

      }else if(_event.Target == this.lastUdfGroupTarget){
          this.SaveChanges()
      }
    }

  }

  /**
   * Publish method to get udf data
   * @param _udfId
   * @constructor
   */
  public GetConfiguredUdfs(_udfId: string): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: _udfId
    });
  }

  //#endregion


  //#region Ubicaciones

  public GetBinAllocations(_item: IDocumentLine, _idx: number, _fieldBin = true): Observable<Structures.Interfaces.ICLResponse<ILocationsModel[]>> {
    let canEditItemLocation = this.userPermissions.some(x => x.Name === 'Sales_Documents_EditItemLocation');
    if (!canEditItemLocation) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para editar la ubicación de la línea'
      });
      return EMPTY;
    }


    if (_item.ManBtchNum.toUpperCase() !== 'N') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Ítem manejado por lotes`
      });
      return EMPTY;
    }

    if (_item.ManSerNum.toUpperCase() !== 'N') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Ítem manejado por series`
      });
      return EMPTY;
    }
    if ((!_fieldBin && _item.DocumentLinesBinAllocations && _item.DocumentLinesBinAllocations.length <= 0) && _item.ManBinLocation !== 'Y') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Ítem no manejado por ubicación`
      });
      return EMPTY;
    }

    this.overlayService.OnGet();
   return this.binLocationsService.Get<ILocationsModel[]>(_item.ItemCode, _item.WarehouseCode)
      .pipe(
        concatMap(callback => {
          if (callback.Data) {
            let data: ILocationsSelectedModel = {
              Locations: callback.Data,
              ValidateStockBatch: this.vldInventoryvldInventory.ValidateBatchesInventory,
              TypeDocument : this.typeDocument
            }
            data.Permission = canEditItemLocation;
            data.Quantity = this.lines[_idx].Quantity;
            this.OpenEditLocationDialog(data, _idx);
          }
          return of(callback);

        }),
        finalize(() => {
          this.overlayService.Drop()
        }))

  }

  public OpenEditLocationDialog(_location: ILocationsSelectedModel, _idx: number): void {
    this.matDialog.open(LocationComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      data: _location
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {
            this.lines[_idx].DocumentLinesBinAllocations = result.Location;
            this.lines[_idx].BinCode = result.BinCode;
            this.InflateTableLines();
          }
        }
      });
  }


  //#endregion

  //#region Lotes

  /**
   * METODO PARA VALIDAR CANTIDADES EN LOS LOTES
   */
  private ValidateQtyLotes(): boolean {

    let index: number = this.lines.findIndex((x) => x.TreeType !== ListMaterial.iSalesTree && x.ManBtchNum.toUpperCase() === 'Y' && (!x.BatchNumbers || x.BatchNumbers.length === 0));

    if (index >= 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El ítem ${this.lines[index].ItemCode} en la línea ${(index + 1)} es manejado por lotes, por favor ingrese la cantidad por lote en la columna opciones.`
      });

      return false;
    }
    if (this.vldInventoryvldInventory.ValidateBatchesInventory) {

      if (this.lines.some(x => x.ManBtchNum.toUpperCase() === 'Y')) {
        let data = this.lines.filter(x => x.ManBtchNum.toUpperCase() === 'Y');

        for (let i = 0; i < data.length; i++) {
          let qty: number = data[i].BatchNumbers.reduce((acumulador, valor) => acumulador + valor.Quantity, 0)

          if (data[i].Quantity < qty || data[i].Quantity > qty) {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `Por favor verifique las cantidades ingresadas para el ítem ${data[i].ItemCode} en la línea ${(i + 1)}, Cantidad Solicitada: ${data[i].Quantity}, Cantidad Ingresada: ${qty}`
            });

            return false;
          }
        }
      }
    }

    return true;

  }

  public GetBatches(_item: IDocumentLine, _idx: number, _fieldBin = true): Observable<Structures.Interfaces.ICLResponse<IBatches[]>> {
    let canEditItemBatch = this.userPermissions.some(x => x.Name === 'Sales_Documents_EditItemBatch');

    if (!canEditItemBatch) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para editar el lote del ítem'
      });
      return EMPTY;
    }

    if (_item.ManBtchNum.toUpperCase() !== 'Y') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Ítem no manejado por lote`
      });
      return EMPTY;
    }

    this.overlayService.OnGet();
    return this.batchesService.Get<IBatches[]>(_item.ItemCode, _item.WarehouseCode)
      .pipe(finalize(() => this.overlayService.Drop()),
        concatMap(callback => {
          if (callback.Data) {
            let data: IBatchSelected = {
              Lotes: callback.Data,
              ValidateStockBatch: this.vldInventoryvldInventory.ValidateBatchesInventory,
              View: ViewBatches.FACTURACION
            }
            this.OpenEditBatchesDialog(data, _idx);
          } else {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: `No se han obtenido lotes para el ítem ${_item.ItemCode} - ${_item.ItemDescription}`
            });
          }
          return of(callback);

        }));
  }

  public OpenEditBatchesDialog(_batch: IBatchSelected, _idx: number): void {

    if (this.lines[_idx]) {
      _batch.Quantity = this.lines[_idx].Quantity;
      _batch.LotesSelected = this.lines[_idx].BatchNumbers;
      _batch.LocationsSelected = this.lines[_idx].DocumentLinesBinAllocations;
    }

    _batch.Permission = this.userPermissions.some(x => x.Name === 'Sales_Documents_EditItemBatch');

    this.matDialog.open(LotComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      data: _batch
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {

            if (result.Lotes) {
              this.lines[_idx].BatchNumbers = result.Lotes;
            }

            if (result.Locations) {
              this.lines[_idx].DocumentLinesBinAllocations = result.Locations;
            }

            this.InflateTableLines();
          }
        }
      });
  }

  //#endregion

  //#region serie

  /**
   * Metodo cargar lista de serie del item
   * @param _item
   * @returns
   */
  public LoadSerial(_sysNumber: number, _distNumber: string, _cant: number): ISerialNumbers[] {
    let SerialNumbers: ISerialNumbers[] = [];
    if (_sysNumber && _distNumber) {
      SerialNumbers = [{
        SystemSerialNumber: _sysNumber,
        Quantity: _cant,
        DistNumber: _distNumber
      } as ISerialNumbers];
    }
    return SerialNumbers;
  }

  //#endregion

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
            Type: this.mapAccountType(account.Type)
          } as IAccount
        }),
    ));

  }

  public mapAccountType(_type: number): string {
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

          //PINPAD
          this.paymentHolder.PaymentSettings.Terminals = this.Terminals;
          this.paymentHolder.PaymentSettings.EnablePinPad = this.PaymentConfiguration?.Pinpad;
          this.paymentHolder.PaymentSettings.DefaultCardNumber = this.PaymentConfiguration?.CardNumber;
          this.paymentHolder.PaymentSettings.CanEditCardNumber = this.userPermissions.some(x => x.Name === 'Sales_Documents_EditPayCardNumber');
          this.paymentHolder.PaymentSettings.DefaultCardValid = new Date(this.PaymentConfiguration?.CardValid);
          this.paymentHolder.PaymentSettings.DocumentKey = this.uniqueId;
          //TOTALES Y MONEDA
          this.paymentHolder.PaymentSettings.Rate = this.currentSession.Rate;
          this.paymentHolder.PaymentSettings.DocumentCurrency = this.currentCurrency;
          this.paymentHolder.PaymentSettings.PaymentCurrency = this.currentCurrency;
          this.paymentHolder.PaymentSettings.DecimalRounding = this.DecimalTotalDocument;
          this.paymentHolder.PaymentSettings.InvertRateDirection = false;
          this.paymentHolder.PaymentSettings.CardRefundAmount = 0;

          let total = this.localCurrency.Id === this.currentCurrency ? this.total : this.totalFC;

          if (this.DownPaymentsToDraw && this.DownPaymentsToDraw.length > 0) {
            total = this.localCurrency.Id === this.currentCurrency ? (this.total - this.DownPaymentPartialTotal) : (this.totalFC - this.DownPaymentPartialTotalFC);
          }
          if(this.IsPartialPay.value &&this.documentForm.get('PartialAmount')?.value>total){
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El monto del pago parcial es superior al total, por favor verifique el monto`
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
          this.paymentHolder.PaymentSettings.DocTotal =  this.IsPartialPay.value==false? total:this.documentForm.get('PartialAmount')?.value;
          this.paymentHolder.PaymentSettings.Currencies = this.currencies.map(element => {
            return {
              Name: element.Id,
              Description: element.Name,
              Symbol: element.Symbol,
              IsLocal: element.IsLocal
            } as ICurrency
          });

          // Validate if points settings was provided
          if (this.pointsSettings) {
            let card = this.GetDataCardPoints();
            if (card) {
              this.pointsSettings.CardSettings = card;
            }
            this.paymentHolder.PointsSettings = this.pointsSettings;
          }

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
   * Method to create payment to document
   * @param _document - Model to docuemnt
   * @param _paymentState -Mode to payment
   * @param _currency - Currency to document
   * @param _rate - Exrate to company
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
      DocDate: _document.DocDate,
      TaxDate: _document.DocDate,
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
          InvoiceType: this.controllerToSendRequest === 'Invoices' ? PaymentInvoiceType.it_Invoice : PaymentInvoiceType.it_DownPayment,
          DocEntry: 0,
          SumApplied: this.localCurrency.Id === _paymentState.Currency ? paymentSum : CLTofixed(this.DecimalTotalDocument, (paymentSum * _rate)),
          AppliedFC: _paymentState.Currency !== this.localCurrency.Id ? paymentSum : CLTofixed(this.DecimalTotalDocument, (paymentSum / _rate))
        } as IPaymentInvoices
      ],
    } as IIncomingPayment;


    let invoiceWithPayment = {
      ARInvoice: _document,
      IncomingPayment: incomingPayment
    } as InvoiceWithPayment;

    let controllerRequest = this.controllerToSendRequest === 'Invoices' ? 'InvoicesWithPayment' : this.controllerToSendRequest;
    if( this.typeInvoice == TypeInvoices.RESERVE_INVOICE){
       controllerRequest =  'ReserveInvoiceWithPayment';
    }
    if (isPaymentPinpad) {

      if (controllerRequest === 'InvoicesWithPayment') {
        this.currentReport = 'PinPadInvoices';
      }
      if (controllerRequest === 'DownPayments') {
        this.currentReport = 'PinpadDownPayment';
      }
      if(controllerRequest ==='ReserveInvoiceWithPayment'){
        this.currentReport = 'PinPadInvoices';
      }
    }


    this.overlayService.OnPost();

    let isADraftDocument = false;

    this.salesDocumentService.PostInvoiceWithPayment(controllerRequest, invoiceWithPayment, this.documentAttachment, this.attachmentFiles).pipe(
      concatMap(res => {
        isADraftDocument = !!res.Data.ARInvoice.ConfirmationEntry;

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
        this.currentReport = res.Data.ARInvoice.ConfirmationEntry ? 'Preliminary' : this.currentReport;

          if (isPaymentPinpad) {

            const ppTransactions = isADraftDocument ? [] : incomingPayment.PPTransactions;

            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocumentPinpad(res.Data.ARInvoice.DocEntry, ppTransactions
              ).pipe(
                map(print => {
                  return {Document: res, Print: print}
                })
              )
            } else {
              return of({ Document: res, Print: null })
            }
          } else {
            if(this.hasCompanyAutomaticPrinting){
              return this.PrintInvoiceDocument(res.Data.ARInvoice.DocEntry
              ).pipe(
                map(print => {
                  return {Document: res, Print: print}
                })
              )
            } else {
              return of({ Document: res, Print: null })
            }
          }
        }
      ),
      switchMap(res => {
        if (this.hasActiveLoyalty && !isADraftDocument) {
          if (this.lealtoActive && this.pointsSettings) {
            return this.RedeemPoints(res?.Document.Data.ARInvoice, _paymentState).pipe(
              switchMap(acc => this.AccumulatePoints(res?.Document.Data.ARInvoice, _paymentState).pipe(
                  map(lealto => res)
                )
              )
            );
          } else if (this.tappActive && this.pointsSettings) {
            return this.PointsTapp(res?.Document.Data.ARInvoice, _paymentState).pipe(map(tapp => res));
          } else {
            return of(res);
          }
        } else {
          return of(res);
        }
      }),
      map(res => {
        this.overlayService.Drop();
        return {
          DocEntry: res.Document.Data.ARInvoice.DocEntry,
          DocNum: res.Document.Data.ARInvoice.DocNum,
          NumFE: res.Document.Data.ARInvoice.NumFE,
          CashChange: !isADraftDocument ? (this.localCurrency.Id === _paymentState.Currency ? _paymentState.ChangeAmount : this.DisplayChangeAmount(this.localCurrency.Id, _paymentState.ChangeAmount)) : 0,
          CashChangeFC: !isADraftDocument ? (_paymentState.Currency === notLocalCurrency.Id ? _paymentState.ChangeAmount : this.DisplayChangeAmount(notLocalCurrency.Id, _paymentState.ChangeAmount)) : 0,
          Title: res.Document.Data.ARInvoice.ConfirmationEntry ? Titles.Draft : this.currentTitle,
          TypeReport: this.currentReport,
          PPTransactions: !isADraftDocument ? (isPaymentPinpad ? incomingPayment.PPTransactions : []) : [],
          Terminals: !isADraftDocument ? this.Terminals : [],
          Accion: this.currentAction,
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
          title: `Se produjo un error ${this.currentActionError} ${this.currentTitle}`,
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
   * Method to load data
   * @private
   */
  private RefreshData(): void {
    // if (this.docEntry && this.docEntry > 0){
    //   this.ResetDocument();
    //   return;
    // }
    this.overlayService.OnGet();
    forkJoin({
      Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode, ItemsFilterType.SellItem),
      SalesPersons: this.salesMenService.Get<ISalesPerson[]>(),
      PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.SellItem),
      PayTerms: this.paytermsService.Get<IPayTerms[]>(),
      Taxes: this.taxesService.Get<ITaxe[]>(),
      Currency: this.currenciesService.Get(false),
      Warehouse: this.warehouseService.Get<IWarehouse[]>(),
      TypeDocE: this.salesDocumentService.GetTypeDocE<ITypeDocE[]>('Invoices'),
      Terminals: this.terminalUsersService.GetTerminals<ITerminal[]>(),
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      Settings: this.settingService.Get<ISettings[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>()
        .pipe(catchError(res => of(null))),
      UdfsLines: this.udfsService.Get<IUdfContext[]>(this.typeDocument, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(this.typeDocument),
      UdfsPaymentDevelopment: this.typeDocument === DocumentType.Invoices ? this.udfsService.GetUdfsDevelopment('ORCT') : of(null),
    }
    ).pipe(
      switchMap(res => {
        this.items = res.Items.Data;
        this.salesPerson = res.SalesPersons.Data;
        this.payTerms = res.PayTerms.Data;
        this.priceList = res.PriceList.Data ?? [];
        this.warehouse = res.Warehouse.Data;
        this.taxes = res.Taxes.Data;
        this.currencies = res.Currency.Data;
        this.typeDocE = res.TypeDocE.Data;
        this.exchangeRate = res.ExchangeRate.Data;
        this.userPermissions = res.Permissions?.Data ?? [];
        this.settings = res.Settings.Data;
        this.Terminals = res.Terminals.Data;
        this.udfsLines = res.UdfsLines?.Data ?? [];
        this.userLogged.SlpCode = +this.userLogged?.SlpCode;
        this.udfsDevelopment = res.UdfsDevelopment.Data;
        this.udfsPaymentDevelopment = res.UdfsPaymentDevelopment?.Data ?? [];
        this.preloadedDocument = null;
        this.DownPaymentsToDraw = [];
        this.DownPaymentPartialTotal  = 0;
        this.DownPaymentPartialTotalFC = 0;
        this.DefaultBusinessPartner = null;

        //Business partner default
        if(this.userLogged?.SellerCode){
          return this.businessPartnersService.Get<IBusinessPartner>(this.userLogged?.SellerCode);
        }
        else if (res.Settings.Data && res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
          let companyDefaultBusinessPartner = JSON.parse(res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

            let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.selectedCompany?.Id) as IDefaultBusinessPartnerSetting;

            if (dataCompany && dataCompany.BusinessPartnerCustomer) {
              return this.businessPartnersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerCustomer);
            }
          }
        }
        return of(null);
      }),
      finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (res => {
          if (res && res.Data) {
            this.DefaultBusinessPartner = res.Data;
          }
          this.ResetDocument();
          this.SetInitialData();
          this.DefineDocument();

          this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});

        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      }
    );
  }

  private DisplayChangeAmount(_currency: string, _amount: number): number {

    if (this.localCurrency.Id === _currency) {
      return +((_amount * this.currentSession.Rate).toFixed(this.DecimalTotalDocument));
    }

    return +((_amount / this.currentSession.Rate).toFixed(this.DecimalTotalDocument));
  }

  /**
   * RESETEA LA DATA
   * @constructor
   * @private
   */
  private ResetDocument(): void {

    this.paymentHolder = {} as IPaymentHolder;

    this.DownPaymentPercentage.setValue(100);

    this.udfsValue = [];

    this.udfsDataHeader = [];

    this.reintent = false;

    this.pointsSettings = null;

    this.preloadedDocActionType = undefined;
    this.preloadedDocFromType = undefined;

    this.paymentDocument = {} as IDocument;

    this.documentAttachment = {
      AbsoluteEntry: 0,
      Attachments2_Lines: []
    };

    this.attachmentFiles = [];
    this.withholdingTaxSelected = [];

    if(['Quotations', 'Orders'].includes(this.controllerToSendRequest))
    {
      this.InflateAttachmentTable();
    }

    if(this.typeDocument == DocumentType.Orders){
      this.documentForm.controls['CardName'].enable();
    }


    if (this.docEntry && this.docEntry > 0) {
      this.actionButtons = [
        {
          Key: 'ADD',
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
      if((this.typeDocument===DocumentType.Quotations||this.typeDocument===DocumentType.Orders||this.typeDocument===DocumentType.Invoices) && this.canCreateDraft){
        this.actionButtons=[ {
          Key: 'ADDPRE',
          MatIcon: 'draft',
          Text: 'Crear preliminar',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },...this.actionButtons]
      }
      this.router.navigate(['sales', 'documents', this.currentUrl]);
    }

    this.docEntry = 0;
    this.currentAction = 'creada';
    this.currentActionError = 'creando la';
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.lines = [];
    this.feData = {} as IFeData;

    this.DeleteDocument(this.currentIndex);

    if (this.typeDocument !== DocumentType.Invoices) {
      this.dropdownDiffList = {};
      this.uom = [];
      this.curr = [];
      this.InflateTableLines();
      this.GetTotals();
    }

    this.CleanFields();
    this.SetUDFsValues(this.UdfWithoutGroupId);
    this.LoadDataUdfGroup();
  }

  /**
   * ESTE METODO LIMPIA LOS UDFS
   * @constructor
   * @private
   */
  private CleanFields(): void {
    this.hasUdfsWithGroup.forEach((udfGroup, index)=>{
      if (udfGroup) {
        this.linkerService.Publish({
          Target: index.toString(),
          Data: '',
          CallBack: CL_CHANNEL.RESET
        });
      }
    })

    if (this.hasUdfsWithoutGroup) {
      this.linkerService.Publish({
        Target: this.UdfWithoutGroupId,
        Data: '',
        CallBack: CL_CHANNEL.RESET
      });
    }
  }

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
      if(validatePrint != null && validatePrint != '') {
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

  public GetItems(): void {
    this.overlayService.OnGet();
    this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode, ItemsFilterType.SellItem).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback => {
        this.items = callback.Data;
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
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

  public OpenDialogFE(): void {
    if (this.feData) {
      this.feData.ConsultFE = this.PaymentConfiguration?.ConsultFE;
      this.feData.EditDocument = this.isEditDocument;
    } else {
      this.feData = {
        ConsultFE: this.PaymentConfiguration?.ConsultFE,
        EditDocument: this.isEditDocument
      } as IFeData;
    }
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
       let CardName = this.documentForm.controls['CardName'].value;
       let NameFe = result?.Nombre ? result?.Nombre : CardName;
       this.feData = result;
       this.documentForm.controls['CardName'].setValue(NameFe);
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
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
            this.OnSelectBusinessPartner(value);
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
        AvailableWithholdingTax: this.availableWithholdingTax,
        SelectedWithholdingTax: this.withholdingTaxSelected,
        UdfsWithholding: this.udfsWithholding
      } as IWithholdingTaxDialogData
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

  public OpenLoyalty(): void {

    const dialogPointsConfig = new MatDialogConfig();

    dialogPointsConfig.disableClose = true;
    dialogPointsConfig.autoFocus = true;

    const currentCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    const currentUserToken = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session);

    const tapp = this.tappSettings?.TappConfigs.find(c => c.CompanyId === currentCompany?.Id);
    const lealto = this.lealtoSettings?.LealtoConfigs.find(c => c.CompanyId === currentCompany?.Id);

    if ((tapp && tapp.Active) || (lealto && lealto.Active)) {
      dialogPointsConfig.data = {
        Type: (tapp && tapp.Active) ? 'TAPP' : 'LEALTO',
        Description: (tapp && tapp.Active) ? 'Puntos Tapp' : 'Puntos Lealto',
        Identification: '',
        UserId: `${currentUserToken?.UserId}`,
        InvoiceNumber: '0',
        InvoiceUniqueId: this.uniqueId
      } as IPointsSettings;

      const dialogPointsRef = this.matDialog.open(PointsModalComponent, dialogPointsConfig);

      dialogPointsRef.afterClosed().subscribe(
        (next: IPointsSettings) => {
          this.pointsSettings = next;
        },
        error => {
          this.alertsService.Toast({type: CLToastType.ERROR, message: error})
        },
      );
    } else {
      this.alertsService.Toast({type: CLToastType.ERROR, message: 'No se encuentra configurado un plan de lealtad'})
    }

  }

  //#region ajuste inventario

  private OpenDialogGoodReceipt(): Observable<IDocumentLine[]> {
    let dataSettings;

    if (this.settings.find((element) => element.Code == SettingCode.AdjustmentInventory)) {

      let inventory = JSON.parse(this.settings.find((element) => element.Code == SettingCode.AdjustmentInventory)?.Json || '') as IAdjustmentInventorySetting[];

      if (inventory && inventory.length > 0) {

        dataSettings = inventory.find(x => x.CompanyId === this.selectedCompany?.Id) as IAdjustmentInventorySetting;

      }
    }

    let data = {
      PriceList: +(this.documentForm.controls['PriceList'].value),
      Lines: this.linesGoodReceipt,
      Comments: dataSettings ? dataSettings.Comments : '',
      GoodsReceiptAccount: dataSettings ? dataSettings?.GoodsReceiptAccount : '',
      DocCurrency: this.currentCurrency,
      DecimalTotalDocument: this.DecimalTotalDocument,
      Currencies: this.currencies
    } as ICreateGoodReceiptDialogData

    return this.matDialog.open(InventoyEntryComponent, {
      disableClose: true,
      width:'98%',
      maxWidth: '1300px',
      height: 'auto',
      maxHeight: '98%',
      data: data
    }).afterClosed();
  }

  private OpenDialogSeriesItems(_index: number, _row: IDocumentLine): void {

    if (_row.TreeType !== ListMaterial.iSalesTree && _row.ManSerNum === 'Y') {

      this.overlayService.OnGet();
      this.itemService.GetItemSeriesByWarehouse(_row.ItemCode, _row.WarehouseCode).pipe(
        filter(res => {
          this.overlayService.Drop()
          if (res.Data && res.Data.length > 0) {
            return true;
          } else {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'No se obtuvieron series.'})
            return false;
          }
        }),
        switchMap(res => this.matDialog.open(SeriesItemsComponent, {
          disableClose: true,
          minWidth: '50%',
          maxWidth: '100%',
          height: '700px',
          maxHeight: '80%',
          data: res.Data
        }).afterClosed()),
        map((res: ISerialNumbers) => res),
        filter(res => !!res),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback => {
          this.lines[_index].SerialNumbers = [];
          this.lines[_index].DistNumber = callback?.DistNumber ?? '';
          this.lines[_index].SerialNumbers.push(callback);
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });

    } else {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'La selección de series solo aplica para un ítem subordinado de lista de material.'
      })
    }

  }


  private OpenDialogDimensionsItems(_index: number, _row: IDocumentLine): void {
    this.overlayService.OnGet();
    this.dimensionService.Get().pipe(
      filter(res => {
        this.overlayService.Drop()
        if (res.Data && res.Data.length > 0) {
          return true;
        } else {
          this.alertsService.Toast({type: CLToastType.INFO, message: 'No se obtuvieron dimensiones'})
          return false;
        }
      }),
      switchMap(res => this.matDialog.open(DimensionsComponent, {
        disableClose: true,
        minWidth: '50%',
        maxWidth: '100%',
        height: '700px',
        maxHeight: '80%',
        data: res.Data
      }).afterClosed()),
      map((res: IDimensionsSelected[]) => res),
      filter(res => !!res),
    ).subscribe({
      next: (callback => {
        this.lines[_index].CostingCode = callback[0]?.DistributionRulesList;
        this.lines[_index].CostingCode2 = callback[1]?.DistributionRulesList;
        this.lines[_index].CostingCode3 = callback[2]?.DistributionRulesList;
        this.lines[_index].CostingCode4 = callback[3]?.DistributionRulesList;
        this.lines[_index].CostingCode5 = callback[4]?.DistributionRulesList;
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

// endregion

  //#region anticipos
  /**
   * Method to create invoice with advance payment
   * @param _document - Document to create
   * @constructor
   * @private
   */
  private ProcessDown(_document: IDocument): void {
    if(this.retentionProcessEnabled){
      _document.WithholdingTaxDataCollection = this.withholdingTaxSelected.map((withholding: IWithholdingTaxSelected) => {
        return {
          WTCode: withholding?.WTCode
        } as WithholdingTaxCode;
      });
    }

    let invoiceWithPayment = {
      ARInvoice: _document
    } as InvoiceWithPayment;

    this.overlayService.OnPost();
    this.salesDocumentService.PostInvoiceWithPayment(this.controllerToSendRequest, invoiceWithPayment, this.documentAttachment, this.attachmentFiles)
    .pipe(
      switchMap(res => {
        if (res && res.Data) {
          if(this.hasCompanyAutomaticPrinting){
            return this.PrintInvoiceDocument(res.Data.ARInvoice.DocEntry).pipe(
              map(print => {
                return {Document: res, Print: print};
              })
            );
          } else {
            return of({ Document: res, Print: null })
          }
        } else {
          return of(null)
        }
      }),
      map(res => {
        return {
          DocEntry: res?.Document.Data.ARInvoice.DocEntry,
          DocNum: res?.Document.Data.ARInvoice.DocNum,
          NumFE: res?.Document.Data.ARInvoice.NumFE,
          CashChange: 0,
          CashChangeFC: 0,
          Title: res?.Document.Data.ARInvoice.ConfirmationEntry ? Titles.Draft : this.currentTitle,
          Accion: this.currentAction,
          TypeReport: this.currentReport
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res)),
      finalize(() => this.overlayService.Drop()
      )
    ).subscribe({
      next: (callback) => {
        this.RefreshData();
      },
      error: (err) => {
        this.modalService.Continue({
          title: `Se produjo un error ${this.currentActionError} ${this.currentTitle}`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  //endregion

  private SetInitialData(): void {

    //#region PERMISOS

    this.isPermissionChangeCurrency = this.userPermissions.some(x => x.Name === 'Sales_Documents_ChangeCurrency');
    this.isPermissionChangeDowntPercentage = this.userPermissions.some(x => x.Name === 'Sales_Documents_ChangeDownPaymentPercentage');
    this.canChangePriceList = this.userPermissions.some(x => x.Name === 'Sales_Documents_ChangePriceList');
    this.canChangePartialPrice = this.userPermissions.some(x => x.Name === 'Sales_Document_PartialPay');


    //#endregion

    //#region SETEO INICIAL
    this.documentForm.reset();
    this.isEditDocument = false;
    this.documentForm.controls['Quantity'].setValue(1);
    this.documentForm.controls['PartialAmount'].setValue(0);
    this.IsPartialPay.setValue(false);
    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['DocDueDate'].setValue(new Date(ZoneDate()));

    if(this.typeDocument == DocumentType.Quotations){

      this.documentForm.controls['DocDueDate'].setValue(this.GetAdjustedDate());
    }

    if (this.typeDocE && this.typeDocE.length > 0) {
      this.documentForm.controls['TipoDocE'].setValue(this.typeDocE.find((x) => x.IsDefault)?.Name);
    }
    //#endregion

    //#region FACTURAS EN MEMORIA
    const data = this.settings.find(x => x.Code === SettingCode.MemoryInvoice);
    if (data) {
      const list: IMemoryInvoiceSetting[] = JSON.parse(data.Json);
      this.memoryInvoice = list.find(element => element.CompanyId === this.selectedCompany?.Id) || {} as IMemoryInvoiceSetting;
    }
    //#endregion

    //#region PERMISOS TABLA
    this.editableFieldConf =
      {
        Permissions: this.userPermissions,
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(x => x.Name === _columnPerm.Name),
        Columns: this.editableField,

      };

    this.lineMappedDisplayColumns.editableFieldConf = this.editableFieldConf;
    //#endregion

    //#region PLANES DE LEALTAD

    const loyaltyData = this.settings.find(x => x.Code === SettingCode.Points);
    this.tappActive = false;
    this.lealtoActive = false;
    if (loyaltyData && loyaltyData.IsActive) {
      const genericLoyaltySettings = JSON.parse(loyaltyData.Json);
      this.tappSettings = genericLoyaltySettings['Tapp'] as ITappConfigBase;
      this.lealtoSettings = genericLoyaltySettings['Lealto'] as ILealtoConfigBase;
      this.hasActiveLoyalty = this.tappSettings?.TappConfigs?.some(x => x.CompanyId === this.selectedCompany?.Id && x.Active);
      this.tappActive = this.hasActiveLoyalty;
      if (!this.hasActiveLoyalty) {
        this.hasActiveLoyalty = this.lealtoSettings?.LealtoConfigs?.some(x => x.CompanyId === this.selectedCompany?.Id && x.Active);
        this.lealtoActive = this.hasActiveLoyalty;
      }
    } else {
      this.hasActiveLoyalty = false;
    }
    //#endregion

    //#region BP POR DEFECTO
    this.LoadDataBp(this.DefaultBusinessPartner as IBusinessPartner);
    //#endregion

    //#region CANTIDAD DE DECIMALES DE LA COMPANY

    if (this.settings.find((element) => element.Code == SettingCode.Decimal)) {
      let companyDecimal: IDecimalSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '');

      if (companyDecimal && companyDecimal.length > 0) {

        let decimalCompany = companyDecimal.find(x => x.CompanyId === this.selectedCompany?.Id) as IDecimalSetting;

        if (decimalCompany) {
          this.DecimalTotalDocument = decimalCompany.TotalDocument;
          this.DecimalUnitPrice = decimalCompany.Price;
          this.DecimalTotalLine = decimalCompany.TotalLine;
          this.TO_FIXED_TOTALDOCUMENT = `1.${this.DecimalTotalDocument}-${this.DecimalTotalDocument}`;

        }
      }

    }

    //#endregion

    //#region AUTO WITHHOLDING DE LA COMPANY

    if (this.settings.find((element) => element.Code == SettingCode.AutoWithholding)) {
      let companyAutoWithholdingSetting: IAutoWithholdingSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.AutoWithholding)?.Json || '');

      if (companyAutoWithholdingSetting && companyAutoWithholdingSetting.length > 0) {

        let autoWithholdingCompany = companyAutoWithholdingSetting.find(x => x.CompanyId === this.selectedCompany?.Id) as IAutoWithholdingSetting;

        if (autoWithholdingCompany) {
          this.AutoWithholdingExpenseCode = autoWithholdingCompany.ExpenseCode;
          this.AutoWithholdingTaxCode = autoWithholdingCompany.TaxCode;
        }
      }

    }

    //#endregion

    //#region VALIDACION DE INVENTARIO

    if (this.settings.find((element) => element.Code == SettingCode.ValidateInventory)) {
      this.vldInventoryCompany = JSON.parse(this.settings.find((element) => element.Code == SettingCode.ValidateInventory)?.Json || '');
    }

    if (this.vldInventoryCompany && this.vldInventoryCompany.length > 0) {

      let dataInventoryCompany = this.vldInventoryCompany.find(x => x.CompanyId === this.selectedCompany?.Id) as IValidateInventorySetting;

      if (dataInventoryCompany && dataInventoryCompany.Validate.length > 0) {

        this.vldInventoryvldInventory = dataInventoryCompany.Validate.filter(x => x.Table === this.typeDocument)[0] ?? {} as IValidateInventory;
        if (this.typeInvoice === TypeInvoices.RESERVE_INVOICE) {
          if (this.vldInventoryvldInventory) {
            this.vldInventoryvldInventory.ValidateInventory = false;
            this.vldInventoryvldInventory.ValidateBatchesInventory = false;
          }
        }

      }

    }

    //#endregion

    //#region INSERTA LINEA AL INICIO O AL FINAL

    if (this.settings.find((element) => element.Code == SettingCode.LineMode)) {
      this.ICompanyValidateLine = JSON.parse(this.settings.find((element) => element.Code == SettingCode.LineMode)?.Json || '');


      if (this.ICompanyValidateLine && this.ICompanyValidateLine.length > 0) {

        let dataValidateLineCompany = this.ICompanyValidateLine.find(x => x.CompanyId === this.selectedCompany?.Id) as ILineModeSetting;

        if (dataValidateLineCompany && dataValidateLineCompany.Validate.length > 0) {

          this.vldLineMode = dataValidateLineCompany.Validate.filter(x => x.Table === this.typeDocument)[0];

        }

      }

    }

    //#endregion

    //#region PINPAD
    if (this.settings.find((element) => element.Code == SettingCode.Payment)) {
      let payment = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '') as IPaymentSetting[];

      if (payment && payment.length > 0) {
        let dataPayment = payment.find(x => x.CompanyId === this.selectedCompany?.Id) as IPaymentSetting;

        if (dataPayment) {
          this.PaymentConfiguration = dataPayment;
          // Store the types of documents allowed for withholding
          const documentsAllowedWithholding = new Set<string>([
            DocumentType.Orders,
            DocumentType.Invoices,
            DocumentType.ArDownPayments
          ]);
          this.RetentionProcessPermission(dataPayment, documentsAllowedWithholding);
        }
      }
    }
    //#endregion

    //#region CONFIGURACION DE ACTIVAR MODAL
    if (this.settings.find((element) => element.Code == SettingCode.Payment)) {
      let payment = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '') as IPaymentSetting[];

      if(payment && payment.length > 0)
      {
        let dataPayment = payment.find(x => x.CompanyId === this.selectedCompany?.Id) as IPaymentSetting;

        if(dataPayment)
        {
            this.modalProcessEnabled = !dataPayment.ModalProcess;
        }
      }

    }

    //#endregion

    //#region DESACTIVAR EL DRAG AND DROP
    let payment = this.settings.find((element) => element.Code == SettingCode.Payment);
    if (payment && payment.Json) {
      let data = JSON.parse(payment.Json) as IPaymentSetting[];
      if (data) {
        this.disableDragAndDrop = !!data.find(x => x.CompanyId === this.selectedCompany?.Id)?.OrderLine;
      }
    }

    //#endregion

    //#region CAMPOS FACTURA
    if (this.settings.some(s => s.Code === SettingCode.FieldsInvoice)) {
      let Settings = JSON.parse(this.settings.find(s => s.Code === SettingCode.FieldsInvoice)?.Json || '[]') as IFieldsInvoiceSetting[];

      let fieldsInvoiceSetting = Settings.find(s => s.CompanyId === this.selectedCompany?.Id) as IFieldsInvoiceSetting;

      if (fieldsInvoiceSetting) {
        this.displayTypeInvoice = fieldsInvoiceSetting.DisplayTypeInvoice;
        this.changeCurrencyLines = fieldsInvoiceSetting.ChangeCurrencyLine;
      }

    }
    //#endregion

    this.MsgPreviewDocument = Repository.Behavior.GetStorageObject<string>(StorageKey.PreviewDocumentMessage) || '';

    //#region Methodo de impresion


    //#region AGREGAR UDFS A NIVEL DE LINEA
    if (this.udfsLines && this.udfsLines.length > 0) {
      MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns, this.dropdownColumns);
      this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
    }
    //#endregion


    //#region PRELOADED DOCUMENT

    if (this.preloadedDocument) {
      this.setData();
      this.InflateTableLines();
      this.GetTotals();
      if (this.udfsLines && this.udfsLines.length > 0) {
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);

      }
    }

    if(this.documentAttachment.Attachments2_Lines && this.documentAttachment.Attachments2_Lines.length)
    {
      this.InflateAttachmentTable();
    }
    //#endregion

    //#region ELIMINAR CAMPO DE BONIFICADO PARA FACTURAS ANTICIPOS
    if (this.controllerToSendRequest == 'DownPayments') {
      this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly')
    }

    //#endregion

    //#region VALIDAR SI MANEJA MONEDA A NIVEL DE LINEA

    if (!this.changeCurrencyLines) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
    }
    //#endregion

    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);

  }

  private RetentionProcessPermission(dataPayment: IPaymentSetting, documentsAllowedWithholding: Set<string>) {
    const invoiceAllowedWithholding = documentsAllowedWithholding.has(this.typeDocument);

    if (!dataPayment?.RetentionProcess || !invoiceAllowedWithholding) {
      this.retentionProcessEnabled = false;
      return;
    }

    const permissionMap: Record<string, string> = {
      [DocumentType.Orders]: 'Sales_SalesOrder_RetentionProcess',
      [DocumentType.Invoices]: 'Sales_SalesInvoice_RetentionProcess',
      [DocumentType.ArDownPayments]: 'Sales_SalesArDownPayments_RetentionProcess'
    };

    const requiredPermission = permissionMap[this.typeDocument];
    this.retentionProcessEnabled = this.userPermissions.some(permission => permission.Name === requiredPermission);
  }

  /**
   *METODO PARA OBTENER LOS DATOS DE LA TARJETA DE PUNTOS
   * @constructor
   * @private
   */
  private GetDataCardPoints(): ICardSettings | null {

    let cardConfig = null;
    let cardModal = null;

    if (this.hasActiveLoyalty) {
      cardConfig = this.tappSettings.TappConfigs.find(x => x.CompanyId === this.selectedCompany?.Id && x.Active)?.Card;
      if (cardConfig) {
        cardModal = {
          CreditCard: cardConfig.Id,
          CreditCardNumber: cardConfig.CardNumber,
          CreditAcct: cardConfig.Account,
          FormatCode: ``,
          CardValid: cardConfig.Valid,
          OwnerIdNum: cardConfig.Owner,
          VoucherNum: cardConfig.Voucher
        } as ICardSettings
      } else {
        cardConfig = this.lealtoSettings.LealtoConfigs.find(x => x.CompanyId === this.selectedCompany?.Id && x.Active)?.Card;
        if (cardConfig) {
          cardModal = {
            CreditCard: cardConfig.Id,
            CreditCardNumber: cardConfig.CardNumber,
            CreditAcct: cardConfig.Account,
            FormatCode: ``,
            CardValid: cardConfig.Valid,
            OwnerIdNum: cardConfig.Owner,
            VoucherNum: cardConfig.Voucher
          } as ICardSettings
        }
      }
    }

    return cardModal;
  }


  private processDialogOpenDialogGoodReceipt(): Observable<boolean> {
    return this.OpenDialogGoodReceipt().pipe(
      switchMap(dialogResult => {
        if (dialogResult && dialogResult.length > 0) {
          this.overlayService.OnGet();
          return from(dialogResult).pipe(
            concatMap(item =>
              this.itemService.GetStock<IStockWarehouses[]>(item.ItemCode).pipe(
                map(callback => {
                  if (callback && callback.Data) {
                    let warehouse = callback.Data.find(y => y.WhsCode === item.WarehouseCode);

                    if (warehouse) {
                      this.lines.forEach((line, index) => {
                        if (line.ItemCode === item.ItemCode && line.WarehouseCode === item.WarehouseCode) {
                          this.lines[index].OnHand = warehouse?.OnHand || 0;
                        }
                      });
                    }
                  }
                })
              )
            ),
            last(),
            toArray(),
            map(array => {
              this.InflateTableLines()
              return !(array.length > 0)
            }),
            finalize(() => this.overlayService.Drop())
          );
        } else {
          return of(false);
        }
      })
    );
  }

  /**
   * This method is used to get class when active loyalty plan or down payments
   * @constructor
   */
  public GetClassCss(): string {
    return this.hasActiveLoyalty && this.typeDocument !== DocumentType.ArDownPayments ? 'input-group' : '';
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
            if(this.typeDocument != DocumentType.Orders && this.typeDocument != DocumentType.Quotations){
              this.documentForm.controls['DocDueDate'].setValue(date);
            }
          } else if (payTerms.Months) {
            let date = AddMonths(payTerms.Months);
            if(this.typeDocument != DocumentType.Orders && this.typeDocument != DocumentType.Quotations){
              this.documentForm.controls['DocDueDate'].setValue(date);
            }
          } else {
            if(this.typeDocument != DocumentType.Orders && this.typeDocument != DocumentType.Quotations){
              this.documentForm.controls['DocDueDate'].setValue(new Date());
            }

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

  private ValidateAttachTable(): void {
    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;
    this.IgnoreColumns = this.lineMappedColumns.IgnoreColumns || [];
    this.PropertysIgnoreColumns = [];

    if(urlSegment?.length > 0 && urlSegment[2]){
      this.currentUrl = urlSegment[2].path;
    }


    switch (this.currentUrl) {
      case 'quotations':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.Quotations);
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.Quotations);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'orders':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table ==DocumentTypes.Orders)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.Orders);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'invoices':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.Invoices)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.Invoices);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'down-payments':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.ArDownPayments)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.ArDownPayments);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'reserve-invoice':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.Invoices)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.Invoices);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'delivery':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.DeliveryNotes)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.DeliveryNotes);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;
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
          this.itemService.GetByScan<ItemSearchScan[]>(response, this.currentSession.WhsCode, ItemsFilterType.SellItem)
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

  private FilterButtonsByPermission(): void {
    const userPermissions = this.userPermissions.map(permission => permission.Name);
    const permissionMap: Record<string, { Permission: string; Options?: Record<string, string> }> = {
      'editar': {
        Permission: 'Sales_Document_EditArticle',
        Options: {
          'Ubicación': 'Sales_Document_EditArticleLocation',
          'Lotes': 'Sales_Document_EditArticleLots',
          'Series': 'Sales_Document_EditArticleSeries',
          'Dimensiones': 'Sales_Document_EditArticleDimensions',
        },
      }
    };
    this.buttons = this.buttons.filter(button => {
      const permissionKey = button.Title.toLowerCase();
      if (permissionMap[permissionKey]) {
        return this.HasPermission(button, userPermissions, permissionMap);
      }
      return true;
    });
  }

  private HasPermission(
    button: ICLTableButton,
    userPermissions: string[],
    permissionMap: Record<string, { Permission: string; Options?: Record<string, string> }>
  ): boolean {
    const permissionKey = button.Title.toLowerCase();
    const permission = permissionMap[permissionKey];
    if (!permission) {
      return false;
    }
    const hasMainPermission = userPermissions.includes(permission.Permission);
    if (button.Options) {
      button.Options = this.FilterOptionsByPermission(button.Options, permission.Options, userPermissions);
      const hasValidOptions = button.Options.length > 0;
      return hasMainPermission && hasValidOptions;
    }
    return hasMainPermission;
  }

  private FilterOptionsByPermission(
    options: ICLTableButton[],
    permissionOptions: Record<string, string> | undefined,
    userPermissions: string[]
  ): ICLTableButton[] {
    return options.filter(optionButton => {
      const optionPermission = permissionOptions?.[optionButton.Title];
      return optionPermission && userPermissions.includes(optionPermission);
    });
  }

  private ValidateListNum (): void {
    if (this.preloadedDocActionType === PreloadedDocumentActions.COPY || this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE ||
      this.preloadedDocActionType === PreloadedDocumentActions.EDIT || this.preloadedDocActionType === PreloadedDocumentActions.CREATE_FROM_DRAFT) {
      if (this.preloadedDocument?.PriceList == undefined || this.preloadedDocument?.PriceList == 0 || this.preloadedDocument?.PriceList == null) {
        this.modalService.Continue({
          title: `No se definió la lista de precios del documento.`,
          subtitle: 'No se definió la lista de precios del documento, se utilizará la lista por defecto definida en el socio de negocio.',
          type: CLModalType.INFO
        });

        if (this.DefaultBusinessPartner?.PriceListNum == 0 || this.DefaultBusinessPartner?.PriceListNum == null) {
          this.modalService.Continue({
            title: `El socio de negocios no tiene lista de precios por defecto.`,
            subtitle: 'El socio de negocios no tiene lista de precios por defecto, por favor seleccione otro socio de negocios.',
            type: CLModalType.INFO
          });
        } else {
          this.documentForm.patchValue({
            PriceList: this.DefaultBusinessPartner?.PriceListNum ? this.priceList.find(x => x.ListNum === this.DefaultBusinessPartner?.PriceListNum)?.ListNum : this.priceList[0]?.ListNum
          });
        }
      }
    }
    if(this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE){
      this.documentForm.patchValue({ CardCode: '', CardName: '' });
      this.isFirstBusinessPartnerSelection = true;
    }
  }

  private generateHash(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result:string = '';
    for (let i:number = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
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
   * Method for validated columns table items
   * @constructor
   * @private
   */
  private ValidateColumnsItems():void{
    switch (this.currentUrl) {

      case 'quotations':
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewCCost)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewTaxOnly)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewUoMEntry)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewDistNumber)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewBinCode)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewLastPurchasePrice)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewCurrencyLines)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Quotations_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;
      case 'orders':
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewCCost)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewTaxOnly)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewUoMEntry)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewDistNumber)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewBinCode)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewLastPurchasePrice)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewCurrencyLines)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Orders_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;
      case 'invoices':
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewCCost)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewTaxOnly)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewUoMEntry)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewDistNumber)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewBinCode)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewLastPurchasePrice)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewCurrencyLines)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Invoices_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }

        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;
      case 'down-payments':
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewCCost)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewTaxOnly)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewUoMEntry)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewDistNumber)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewBinCode)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewLastPurchasePrice)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewCurrencyLines)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_DownPayments_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);

        break;
      case 'reserve-invoice':
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewCCost)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewTaxOnly)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewUoMEntry)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewDistNumber)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewBinCode)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewLastPurchasePrice)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewCurrencyLines)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_ReserveInvoice_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;

      case 'delivery':
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewCCost)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewTaxOnly)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewUoMEntry)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewDistNumber)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewBinCode)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewLastPurchasePrice)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewCurrencyLines)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
        }
        if (!this.userPermissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_Delivery_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);

        break;

    }
  }

  /**
   * Loads blanket agreements for a specific business partner.
   *
   * @param cardCode The card code associated with the business partner.
   * @param _businessPartner The business partner object for which blanket agreements need to be loaded.
   */
  public LoadBlankeetAgrements( cardCode:string, _businessPartner: IBusinessPartner) {
    if(cardCode) {
      this.overlayService.OnGet();
      this.agreementsService.Get<IBlanketAgreements[]>(cardCode).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          this.blanketAgreements = callback.Data;
        },
        error: (err) => this.alertsService.ShowAlert({HttpErrorResponse: err})
      });
    }else if(_businessPartner!=null && !Array.isArray(_businessPartner)) {
      this.overlayService.OnGet();
      this.agreementsService.Get<IBlanketAgreements[]>(_businessPartner.CardCode).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback) => {
          this.blanketAgreements = callback.Data;
        },
        error: (err) => this.alertsService.ShowAlert({HttpErrorResponse: err})
      });
    }
  }

  /**
   * Updates the available withholding taxes based on the specified Business Partner.
   * @param {string} _cardCode - The unique identifier of the Business Partner.
   */
  private GetWithholdingTaxByBP(_cardCode: string): void{
    if(_cardCode){
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
    }
  }

  /**
   * Method to use for validated permission to create draft
   * @constructor
   * @private
   */
  private ValidatePermissionToAvailableDraft(): void {

    switch (this.currentUrl) {
      case 'quotations':
        this.canCreateDraft = this.userPermissions.some(x => x.Name === PermissionValidateDraft.SalesDocumentsQuotationsCreateDraft);
        break;
      case 'orders':
        this.canCreateDraft = this.userPermissions.some(x => x.Name === PermissionValidateDraft.SalesDocumentsOrdersCreateDraft);
        break;
      case 'invoices':
        this.canCreateDraft = this.userPermissions.some(x => x.Name === PermissionValidateDraft.SalesDocumentsInvoicesCreateDraft);
        break;
      case 'down-payments':
        this.canCreateDraft=true;
        break;
      case 'reserve-invoice':
        this.canCreateDraft = this.userPermissions.some(x => x.Name === PermissionValidateDraft.SalesDocumentsReserveInvoiceCreateDraft);
        break;
      case 'delivery':
        this.canCreateDraft=true;
        break;
    }
  }

  /**
   * Method to handle the selection of an address from the address list.
   * @param _address Selected address from the address list
   */
  AdressSelected(_address: IBPAddresses): void {
    this.deliveryAddressSelected = _address;
  }
}
