import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {
  IFieldsInvoiceSetting,
  IPaymentSetting, IPrintFormatSetting,
  ISettings,
  IValidateAttachmentsSetting, IValidateAutomaticPrintingsSetting
} from "@app/interfaces/i-settings";
import {ICompany} from "@app/interfaces/i-company";
import {IDecimalSetting, IDefaultBusinessPartnerSetting} from "../../../interfaces/i-settings";
import {IAttachments2Line, IBPAddresses, IBusinessPartner} from "@app/interfaces/i-business-partner";
import {IDocumentLine, ILinesCurrencies, ItemSearchScan} from "@app/interfaces/i-items";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {IPriceList} from "@app/interfaces/i-price-list";
import {IChangeWarehouse, IWarehouse} from "@app/interfaces/i-warehouse";
import {IPayTerms} from "@app/interfaces/i-pay-terms";
import {ITaxe} from "@app/interfaces/i-taxe";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
} from "rxjs";
import {IActionButton} from "@app/interfaces/i-action-button";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {Copy, PrinterWorker, SharedService} from "@app/shared/shared.service";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {ActivatedRoute, Router} from "@angular/router";
import {BusinessPartnersService} from "@app/services/business-partners.service";
import {OverlayService} from "@clavisco/overlay";
import {ItemsService} from "@app/services/items.service";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {
  DropdownElement,
  IEditableField,
  IEditableFieldConf,
  IInputColumn,
  IRowByEvent
} from "@clavisco/table/lib/table.space";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {StorageKey} from "@app/enums/e-storage-keys";
import {ICreditMemoComponentResolvedData} from "@app/interfaces/i-resolvers";
import {
  ControllerName,
  CopyFrom,
  DocumentType,
  DocumentTypes,
  ItemSerialBatch,
  ItemsFilterType,
  ListMaterial,
  PermissionEditDocumentsDates, PermissionViewColumnsItems,
  PreloadedDocumentActions,
  SettingCode,
  Titles,
  ViewBatches
} from "@app/enums/enums";
import {IUserAssign} from "@app/interfaces/i-user";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IFeData, IPadron} from "@app/interfaces/i-padron";
import {IDocument} from "@app/interfaces/i-sale-document";
import {CreditNotesService} from "@app/services/credit-notes.service";
import {PadronService} from "@app/services/padron.service";
import {IUdf, IUdfContext, IUdfDevelopment, UdfSourceLine} from "@app/interfaces/i-udf";
import {MatDialog} from "@angular/material/dialog";
import {StockWarehousesComponent} from "@Component/sales/stock-warehouses/stock-warehouses.component";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {
  IBatches,
  IBatchResult,
  IBatchSelected,
  IDocumentLinesBinAllocations,
  ISerialNumbers
} from "@app/interfaces/i-serial-batch";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {IStructures} from "@app/interfaces/i-structures";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {ReportsService} from "@app/services/reports.service";
import {
  AddDays,
  AddMonths, ApplyBlanketAgreements,
  CLTofixed,
  FormatDate,
  GetIndexOnPagedTable,
  GetUdfsLines,
  MappingDefaultValueUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines,
  SetDataUdfsLines, SetUdfsLineValues,
  ValidateLines,
  ValidateUdfsLines,
  ZoneDate
} from "@app/shared/common-functions";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {ISalesDocument, IUniqueId, ULineMappedColumns} from "@app/interfaces/i-document-type";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {CommonService} from "@app/services/common.service";
import {BatchesService} from "@app/services/batches.service";
import {LotComponent} from "@Component/sales/document/lot/lot.component";
import {SalesPersonService} from "@app/services/sales-person.service";
import {PriceListService} from "@app/services/price-list.service";
import {PayTermsService} from "@app/services/pay-terms.service";
import {TaxesService} from "@app/services/taxes.service";
import {WarehousesService} from "@app/services/warehouses.service";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {SettingsService} from "@app/services/settings.service";
import {StructuresService} from "@app/services/structures.service";
import {UdfsService} from "@app/services/udfs.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {CurrenciesService} from "@app/services/currencies.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {formatDate} from "@angular/common";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {AttachmentsService} from "@app/services/Attachments.service";
import {DimensionsComponent} from "@Component/sales/document/dimensions/dimensions.component";
import {IDimensionsSelected} from "@app/interfaces/i-dimensions";
import {DimensionsService} from "@app/services/dimensions.service";
import ICLResponse = Structures.Interfaces.ICLResponse;
import CL_DISPLAY = Structures.Enums.CL_DISPLAY;
import {IBlanketAgreements} from "@app/interfaces/i-blanket-agreements.ts";
import {BlanketAgreementsService} from "@app/services/blanket-agreements.service";

@Component({
  selector: 'app-credit-memo',
  templateUrl: './credit-memo.component.html',
  styleUrls: ['./credit-memo.component.scss']
})
export class CreditMemoComponent implements OnInit, OnDestroy, AfterViewInit {

  /*FORMULARIOS*/
  documentForm!: FormGroup;
  feForm!: FormGroup;

  /*OBSERVABLES*/
  subscriptions$!: Subscription;
  changeWarehouse$ = new Subject<string>();


  /*VARIABLES*/
  total: number = 0;
  totalFC: number = 0;
  discount: number = 0;
  discountFC: number = 0;
  tax: number = 0;
  taxFC: number = 0;
  totalWithoutTax = 0;
  totalWithoutTaxFC: number = 0;
  index: number = 0;
  isToggleFe = false;
  isCashCustomer = false;
  canChangeDocDate: boolean = true;
  canChangeDocDueDate: boolean = true;
  canChangeTaxDate: boolean = true;
  docEntry: number = 0;
  accion: string = '';
  from: string = '';
  IdTranAcumular: string = '';
  IdTranRedimir: string = '';
  docCurrency: string = '';
  TO_FIXED_TOTALDOCUMENT: string = '1.0-0';
  uniqueId: string = '';
  isPermissionChangeCurrency = true;
  isUseInvoiceNumber = false;
  changeCurrencyLines: boolean = false;
  shouldPaginateRequest: boolean = false;
  canChangePriceList: boolean = true;
  disableDragAndDrop: boolean = false;
  isFirstBusinessPartnerSelection: boolean = false;
  hasCompanyAutomaticPrinting: boolean = false;

  DecimalUnitPrice = 0; // Decimal configurado para precio unitario
  DecimalTotalLine = 0; //Decimal configurado por compania para total de linea
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento

  /*OBJECTS*/
  DefaultBusinessPartner!: IBusinessPartner | null;
  userAssign!: IUserAssign;
  currentSession!: ICurrentSession;
  selectedCompany!: ICompany | null;
  documentData!: IDocument | null;
  companyReportValidateAutomaticPrinting!: IValidateAutomaticPrintingsSetting;

  //#region listas
  uom: DropdownElement[] = [];
  curr: DropdownElement[] = [];
  settings: ISettings[] = [];
  businessPartners: IBusinessPartner[] = [];
  items: ItemSearchTypeAhead[] = [];
  salesPersons: ISalesPerson[] = [];
  priceLists: IPriceList[] = [];
  warehouse: IWarehouse[] = [];
  payTerms: IPayTerms[] = [];
  taxes: ITaxe[] = [];
  permissions: IPermissionbyUser[] = [];
  currencies: ICurrencies[] = [];
  TypeIdentification: IStructures[] = [];
  udfs: IUdfContext[] = [];
  actionButtons: IActionButton[] = [];
  udfsLines: IUdfContext[] = [];
  companyPrintFormat: IPrintFormatSetting[] = [];
  companyValidateAutomaticPrinting: IValidateAutomaticPrintingsSetting[] = [];
  //#endregion

  //#region @clavisco/table Configuration
  lineTableId: string = 'LINE-TABLE-CREDITMEMO';
  lineMappedColumns!: MappedColumns;
  InputColumns: IInputColumn[] = [
    {ColumnName: 'UnitPrice', FieldType: 'number'},
    {ColumnName: 'Quantity', FieldType: 'number'},
    {ColumnName: 'DiscountPercent', FieldType: 'number'},
    {ColumnName: 'ItemDescription', FieldType: 'text'},
  ];

  lines: IDocumentLine[] = [];
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  dropdownColumns: string[] = ['TaxCode', 'WarehouseCode', 'UoMEntry', 'IdCurrency'];
  checkboxColumns: string[] = ['TaxOnly'];
  dropdownList!: DropdownList;
  buttons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_2,
      Icon: `edit`,
      Color: `primary`,
      Data: '',
      Options: [
        {
          Title: `Lotes`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_3,
          Icon: `edit`,
          Color: `primary`,
          Data: 'Lote'
        },
        {
          Title: `Dimensiones`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_4,
          Icon: `edit`,
          Color: `primary`,
          Data: 'Dimension'
        }
      ],
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
    },
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
      ColumnName: 'TaxRate',
      Permission: {Name: 'Sales_Documents_EditItemTax'}
    },
    {
      ColumnName: 'WarehouseCode',
      Permission: {Name: 'Sales_Documents_EditItemWarehouse'}
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
  dropdownDiffList: DropdownList = {};
  dropdownDiffBy = 'IdDiffBy';
  headerTableColumns: { [key: string]: string } = {
    Id: '#',
    ItemCode: 'Código',
    ItemDescription: 'Descripción',
    CostingCode: 'C.Costo',
    UnitPrice: 'Precio',
    IdCurrency: 'Moneda',
    Quantity: 'Cantidad',
    DiscountPercent: 'Descuento',
    TaxOnly: 'Bonificado',
    TaxCode: 'Impuesto',
    WarehouseCode: 'Almacén',
    UoMEntry: 'U.Medida',
    DistNumber: 'Serie',
    Total: 'Total',
    VATLiable: 'Sujeto a impuestos'
  }

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
      'ManBtchNum', 'ManSerNum', 'DocumentLinesBinAllocations', 'SysNumber', 'SerialNumbers', 'BinCode', 'BatchNumbers',
      'TotalDescFC', 'TotalDescCOL', 'TotalImpFC', 'TotalImpCOL', 'LastPurchasePriceFC', 'Udfs',
      'TreeType', 'BillOfMaterial', 'ManBinLocation', 'RowColor', 'FatherCode', 'LineStatus', 'RowMessage', 'LockedUnitPrice',
      'IdDiffBy', 'LinesCurrenciesList', 'CurrNotDefined', 'Currency','QuantityOriginal','HideComp','HasGroup', 'LineTotal',
      'CostingCode2', 'CostingCode3', 'CostingCode4', 'CostingCode5', 'WhsName','IsAServerLine','Freight','ShipToCode']
  }
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  //#endregion
  //#region Udfs
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsDataHeader: IUdf[] = [];
  udfsLinesValue: UdfSourceLine[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'ORIN';
  isVisible: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";
  localCurrency!: ICurrencies;

  //#endregion
  //#region component search
  searchModalId = "searchModalId";
  searchItemModalId = "searchItemModalId";
  //#endregion
  documentAttachment: IDocumentAttachment = {
    AbsoluteEntry: 0,
    Attachments2_Lines: []
  } as IDocumentAttachment;
  attachmentFiles: File[] = [];
  attachmentTableId: string = "CreditMemoDocumentAttachmentTableId";
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
  requestingItem: boolean = false;
  private onScanCode$ = new Subject<string>();
  scannedCode: string = '';

  ValidateAttachmentsTables?: IValidateAttachmentsSetting=undefined;
  IsVisibleAttachTable:boolean=false;

  /**
   * Contains object for print report setting
   */
  reportConfigured!:  IPrintFormatSetting;

  /**
   * Conatins array object to blanket Agreements
   */
  blanketAgreements :IBlanketAgreements[] = [];
  
  canChangeDeliveryAddres: boolean = false;
  deliveryAddressSelected!: IBPAddresses;
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
    private creditNotesService: CreditNotesService,
    private modalService: ModalService,
    private padronService: PadronService,
    private matDialog: MatDialog,
    private reportsService: ReportsService,
    private commonService: CommonService,
    private batchesService: BatchesService,
    private salesMenService: SalesPersonService,
    private priceListService: PriceListService,
    private payTermService: PayTermsService,
    private taxesService: TaxesService,
    private dimensionService: DimensionsService,
    private warehouseService: WarehousesService,
    private exchangeRateService: ExchangeRateService,
    private permissionUserService: PermissionUserService,
    private settingService: SettingsService,
    private structuresService: StructuresService,
    private udfsService: UdfsService,
    private printerWorkerService: PrinterWorkerService,
    private currenciesService: CurrenciesService,
    private attachmentService: AttachmentsService,
    private agreementsService:BlanketAgreementsService,
  ) {
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.subscriptions$ = new Subscription();
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.subscriptions$.unsubscribe();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.accion !== '') {
        this.router.navigateByUrl('/').then(() => {
          this.router.navigate(['sales', 'credit-memo']);
        })
      }
    });
    this.OnLoad();
  }

  /**
   * Method is executed after Angular initializes the component views
   */
  ngAfterViewInit(): void {
    if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
      this.SetUDFsValues();
    }
  }

  public ToggleFe(): void {
    this.isToggleFe = !this.isToggleFe;
  }

  private OnLoad(): void {

    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.InitForm();
    this.SelectPayTerms();
    this.HandleResolvedData();
    this.ConfigSelectInRows();
    this.ChangeWarehouse();
    this.RefreshRate();
    this.ValidatePermissionToEditDate();
    this.ListenScan();
    this.ValidateColumnsItems();
    this.FilterButtonsByPermission();
    this.ValidateListNum();

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

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalItemRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);

    this.subscriptions$.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
    this.subscriptions$.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    if(this.ValidateAttachmentsTables){
      let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.CreditNotes)
      if(setting){
        if ('Active' in setting) {
          this.IsVisibleAttachTable = setting.Active != true ? false : true;
        } else {
          this.IsVisibleAttachTable = false;
        }
      }
    }

    if(this.companyReportValidateAutomaticPrinting){
      let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.CreditNotes);
      this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
    }

    if(!this.permissions.some(permission => permission.Name == 'Sales_Document_ViewSeriesColumn')){
      this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
    }

    // Check if the user has permission to change the delivery address
    this.canChangeDeliveryAddres = this.permissions.some(permission => permission.Name ===  'W_Sales_CreditMemo_ChangeDeliveryAddress');
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

    this.warehouse.forEach(x => {
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

  private HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (res) => {
        const resolvedData = res['resolvedData'] as ICreditMemoComponentResolvedData;

        if (resolvedData) {

          this.items = resolvedData.Items ?? [];
          this.DefaultBusinessPartner = resolvedData.BusinessPartner;
          this.priceLists = resolvedData.PriceList ?? [];
          this.payTerms = resolvedData.PayTerms ?? [];
          this.salesPersons = resolvedData.SalesPersons ?? [];
          this.permissions = resolvedData.Permissions ?? [];
          this.settings = resolvedData.Settings ?? [];
          this.warehouse = resolvedData.Warehouse ?? [];
          this.currencies = resolvedData.Currency ?? [];
          this.localCurrency = this.currencies.find(c => c.IsLocal)!;
          this.docCurrency = this.localCurrency?.Id;
          this.taxes = resolvedData.Taxes;
          this.TypeIdentification = resolvedData.TypeIdentification ?? [];
          this.udfsLines = resolvedData.UdfsLines;
          this.udfsLinesValue = resolvedData.UdfsData || [];
          this.udfsDataHeader = resolvedData.UdfsDataHeader || [];
          this.udfsDevelopment = resolvedData.UdfsDevelopment;
          this.documentData = resolvedData?.Invoice;
          this.ValidateAttachmentsTables = resolvedData?.ValidateAttachmentsTables??undefined;
          this.documentAttachment = {
            AbsoluteEntry: resolvedData?.Invoice?.AttachmentEntry ?? 0,
            Attachments2_Lines: (resolvedData?.AttachmentLines ?? []).map((attL, index) => ({...attL, Id: index + 1}))
          };
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
    })
  }

  /**
   * Initializes the forms for creating or editing a document
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
      DocCurrency: [''],
      Comments: ['',],
      NumAtCard: [''],
      DocDate: ['',[Validators.required]],
      DocDueDate: ['',[Validators.required]],
      TaxDate: ['',[Validators.required]],
      Quantity: [1, [Validators.min(1)]]
    });

    this.feForm = this.fb.group({
      IdType: ['', Validators.required],
      Identification: [''],
      Email: ['', Validators.required]
    });


  }

  /**
   * Validates if the current user has permissions to edit the document date
   * @constructor
   * @private
   */
  private ValidatePermissionToEditDate(): void {
    this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsCreditMemoChangeDocDate);
    this.canChangeDocDueDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.SalesDocumentsCreditMemoChangeDocDueDate);
    this.canChangeTaxDate = this.permissions.some(x => x.Name ===  PermissionEditDocumentsDates.SalesDocumentsCreditMemoChangeTaxDate);

    if (!this.canChangeDocDate) {
      this.documentForm.controls['DocDate'].disable();
    }
    if (!this.canChangeDocDueDate) {
      this.documentForm.controls['DocDueDate'].disable();
    }
    if (!this.canChangeTaxDate) {
      this.documentForm.controls['TaxDate'].disable();
    }
  }


  public DisplayTotal(_option: number): number {
    if (_option === 1) {
      if (this.localCurrency?.Id === this.docCurrency) {
        return this.totalFC;
      } else {
        return this.total;
      }
    } else {
      {
        if (this.localCurrency?.Id === this.docCurrency) {
          return this.total;
        } else {
          return this.totalFC;
        }
      }
    }

  }

  public DisplaySubtotal(): number {
    if (this.localCurrency?.Id === this.docCurrency) {
      return this.totalWithoutTax;
    } else {
      return this.totalWithoutTaxFC;
    }
  }

  public DisplayDiscount(): number {
    if (this.localCurrency?.Id === this.docCurrency) {
      return this.discount;
    } else {
      return this.discountFC;
    }
  }

  public DisplayTaxes(): number {
    if (this.localCurrency?.Id === this.docCurrency) {
      return this.tax;
    } else {
      return this.taxFC;
    }
  }

  /**
   * Calculate the total edited line
   * @param _index - The index for which the total edited lines will be calculated.
   * @constructor
   */
  public LineTotal(_index: number): void {

    const priceCOL = +this.lines[_index]?.UnitPriceCOL ?? 0;
    const priceFC = +this.lines[_index]?.UnitPriceFC ?? 0;

    let disc = this.lines[_index]?.DiscountPercent ?? 0

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
    this.lines[_index].Total = this.localCurrency.Id === this.docCurrency ? lineTotal : lineTotalFC;
    this.lines[_index].Quantity = qty;

  }

  private DeleteRow(_row: IDocumentLine): void {

    if (_row.TreeType === ListMaterial.iSalesTree) {
      //Elimina el padre
      this.lines.splice(_row.Id - 1, 1);

      //Elimina los hijos
      let billOfMAterial = this.lines.filter(x => x.HasGroup === _row.HasGroup);
      billOfMAterial?.forEach((material) => {
        let index = this.lines.findIndex(x => x.HasGroup === material.HasGroup);
        if (index >= 0) {
          this.lines.splice(index, 1);
        }
      });

    } else if (_row.TreeType === ListMaterial.iIngredient) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'El ítem no se puede eliminar, es un subordinado de una lista de material, si desea eliminarlo borre al ítem padre.'
      });

    } else {
      this.lines.splice(_row.Id - 1, 1);
    }

    this.uom = this.uom.filter(x => x.by !== _row.IdDiffBy);
    this.curr = this.curr.filter(x => x.by !== _row.IdDiffBy);

    // Update the drop-down list by filtering only on those UDF fields, the values associated with the deleted item
    Object.keys(this.dropdownDiffList)?.filter(key => key.includes('U_'))?.forEach((key) => {
      this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== _row.IdDiffBy);
    });
    this.InflateTableLines();
    this.GetTotals();

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

      switch (ALL_RECORDS.EventName) {
        case 'Dropdown':

          //#region CAMBIO LA SELECCION DE UNIDADES DE MEDIDA
          if (this.lines[INDEX].UoMEntry != ALL_RECORDS.Row.UoMEntry) {

            let uom = ALL_RECORDS.Row.UoMMasterData.find(x => x.UoMEntry === ALL_RECORDS.Row.UoMEntry);

            if (uom) {
              ALL_RECORDS.Row.UnitPriceFC = uom.UnitPriceFC
              ALL_RECORDS.Row.UnitPriceCOL = uom.UnitPrice;
              ALL_RECORDS.Row.UnitPrice = this.localCurrency.Id === (ALL_RECORDS.Row.Currency ?? '') ? uom.UnitPrice : uom.UnitPriceFC;
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

                if (ALL_RECORDS.Row.Currency !== this.docCurrency) {
                  this.alertsService.Toast({
                    type: CLToastType.INFO,
                    message: 'La moneda es diferente a la del encabezado del documento.'
                  });
                }
              }
              ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== ALL_RECORDS.Row.Currency ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
              ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === (ALL_RECORDS.Row.Currency ?? '') ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            }
          }
          //#endregion

          break;

        case 'InputField':

          ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== ALL_RECORDS.Row.Currency ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
          ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === (ALL_RECORDS.Row.Currency ?? '') ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

          if (ALL_RECORDS.Row.DiscountPercent > this.userAssign.Discount) {

            ALL_RECORDS.Row.DiscountPercent = 0;
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El descuento no puede ser mayor a ${this.userAssign.Discount} que es lo permitido para este usuario.`
            });

          }

          if (ALL_RECORDS.Row.DiscountPercent < 0) {
            ALL_RECORDS.Row.DiscountPercent = 0;
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `El descuento no puede ser un valor negativo.`
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
      this.index = ACTION.Id;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.DELETE:

          if (this.IdTranAcumular || this.IdTranRedimir) {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'Estimado usuario, no se pueden eliminar líneas del documento, porque este posee transacciones en el plan de lealtad de lealto.'
            });
          } else {
            this.DeleteRow(ACTION);
          }

          break;

        case Structures.Enums.CL_ACTIONS.OPTION_1:
          this.OpenDialogStock(ACTION.Id - 1, ACTION.ItemCode, ACTION.WarehouseCode);
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_3:
          this.GetBatches(ACTION, ACTION.Id - 1)
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_4:
          this.OpenDialogDimensionsItems(ACTION.Id - 1, ACTION);
          break;
      }
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
            this.OnSelectBusinessPartner(value);
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

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
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
  };

  public GetTotals(): void {

    this.total = 0;
    this.totalFC = 0;
    this.discount = 0;
    this.discountFC = 0;
    this.tax = 0;
    this.taxFC = 0;
    this.totalWithoutTax = 0;
    this.totalWithoutTaxFC = 0

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

  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.OnSubmit();
        break;
      case 'CLEAN':
        this.Clear();
        break;

    }
  }

  private Clear(): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: ()=> {
        this.RefreshData();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private SetItem(_data: IDocumentLine, _item: ItemSearchTypeAhead, _location: IDocumentLinesBinAllocations[], _cant: number, _isChildren: boolean = false): IDocumentLine {

    try {

      let unitPrice = 0;
      let unitPriceFC = 0;

      if (!_isChildren && _data.HideComp=="Y" ||_isChildren && _data.HideComp=="N" ||!_isChildren && _data.HideComp==undefined) {
        unitPrice = _data.UoMMasterData[0].UnitPrice;
        unitPriceFC = _data.UoMMasterData[0].UnitPriceFC;
      } else {
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
        WarehouseCode: this.userAssign?.WhsCode,
        Quantity: _cant,
        TaxCode: _data.TaxCode,
        TaxRate: _data.TaxRate,
        UnitPriceFC: unitPriceFC,
        UnitPrice: this.localCurrency.Id === currency ? unitPrice : unitPriceFC,
        UnitPriceCOL: unitPrice,
        DiscountPercent: _data.DiscountPercent ? _data.DiscountPercent : 0,
        CostingCode: this.userAssign?.CenterCost,
        ItemDescription: _data.ItemName,
        OnHand: _data.OnHand,
        UoMEntry: _data.UoMMasterData[0].UoMEntry,
        DocumentLinesBinAllocations: !_isChildren ? ((_item.ManBtchNum === 'N' && _item.ManSerNum === 'N') ? _location : []) : _location,
        UoMMasterData: _data.UoMMasterData,
        SerialNumbers: !_isChildren ? (_item.ManSerNum === 'Y' ? this.LoadSerial(_item.SysNumber, _item.DistNumberSerie, _cant) : []) : [],
        ManBtchNum: _item.ManBtchNum,
        ManSerNum: _item.ManSerNum,
        ManBinLocation: _isChildren ? this.warehouse.find(x => x.WhsCode === _data.WarehouseCode)?.BinActivat ?? '' : '',
        BatchNumbers: _data.BatchNumbers ? _data.BatchNumbers : [],
        SysNumber: _item.SysNumber,
        DistNumber: _item.DistNumberSerie,
        RowColor: _isChildren ? RowColors.PaleBlue : (_data.TreeType === 'S' ? RowColors.LightBlue : ''),
        TreeType: _isChildren ? ListMaterial.iIngredient : (_data.TreeType && _data.TreeType === 'S' ? ListMaterial.iSalesTree : ''),
        BillOfMaterial: _isChildren ? [] : _data.BillOfMaterial,
        FatherCode: _isChildren ? _item.ItemCode : '',
        IdDiffBy: maxIdUomEntry,
        IdCurrency: _data.LinesCurrenciesList.find(x => x.DocCurrency == this.docCurrency)?.Id ?? '0',
        LinesCurrenciesList: this.GetLinesCurrencies(_data),
        CurrNotDefined: this.CurrLinesDifined(_data),
        Currency: this.docCurrency,
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
      CLPrint(e, CL_DISPLAY.ERROR);
      return {} as IDocumentLine
    }

  }

  private GetLinesCurrencies(_data: IDocumentLine): ILinesCurrencies[] {
    if (this.changeCurrencyLines) {
      if (_data.LinesCurrenciesList && _data.LinesCurrenciesList.length > 0) {
        return _data.LinesCurrenciesList;
      } else {
        let curr = this.currencies.find(x => x.Id === this.docCurrency);
        if (curr) {
          return [{
            Id: '0',
            DocCurrency: curr?.Id,
            Description: `${curr?.Id} Moneda primaria`,
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
        let curr = this.currencies.find(x => x.Id === this.docCurrency);
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

  public OnSelectItem(_item: ItemSearchTypeAhead | string): void {
    try {

      if (this.IdTranAcumular || this.IdTranRedimir) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'Estimado usuario, no se pueden agregar líneas al documento, porque este posee transacciones en el plan de lealtad de lealto.'
        });
        return;
      }

      if (typeof _item === 'string') return;

      let cant = +this.documentForm.controls['Quantity'].value;

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

      let Location: IDocumentLinesBinAllocations[] = [];

      _item.AbsEntry || 0 > 0 ?
        Location = [{
          SerialAndBatchNumbersBaseLine: 0,
          BinAbsEntry: _item.AbsEntry,
          Quantity: cant,
          Stock: _item.OnHand
        } as IDocumentLinesBinAllocations] : [];

      let typeSerial: number = ItemSerialBatch.NA;

      if (_item.ManSerNum === 'Y') {
        typeSerial = ItemSerialBatch.Serie
      }
      if (_item.ManBtchNum === 'Y') {
        typeSerial = ItemSerialBatch.Lote
      }


      this.overlayService.OnGet();
      this.itemService.Get<IDocumentLine>(
        _item.ItemCode,
        this.currentSession?.WhsCode || this.userAssign?.WhsCode,
        this.documentForm.controls['PriceList'].value,
        this.documentForm.controls['CardCode'].value,
        typeSerial,
        _item.SysNumber,
        'N',
        ItemsFilterType.SellItem
      )
        .pipe(
          finalize(() => {
            this.sharedService.EmitEnableItem();
            this.overlayService.Drop();
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

              this.lines.push(item);

              this.ConfigDropdownDiffListTable(item);

              if (callback.Data.BillOfMaterial && callback.Data.BillOfMaterial.length > 0) {
                callback.Data.BillOfMaterial.forEach(element => {

                  element.WarehouseCode = this.currentSession.WhsCode;
                  element.HideComp = HideComp;
                  let data = {
                    ManBtchNum: element.ManBtchNum,
                    ManSerNum: element.ManSerNum,
                    SysNumber: element.SysNumber,
                    DistNumberSerie: element.DistNumber,
                    ItemCode: _item.ItemCode,
                    BinCode: ''
                  } as ItemSearchTypeAhead

                  item = this.SetItem(element, data, [], element.Quantity*this.documentForm.controls['Quantity'].value, true);
                  item.HideComp=HideComp;
                  item.HasGroup=HasGroup;
                  if (this.udfsLines && this.udfsLines.length > 0) {
                    MappingDefaultValueUdfsLines(item, this.udfsLines);
                  }

                  this.lines.push(item);

                  this.ConfigDropdownDiffListTable(item);

                });

              }

              if (item.TaxCode === '') {
                this.alertsService.Toast({
                  type: CLToastType.INFO,
                  message: `Ítem ${item.ItemDescription} no cuenta con el código del impuesto`
                });
              }

              this.LineTotal(this.lines.length - 1);
              this.InflateTableLines();
              this.GetTotals();

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
    }

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

  private LoadSerial(_sysNumber: number, _distNumber: string, _cant: number): ISerialNumbers[] {
    let SerialNumbers = null;
    SerialNumbers = [{
      SystemSerialNumber: _sysNumber,
      Quantity: _cant,
      DistNumber: _distNumber
    } as ISerialNumbers];

    return SerialNumbers;
  }

  private LoadDataBp(_businessPartner: IBusinessPartner): void {
    let priceList = this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.ListNum;

    if (_businessPartner) {
      this.isCashCustomer = _businessPartner.CashCustomer;
      this.documentForm.patchValue({
        CardCode: _businessPartner.CardCode,
        CardName: _businessPartner.CardName,
        DocCurrency: priceList ? this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.PrimCurr : this.priceLists.find(x => x.ListNum === this.priceLists[0]?.ListNum)?.PrimCurr,
        PriceList: _businessPartner.PriceListNum ? this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.ListNum : this.priceLists[0]?.ListNum,
        PaymentGroupCode: this.payTerms.find(x => x.GroupNum === _businessPartner.PayTermsGrpCode)?.GroupNum,
        SalesPersonCode: this.salesPersons.find(x => x.SlpCode == +this.userAssign.SlpCode)?.SlpCode
      });

      this.docCurrency = this.documentForm.controls['DocCurrency'].value;
      this.LoadBlankeetAgrements(_businessPartner.CardCode, _businessPartner);
    }
  }

  public GetSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id === this.docCurrency)?.Symbol || '';
  }

  public GetConversionSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id !== this.docCurrency)?.Symbol || '';
  }

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

  private SetUdfsDevelopment(): void {
    MappingUdfsDevelopment<ISalesDocument>(this.documentForm.value, this.udfsValue, this.udfsDevelopment);
    if (this.feForm?.value) {
      MappingUdfsDevelopment<IFeData>(this.feForm.value, this.udfsValue, this.udfsDevelopment);
    }
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);
  }

  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else this.SaveChanges();
  }

  /**
   * Method to create document
   * @constructor
   * @private
   */
  private SaveChanges(): void {
    if (!this.ValidateFields()) return;

    if (!this.ValidateUdfsLines()) return;
    this.SetUdfsDevelopment();

    let document: IDocument = this.documentForm.getRawValue();
    document.DocDate = FormatDate(document.DocDate);
    document.DocDueDate = FormatDate(document.DocDueDate);
    document.TaxDate = FormatDate(document.TaxDate);
    document.DocumentLines = this.lines;
    document.Udfs = this.udfsValue;
    document.DocEntry = this.docEntry;
    document.NumAtCard = !this.isUseInvoiceNumber ? (this.documentForm.controls['NumAtCard'].value === '' ? null : this.documentForm.controls['NumAtCard'].value) : null;
    document.ShipToCode = this.deliveryAddressSelected.AddressName ?? '';
    document.DocumentLines = this.lines.map(x => {
      return {
        ...x, 
        TaxOnly: x.TaxOnly ? "tYES" : "tNO", 
        Udfs: GetUdfsLines(x, this.udfsLines), 
        VATLiable: x.VATLiable=='1' || x.VATLiable=='SI' ? 1 : 0,
        ShipToCode: this.deliveryAddressSelected.AddressName ?? ''
      } as IDocumentLine
    });

    document.DocumentReferences = this.isUseInvoiceNumber ? [{
      RefDocNum: 0,
      RefObjType: 'rot_SalesInvoice',
      Remark: this.documentForm.controls['Comments'].value,
      RefDocEntr:this.documentForm.controls['NumAtCard'].value,
    }] : null;


    this.SetUdfsDevelopment();

    let updateOrCreate$: Observable<ICLResponse<IDocument>> | null = null;

    if (this.accion === '' || this.accion === PreloadedDocumentActions.COPY || this.accion === PreloadedDocumentActions.DUPLICATE) {
      updateOrCreate$ = this.creditNotesService.Post(document,this.documentAttachment, this.attachmentFiles);
    } else {
      updateOrCreate$ = this.creditNotesService.Patch(document);
    }

    this.overlayService.OnPost();
    updateOrCreate$.pipe(
      switchMap(res => {
        if(this.hasCompanyAutomaticPrinting){
          return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
            map(print => {
              return { Document: res, Print: print };
            })
          )
        } else {
          return of({ Document: res, Print: null })
        }
      }),
      map(res => {
        this.overlayService.Drop();
        return {
          DocEntry: res.Document.Data.DocEntry,
          DocNum: res.Document.Data.DocNum,
          NumFE: '',
          CashChange: 0,
          CashChangeFC: 0,
          Title: res.Document.Data.ConfirmationEntry ? Titles.Draft : Titles.NC,
          TypeReport: res.Document.Data.ConfirmationEntry ? 'Preliminary' : 'CreditNote'
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res)),
    ).subscribe({
      next: (callback) => {
        this.RefreshData();
      },
      error: (err) => {
        this.overlayService.Drop();
        this.modalService.Continue({
          title: 'Se produjo un error creando la nota de crédito',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  /**
   * Method that obtains required requests from the component
   * @constructor
   * @private
   */
  private RefreshData(): void {
    if (this.accion !== '') {
      this.ResetDocument();
      return;
    }

    this.overlayService.OnGet();
    forkJoin({
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Rate: this.exchangeRateService.Get<IExchangeRate>(),
      SalesPerson: this.salesMenService.Get<ISalesPerson[]>(),
      PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.SellItem),
      PayTerms: this.payTermService.Get<IPayTerms[]>(),
      Taxes: this.taxesService.Get<ITaxe[]>(),
      Warehouses: this.warehouseService.Get<IWarehouse[]>(),
      Currencies: this.currenciesService.Get(false),
      Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode, ItemsFilterType.SellItem),
      Seetings: this.settingService.Get<ISettings[]>(),
      TypeIdentification: this.structuresService.Get('TypeIdentification'),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('ORIN')
        .pipe(catchError(res => of(null))),
      UdfsLine: this.udfsService.Get<IUdfContext[]>('ORIN', true, true)
        .pipe(catchError(res => of(null)))
    }).pipe(
      switchMap(res => {
        this.currentSession.Rate = res.Rate.Data.Rate;
        this.settings = res.Seetings.Data;
        this.salesPersons = res.SalesPerson.Data;
        this.priceLists = res.PriceList.Data ?? [];
        this.taxes = res.Taxes.Data;
        this.warehouse = res.Warehouses.Data;
        this.currencies = res.Currencies.Data;
        this.payTerms = res.PayTerms.Data;
        this.items = res.Items.Data;
        this.TypeIdentification = res.TypeIdentification.Data;
        this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
        this.udfsLines = res.UdfsLine?.Data ?? [];
        this.permissions = res.Permissions.Data;
        this.DefaultBusinessPartner = null;

        //Business partner default
        if(this.userAssign?.SellerCode){
          return this.businessPartnersService.Get<IBusinessPartner>(this.userAssign.SellerCode);
        }
        else if (this.settings && this.settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
          let companyDefaultBusinessPartner = JSON.parse(this.settings.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

            let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.selectedCompany?.Id) as IDefaultBusinessPartnerSetting;

            if (dataCompany && dataCompany.BusinessPartnerCustomer) {
              return this.businessPartnersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerCustomer);
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

  private ValidateFields(): boolean {

    let data = ValidateLines(this.lines, true);

    if (!data.Value) {
      this.alertsService.Toast({type: CLToastType.INFO, message: data.Message});
      return false;
    }

    return true;
  }

  public GetItems(): void {
    this.overlayService.OnGet();
    this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession.WhsCode, ItemsFilterType.SellItem).pipe(
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

  private PrintInvoiceDocument(_docEntry: number): Observable<ICLResponse<IDownloadBase64> | null> {
    let validatePrint = this.ValidateValueFormatSetting(this.reportConfigured,'CreditNote');

    if(validatePrint != null && validatePrint != ''){
      return this.reportsService.PrintReport(_docEntry, 'CreditNote').pipe(
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

  private ChangeBp(): void {
    this.lines = [];
    this.uom = [];
    this.curr = [];
    this.dropdownDiffList = {};
    this.GetTotals();
    this.InflateTableLines();
  }

  public GetPadron(): void {

    let feForm = this.feForm.value;

    if (!feForm.Identification || feForm.Identification.toString().length < 9) return;

    this.overlayService.OnGet();
    this.padronService.Get<string>(this.feForm.controls['Identification'].value)
      .pipe(
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback => {
          if (callback.Data) {
            let padron = JSON.parse(callback.Data) as IPadron;
            this.feForm.controls['IdType'].setValue(padron.tipoIdentificacion);

            let CardName = this.documentForm.controls['CardName'].value;
            let NameFe = padron.nombre? padron.nombre: CardName;
            this.documentForm.controls['CardName'].setValue(NameFe);
          }
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  private ResetDocument(): void {
    try {
      this.IdTranRedimir = '';
      this.IdTranAcumular = '';
      this.lines = [];
      this.documentData = null;
      this.GetTotals();
      if (this.accion !== '') {
        this.router.navigate(['sales', 'credit-memo']);
      }
      this.feForm.reset();
      this.dropdownDiffList = {};
      this.uom = [];
      this.curr = [];
      this.accion = '';
      this.from = '';
      this.uniqueId = this.commonService.GenerateDocumentUniqueID();
      this.InflateTableLines();
      this.udfsValue = [];
      this.CleanFields();
      this.documentForm.get('Comments')?.reset();
      this.documentAttachment = {
        AbsoluteEntry: 0,
        Attachments2_Lines: []
      };
      this.attachmentFiles = [];
      this.InflateAttachmentTable();
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
        this.overlayService.OnGet();
        return this.itemService.GetAll<ItemSearchTypeAhead[]>(value, ItemsFilterType.SellItem).pipe(finalize(() => this.overlayService.Drop()))
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
   * Load invoice data
   * @param _invoice -Invoice to move to NC
   * @constructor
   * @private
   */
  private SetData(_invoice: IDocument): void {

    try {

      this.activatedRoute.queryParamMap.pipe(
        filter(res => res.has('Action')),
        take(1)
      ).subscribe({
        next: (res => {
          this.accion = res.get('Action') ?? ''
          this.from = res.get('From') ?? '';

          try {

            this.IdTranAcumular = _invoice.IdTranAcumular ?? '';
            this.IdTranRedimir = _invoice.IdTranRedimir ?? '';
            this.docEntry = _invoice.DocEntry;

            this.documentForm.patchValue({
              CardCode: _invoice.CardCode,
              CardName: _invoice.CardName,
              PaymentGroupCode: _invoice.PaymentGroupCode,
              PriceList: _invoice?.PriceList,
              SalesPersonCode: _invoice.SalesPersonCode,
              DocCurrency: _invoice.DocCurrency,
              Comments: _invoice.Comments,
              NumAtCard: '',
              Quantity: 1
            });

            this.docCurrency = this.documentForm.controls['DocCurrency'].value;

            this.feForm.patchValue({
              IdType: _invoice.IdType,
              Identification: _invoice.Identification,
              Email: _invoice.Email
            });


            this.lines = Copy<IDocumentLine[]>(_invoice?.DocumentLines ?? []);
            let HasGroup="";
            let HideComp:string |undefined="";
            this.lines.forEach((x, index: number) => {
              //En caso de que no tenga moneda la linea, se le asigna la de la cabecera
              x.Currency = x.Currency || _invoice?.DocCurrency;

              let unitPrice = this.localCurrency.Id === (x.Currency ?? '') ? x.UnitPrice : CLTofixed(this.DecimalTotalDocument, (x.UnitPrice * this.currentSession.Rate));
              let unitPriceFC = this.localCurrency.Id !== x.Currency ? x.UnitPrice : CLTofixed(this.DecimalTotalDocument, (x.UnitPrice / this.currentSession.Rate));

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
              x.UoMEntry = +x.UoMEntry;
              x.IdDiffBy = index + 1;
              x.UoMMasterData = x.UoMMasterData ?? [];
              x.UnitPriceFC = unitPriceFC;
              x.UnitPriceCOL = unitPrice;
              x.ManBinLocation = this.warehouse.find(y => y.WhsCode === x.WarehouseCode)?.BinActivat ?? ''
              x.WhsName = this.warehouse.find(y => y.WhsCode === x.WarehouseCode)?.WhsName || '';
              x.BaseEntry = this.accion === PreloadedDocumentActions.DUPLICATE ? null : _invoice?.DocEntry || 0;
              x.BaseLine = x.LineNum;
              x.BaseType = this.accion === PreloadedDocumentActions.DUPLICATE ? -1 : this.from === 'Invoices' ? CopyFrom.OINV : CopyFrom.ODPI;
              x.TaxRate = +(x.TaxRate);
              x.DistNumber = x.SerialNumbers && x.SerialNumbers.length > 0 ? x.SerialNumbers[0].DistNumber || '' : '';
              x.RowColor = this.GetRowColor((x.TreeType ?? ''));
              x.TaxOnly = x.TaxOnly === 'Y';
              x.LinesCurrenciesList = this.GetLinesCurrencies(x);
              x.CurrNotDefined = this.CurrLinesDifined(x);
              x.IdCurrency = x.LinesCurrenciesList.find(y => y.DocCurrency === x.Currency)?.Id ?? '0';
              this.ConfigDropdownDiffListTable(x);
              this.LineTotal(index);
              if (this.udfsLines?.length) {
                SetUdfsLineValues(this.udfsLines, x, this.dropdownDiffList);
              }
            });

            if (this.lines.some(x => x.Currency !== _invoice?.DocCurrency)) {
              this.alertsService.Toast({
                type: CLToastType.INFO,
                message: 'Existen líneas con moneda diferente a el encabezado del documento.',
                verticalPosition: 'top'
              });
            }

            this.InflateTableLines();
            this.GetTotals();
          } catch (e) {

          }
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });

    } catch (Exception) {
      CLPrint(Exception, CL_DISPLAY.ERROR);
    }

  }

  private GetRowColor(_treeType: string): string {
    if (_treeType === ListMaterial.iIngredient) {
      return RowColors.PaleBlue;
    } else if (_treeType === ListMaterial.iSalesTree) {
      return RowColors.LightBlue;
    } else if (_treeType === ListMaterial.iNotATree) {
      return '';
    } else {
      return '';
    }
  }

  public GetBatches(_item: IDocumentLine, _idx: number, _fieldBin = true): void {
    if (_item.ManBtchNum.toUpperCase() !== 'Y') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Ítem no manejado por lote`
      });
      return;
    }

    this.overlayService.OnGet();
    this.batchesService.Get<IBatches[]>(_item.ItemCode, _item.WarehouseCode)
      .pipe(
        filter(res => {
          if (res.Data && res.Data.length > 0) {
            return true;
          } else {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: `No se han obtenido lotes para el ítem ${_item.ItemCode} - ${_item.ItemDescription}`
            });
            return false;
          }
        }),
        map(res => {
          return {
            Lotes: res.Data,
            ValidateStockBatch: false,
            View: ViewBatches.FACTURACION
          } as IBatchSelected
        }),
        switchMap(res => {
          this.overlayService.Drop();
          return this.OpenEditBatchesDialog(res, _idx);
        }),
        finalize(() => this.overlayService.Drop()))
      .subscribe({
        next: (callback => {
          if (callback) {
            if (callback.Lotes) {
              this.lines[_idx].BatchNumbers = callback.Lotes;
            }

            if (callback.Locations) {
              this.lines[_idx].DocumentLinesBinAllocations = callback.Locations;
            }
            this.InflateTableLines();
          }
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });
  }

  private OpenEditBatchesDialog(_batch: IBatchSelected, _idx: number): Observable<IBatchResult> {

    if (this.lines[_idx]) {
      _batch.Quantity = this.lines[_idx].Quantity;
      _batch.LotesSelected = this.lines[_idx].BatchNumbers;
      _batch.LocationsSelected = this.lines[_idx].DocumentLinesBinAllocations;
    }

    _batch.Permission = this.permissions.some(x => x.Name === 'Sales_Documents_EditItemBatch');

    return this.matDialog.open(LotComponent, {
      maxWidth: '100vw',
      minWidth: '40vw',
      maxHeight: 'calc(100vh - 20px)',
      disableClose: true,
      data: _batch
    }).afterClosed();
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
        console.log(this.lines[_index]);
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
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
  private OpenDialogStock(_index: number, _itemCode: string, _warehouseCode: string): void {
    let canChangeWarehouse = this.permissions.some(x => x.Name === 'Sales_Documents_EditItemWarehouse');
    let viewStock = this.permissions.some(x => x.Name === 'Sales_Documents_ViewItemWarehouse');

    if (!viewStock) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tiene permiso para ver el stock.'
      });
      return;
    }

    let stock = {
      ItemCode: _itemCode,
      isPermissionChangeWarehouse: canChangeWarehouse,
      WarehouseCode: _warehouseCode
    } as IChangeWarehouse;

    this.matDialog.open(StockWarehousesComponent, {
      disableClose: true,
      minWidth: '50%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '80%',
      data: stock
    }).afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {
            this.lines[_index].WarehouseCode = result.WhsCode;
            this.lines[_index].WhsName = result.WhsName;
            this.lines[_index].OnHand = result.OnHand;
            this.lines[_index].BatchNumbers = [];
            this.lines[_index].DocumentLinesBinAllocations = [];
            this.lines[_index].BinCode = '';
            this.InflateTableLines();
          }
        }
      });
  }

  public SelectCurrency(): void {
    this.docCurrency = this.documentForm.controls['DocCurrency'].value;
    if (!this.lines || this.lines.length <= 0) return;

    if (this.changeCurrencyLines) {
      this.lines.forEach((x, index) => {
        x.IdCurrency = x.CurrNotDefined ? '0' : x.IdCurrency;
        x.LinesCurrenciesList = x.CurrNotDefined ? this.currencies.filter(x => x.Id === this.docCurrency).map((element, index) => {
          return {
            Id: '0',
            DocCurrency: element?.Id.toString(),
            Description: `${element?.Id} Moneda primaria`,
            Price: x.UnitPrice
          } as ILinesCurrencies
        }) ?? [] : x.LinesCurrenciesList;
        x.UnitPrice = x.CurrNotDefined ? (this.localCurrency.Id === this.docCurrency ? x.UnitPriceCOL : x.UnitPriceFC) : x.UnitPrice;
        x.Total = this.localCurrency.Id === this.docCurrency ? x.TotalCOL : x.TotalFC;
        x.Currency = x.CurrNotDefined ? this.docCurrency : x.Currency;
        if (x.CurrNotDefined) {
          let i = this.curr.findIndex(y => y.by === x.IdDiffBy);
          this.curr[i].key = x.LinesCurrenciesList[0].Id;
          this.curr[i].value = x.LinesCurrenciesList[0].Description;
        }
      });
    } else {
      this.lines.forEach(x => {
        x.Currency = this.docCurrency;
        x.UnitPrice = this.localCurrency.Id === (x.Currency ?? '') ? x.UnitPriceCOL : x.UnitPriceFC;
        x.Total = this.localCurrency.Id === (x.Currency ?? '') ? x.TotalCOL : x.TotalFC;
      });
    }
    this.InflateTableLines();
    this.GetTotals();
  }

  //#region Lista de precios
  public SelectPriceList(): void {

    const priceList: number = +(this.documentForm.controls['PriceList'].value);

    this.documentForm.patchValue({
      DocCurrency: this.priceLists.find(x => x.ListNum === priceList)?.PrimCurr
    });

    this.docCurrency = this.documentForm.controls['DocCurrency'].value;
  }

  //#endregion


  //#region Udfs
  public SetUDFsValues(): void {
    this.linkerService.Publish({
      Target: this.UdfsId,
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.udfsDataHeader)
    });
  }

  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs.length > 0;
  }

  public OnClickUdfEvent = (_event: ICLEvent): void => {
    this.udfsValue = JSON.parse(_event.Data) as IUdfContext[];
    this.SaveChanges();
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

  public GetConfiguredUdfs(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: this.UdfsId
    });
  }


  //#endregion

  private SetInitialData(): void {

    this.isPermissionChangeCurrency = this.permissions.some(x => x.Name === 'Sales_Documents_ChangeCurrency');
    this.canChangePriceList = this.permissions.some(x => x.Name === 'Sales_Documents_ChangePriceList');
    let companyId = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany)?.Id || 0;

    //#region SETEO inicial
    this.documentForm.reset();
    this.feForm.get('IdType')?.setValue(this.TypeIdentification ? this.TypeIdentification.find(ds => ds.Default)?.Key || '' : '');
    this.documentForm.controls['SalesPersonCode'].setValue(+(this.userAssign?.SlpCode));
    this.documentForm.controls['Quantity'].setValue(1);
    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['DocDueDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));
    //#endregion


    //#region CAMPOS FACTURA
    if (this.settings.find((element) => element.Code == SettingCode.FieldsInvoice)) {

      let settingFieldsInvoices: IFieldsInvoiceSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.FieldsInvoice)?.Json || '');

      if (settingFieldsInvoices && settingFieldsInvoices.length > 0) {

        let fieldReference = settingFieldsInvoices.find(x => x.CompanyId === companyId) as IFieldsInvoiceSetting;

        this.isUseInvoiceNumber = fieldReference.NumFactura;
      }
    }
    //#endregion

    //#region DECIMALES
    if (this.settings.find((element) => element.Code == SettingCode.Decimal)) {
      let companyDecimal: IDecimalSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '');

      if (companyDecimal && companyDecimal.length > 0) {

        let decimalCompany = companyDecimal.find(x => x.CompanyId === companyId) as IDecimalSetting;

        if (decimalCompany) {
          this.DecimalTotalDocument = decimalCompany.TotalDocument;
          this.DecimalUnitPrice = decimalCompany.Price;
          this.DecimalTotalLine = decimalCompany.TotalLine;
          this.TO_FIXED_TOTALDOCUMENT = `1.${this.DecimalTotalDocument}-${this.DecimalTotalDocument}`;

        }
      }

    }
    //#endregion

    //#region SOCIO POR DEFECTO
    if(this.DefaultBusinessPartner)
    this.LoadDataBp(this.DefaultBusinessPartner as IBusinessPartner);
    //#endregion

    //#region PERMISOS DE LA TABLA
    this.editableFieldConf =
      {
        Permissions: this.permissions,
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(x => x.Name === _columnPerm.Name),
        Columns: this.editableField,

      };

    this.lineMappedDisplayColumns.editableFieldConf = this.editableFieldConf;
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    //#endregion

    //#region CAMPOS FACTURA
    if (this.settings.some(s => s.Code === SettingCode.FieldsInvoice)) {
      let Settings = JSON.parse(this.settings.find(s => s.Code === SettingCode.FieldsInvoice)?.Json || '[]') as IFieldsInvoiceSetting[];

      let fieldsInvoiceSetting = Settings.find(s => s.CompanyId === this.selectedCompany?.Id) as IFieldsInvoiceSetting;

      if (fieldsInvoiceSetting) {
        this.changeCurrencyLines = fieldsInvoiceSetting.ChangeCurrencyLine;
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

    //#region AGREGAR UDFS A NIVEL DE LINEA
    if (this.udfsLines && this.udfsLines.length > 0) {
      MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns, this.dropdownColumns);
      this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
      this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    }
    //#endregion

    //#region VALIDAR SI MANEJA MONEDA A NIVEL DE LINEA

    if (!this.changeCurrencyLines) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
      this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    }
    //#endregion

    //#region PASANDO UNA FACTURA A NOTA DE CREDITO
    if (this.documentData) {
      this.DBODataEndPoint = this.from === ControllerName.Invoices ?  DocumentType.Invoices : DocumentType.CreditNotes ;
      this.SetData(this.documentData);

      if (this.udfsLines?.length) {
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);
      }
    }
    //#endregion
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
  private OnAttachmentTableRowModified = (_event: ICLEvent): void => {
    let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IAttachments2Line>;

    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1, true);

    this.documentAttachment.Attachments2_Lines[INDEX].FreeText = ALL_RECORDS.Row.FreeText;
  }

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
    const userPermissions = this.permissions.map(permission => permission.Name);
    const permissionMap: Record<string, { Permission: string; Options?: Record<string, string> }> = {
      'editar': {
        Permission: 'Sales_Document_EditArticle',
        Options: {
          'Lotes': 'Sales_Document_EditArticleLots',
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

  private HasPermission(button: ICLTableButton, userPermissions: string[], permissionMap: Record<string, { Permission: string; Options?: Record<string, string> }>
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

  private FilterOptionsByPermission( options: ICLTableButton[], permissionOptions: Record<string, string> | undefined, userPermissions: string[]): ICLTableButton[] {
    return options.filter(optionButton => {
      const optionPermission = permissionOptions?.[optionButton.Title];
      return optionPermission && userPermissions.includes(optionPermission);
    });
  }

  private ValidateListNum (): void{
    if(this.accion!='') {
      if (this.documentData?.PriceList == undefined || this.documentData?.PriceList == 0 || this.documentData?.PriceList == null) {
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
            PriceList: this.DefaultBusinessPartner?.PriceListNum ? this.priceLists.find(x => x.ListNum === this.DefaultBusinessPartner?.PriceListNum)?.ListNum : this.priceLists[0]?.ListNum
          });
        }
      }
    }
    if(this.accion === PreloadedDocumentActions.DUPLICATE){
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
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewCCost)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('CostingCode');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewTaxOnly)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('TaxOnly');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewUoMEntry)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('UoMEntry');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewDistNumber)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('DistNumber');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewBinCode)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('BinCode');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewLastPurchasePrice)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('LastPurchasePrice');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewCurrencyLines)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
    }
    if (!this.permissions.some(persmision => persmision.Name == PermissionViewColumnsItems.Sales_Documents_CreditMemo_ViewVATLiable)) {
      this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
    }
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
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
    }else if(_businessPartner!=null && !Array.isArray(_businessPartner)){
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
     * Method to handle the selection of an address from the address list.
     * @param _address Selected address from the address list
     */
    AdressSelected(_address: IBPAddresses): void {
      this.deliveryAddressSelected = _address;
    }
}
