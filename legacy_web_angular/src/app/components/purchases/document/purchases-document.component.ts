import {AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {
  ICompany
} from "@app/interfaces/i-company";
import {
  IDecimalSetting,
  IDefaultBusinessPartnerSetting,
  IMarginSetting, IPaymentSetting,
  IPrintFormatSetting, IValidateAttachmentsSetting, IValidateAutomaticPrintingsSetting
} from "../../../interfaces/i-settings";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
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
import {ActivatedRoute, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";

import {OverlayService} from "@clavisco/overlay";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {ItemsService} from "@app/services/items.service";
import {IPurchaseDocumentComponentResolvedData} from "@app/interfaces/i-resolvers";
import {
  catchError,
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
  take,
  takeUntil,
} from "rxjs";
import {
  DropdownElement,
  IEditableField,
  IEditableFieldConf,
  IInputColumn,
  IRowByEvent
} from "@clavisco/table/lib/table.space";
import {
  CopyFrom,
  DocumentType, DocumentTypes,
  ItemSerialBatch, ItemsFilterType,
  LineStatus, PermissionEditDocumentsDates, PermissionValidateDraft, PermissionViewColumnsItemsPurchases,
  PreloadedDocumentActions,
  SettingCode, Titles
} from "@app/enums/enums";
import {ISettings} from "@app/interfaces/i-settings";
import {IAttachments2Line, IBusinessPartner} from "@app/interfaces/i-business-partner";
import {IDocumentLine, IItemMasterData, ItemSearchScan,} from "@app/interfaces/i-items";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {IPriceList} from "@app/interfaces/i-price-list";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {ITaxe} from "@app/interfaces/i-taxe";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {IActionButton} from "@app/interfaces/i-action-button";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {IDocument, WithholdingTaxCode} from "@app/interfaces/i-sale-document";
import {formatDate} from "@angular/common";
import {PurchasesDocumentService} from "@app/services/purchases-document.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {PurchaseSearchDocsService} from "@app/services/purchase-search-docs.service";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {StockWarehousesComponent} from "@Component/sales/stock-warehouses/stock-warehouses.component";
import {MatDialog} from "@angular/material/dialog";
import {SuppliersService} from "@app/services/suppliers.service";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {ItemDetailsComponent} from "@Component/purchases/document/item-details/item-details.component";
import {ICreateItemDialogData, IItemDetailDialogData} from "@app/interfaces/i-dialog-data";
import {CreateItemComponent} from "@Component/purchases/document/create-item/create-item.component";
import {
  CurrentDate, FormatDate,
  GetIndexOnPagedTable,
  GetUdfsLines,
  MappingDefaultValueUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines,
  SetDataUdfsLines, SetUdfsLineValues,
  ValidateLines,
  ValidateUdfsLines, ZoneDate
} from "@app/shared/common-functions";
import {IUdf, IUdfContext, IUdfDevelopment, UdfSourceLine} from "@app/interfaces/i-udf";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {IPurchaseDocument, IUniqueId, ULineMappedColumns} from "@app/interfaces/i-document-type";
import {CommonService} from "@app/services/common.service";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {SalesPersonService} from "@app/services/sales-person.service";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {TaxesService} from "@app/services/taxes.service";
import {WarehousesService} from "@app/services/warehouses.service";
import {SettingsService} from "@app/services/settings.service";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {UdfsService} from "@app/services/udfs.service";
import {PriceListService} from "@app/services/price-list.service";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {CurrenciesService} from "@app/services/currencies.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {DraftService} from "@app/services/draft.service";
import { MasterDataService } from '@app/services/master-data.service';
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {AttachmentsService} from "@app/services/Attachments.service";
import {IDownloadBase64} from "@app/interfaces/i-files";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {ReportsService} from "@app/services/reports.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import {IWithholdingTax, IWithholdingTaxSelected} from "@app/interfaces/i-withholding-tax";
import {
  ModalAppliedRetentionsComponent
} from "@Component/sales/document/modal-applied-retentions/modal-applied-retentions/modal-applied-retentions.component";
import {WithholdingTaxService} from "@app/services/withholding-tax.service";


@Component({
  selector: 'app-good-receipt',
  templateUrl: './purchases-document.component.html',
  styleUrls: ['./purchases-document.component.scss']
})
export class PurchasesDocumentComponent implements OnInit, AfterViewInit, OnDestroy {

  /*Formularios*/
  documentForm!: FormGroup;

  /*Observables*/
  subscriptions$: Subscription;
  changeWarehouse$ = new Subject<string>();

  /*OBJECTS*/
  currentSession!: ICurrentSession;
  DefaultBusinessPartner!: IBusinessPartner;
  selectedCompany!: ICompany | null;
  userAssign!: IUserAssign;
  currentReport!: keyof IPrintFormatSetting;
  documentData!: IDocument | null;
  reportConfigured!:  IPrintFormatSetting;
  companyReportValidateAutomaticPrinting!: IValidateAutomaticPrintingsSetting;

  /*Variables*/
  xmlName: string = '';
  IsXml = false;
  canChangeDocDate: boolean = true;
  canChangeDocDueDate: boolean = true;
  canChangeTaxDate: boolean = true;
  acceptedMargin: number = 0;
  uniqueId!: string;
  total: number = 0;
  totalFC: number = 0;
  discount: number = 0;
  discountFC: number = 0;
  tax: number = 0;
  taxFC: number = 0;
  totalWithoutTax = 0;
  totalWithoutTaxFC: number = 0;
  docCurrency: string = '';
  controllerToSendRequest: string = '';
  typeDocument: string = '';
  docEntry: number = 0;
  docNum: number = 0;
  index: number = 0;
  currentUrl: string = '';
  currentTitle: string = '';
  TO_FIXED_TOTALDOCUMENT: string = `1.0-0`;
  DecimalUnitPrice = 0; // Decimal configurado para precio unitario
  DecimalTotalLine = 0; //Decimal configurado por compania para total de linea
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento
  preloadedDocActionType: string = '';
  docDueDataLabel: string = 'Fecha de vencimiento';
  isFirstBusinessPartnerSelection: boolean = false;
  hasCompanyAutomaticPrinting: boolean = false;

  totalRetention: number = 0;
  totalRetentionFC: number = 0;
  retentionProcessEnabled: boolean = false;

  //#region Reasignación de índices que no estén en ocupados para editar documentos
  indexMaxUpdate: number = 0;
  IndexMinUpdate: number = 0;

  //#endregion
  @ViewChild("file") inputVariableFileXml!: ElementRef;

  /*Listas*/
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsLines: IUdfContext[] = [];
  file: any = [];
  settings: ISettings[] = [];
  suppliers: IBusinessPartner[] = [];
  items: ItemSearchTypeAhead[] = [];
  salesPerson: ISalesPerson[] = [];
  priceLists: IPriceList[] = [];
  warehouses: IWarehouse[] = [];
  currencies: ICurrencies[] = [];
  taxes: ITaxe[] = [];
  permission: IPermissionbyUser[] = [];
  actionButtons: IActionButton[] = [];
  lines: IDocumentLine[] = [];
  companyPrintFormat: IPrintFormatSetting[] = [];
  companyValidateAutomaticPrinting: IValidateAutomaticPrintingsSetting[] = [];
  availableWithholdingTax: IWithholdingTax[] = [];
  withholdingTaxSelected: IWithholdingTaxSelected[] = [];
  buttons: ICLTableButton[] = [
    {
      Title: `Escanear ítem`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_2,
      Icon: `qr_code_scanner`,
      Color: `primary`
    },
    {
      Title: `Eliminar`,
      Action: Structures.Enums.CL_ACTIONS.DELETE,
      Icon: `delete`,
      Color: `primary`,
      Data: ''
    }
  ];
  localCurrency!: ICurrencies;
  /*Tabla*/
  shouldPaginateRequest: boolean = false;
  lineTableId: string = 'LINE-TABLE-PURCHASE';
  lineMappedColumns!: MappedColumns;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  disableDragAndDrop: boolean = false;
  dropdownColumns: string[] = ['TaxCode', 'WarehouseCode', 'UoMEntry'];
  checkboxColumns: string[] = ['TaxOnly'];
  dropdownList!: DropdownList;
  dropdownDiffList: DropdownList = {};
  uom: DropdownElement[] = [];
  dropdownDiffBy = 'IdDiffBy';
  InputColumns: IInputColumn[] = [
    {ColumnName: 'UnitPrice', FieldType: 'number'},
    {ColumnName: 'Quantity', FieldType: 'number'},
    {ColumnName: 'DiscountPercent', FieldType: 'number'},
    {ColumnName: 'CostingCode', FieldType: 'text'},
    {ColumnName: 'Total', FieldType: 'number'},
    {ColumnName: 'TotalDesc', FieldType: 'number'},
    {ColumnName: 'TotalImp', FieldType: 'number'},
    {ColumnName: 'ItemDescription', FieldType: 'text'},
  ];

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
      ColumnName: 'Total',
      Permission: {Name: 'Purchases_Documents_EditItemTotals'}
    },
    {
      ColumnName: 'TotalDesc',
      Permission: {Name: 'Purchases_Documents_EditItemTotals'}
    },
    {
      ColumnName: 'TotalImp',
      Permission: {Name: 'Purchases_Documents_EditItemTotals'}
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
    Total: 'Total',
    TotalDesc: 'T. + Desc',
    TotalImp: 'T. + Imp'
  };
  lineMappedDisplayColumns: ULineMappedColumns<IDocumentLine, IPermissionbyUser> =
    {
      dataSource: [] as IDocumentLine[],
      inputColumns: this.InputColumns,
      editableFieldConf: this.editableFieldConf,
      renameColumns: this.headerTableColumns,
      iconColumns: ['active'],
      stickyColumns: [
        {Name: 'Options', FixOn: 'right'},
        {Name: 'TotalImp', FixOn: 'right'},
        {Name: 'TotalDesc', FixOn: 'right'},
        {Name: 'Total', FixOn: 'right'}
      ],
      ignoreColumns: ['InventoryItem', 'PurchaseItem', 'SalesItem', 'ItemName', 'OnHand', 'UnitPriceFC',
        'IsCommited', 'OnOrder', 'WhsCode', 'ItemClass', 'ForeignName', 'Frozen', 'Series', 'U_IVA',
        'BarCode', 'ItemBarCodeCollection', 'ItemPrices', 'TaxRate', 'Rate', 'TotalFC',
        'LineNum', 'BaseLine', 'BaseEntry', 'BaseType', 'UnitPriceCOL', 'TotalCOL', 'LastPurchasePrice', 'UoMMasterData',
        'ManBtchNum', 'ManSerNum', 'DocumentLinesBinAllocations', 'SysNumber', 'SerialNumbers', 'DistNumber', 'BinCode', 'BatchNumbers',
        'TotalDescFC', 'TotalDescCOL', 'TotalImpFC', 'TotalImpCOL', 'IsFocused',
        'TreeType', 'BillOfMaterial', 'ManBinLocation', 'RowColor', 'FatherCode', 'LineStatus', 'Currency', 'RowMessage', 'LockedUnitPrice',
        'IdDiffBy', 'LinesCurrenciesList', 'CurrNotDefined', 'IdCurrency']
    };
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  //#region Udfs
  udfsDataHeader: IUdf[] = [];
  udfsLinesValue: UdfSourceLine[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = '';
  isVisible: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";

  //#endregion
  //#region component search
  searchModalId = "searchModalId";
  searchItemModalId = "searchItemModalId";
  //#endregion
  canChangePriceList: boolean = true;
  isDrafts: boolean = false;
  preloadedDocFromType: String | undefined;
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

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'F9') {
      this.OpenItem();
    }
  }
  requestingItem: boolean = false;
  private onScanCode$ = new Subject<string>();
  scannedCode: string = '';

  ValidateAttachmentsTables?: IValidateAttachmentsSetting=undefined;
  IsVisibleAttachTable:boolean=false;

  /**
   * is variable to know if the user has permission to create a draft
   */
  canCreateDraft: boolean = true;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    @Inject('LinkerService') private linkerService: LinkerService,
    private activatedRoute: ActivatedRoute,
    private suppliersService: SuppliersService,
    private overlayService: OverlayService,
    private router: Router,
    private alertsService: AlertsService,
    private itemService: ItemsService,
    private purchasesDocumentService: PurchasesDocumentService,
    private modalService: ModalService,
    private matDialog: MatDialog,
    private commonService: CommonService,
    private salesMenService: SalesPersonService,
    private priceListService: PriceListService,
    private taxesService: TaxesService,
    private warehouseService: WarehousesService,
    private permissionUserService: PermissionUserService,
    private exchangeRateService: ExchangeRateService,
    private settingService: SettingsService,
    private udfsService: UdfsService,
    private currenciesService: CurrenciesService,
    private draftService:DraftService,
    private masterDataService: MasterDataService,
    private attachmentService: AttachmentsService,
    private reportsService: ReportsService,
    private printerWorkerService: PrinterWorkerService,
    private withholdingTaxService: WithholdingTaxService,
  ) {
    this.subscriptions$ = new Subscription();
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
    this.ConfigTable();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.subscriptions$.unsubscribe();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.docEntry && this.docEntry > 0) {
        this.router.navigateByUrl('/').then(() => {
          this.router.navigate(['purchases', this.currentUrl])
        })
      }
    });
    this.OnLoad();
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

    this.DefineDocument();
    this.ReadQueryParameters();
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;
    this.InitForm();
    this.HandleResolvedData();
    this.ConfigSelectInRows();
    this.ChangeWarehouse();
    this.RefreshRate();
    this.ValidatePermissionToEditDate();
    this.ValidatePermissionToAvailableDraft();
    this.ListenScan();
    this.ValidateColumnsItems();
    this.ValidateAttachTable();
    this.ValidateListNum();

    this.documentForm.patchValue({WareHouse: this.currentSession?.WhsCode});

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

    this.DBODataEndPoint = this.typeDocument;
  }

  private InitForm(): void {
    this.documentForm = this.fb.group({
      CardCode: ['', [Validators.required]],
      CardName: ['', [Validators.required]],
      PriceList: ['', [Validators.required]],
      SalesPersonCode: ['', [Validators.required]],
      DocDate: ['',[Validators.required]],
      DocDueDate: ['',[Validators.required]],
      TaxDate: ['',[Validators.required]],
      DocCurrency: [''],
      Comments: [''],
      Quantity: [1],
      WareHouse: [],
      ShowItemDetail: []
    });

  }


  private HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {

          const resolvedData: IPurchaseDocumentComponentResolvedData = data['resolvedData'];

          if (resolvedData) {

            this.items = resolvedData.Items;
            this.priceLists = resolvedData.PriceList;
            this.salesPerson = resolvedData.SalesPersons;
            this.warehouses = resolvedData.Warehouse;
            this.taxes = resolvedData.Taxes;
            this.currencies = resolvedData.Currency;
            this.localCurrency = this.currencies.find(c => c.IsLocal)!;
            this.docCurrency = this.localCurrency?.Id || '';
            this.settings = resolvedData.Settings;
            this.DefaultBusinessPartner = resolvedData.BusinessPartner;
            this.permission = resolvedData.Permissions;
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
            this.currentSession.Rate = resolvedData.ExchangeRate.Rate;
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

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

    if(urlSegment?.length > 0 && urlSegment[1]){
      switch (urlSegment[1].path) {
        case 'good-receipt':
          this.canChangeDocDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsGoodReceiptChangeDocDate);
          this.canChangeDocDueDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsGoodReceiptChangeDocDueDate);
          this.canChangeTaxDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsGoodReceiptChangeTaxDate);

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

        case 'return-good':
          this.canChangeDocDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsReturnGoodChangeDocDate);
          this.canChangeDocDueDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsReturnGoodChangeDocDueDate);
          this.canChangeTaxDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsReturnGoodChangeTaxDate);

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

        case 'order':

          this.canChangeDocDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsOrderChangeDocDate);
          this.canChangeDocDueDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsOrderChangeDocDueDate);
          this.canChangeTaxDate = this.permission.some(x => x.Name === PermissionEditDocumentsDates.PurchasesDocumentsOrderChangeTaxDate);

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


  }

  private ConfigTable(): void {
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
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
   * Set partner to form
   * @param _businessPartner - Business partner set to form
   * @constructor
   * @private
   */
  private LoadDataBp(_businessPartner: IBusinessPartner): void {
    if (_businessPartner) {
      let priceList = this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.ListNum;

      this.documentForm.patchValue({
        CardCode: _businessPartner.CardCode,
        CardName: _businessPartner.CardName,
        PriceList: priceList ? priceList : this.priceLists[0]?.ListNum,
        DocCurrency: priceList ? this.priceLists.find(x => x.ListNum === _businessPartner.PriceListNum)?.PrimCurr : this.priceLists.find(x => x.ListNum === this.priceLists[0]?.ListNum)?.PrimCurr,
        WareHouse: this.currentSession?.WhsCode,
      });

      this.retentionProcessEnabled && this.GetWithholdingTaxByBP(_businessPartner.CardCode);
    }
  }

  public ReadQueryParameters(): void {
    let params = this.activatedRoute.snapshot.queryParams
    if (params['Action']) {
      this.preloadedDocActionType = params['Action'] as PreloadedDocumentActions;
    }

    if (params['Action'] && params['From'] ) {
      this.preloadedDocFromType = params['From'];
    }
    this.DefineActionButtonByPreloadedDocAction();
  }

  public DefineActionButtonByPreloadedDocAction(): void {

    switch (this.preloadedDocActionType) {
      case PreloadedDocumentActions.EDIT:
        this.actionButtons = [
          {
            Key: 'ADDXML',
            MatIcon: 'upload_file',
            Text: 'Cargar Xml',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'ADD',
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
            Key: 'ADDXML',
            MatIcon: 'upload_file',
            Text: 'Cargar Xml',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
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
            Key: 'ADDXML',
            MatIcon: 'upload_file',
            Text: 'Cargar Xml',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
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
              Key: 'ADDXML',
              MatIcon: 'upload_file',
              Text: 'Cargar Xml',
              MatColor: 'primary',
              DisabledIf: (_form?: FormGroup) => _form?.invalid || false
            },
            {
              Key: 'ADD',
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

    if(this.preloadedDocFromType=='Draft' && this.currentUrl != 'good-receipt' && this.currentUrl != 'return-good' && this.canCreateDraft){
      this.actionButtons=[ {
        Key: 'ADDPRE',
        MatIcon: 'draft',
        Text: 'Actualizar preliminar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },...this.actionButtons]
    }else{
      if(this.currentUrl != 'good-receipt' && this.currentUrl != 'return-good' && this.canCreateDraft){
        this.actionButtons=[ {
          Key: 'ADDPRE',
          MatIcon: 'draft',
          Text: 'Crear preliminar',
          MatColor: 'primary',
          DisabledIf: (_form?: FormGroup) => _form?.invalid || false
        },...this.actionButtons]
      }
    }
  }

  private DefineDocument(): void {

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

    if(urlSegment?.length > 0 && urlSegment[1]){
      switch (urlSegment[1].path) {
        case 'good-receipt':

          this.controllerToSendRequest = 'PurchaseDeliveryNotes';
          this.typeDocument = this.preloadedDocActionType === PreloadedDocumentActions.COPY ? DocumentType.PurchaseOrder : DocumentType.Purchase;
          this.currentUrl = 'good-receipt';
          this.currentReport = 'GoodsReceiptPO';
          this.currentTitle = 'Entrada Mercancías';

          break;

        case 'return-good':

          this.controllerToSendRequest = 'PurchaseReturns';
          this.currentUrl = 'return-good';
          this.currentReport = 'GoodsReturn';
          this.typeDocument = DocumentType.PurchaseReturns;
          this.currentTitle = 'Devolución Mercancías';

          break;

        case 'order':

          this.controllerToSendRequest = 'PurchaseOrders';
          this.currentUrl = 'order';
          this.currentReport = 'PurchaseOrder';
          this.typeDocument = DocumentType.PurchaseOrder;
          this.currentTitle = 'Orden';
          this.docDueDataLabel = 'Fecha de entrega';

          break;

      }

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

      if (+(ALL_RECORDS.Row.Quantity) <= 0 || +(ALL_RECORDS.Row.UnitPrice) < 0 || +(ALL_RECORDS.Row.DiscountPercent) < 0
        || +(ALL_RECORDS.Row.Total < 0) || +(ALL_RECORDS.Row.TotalImp) < 0 || +(ALL_RECORDS.Row.TotalDesc) < 0) {
        this.InflateTableLines();
        return;
      }

      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);

      if (!ALL_RECORDS.Row.Currency) {
        ALL_RECORDS.Row.Currency = this.docCurrency;
      }

      switch (ALL_RECORDS.EventName) {
        case 'Dropdown':

          if (ALL_RECORDS.Row.LineStatus === 'C') {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'No se puede modificar ítem en estado cerrado.'
            });
            this.InflateTableLines();
            return;
          }


          if (this.lines[INDEX].UoMEntry != ALL_RECORDS.Row.UoMEntry) {

            let uom = ALL_RECORDS.Row.UoMMasterData.find(x => x.UoMEntry === ALL_RECORDS.Row.UoMEntry);

            if (uom) {
              ALL_RECORDS.Row.UnitPriceFC = uom.UnitPriceFC;
              ALL_RECORDS.Row.UnitPriceCOL = uom.UnitPrice;
              ALL_RECORDS.Row.UnitPrice = this.localCurrency.Id === this.docCurrency ? uom.UnitPrice : uom.UnitPriceFC;
            }
          }

          let taxSelected = this.taxes.find(x => x.TaxCode === ALL_RECORDS.Row.TaxCode);
          if(this.lines[INDEX].VATLiable=='NO'){
            ALL_RECORDS.Row.TaxRate=0;
          }
          else if (taxSelected) {
            ALL_RECORDS.Row.TaxRate = taxSelected?.TaxRate || 0;
          }
          this.lines[INDEX] = ALL_RECORDS.Row;
          this.LineTotal(INDEX);
          break;

        case 'InputField':

          if (this.lines[INDEX].UnitPrice != ALL_RECORDS.Row.UnitPrice) {

            ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            this.lines[INDEX] = ALL_RECORDS.Row;
            this.LineTotal(INDEX);

          } else if (this.lines[INDEX].Total != ALL_RECORDS.Row.Total) {

            let price = ALL_RECORDS.Row.Total / ALL_RECORDS.Row.Quantity

            ALL_RECORDS.Row.UnitPrice = price;
            ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== this.docCurrency ? price : +((price / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === this.docCurrency ? price : +((price * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));


            ALL_RECORDS.Row.TotalFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.TotalDesc = +(((ALL_RECORDS.Row.Total) - ((ALL_RECORDS.Row.Total) * (+(ALL_RECORDS.Row.DiscountPercent) / 100))).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalDescFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.TotalDesc : +((ALL_RECORDS.Row.TotalDesc / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalDescCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.TotalDesc : +((ALL_RECORDS.Row.TotalDesc * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            let totalLineImp = +(((ALL_RECORDS.Row.Total) + ((ALL_RECORDS.Row.Total) * (+(ALL_RECORDS.Row.TaxRate) / 100))).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.TotalImp = totalLineImp;
            ALL_RECORDS.Row.TotalImpFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.TotalImp : +((ALL_RECORDS.Row.TotalImp / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalImpCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.TotalImp : +((ALL_RECORDS.Row.TotalImp * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

          } else if (this.lines[INDEX].TotalDesc != ALL_RECORDS.Row.TotalDesc) {

            let total = +(ALL_RECORDS.Row.TotalDesc + (ALL_RECORDS.Row.TotalDesc * (ALL_RECORDS.Row.DiscountPercent / 100)));

            let price = total / ALL_RECORDS.Row.Quantity;

            ALL_RECORDS.Row.UnitPrice = price;
            ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== this.docCurrency ? price : +((price / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === this.docCurrency ? price : +((price * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.Total = total;
            ALL_RECORDS.Row.TotalFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            let totalLineImp = +(((ALL_RECORDS.Row.Total) + ((ALL_RECORDS.Row.Total) * (+(ALL_RECORDS.Row.TaxRate) / 100))).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.TotalImp = totalLineImp;
            ALL_RECORDS.Row.TotalImpFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.TotalImp : +((ALL_RECORDS.Row.TotalImp / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalImpCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.TotalImp : +((ALL_RECORDS.Row.TotalImp * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

          } else if (this.lines[INDEX].TotalImp != ALL_RECORDS.Row.TotalImp) {

            let total = +((ALL_RECORDS.Row.TotalImp / (1 + (ALL_RECORDS.Row.TaxRate / 100))).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.Total = total;
            ALL_RECORDS.Row.TotalFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            let price = ALL_RECORDS.Row.Total / ALL_RECORDS.Row.Quantity;
            ALL_RECORDS.Row.UnitPrice = price;
            ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== this.docCurrency ? price : +((price / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === this.docCurrency ? price : +((price * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));


            let totalLineWithDisc = +(((ALL_RECORDS.Row.Total) - ((ALL_RECORDS.Row.Total) * (+(ALL_RECORDS.Row.DiscountPercent) / 100))).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.TotalDesc = totalLineWithDisc;
            ALL_RECORDS.Row.TotalDescFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.TotalDesc : +((ALL_RECORDS.Row.TotalDesc / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalDescCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.TotalDesc : +((ALL_RECORDS.Row.TotalDesc * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

          } else if (this.lines[INDEX].DiscountPercent != ALL_RECORDS.Row.DiscountPercent) {

            if (ALL_RECORDS.Row.DiscountPercent > this.userAssign.Discount) {

              ALL_RECORDS.Row.DiscountPercent = 0;
              this.alertsService.Toast({
                type: CLToastType.INFO,
                message: `El descuento no puede ser mayor a ${this.userAssign.Discount} que es lo permitido para este usuario.`
              });

            }

            let total = +((ALL_RECORDS.Row.Quantity * ALL_RECORDS.Row.UnitPrice).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.Total = total;
            ALL_RECORDS.Row.TotalFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.Total : +((ALL_RECORDS.Row.Total * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

            let totalLineWithDisc = +(((ALL_RECORDS.Row.Total) - ((ALL_RECORDS.Row.Total) * (+(ALL_RECORDS.Row.DiscountPercent) / 100))).toFixed(this.DecimalUnitPrice));

            ALL_RECORDS.Row.TotalDesc = totalLineWithDisc;
            ALL_RECORDS.Row.TotalDescFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.TotalDesc : +((ALL_RECORDS.Row.TotalDesc / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.TotalDescCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.TotalDesc : +((ALL_RECORDS.Row.TotalDesc * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
          } else {

            ALL_RECORDS.Row.UnitPriceFC = this.localCurrency.Id !== this.docCurrency ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === this.docCurrency ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            this.lines[INDEX] = ALL_RECORDS.Row;
            this.LineTotal(INDEX);
          }
          this.lines[INDEX] = ALL_RECORDS.Row;
          break;
        case 'Dropped':
          this.InflateTableLines();
          this.lines[INDEX] = ALL_RECORDS.Row;
          this.LineTotal(INDEX);
          return;
          break;

      }
      this.GetRowMessage(ALL_RECORDS.Row);
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

      if (ACTION.LineStatus === 'C') {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'No se puede modificar ítem en estado cerrado.'
        });
        return;
      }

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.DELETE:
          this.lines.splice(ACTION.Id - 1, 1);
          this.uom = this.uom.filter(x => x.by !== ACTION.IdDiffBy);

          // Update the drop-down list by filtering only on those UDF fields, the values associated with the deleted item
          Object.keys(this.dropdownDiffList)?.filter(key => key.includes('U_'))?.forEach((key) => {
            this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== ACTION.IdDiffBy);
          });

          this.InflateTableLines();
          this.GetTotals();
          break;

        case Structures.Enums.CL_ACTIONS.OPTION_1:
          this.OpenDialogStock(ACTION.ItemCode);
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_2:
          if (this.IsXml && this.lines[ACTION.Id - 1].U_DescriptionItemXml) {

            this.lines = this.lines.map(x => {
              return {...x, IsFocused: false, RowColor: ''}
            });

            this.lines[ACTION.Id - 1].IsFocused = !ACTION.IsFocused;

            if (this.lines[ACTION.Id - 1].IsFocused) {
              this.lines[ACTION.Id - 1].RowColor = RowColors.PaleBlue;
              this.sharedService.focusItem$.next();
            }
            this.InflateTableLines();
          } else {
            this.alertsService.Toast({type: CLToastType.INFO, message: 'Opción para escanear ítems cargados del xml'})
          }
          break;
      }
    }
  }

  /**
   * Method to assign color to line to items with xml load pending item scanning
   * @constructor
   * @private
   */
  private GetRowColorisXml(): void {
    if (this.lines.some(x => !x.IsFocused && !x.ItemCode)) {
      const NEXT_INDEX = this.lines.findIndex((x) => x.ItemCode === "");
      if (NEXT_INDEX != -1) {
        this.lines[NEXT_INDEX].IsFocused = true;
        this.lines[NEXT_INDEX].RowColor = RowColors.PaleBlue;
        this.sharedService.focusItem$.next();
      }
    }
  }

  private OpenDialogStock(_itemCode: string): void {
    this.matDialog.open(StockWarehousesComponent, {
      disableClose: true,
      minWidth: '50%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '80%',
      data: _itemCode
    }).afterClosed().subscribe();
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'GOOD_RECEIPT':

        this.currentTitle = 'Entrada';
        this.controllerToSendRequest = 'PurchaseDeliveryNotes';
        this.isDrafts=false;
        this.OnSubmit();

        break;

      case 'PURCHASE_ORDER':

        this.currentTitle = 'Orden';
        this.controllerToSendRequest = 'PurchaseOrders';
        this.isDrafts=false;
        this.OnSubmit();

        break;

      case 'CLEAN':
        this.isDrafts=false;
        this.Clear();

        break;

      case 'ADD':
        this.isDrafts=false;
        this.OnSubmit();

        break;

      case 'ADDPRE':
        this.currentTitle = 'Preliminar';
        this.controllerToSendRequest = 'PurchaseOrders';
        this.isDrafts=true;
        this.OnSubmit();

        break;

      case 'ADDXML':

        this.inputVariableFileXml.nativeElement.click();

        break;

    }
  }

  /**
   * Clean componente
   * @constructor
   * @private
   */
  private Clear(): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
      switchMap(res => {
        this.overlayService.OnGet();
        return forkJoin({
          SalesPerson: this.salesMenService.Get<ISalesPerson[]>(),
          PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.PrchseItem),
          Taxes: this.taxesService.Get<ITaxe[]>(),
          Currencies: this.currenciesService.Get(false),
          Warehouses: this.warehouseService.Get<IWarehouse[]>(),
          Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode, ItemsFilterType.PrchseItem),
          Permission: this.permissionUserService.Get<IPermissionbyUser[]>(),
          ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
          Settings: this.settingService.Get<ISettings[]>(),
          UdfsLines: this.udfsService.Get<IUdfContext[]>(this.typeDocument, true, true)
            .pipe(catchError(res => of(null))),
          UdfsDevelopment: this.udfsService.GetUdfsDevelopment(this.typeDocument)
            .pipe(catchError(res => of(null)))
        })
      }),
      switchMap(res => {
        this.salesPerson = res.SalesPerson.Data;
        this.priceLists = res.PriceList.Data;
        this.taxes = res.Taxes.Data;
        this.currencies = res.Currencies.Data;
        this.warehouses = res.Warehouses.Data;
        this.items = res.Items.Data;
        this.settings = res.Settings.Data;
        this.udfsLines = res.UdfsLines?.Data ?? [];
        this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
        this.permission = res.Permission.Data;
        this.currentSession.Rate = res.ExchangeRate.Data.Rate;

        //Business partner default
        if(this.userAssign?.BuyerCode) {
          return this.suppliersService.Get<IBusinessPartner>(this.userAssign?.BuyerCode);
        }
        else if (res.Settings.Data && res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
          let companyDefaultBusinessPartner = JSON.parse(res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

          if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

            let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.selectedCompany?.Id) as IDefaultBusinessPartnerSetting;

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
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });

        this.ResetDocument();
        this.SetInitialData();
      }),
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });

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
   * Calculates and returns the total retention amount for an invoice.
   * @returns The total retention amount.
   */
  public DisplayRetention(): number {
    if (this.localCurrency?.Id === this.docCurrency) {
      return this.totalRetention;
    } else {
      return this.totalRetentionFC;
    }
  };

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

  public GetTotals(): void {

    this.total = 0;
    this.totalFC = 0;
    this.discount = 0;
    this.discountFC = 0;
    this.tax = 0;
    this.taxFC = 0;
    this.totalWithoutTax = 0;
    this.totalWithoutTaxFC = 0;

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

    this.total = this.total - this.totalRetention;
    this.totalFC = this.totalFC - this.totalRetention;
  };

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

    lineTotal = +(lineTotal.toFixed(this.DecimalTotalLine));
    lineTotalFC = +(lineTotalFC.toFixed(this.DecimalTotalLine));

    let totalLineDesc = +((lineTotal - (lineTotal * (disc / 100))).toFixed(this.DecimalTotalLine));
    let totalLineDescFC = +((lineTotalFC - (lineTotalFC * (disc / 100))).toFixed(this.DecimalTotalLine));

    let totalLineImp = +((lineTotal + (lineTotal * (+(this.lines[_index].VATLiable=='NO'? 0 :  this.lines[_index]?.TaxRate ?? 0) / 100))).toFixed(this.DecimalTotalLine));
    let totalLineImpFC = +((lineTotalFC + (lineTotalFC * (+(this.lines[_index].VATLiable=='NO'? 0 : this.lines[_index]?.TaxRate ?? 0) / 100))).toFixed(this.DecimalTotalLine));

    this.lines[_index].TotalCOL = lineTotal;
    this.lines[_index].TotalFC = lineTotalFC;
    this.lines[_index].Total = this.localCurrency.Id === this.docCurrency ? lineTotal : lineTotalFC;
    this.lines[_index].TotalDescFC = totalLineDescFC;
    this.lines[_index].TotalDescCOL = totalLineDesc;
    this.lines[_index].TotalDesc = this.localCurrency.Id === this.docCurrency ? totalLineDesc : totalLineDescFC;
    this.lines[_index].TotalImpFC = totalLineImpFC;
    this.lines[_index].TotalImpCOL = totalLineImp;
    this.lines[_index].TotalImp = this.localCurrency.Id === this.docCurrency ? totalLineImp : totalLineImpFC;
    this.lines[_index].Quantity = qty;
  }

  public GetSymbol(): string {
    return this.currencies.find(c => c.Id === this.documentForm.controls['DocCurrency'].value)?.Symbol || '';
  }

  public GetConversionSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id !== this.documentForm.controls['DocCurrency'].value)?.Symbol || '';
  }

  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else this.SaveChanges();
  }

  /**
   * Create purchase invoice
   * @constructor
   * @private
   */
  private SaveChanges(): void {
    if (!this.DocumentLinesValidations()) return;
    if (!this.ValidateUdfsLines()) return;


    let document: IDocument = this.documentForm.getRawValue();

    if (this.DefaultBusinessPartner.CardName !== this.documentForm.controls['CardName'].value) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No es permitido cambiar el nombre a proveedor'
      });

      return;
    }

    document.DocDate = FormatDate(document.DocDate);
    document.DocDueDate = FormatDate(document.DocDueDate);
    document.TaxDate = FormatDate(document.TaxDate);
    document.DocEntry = this.docEntry;
    document.DocNum = this.docNum;
    document.DocumentLines = this.lines;
    document.Udfs = this.udfsValue;

    if(this.retentionProcessEnabled){
      document.WithholdingTaxDataCollection = this.withholdingTaxSelected.map((withholding: IWithholdingTaxSelected) => {
        return {
          WTCode: withholding?.WTCode
        } as WithholdingTaxCode;
      });
    }

    let IsUpdate = false;

    let actionMessage = this.preloadedDocActionType === PreloadedDocumentActions.EDIT  && this.preloadedDocFromType!='Draft' &&!this.isDrafts? 'actualizada' : !this.isDrafts ? 'creada': this.isDrafts && this.preloadedDocFromType==='Draft'?'actualizado':'creado';
    let actionMessageError = this.preloadedDocActionType === PreloadedDocumentActions.EDIT && this.preloadedDocFromType!='Draft' &&!this.isDrafts  ? 'actualizando' : 'creando';

    if (document.DocEntry > 0 && this.preloadedDocActionType === PreloadedDocumentActions.EDIT) {
      IsUpdate = true;

      if ((this.lines.length - 1) < this.IndexMinUpdate) {
        this.indexMaxUpdate = -1;
      }
    }
    document.DocumentLines = this.lines.map(x => {
      x.LineNum == -1 ? this.indexMaxUpdate = this.indexMaxUpdate + 1 : this.indexMaxUpdate;
      return {
        ...x,
        Udfs: GetUdfsLines(x, this.udfsLines),
        LineNum: IsUpdate ? x.LineNum == -1 ? this.indexMaxUpdate : x.LineNum : x.LineNum,
        TaxOnly: x.TaxOnly ? "tYES" : "tNO",
        LineStatus: x.LineStatus === 'C' ? LineStatus.bost_Close : LineStatus.bost_Open,
        VATLiable:x.VATLiable=='1' || x.VATLiable=='SI' ? 1 : 0
      } as IDocumentLine
    });


    this.SetUdfsDevelopment();

    this.overlayService.OnPost();
    let updateOrCreate$: Observable<Structures.Interfaces.ICLResponse<IDocument>> | null = null;
    if(this.isDrafts){
      if(this.preloadedDocFromType=='Draft'){
        updateOrCreate$ = this.draftService.Patch<IDocument>(this.controllerToSendRequest, document, this.documentAttachment, this.attachmentFiles);
      }else{
        updateOrCreate$ = this.draftService.Post<IDocument>(this.controllerToSendRequest, document,  this.documentAttachment, this.attachmentFiles);
      }
    }
    else if(!document.DocEntry || document.DocEntry === 0 || this.preloadedDocActionType === PreloadedDocumentActions.COPY || this.preloadedDocActionType === PreloadedDocumentActions.DUPLICATE || this.preloadedDocActionType === PreloadedDocumentActions.CREATE_FROM_DRAFT) {
      updateOrCreate$ = this.purchasesDocumentService.Post(this.controllerToSendRequest, document,  this.documentAttachment, this.attachmentFiles);
    } else {
      updateOrCreate$ = this.purchasesDocumentService.Patch(this.controllerToSendRequest, document,  this.documentAttachment, this.attachmentFiles);
    }

    updateOrCreate$
      .pipe(
        switchMap(res => {
          this.currentReport = res.Data?.ConfirmationEntry ? 'Preliminary': this.currentReport;

          if(this.hasCompanyAutomaticPrinting){
            return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
              map(print => {
                return { Document: res, Print: print };
              })
            );
          } else {
            return of({ Document: res, Print: null })
          }
        }),
        map(res => {
          this.overlayService.Drop();
          return {
            DocEntry: res.Document.Data?.DocEntry ?? this.docEntry,
            DocNum: res.Document.Data?.DocNum ?? this.docNum,
            NumFE: '',
            CashChange: 0,
            CashChangeFC: 0,
            Title: res.Document.Data?.ConfirmationEntry ? Titles.Draft : this.currentTitle,
            Accion: actionMessage,
            TypeReport: this.currentReport
          } as ISuccessSalesInfo;
        }),
        switchMap(res => this.OpenDialogSuccessSales(res)),
        switchMap(res => {
          this.overlayService.OnGet();
          return forkJoin({
            SalesPerson: this.salesMenService.Get<ISalesPerson[]>(),
            PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.PrchseItem),
            Taxes: this.taxesService.Get<ITaxe[]>(),
            Currencies: this.currenciesService.Get(false),
            Warehouses: this.warehouseService.Get<IWarehouse[]>(),
            Items: this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode, ItemsFilterType.PrchseItem),
            Permission: this.permissionUserService.Get<IPermissionbyUser[]>(),
            ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
            Settings: this.settingService.Get<ISettings[]>(),
            UdfsLines: this.udfsService.Get<IUdfContext[]>(this.typeDocument, true, true)
              .pipe(catchError(res => of(null))),
            UdfsDevelopment: this.udfsService.GetUdfsDevelopment(this.typeDocument)
              .pipe(catchError(res => of(null)))
          })
        }),
        switchMap(res => {
          this.salesPerson = res.SalesPerson.Data;
          this.priceLists = res.PriceList.Data;
          this.taxes = res.Taxes.Data;
          this.currencies = res.Currencies.Data;
          this.warehouses = res.Warehouses.Data;
          this.items = res.Items.Data;
          this.settings = res.Settings.Data;
          this.udfsLines = res.UdfsLines?.Data ?? [];
          this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
          this.permission = res.Permission.Data;
          this.currentSession.Rate = res.ExchangeRate.Data.Rate;

          //Business partner default
          if(this.userAssign?.BuyerCode) {
            return this.suppliersService.Get<IBusinessPartner>(this.userAssign?.BuyerCode);
          }
          else if (res.Settings.Data && res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)) {
            let companyDefaultBusinessPartner = JSON.parse(res.Settings.Data.find((element) => element.Code == SettingCode.DefaultBusinessPartner)?.Json || '') as IDefaultBusinessPartnerSetting[];

            if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {

              let dataCompany = companyDefaultBusinessPartner.find(x => x.CompanyId === this.selectedCompany?.Id) as IDefaultBusinessPartnerSetting;

              if (dataCompany) {
                return this.suppliersService.Get<IBusinessPartner>(dataCompany.BusinessPartnerSupplier);
              }
            }
          }
          return of(null);
        }),
        finalize(() => this.overlayService.Drop())
      )
      .subscribe({
        next: (res) => {

          if (res && res.Data) {
            this.DefaultBusinessPartner = res.Data;
          }

          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
          this.SetInitialData();
          this.ResetDocument();
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


  private DocumentLinesValidations(): boolean {

    let data = ValidateLines(this.lines);

    if (!data.Value) {
      this.alertsService.Toast({type: CLToastType.INFO, message: data.Message});
      return false;
    }

    if (this.lines.some(l => l.TaxOnly === (typeof l.TaxOnly === 'string' ? 'tYES' : true)) && !this.permission.some(p => p.Name === 'Purchases_Documents_BillDiscountedProducts')) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'No tienes permisos para crear documentos con productos bonificados'
      });
      return false;
    }

    const LOADXML = this.lines.find(x => x.ItemCode === "" || x.ItemDescription === "");

    if (this.IsXml && LOADXML) {

      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Debe escanear ítem  ${LOADXML.U_DescriptionItemXml}`
      });
      return false;
    }

    return true;
  }

  public GetItems(): void {
    this.overlayService.OnGet();
    this.itemService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode, ItemsFilterType.PrchseItem).pipe(
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

  /**
   * Load item selected to table
   * @param _item - Item selected
   * @constructor
   */
  public OnSelectItem(_item: ItemSearchTypeAhead | string): void {
    try {

      if (typeof _item === 'string') {
        this.OpenItem(_item);
      } else {
        if (this.documentForm.controls['ShowItemDetail'].value) {
          this.OpenDialogItemDetail(_item.ItemCode);
          this.sharedService.EmitEnableItem();
        } else {

          let cant = +this.documentForm.controls['Quantity'].value;
          if (cant <= 0) {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: `Cantidad permitida mayor a 0`
            });
            this.sharedService.EmitEnableItem();
            return;
          }

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
            this.currentSession?.WhsCode,
            this.documentForm.controls['PriceList'].value,
            this.documentForm.controls['CardCode'].value,
            typeSerial,
            _item.SysNumber,
            'Y',
            ItemsFilterType.PrchseItem
          )
            .pipe(
              take(1),
              finalize(() => {
                this.sharedService.EmitEnableItem();
                this.overlayService.Drop();
              }))
            .subscribe({
              next: (callback => {
                if (callback.Data) {

                  let totalLine = 0;
                  let totalLineFC = 0;
                  let totalLineDesc = 0;
                  let totalLineDescFC = 0;
                  let totalLineImp = 0;
                  let totalLineImpFC = 0;
                  let unitPrice = 0;
                  let unitPriceFC = 0;
                  let discount = 0;
                  discount = callback.Data.DiscountPercent ? callback.Data.DiscountPercent : 0;

                  totalLine = +((callback.Data.UoMMasterData[0].UnitPrice * cant).toFixed(this.DecimalTotalLine));
                  totalLineFC = +((callback.Data.UoMMasterData[0].UnitPriceFC * cant).toFixed(this.DecimalTotalLine));

                  totalLineDesc = +((totalLine - (totalLine * (discount / 100))).toFixed(this.DecimalTotalLine));
                  totalLineDescFC = +((totalLineFC - (totalLineFC * (discount / 100))).toFixed(this.DecimalTotalLine));

                  totalLineImp = +((totalLine + (totalLine * (callback.Data.TaxRate / 100))).toFixed(this.DecimalTotalLine));
                  totalLineImpFC = +((totalLineFC + (totalLineFC * (callback.Data.TaxRate / 100))).toFixed(this.DecimalTotalLine));

                  unitPrice = callback.Data.UoMMasterData[0].UnitPrice;
                  unitPriceFC = callback.Data.UoMMasterData[0].UnitPriceFC;

                  let maxIdUomEntry = this.lines && this.lines.length > 0 ? Math.max(...this.lines.map(x => (x.IdDiffBy || 0))) + 1 : 1;

                  let item = {
                    ItemCode: callback.Data.ItemCode,
                    InventoryItem: callback.Data.InventoryItem,
                    PurchaseItem: callback.Data.PurchaseItem,
                    SalesItem: callback.Data.SalesItem,
                    DocEntry: callback.Data.DocEntry,
                    WarehouseCode: this.currentSession?.WhsCode,
                    Quantity: cant,
                    TaxCode: callback.Data.TaxCode,
                    TaxRate: callback.Data.TaxRate,
                    UnitPriceCOL: unitPrice,
                    UnitPriceFC: unitPriceFC,
                    UnitPrice: this.localCurrency.Id === this.docCurrency ? unitPrice : unitPriceFC,
                    DiscountPercent: callback.Data.DiscountPercent ? callback.Data.DiscountPercent : 0,
                    CostingCode: this.userAssign?.CenterCost,
                    TotalFC: totalLineFC,
                    TotalCOL: totalLine,
                    Total: this.localCurrency.Id === this.docCurrency ? totalLine : totalLineFC,
                    TotalDesc: this.localCurrency.Id === this.docCurrency ? totalLineDesc : totalLineDescFC,
                    TotalDescFC: totalLineDescFC,
                    TotalDescCOL: totalLineDesc,
                    TotalImpFC: totalLineImpFC,
                    TotalImpCOL: totalLineImp,
                    TotalImp: this.localCurrency.Id === this.docCurrency ? totalLineImp : totalLineImpFC,
                    LineNum: -1,
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
                    LockedUnitPrice: unitPrice,
                    VATLiable:callback.Data.VATLiable
                  } as IDocumentLine;

                  if (this.udfsLines && this.udfsLines.length > 0) {
                    MappingDefaultValueUdfsLines(item, this.udfsLines);
                  }
                  if (this.IsXml && this.lines.some(x => x.IsFocused)) {
                    const INDEX = this.lines.findIndex(x => x.IsFocused);
                    this.lines[INDEX].ItemCode = item.ItemCode;
                    this.lines[INDEX].ItemDescription = item.ItemDescription;
                    this.lines[INDEX].RowColor = '';
                    this.lines[INDEX].IsFocused = false;
                    this.GetRowColorisXml();
                  } else {
                    this.lines.push(item);
                  }

                  if (item.TaxCode === '') {
                    this.alertsService.Toast({
                      type: CLToastType.ERROR,
                      message: `Ítem ${item.ItemCode} - Ítem ${item.ItemDescription} no cuenta con el código del impuesto`
                    });
                  }

                  this.ConfigDropdownDiffListTable(item);

                  if (this.udfsLines?.length) {
                    SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList);
                  }
                  this.InflateTableLines();
                  this.GetTotals();
                }
              }),
              error: (err) => {
                this.alertsService.ShowAlert({HttpErrorResponse: err});
              }
            });
        }
      }
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

      this.dropdownDiffList = {
        ...this.dropdownDiffList,
        UoMEntry: this.uom as DropdownElement[]
      };

    }
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

  private ResetDocument(): void {
    this.documentAttachment = {
      AbsoluteEntry: 0,
      Attachments2_Lines: []
    };
    this.attachmentFiles = [];
    this.InflateAttachmentTable();
    this.lines = [];
    this.docEntry = 0;
    this.docNum = 0;
    this.GetTotals();
    this.documentData = null;
    if (this.preloadedDocActionType) {
      this.router.navigate(['purchases', this.currentUrl]);
      if (this.preloadedDocActionType === PreloadedDocumentActions.EDIT) {
        this.actionButtons = [
          {
            Key: 'ADDXML',
            MatIcon: 'upload_file',
            Text: 'Cargar Xml',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
          {
            Key: 'ADD',
            MatIcon: 'save',
            Text: 'Crear',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false,
            Options: [
              {
                Key: 'GOOD_RECEIPT',
                MatIcon: 'description',
                Text: `Entrada de Inventario`,
                MatColor: 'primary',
              },
              {
                Key: 'PURCHASE_ORDER',
                MatIcon: 'list_alt',
                Text: `Orden de compra`,
                MatColor: 'primary',
              }
            ]
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        if (this.canCreateDraft) {
          const button = {
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          };

          // Insert the button at the desired index, e.g., index 1
          const index = 1;
          this.actionButtons.splice(index, 0, button);
        }
      } else {
        this.actionButtons = [
          {
            Key: 'ADDXML',
            MatIcon: 'upload_file',
            Text: 'Cargar Xml',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          },
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
        if (this.canCreateDraft) {
          const button = {
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          };

          // Insert the button at the desired index, e.g., index 1
          const index = 1;
          this.actionButtons.splice(index, 0, button);
        }
      }

    }
    this.preloadedDocActionType = '';
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.InflateTableLines();
    this.udfsValue = [];
    this.dropdownDiffList = {};
    this.withholdingTaxSelected = [];
    this.CleanFields();
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
   * ESTE METODO CARGA LA INFO DE UNA ORDEN DE COMPRA PARA PASARLA A UNA ENTRADA DE MERCADERIA O EDITAR
   * @private
   */
  private SetData(data: IDocument): void {
    this.documentForm.patchValue({
      CardCode: data.CardCode,
      CardName: data.CardName,
      PriceList: data.PriceList,
      SalesPersonCode: data.SalesPersonCode,
      DocCurrency: data.DocCurrency,
      Comments: data.Comments,
      DocDate: data.DocDate,
      DocDueDate: data.DocDueDate,
      TaxDate: data.TaxDate
    });
    this.docCurrency = this.documentForm.controls['DocCurrency'].value;
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

    this.indexMaxUpdate = data?.DocumentLines.reduce((acc, i) => (i.LineNum > acc.LineNum ? i : acc)).LineNum || 0;
    this.IndexMinUpdate = data?.DocumentLines.reduce((acc, i) => (i.LineNum < acc.LineNum ? i : acc)).LineNum || 0;

    if (this.preloadedDocActionType === PreloadedDocumentActions.COPY) {
      data.DocumentLines = data?.DocumentLines.filter(x => x.LineStatus != 'C');
    }

    this.lines = data.DocumentLines.map((x, index) => {

      unitPrice = 0;
      unitPriceFC = 0;
      totalLine = 0;
      totalLineFC = 0;
      totalLineDesc = 0;
      totalLineDescFC = 0;
      totalLineImp = 0;
      totalLineImpFC = 0;

      if (data.DocCurrency === this.localCurrency.Id) {
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
        Currency: x.Currency || data.DocCurrency
      } as IDocumentLine;

      if (this.preloadedDocActionType !== PreloadedDocumentActions.DUPLICATE) {
        item.BaseEntry = data.DocEntry;
        item.BaseLine = x.LineNum;
        item.BaseType = this.preloadedDocActionType == PreloadedDocumentActions.CREATE_FROM_DRAFT ? -1 : CopyFrom.OPOR;
      }

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

  private ChangeWarehouse(): void {
    this.subscriptions$.add(
      this.sharedService.changeWarehouse$.pipe(
        filter((value: string) => {
          return !!(value && value !== '');
        }),
        switchMap((value: string) => {
          this.currentSession.WhsCode = value;
          this.overlayService.OnGet();
          return this.itemService.GetAll<ItemSearchTypeAhead[]>(value, ItemsFilterType.PrchseItem).pipe(finalize(() => this.overlayService.Drop()))
        }),
      ).subscribe({
        next: (callback => {
          this.items = callback.Data;
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })
    );
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

  public SelectCurrency(): void {
    this.docCurrency = this.documentForm.controls['DocCurrency'].value;
    this.lines = this.lines.map(element => {
      return {
        ...element,
        UnitPrice: this.docCurrency === this.localCurrency.Id ? element.UnitPriceCOL : element.UnitPriceFC,
        Total: this.docCurrency === this.localCurrency.Id ? element.TotalCOL : element.TotalFC,
        TotalImp: this.docCurrency === this.localCurrency.Id ? element.TotalImpCOL : element.TotalImpFC,
        TotalDesc: this.docCurrency === this.localCurrency.Id ? element.TotalDescCOL : element.TotalDescFC
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
    this.docCurrency = this.documentForm.controls['DocCurrency'].value;
  }

  public SelectWarehouse(): void {
    this.lines = this.lines.map(element => {
      return {
        ...element,
        WarehouseCode: this.documentForm.controls['WareHouse'].value
      }
    });
    this.InflateTableLines();

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


  //#region CREACION ENTRADA DESDE XML
  public UploadFileXML(_event: any): void {

    if (!this.documentForm.controls['WareHouse'].value) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Seleccione almacén para cargar xml`
      });
      return;
    }

    if (_event.target.files) {
      let FileExtention: string = _event.target.files[0]?.name.split(".").pop();
      if (FileExtention && FileExtention.toUpperCase() === "XML") {
        this.file = _event.target.files;
        this.xmlName = this.file[0].name;

        if (this.file != null) {
          this.lines = [];
          this.SaveXML();
        }
      } else {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El tipo de archivo debe ser xml`
        });
      }
    }
  }

  /**
   * Load xml template items
   * @constructor
   */
  public SaveXML(): void {
    if (this.file.length === 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Seleccione un archivo al menos`
      });
      return;
    }
    this.overlayService.OnGet();
    let formData = new FormData();

    if (this.file != null) {
      formData.append('file', this.file[0]);
      formData.append(`WhsCode`, this.documentForm.controls['WareHouse'].value);
      formData.append(`UserId`, this.userAssign?.UserId.toString());
      formData.append(`PriceList`, this.documentForm.controls['PriceList'].value);
    }

    this.purchasesDocumentService.PurchaseDeliveryNotesXml(formData)
      .pipe(
        finalize(() => {
          this.overlayService.Drop()
        }))
      .subscribe({
        next: callback => {
          if (callback.Data) {
            this.lines = [];
            this.IsXml = true;

            if (callback.Data.CardCode != null && callback.Data.CardName != null) {
              this.documentForm.patchValue({
                CardCode: callback.Data.CardCode,
                CardName: callback.Data.CardCode});
            }

            this.headerTableColumns['U_DescriptionItemXml'] = 'Descripción de xml';

            callback.Data.DocumentLines.forEach(x => {

              let totalLine = 0;
              let totalLineFC = 0;
              let totalLineDesc = 0;
              let totalLineDescFC = 0;
              let totalLineImp = 0;
              let totalLineImpFC = 0;
              let unitPrice = 0;
              let unitPriceFC = 0;


              if (this.docCurrency === this.localCurrency.Id) {

                totalLine = +((x.UnitPrice * x.Quantity).toFixed(this.DecimalTotalLine));
                totalLineFC = +(((x.UnitPrice * x.Quantity) / this.currentSession.Rate).toFixed(this.DecimalTotalLine));
                unitPrice = x.UnitPrice;
                unitPriceFC = +((x.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

              } else {

                totalLine = +(((x.UnitPrice * x.Quantity) * this.currentSession.Rate).toFixed(this.DecimalTotalLine));
                totalLineFC = +(((x.UnitPrice * x.Quantity)).toFixed(this.DecimalTotalLine));
                unitPrice = +((x.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
                unitPriceFC = x.UnitPrice;
              }

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
                TaxCode: x.TaxCode,
                TaxRate: x.TaxRate,
                UnitPriceCOL: x.UnitPrice,
                UnitPriceFC: unitPriceFC,
                UnitPrice: this.docCurrency === this.localCurrency.Id ? unitPrice : unitPriceFC,
                DiscountPercent: x.DiscountPercent ? x.DiscountPercent : 0,
                CostingCode: this.userAssign?.CenterCost,
                TotalFC: totalLineFC,
                TotalCOL: totalLine,
                Total: this.docCurrency === this.localCurrency.Id ? totalLine : totalLineFC,
                TotalDesc: this.docCurrency === this.localCurrency.Id ? totalLineDesc : totalLineDescFC,
                TotalDescFC: totalLineDescFC,
                TotalDescCOL: totalLineDesc,
                TotalImpFC: totalLineImpFC,
                TotalImpCOL: totalLineImp,
                TotalImp: this.docCurrency === this.localCurrency.Id ? totalLineImp : totalLineImpFC,
                ItemDescription: x.ItemDescription,
                OnHand: x.OnHand,
                UoMEntry: x.UoMMasterData && x.UoMMasterData.length > 0 ? x.UoMMasterData[0].UoMEntry : -1,
                UoMMasterData: x.UoMMasterData,
                IdDiffBy: this.lines.length === 0 ? 1 : this.lines.length + 1,
                Id: !this.lines || this.lines?.length === 0 ? 1 : this.lines.length + 1,
                U_DescriptionItemXml: x.U_DescriptionItemXml,
                LockedUnitPrice: unitPrice
              } as IDocumentLine;

              if (this.udfsLines && this.udfsLines.length > 0) {
                MappingDefaultValueUdfsLines(item, this.udfsLines);
              }
              this.lines.push(item);
              this.ConfigDropdownDiffListTable(item);

              if (this.udfsLines?.length) {
                SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList);
              }
            });


            this.InflateTableLines();
            this.GetTotals();
          }
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });

  }


//#endregion


  //#region Detalles de items
  private OpenDialogItemDetail(_itemCode: string): void {
    this.matDialog.open(ItemDetailsComponent, {
      disableClose: true,
      minWidth: '50%',
      maxWidth: '100%',
      //height: 'auto',
      //maxHeight: '80%',
      data: {ItemCode: _itemCode, DocType: this.typeDocument} as IItemDetailDialogData
    }).afterClosed().subscribe();
  }

  private OpenItem(_barCode?: string): void {
    let data = {
      BarCode: _barCode,
      Taxes: this.taxes,
      PriceList: this.priceLists.find(x => x.ListNum === this.documentForm.controls['PriceList'].value),
      IsWithBarCode: !!_barCode

    } as ICreateItemDialogData;
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: 'No se encontró el código de barras en su aplicación', subtitle: '¿Desea crear un producto nuevo?'
    })
      .pipe(
        filter(result => result),
        switchMap(res => this.matDialog.open(CreateItemComponent, {
            disableClose: true,
            minWidth: '50%',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '80%',
            data: data
          }).afterClosed()
        )
      ).subscribe({
      next: callback => {
        this.alertsService.ShowAlert({Response: callback});
        if (callback) {
          this.GetItems();
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }

    })

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

  private SetUdfsDevelopment(): void {
    MappingUdfsDevelopment<IPurchaseDocument>(this.documentForm.value, this.udfsValue, this.udfsDevelopment);
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);
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

  //#region Margin
  private GetRowMessage(_item: IDocumentLine): void {

    let LockedUnitPrice = this.docCurrency === this.localCurrency.Id ? +(_item.LockedUnitPrice) : +(((_item.LockedUnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice)));
    let UnitPrice = this.docCurrency === this.localCurrency.Id ? +(_item.UnitPriceCOL) : +(_item.UnitPriceFC);

    let MsgForExceededMargins = '';
    let MAX = LockedUnitPrice + LockedUnitPrice * (+(this.acceptedMargin) / 100);
    let MIN = LockedUnitPrice - LockedUnitPrice * (+(this.acceptedMargin) / 100);

    if (MAX < UnitPrice) {
      MsgForExceededMargins = `Margen en precio unitario excedido, margen aceptado de ${this.acceptedMargin}%, diferencia de ${(UnitPrice - MAX).toFixed(this.DecimalUnitPrice)}`;
    }

    if (UnitPrice < MIN) {
      MsgForExceededMargins = `Margen en precio unitario inferior, margen aceptado de ${this.acceptedMargin}%, diferencia de ${(UnitPrice - MIN).toFixed(this.DecimalUnitPrice)}`;
    }
    _item.RowMessage = MsgForExceededMargins;
    _item.RowColor = MAX < UnitPrice || UnitPrice < MIN ? RowColors.BeigePink : '';

  }

  //#endregion

  private SetInitialData(): void {

    this.canChangePriceList = this.permission.some(x => x.Name === 'Purchases_Documents_ChangePriceList');


    //#region SETEO INICIAL
    this.documentForm.reset();
    this.documentForm.controls['SalesPersonCode'].setValue(+(this.userAssign?.SlpCode));
    this.documentForm.controls['Quantity'].setValue(1);
    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['DocDueDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));
    //#endregion

    //#region DECIMALES
    if (this.settings.find((element) => element.Code == SettingCode.Decimal)) {
      let companyDecimal: IDecimalSetting[] = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '');

      if (companyDecimal && companyDecimal.length > 0) {

        let decimalCompany = companyDecimal.find(x => x.CompanyId === this.selectedCompany?.Id) as IDecimalSetting;

        if (decimalCompany) {
          this.TO_FIXED_TOTALDOCUMENT = `1.${decimalCompany.TotalDocument}-${decimalCompany.TotalDocument}`;
          this.DecimalTotalLine = decimalCompany.TotalLine;
          this.DecimalUnitPrice = decimalCompany.Price;
          this.DecimalTotalDocument = decimalCompany.TotalDocument;
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

    //#region MARGEN


    if (this.settings.find((element) => element.Code == SettingCode.Margin)) {

      let settingMargin = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Margin)?.Json || '') as IMarginSetting[];

      if (settingMargin && settingMargin.length > 0) {

        let dataMarginCompany = settingMargin.find(x => x.CompanyId === this.selectedCompany?.Id) as IMarginSetting;

        if (dataMarginCompany && dataMarginCompany.Margin.length > 0) {

          this.acceptedMargin = dataMarginCompany.Margin.filter(x => x.Table == this.typeDocument)[0]?.Margin || 0;

        }

      }
    }

    //#endregion

    //#region DEFAULT BUSINESS PARTNER
    this.LoadDataBp(this.DefaultBusinessPartner);

    //#region PERMISOS DE LA TABLA
    this.editableFieldConf =
      {
        Permissions: this.permission,
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(x => x.Name === _columnPerm.Name),
        Columns: this.editableField,
      };

    this.lineMappedDisplayColumns.editableFieldConf = this.editableFieldConf;
    //#endregion

    //#region AGREGAR UDFS A NIVEL DE LINEA
    if (this.udfsLines && this.udfsLines.length > 0) {
      MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns, this.dropdownColumns);
      this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
    }

    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);

    //#endregion

    //#region COPIA DE FACTURA A ORDEN
    if (this.documentData) {
      this.SetData(this.documentData);
      if (this.udfsLines.length){
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);
      }

    }
    //#endregion

    if (this.settings.find((element) => element.Code == SettingCode.Payment)) {
      let payment = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '') as IPaymentSetting[];

      if (payment && payment.length > 0) {
        let dataPayment = payment.find(x => x.CompanyId === this.selectedCompany?.Id) as IPaymentSetting;
        if (dataPayment) {
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
    this.retentionProcessEnabled = this.permission.some(permission => permission.Name === requiredPermission);
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

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

    if(urlSegment?.length > 0 && urlSegment[2]){
      this.currentUrl = urlSegment[2].path;
    }


    switch (this.currentUrl) {
      case 'good-receipt':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.Purchase)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.Purchase);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'return-good':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table ==DocumentTypes.MerchantOuput)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.MerchantOuput);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'order':
        if(this.ValidateAttachmentsTables){
          let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.PurchaseOrder)
          if(setting){
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.PurchaseOrder);
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

  /**
   * Validates the columns/items in a specific context.
   * This method performs validation checks on the columns or items.
   */
  private ValidateColumnsItems():void{
    switch (this.currentUrl) {
      case 'return-good':
        if (!this.permission.some(persmision => persmision.Name == PermissionViewColumnsItemsPurchases.Purchases_Documents_ReturnGood_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;

      case 'order':
        if (!this.permission.some(persmision => persmision.Name == PermissionViewColumnsItemsPurchases.Purchases_Documents_Order_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;

      case 'good-receipt':
        if (!this.permission.some(persmision => persmision.Name == PermissionViewColumnsItemsPurchases.Purchases_Documents_GoodReceipt_ViewVATLiable)) {
          this.lineMappedDisplayColumns.ignoreColumns?.push('VATLiable');
        }
        this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
        break;
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
   * Handles the print request for an invoice document.
   * @param _docEntry - The unique identifier of the invoice document to be printed.
   * @returns An observable containing the base64-encoded document or null if unavailable.
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
   * This function checks the current URL and sets the `canCreateDraft` flag
   * accordingly, determining whether the user has permission to create a draft
   * for the current document type.
   *
   * @returns {void} This function does not return a value.
   */
  private ValidatePermissionToAvailableDraft(): void {
    switch (this.currentUrl) {
      case 'order':
        this.canCreateDraft = this.permission.some(x => x.Name === PermissionValidateDraft.PurchasesDocumentsCreateDraft);
        break;
      case 'good-receipt':
        this.canCreateDraft=true;
        break;
      case 'return-good':
        this.canCreateDraft=true;
        break;
    }
    this.DefineActionButtonByPreloadedDocAction();
  }
}

