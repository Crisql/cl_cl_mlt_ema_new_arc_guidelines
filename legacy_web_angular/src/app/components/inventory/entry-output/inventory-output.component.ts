import {Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
import {
  CL_CHANNEL,
  ICLCallbacksInterface,
  ICLEvent,
  LinkerService,
  Register,
  Run,
  StepDown
} from "@clavisco/linker";
import {IActionButton} from "@app/interfaces/i-action-button";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {
  IDocumentLine,
  ILinesCurrencies,
  ILinesGoodReceip,
  ItemSearchScan
} from "@app/interfaces/i-items";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {
  catchError,
  concatMap,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from "rxjs";
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {ActivatedRoute, PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {AlertsService, CLModalType, CLToastType, ModalService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {
  DropdownElement,
  IEditableField,
  IEditableFieldConf,
  IInputColumn,
  IRowByEvent
} from "@clavisco/table/lib/table.space";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ITaxe} from "@app/interfaces/i-taxe";
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUserAssign} from "@app/interfaces/i-user";
import {ICompany } from "@app/interfaces/i-company";
import {
  IDecimalSetting, IFieldsInvoiceSetting,
  IPaymentSetting,
  IPrintFormatSetting,
  IValidateAttachmentsSetting, IValidateAutomaticPrintingsSetting
} from "../../../interfaces/i-settings";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {ItemSearchTypeAhead} from "@app/interfaces/i-item-typeahead";
import {IPriceList} from "@app/interfaces/i-price-list";
import {ItemsService} from "@app/services/items.service";
import {IInventoryOuputResolveData} from "@app/interfaces/i-resolvers";
import {StockWarehousesComponent} from "@Component/sales/stock-warehouses/stock-warehouses.component";
import {MatDialog} from "@angular/material/dialog";
import {
  DocumentTypes,
  ItemSerialBatch,
  ItemsFilterType,
  PermissionEditDocumentsDates,
  SettingCode,
  ViewBatches
} from "@app/enums/enums";
import {IBatches, IBatchSelected, IBinLocation, IDocumentLinesBinAllocations, ISerialNumbers} from "@app/interfaces/i-serial-batch";
import {IDocument} from "@app/interfaces/i-sale-document";
import {ISettings} from "@app/interfaces/i-settings";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {PurchasesDocumentService} from "@app/services/purchases-document.service";
import {IUdf, IUdfContext, IUdfDevelopment} from "@app/interfaces/i-udf";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {
  FormatDate,
  GetIndexOnPagedTable,
  GetUdfsLines,
  MappingDefaultValueUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines, SetUdfsLineValues,
  ValidateLines,
  ValidateUdfsLines, ZoneDate
} from "@app/shared/common-functions";
import {IInventoryEntryOutput, IUniqueId, IUserDev, ULineMappedColumns} from "@app/interfaces/i-document-type";
import {CommonService} from "@app/services/common.service";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {WarehousesService} from "@app/services/warehouses.service";
import {PriceListService} from "@app/services/price-list.service";
import {TaxesService} from "@app/services/taxes.service";
import {SettingsService} from "@app/services/settings.service";
import {UdfsService} from "@app/services/udfs.service";
import {IExchangeRate} from "@app/interfaces/i-exchange-rate";
import {ExchangeRateService} from "@app/services/exchange-rate.service";
import {PermissionUserService} from "@app/services/permission-user.service";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {BinLocationsService} from "@app/services/bin-locations.service";
import {MasterDataService} from '@app/services/master-data.service';
import {formatDate} from "@angular/common";
import {IAttachments2Line} from "@app/interfaces/i-business-partner";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {AttachmentsService} from "@app/services/Attachments.service";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {ReportsService} from "@app/services/reports.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";
import { BatchesService } from '@app/services/batches.service';
import { LotComponent } from '@app/components/sales/document/lot/lot.component';

@Component({
  selector: 'app-output',
  templateUrl: './inventory-output.component.html',
  styleUrls: ['./inventory-output.component.scss']
})
export class InventoryOutputComponent implements OnInit, OnDestroy {
  allItems: ItemSearchTypeAhead[] = [];

  /*Formularios*/
  documentForm!: FormGroup;

  /*OBSERVABLES*/
  subscriptions$!: Subscription;
  changeWarehouse$ = new Subject<string>();

  /*Listas*/
  actionButtons: IActionButton[] = [];
  warehouses: IWarehouse[] = [];
  lines: ILinesGoodReceip[] = [];
  permissions: IPermissionbyUser[] = [];
  items: ItemSearchTypeAhead[] = [];
  priceLists: IPriceList[] = [];
  buttons: ICLTableButton[] = [];
  udfsLines: IUdfContext[] = [];
  setting: ISettings[] = [];
  companyPrintFormat: IPrintFormatSetting[] = [];
  companyValidateAutomaticPrinting: IValidateAutomaticPrintingsSetting[] = [];

  /*OBJECTS*/
  userAssign!: IUserAssign;
  DecimalUnitPrice = 0; // Decimal configurado para precio unitario
  DecimalTotalLine = 0; //Decimal configurado por compania para total de linea
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento
  currentSession!: ICurrentSession;
  selectedCompany!: ICompany | null;
  currentReport!: keyof IPrintFormatSetting;
  reportConfigured!:  IPrintFormatSetting;
  companyReportValidateAutomaticPrinting!: IValidateAutomaticPrintingsSetting;

  /*Tabla*/
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  disableDragAndDrop: boolean = false;
  dropdownColumns: string[] = ['TaxCode', 'WarehouseCode', 'UoMEntry','BinAbsEntry','IdCurrency'];
  checkboxColumns: string[] = ['TaxOnly'];
  dropdownDiffBy = 'IdDiffBy';
  dropdownList!: DropdownList;
  lineTableId: string = 'LINE-TABLE-OUPUT';
  lineMappedColumns!: MappedColumns;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  editableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'UnitPrice',
      Permission: {Name: 'Inventory_InOut_EditLinePrice'}
    },
    {
      ColumnName: 'DiscountPercent',
      Permission: {Name: 'Inventory_InOut_EditLineDiscount'}
    },
    {
      ColumnName: 'CostingCode',
      Permission: {Name: 'Inventory_InOut_EditLineCostingCode'}
    },
    {
      ColumnName: 'TaxCode',
      Permission: {Name: 'Inventory_InOut_EditLineTax'}
    },
    {
      ColumnName: 'WarehouseCode',
      Permission: {Name: 'Inventory_InOut_EditLineWarehouse'}
    },
    {
      ColumnName: 'UoMEntry',
      Permission: {Name: 'Inventory_InOut_EditLineUoM'}
    },
    {
      ColumnName: 'TaxOnly',
      Permission: {Name: 'Inventory_InOut_BillDiscountedProducts'}
    },
    {
      ColumnName: 'IdCurrency',
      Permission: {Name: 'Inventory_InOut_EditLineCurrency'}
    },
  ];
  editableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  dropdownDiffList: DropdownList = {};
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
    WarehouseCode: 'Almacén',
    UoMEntry: 'U.Medida',
    BinAbsEntry: 'Ubicación',
    Total: 'Total',
    TotalDesc: 'T. + Desc'
  }

  InputColumns: IInputColumn[] = [
    {ColumnName: 'UnitPrice', FieldType: 'number'},
    {ColumnName: 'Quantity', FieldType: 'number'},
    {ColumnName: 'DiscountPercent', FieldType: 'number'},
    {ColumnName: 'CostingCode', FieldType: 'text'}]

  //mapped Table
  lineMappedDisplayColumns: ULineMappedColumns<ILinesGoodReceip, IPermissionbyUser> = {
    dataSource: [] as ILinesGoodReceip[],
    inputColumns: this.InputColumns,
    editableFieldConf: this.editableFieldConf,
    renameColumns: this.headerTableColumns,
    stickyColumns: [
      {Name: 'Total', FixOn: 'right'},
      {Name: 'TotalDesc', FixOn: 'right'},
      {Name: 'Options', FixOn: 'right'}
    ],
    ignoreColumns: ['InventoryItem', 'PurchaseItem', 'SalesItem', 'ItemName', 'OnHand', 'UnitPriceFC',
      'IsCommited', 'OnOrder', 'WhsCode', 'ItemClass', 'ForeignName', 'Frozen', 'Series', 'U_IVA',
      'BarCode', 'ItemBarCodeCollection', 'ItemPrices', 'TaxRate', 'Rate', 'TotalFC',
      'LineNum', 'BaseLine', 'BaseEntry', 'BaseType', 'UnitPriceCOL', 'TotalCOL', 'LastPurchasePrice', 'UoMMasterData',
      'ManBtchNum', 'ManSerNum', 'DocumentLinesBinAllocations', 'SysNumber', 'SerialNumbers', 'DistNumber', 'BatchNumbers',
      'TotalDescFC', 'TotalDescCOL', 'TotalImpFC', 'TotalImpCOL', 'UnitPriceDOL',
      'TreeType', 'BillOfMaterial', 'ManBinLocation', 'RowColor', 'FatherCode', 'LineStatus', 'Currency', 'RowMessage', 'LockedUnitPrice',
      'IdDiffBy', 'LinesCurrenciesList', 'CurrNotDefined', 'TotalImp', 'TaxCode','BinCode','AVGPrice','DeviationStatus','Solicited','Message']
  }


  /*VARIABLES*/
  total: number = 0;
  discount: number = 0;
  tax: number = 0;
  totalWithoutTax = 0;
  totalFC = 0;
  discountFC = 0;
  taxFC = 0;
  totalWithoutTaxFC = 0;
  docCurrency: string = '';
  controllerToSendRequest: string = '';
  currentUrl: string = '';
  currentTitle: string = '';
  TO_FIXED_TOTALDOCUMENT: string = '1.0-0';
  uniqueId: string = '';
  User!: string;
  shouldPaginateRequest: boolean = false;
  hasCompanyAutomaticPrinting: boolean = false;

  //#region Udfs
  udfsDevelopment: IUdfDevelopment[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = '';
  isVisible: boolean = true;
  canChangeDocDate: boolean = true;
  canChangeTaxDate: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";

  //#endregion

  //#region
  searchItemModalId = "searchItemModalId";
  //#endregion

  canChangePriceList: boolean = true;
  currencies: ICurrencies[] = [];
  localCurrency!: ICurrencies;
  documentAttachment: IDocumentAttachment = {
    AbsoluteEntry: 0,
    Attachments2_Lines: []
  } as IDocumentAttachment;
  attachmentFiles: File[] = [];
  attachmentTableId: string = "InventoryOutputDocumentAttachmentTableId";
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

  changeCurrencyLines: boolean = false;

  constructor(
    private fb: FormBuilder,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private alertsService: AlertsService,
    private router: Router,
    private itemService: ItemsService,
    private overlayService: OverlayService,
    private modalService: ModalService,
    private matDialog: MatDialog,
    private purchaseDocumentService: PurchasesDocumentService,
    private commonService: CommonService,
    private warehouseService: WarehousesService,
    private priceListService: PriceListService,
    private itemsService: ItemsService,
    private taxesService: TaxesService,
    private settingService: SettingsService,
    private udfsService: UdfsService,
    private exchangeRateService: ExchangeRateService,
    private permissionUserService: PermissionUserService,
    private binLocationsService: BinLocationsService,
    private masterDataService: MasterDataService,
    private attachmentService: AttachmentsService,
    private warehousesService: WarehousesService,
    private reportsService: ReportsService,
    private printerWorkerService: PrinterWorkerService,
    private batchesService: BatchesService,
  ) {

    this.ConfigTable();
    this.subscriptions$ = new Subscription();
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.subscriptions$.unsubscribe();
  }

  ngOnInit(): void {
    this.OnLoad();

    if(this.DBODataEndPoint == 'OIGE'){
      this.documentForm.controls['WhsCode'].valueChanges.subscribe((value: string) => {
        this.GetItemsOut(value);
      });

      if(this.documentForm.controls['WhsCode'].value){
        this.GetItemsOut(this.documentForm.controls['WhsCode'].value);
      }
    }else{
      this.GetItemsEntry();
    }
  }

  private OnLoad(): void {

    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign) as IUserAssign;
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.dropdownDiffList = {};

    this.InitForm();
    this.DefineDocument();
    this.HandleResolvedData();
    this.ConfigSelectInRows();
    this.RefreshRate();
    this.ValidatePermissionToEditDate();
    this.ListenScan();
    this.ValidateAttachTable();

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalItemRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);

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

  private DefineDocument(): void {

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

    if(urlSegment?.length > 0 && urlSegment[1]){
      switch (urlSegment[1].path) {
        case 'output':
          this.controllerToSendRequest = 'InventoryGenExits';
          this.currentUrl = 'output';
          this.currentTitle = 'Salida';
          this.DBODataEndPoint = 'OIGE';
          this.currentReport = 'GoodsIssue';
          break;
        case 'entry':
          this.controllerToSendRequest = 'InventoryGenEntries';
          this.currentUrl = 'entry';
          this.currentTitle = 'Entrada';
          this.DBODataEndPoint = 'OIGN';
          this.currentReport = 'GoodsReceipt';
          break;
      }
    }
  }

  /**
   * Initialize form for inventory documents
   */
  private InitForm(): void {
    this.documentForm = this.fb.group({
      Quantity: [1],
      WhsCode: [''],
      PriceList: ['', [Validators.required]],
      Comments: ['',],
      DocDate: ['',[Validators.required]],
      TaxDate: ['',[Validators.required]]
    });
  }

  /**
   * Handles and assigns resolved route data for the inventory output component.
   *
   * - Subscribes to Angular's `ActivatedRoute.data` to extract preloaded values.
   * - Assigns price lists, currencies, warehouses, permissions, UDFs, and settings.
   * - Identifies the local currency and exchange rate.
   * - Parses settings related to print formats and automatic printing validation.
   * - Applies company-specific configuration for report formatting and validation.
   * - Triggers the initialization of dependent data via `SetInitialData`.
   */
  private HandleResolvedData(): void {
    this.activatedRoute.data.subscribe({
      next: (res) => {
        const resolvedData = res['resolvedData'] as IInventoryOuputResolveData;

        if (resolvedData) {
          this.priceLists = resolvedData.PriceList ?? [];
          this.currencies = resolvedData.Currencies;
          this.localCurrency = this.currencies.find(c => c.IsLocal)!;
          this.items = resolvedData.Items;
          this.warehouses = resolvedData.Warehouse;
          this.permissions = resolvedData.Permissions;
          this.setting = resolvedData.Setting;
          this.udfsLines = resolvedData.UdfsLines;
          this.udfsDevelopment = resolvedData.UdfsDevelopment;
          this.currentSession.Rate = resolvedData.ExchangeRate.Rate;
          this.ValidateAttachmentsTables = resolvedData?.ValidateAttachmentsTables??undefined;
          this.SetInitialData();

          if(this.setting){
            let printFormatsSetting = this.setting.find((setting) => setting.Code == SettingCode.PrintFormat);
            let validateAutomaticPrintingSetting = this.setting.find((setting) => setting.Code == SettingCode.ValidateAutomaticPrinting);

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

  /**
   * Validates if the current user has permissions to edit the document date
   */
  private ValidatePermissionToEditDate(): void {

    const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
    const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
    const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

    if(urlSegment?.length > 0 && urlSegment[1]){
      switch (urlSegment[1].path) {
        case 'output':
          this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsOutputChangeDocDate);
          this.canChangeTaxDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsOutputChangeTaxDate);
          if (!this.canChangeDocDate) {
            this.documentForm.controls['DocDate'].disable();
          }
          if (!this.canChangeTaxDate) {
            this.documentForm.controls['TaxDate'].disable();
          }


          break;
        case 'entry':
          this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsEntryChangeDocDate);
          this.canChangeTaxDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsEntryChangeTaxDate);
          if (!this.canChangeDocDate) {
            this.documentForm.controls['DocDate'].disable();
          }
          if (!this.canChangeTaxDate) {
            this.documentForm.controls['TaxDate'].disable();
          }
          break;
      }
    }

  }

  OnModalItemRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    const currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    if(this.DBODataEndPoint == 'OIGE') {
      this.itemService.GetAllPagination<ItemSearchTypeAhead[]>(VALUE?.SearchValue, this.documentForm.controls['WhsCode'].value, ItemsFilterType.InvntItem)
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
    }else{

      this.itemService.GetEntryAllPagination<ItemSearchTypeAhead[]>(VALUE?.SearchValue,"", ItemsFilterType.InvntItem)
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
  }

  private Clear(): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: () => {
        this.RefreshData();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  private InflateTableLines(): void {

    this.lines = this.lines.map((x, index) => {
      return {
        ...x,
        Id: index + 1
      }
    });
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.lines,
      RecordsCount: this.lines?.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.lineTableId
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
   * Configures the table component by mapping display columns and setting up action buttons.
   *
   * - Maps the raw column definitions using `MapDisplayColumns`.
   * - Defines available row actions such as "Edit", "Edit Batches", and "Delete".
   */
  private ConfigTable(): void {
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.buttons = [
      {
        Title: `Editar`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Icon: `edit`,
        Color: `primary`,
        Options: [
          {
            Title: `Lotes`,
            Action: Structures.Enums.CL_ACTIONS.OPTION_3,
            Icon: `edit`,
            Color: `primary`,
            Data: 'Lote'
          }
        ]
      },
      {
        Title: `Eliminar`,
        Action: Structures.Enums.CL_ACTIONS.DELETE,
        Icon: `delete`,
        Color: `primary`,
        Data: ''
      }
    ]
  }

  /**
   * Configures dropdown selections within table rows, specifically for warehouse codes.
   *
   * - Iterates over the `warehouses` array and maps each entry into a `DropdownElement`.
   * - Populates the `dropdownList` object with a `WarehouseCode` list.
   */
  private ConfigSelectInRows(): void {

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
      WarehouseCode: dropWarehouse as DropdownElement[]
    };
  }

  /**
   * Method to edit a table
   * @param _event - Event emitted in the table button when selecting a line
   * @constructor
   */
  private OnTableActionActivated = (_event: ICLEvent): void => {

    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as ILinesGoodReceip;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.DELETE:
          this.DeleteRow(ACTION);
          break;

        case Structures.Enums.CL_ACTIONS.OPTION_3:
          this.GetBatches(ACTION, ACTION.Id - 1).subscribe();
          break;
      }
    }
  }

  /**
   * Deletes a row from the lines array and updates related dropdown values.
   *
   * @param _item - The item to be deleted, containing its ID and differentiation key.
   */
  private DeleteRow(_item: ILinesGoodReceip): void {
    if (this.lines && this.lines?.length > 0) {
      this.lines.splice(_item.Id - 1, 1);

      // Update the dropdown list by filtering out values associated with the deleted item
      Object.keys(this.dropdownDiffList)?.forEach((key) => {
        this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== _item.IdDiffBy);
      });

      this.InflateTableLines();
      this.GetTotals();
    }

  }

  /**
   * Method to update a table record
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumn = (_event: ICLEvent): void => {

    try {

      let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<ILinesGoodReceip>;

      if (+(ALL_RECORDS.Row.Quantity) <= 0 || +(ALL_RECORDS.Row.UnitPrice) < 0 || +(ALL_RECORDS.Row.DiscountPercent) < 0) {
        this.InflateTableLines();
        return;
      }

      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);

      // Establezco moneda de documento a linea si esta no tiene una
      let currency = this.priceLists.find(x => x.ListNum === +this.documentForm.controls['PriceList'].value)?.PrimCurr ?? '';
      if (!ALL_RECORDS.Row.Currency) {
        ALL_RECORDS.Row.Currency = currency;
      }
      switch (ALL_RECORDS.EventName) {
        case 'Dropdown':
          if (this.lines[INDEX].UoMEntry != ALL_RECORDS.Row.UoMEntry) {

            let uom = ALL_RECORDS.Row.UoMMasterData.find(x => x.UoMEntry === ALL_RECORDS.Row.UoMEntry);

            if (uom) {
              ALL_RECORDS.Row.UnitPriceFC = uom.UnitPriceFC;
              ALL_RECORDS.Row.UnitPriceCOL = uom.UnitPrice;
              ALL_RECORDS.Row.UnitPrice = this.localCurrency.Id === this.docCurrency ? uom.UnitPrice : uom.UnitPriceFC;
            }
          }

          if (this.lines[INDEX].WarehouseCode != ALL_RECORDS.Row.WarehouseCode) {

            this.dropdownDiffList['BinAbsEntry'] = this.dropdownDiffList['BinAbsEntry']
              .filter(x => (x.by !== ALL_RECORDS.Row.IdDiffBy));

            ALL_RECORDS.Row.DocumentLinesBinAllocations = [];
            ALL_RECORDS.Row.ManBinLocation = this.warehouses.find(x => x.WhsCode === ALL_RECORDS.Row.WarehouseCode)?.BinActivat ?? '';
            ALL_RECORDS.Row.BinAbsEntry = -1;
            if (ALL_RECORDS.Row.ManBinLocation === 'Y') {
              this.LoadLocationsByItem(ALL_RECORDS.Row);
            }
          }

          if (this.lines[INDEX].BinAbsEntry != ALL_RECORDS.Row.BinAbsEntry) {

            let LocationSelected = this.dropdownDiffList['BinAbsEntry']
              .find(x => (x.key === ALL_RECORDS.Row.BinAbsEntry));

            let Location: IDocumentLinesBinAllocations[] = [];

            Location = [{
              SerialAndBatchNumbersBaseLine: 0,
              BinAbsEntry: LocationSelected?.key,
              Quantity: ALL_RECORDS.Row.Quantity,
            } as IDocumentLinesBinAllocations];

            ALL_RECORDS.Row.BinAbsEntry = +(LocationSelected?.key || -1);

            ALL_RECORDS.Row.DocumentLinesBinAllocations = Location;

          }

          //#region  CAMBIAR DE MONEDA EN LAS LINEAS
          if (this.changeCurrencyLines) {
            if (ALL_RECORDS.Row.IdCurrency != this.lines[INDEX].IdCurrency) {
              if (!ALL_RECORDS.Row.CurrNotDefined) {
                let data = ALL_RECORDS.Row.LinesCurrenciesList.find(x => x.Id === ALL_RECORDS.Row.IdCurrency);
                ALL_RECORDS.Row.Currency = data?.DocCurrency;
                ALL_RECORDS.Row.UnitPrice = data?.Price ?? 0;
              }
              ALL_RECORDS.Row.UnitPriceFC = ALL_RECORDS.Row.Currency !== this.localCurrency.Id ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
              ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === (ALL_RECORDS?.Row?.Currency ?? '') ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
            }
          }
          //#endregion

          break;
        case 'InputField':
          ALL_RECORDS.Row.UnitPriceFC = ALL_RECORDS.Row.Currency !== this.localCurrency.Id ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice / this.currentSession.Rate).toFixed(this.DecimalUnitPrice));
          ALL_RECORDS.Row.UnitPriceCOL = this.localCurrency.Id === (ALL_RECORDS?.Row?.Currency ?? '') ? ALL_RECORDS.Row.UnitPrice : +((ALL_RECORDS.Row.UnitPrice * this.currentSession.Rate).toFixed(this.DecimalUnitPrice));

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

  LoadLocationsByItem(_item: ILinesGoodReceip): void {
      this.overlayService.OnGet();
      this.binLocationsService.GetLocationForTransfer(_item.WarehouseCode)
        .pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: 'Componentes requeridos obtenidos'
            });

            if (callback && callback.Data) {

              let dropToLocation: DropdownElement[] = [];

              const dropLocation: DropdownElement[] = callback.Data.map(element => ({
                key: element.AbsEntry,
                value: element.BinCode,
                by: _item.IdDiffBy,
              }));

              dropToLocation.push(...dropLocation);
              this.dropdownDiffList['BinAbsEntry'].push(...dropToLocation);

            }
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        })
  }



  private RefreshRate(): void {
    this.sharedService.refreshRate$.pipe(
      filter((value: number) => {
        return !!(value);
      }),
      takeUntil(this.changeWarehouse$)
    ).subscribe({
      next: (callback) => {
        this.currentSession.Rate = callback;
      },
      error: (error) => {
        this.alertsService.ShowAlert({HttpErrorResponse: error});
      }
    });
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

    const taxamount = +((lineTotal * ((this.lines[_index]?.TaxRate ?? 0) / 100)).toString());
    const taxamountFC = +((lineTotalFC * ((this.lines[_index]?.TaxRate ?? 0) / 100)).toString());

    lineTotal = +((lineTotal + taxamount).toString());
    lineTotal = +((lineTotal - lineTotal * (disc / 100)).toString());
    lineTotal = +(lineTotal.toFixed(this.DecimalTotalLine));


    lineTotalFC = +((lineTotalFC + taxamountFC).toString());
    lineTotalFC = +((lineTotalFC
      - lineTotalFC * (disc / 100)).toString());
    lineTotalFC = +(lineTotalFC
      .toFixed(this.DecimalTotalLine));

    this.lines[_index].TotalCOL = lineTotal;
    this.lines[_index].TotalFC = lineTotalFC;
    let currency = this.priceLists.find(x => x.ListNum === +this.documentForm.controls['PriceList'].value)?.PrimCurr ?? '';
    this.lines[_index].Total = this.localCurrency.Id === currency ? lineTotal : lineTotalFC;
    this.lines[_index].Quantity = qty;
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

      const CURRENT_TAX_RATE = x.TaxRate / 100;
      const CURRENT_TAX_RATEFC = x.TaxRate / 100;

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

  /**
   * Handles the form submission event.
   *
   * - If the component is in a visible state (`isVisible`), it loads the configured user-defined fields (UDFs).
   * - Otherwise, it proceeds to save the document by calling `SaveChanges`.
   */
  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else
      this.SaveChanges();
  }

  /**
   * Saves the current document by performing the following:
   * - Validates required fields and user-defined fields (UDFs).
   * - Formats date fields and prepares the document structure.
   * - Applies UDFs to lines and transforms boolean flags.
   * - Sends the document via a service and optionally triggers automatic printing.
   * - Opens a success dialog if the process completes correctly.
   * - Displays an error modal if the operation fails.
   */
  private SaveChanges(): void {
    if (!this.ValidateFields()) return;
    if (!this.ValidateUdfsLines()) return;

    let document: IDocument = this.documentForm.getRawValue();

    document.DocDate = FormatDate(document.DocDate);
    document.TaxDate = FormatDate(document.TaxDate);

    document.Udfs = this.udfsValue;
    document.DocumentLines = this.lines.map(x => {
      return {...x, TaxOnly: x.TaxOnly ? 'tYES' : 'tNO', Udfs: GetUdfsLines(x, this.udfsLines)} as ILinesGoodReceip
    });

    this.SetUdfsDevelopment();

    this.overlayService.OnPost();
    this.purchaseDocumentService.Post(this.controllerToSendRequest, document, this.documentAttachment, this.attachmentFiles).pipe(
      switchMap(res => {
        if (res && res.Data) {
          if(this.hasCompanyAutomaticPrinting){
            return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
              map(print => {
                return { Data: res.Data, Print: print };
              }));
          } else {
            return of({ Data: res.Data, Print: print })
          }
        } else {
          return of(null);
        }
      }),
      map(res => {
        return {
          DocEntry: res?.Data.DocEntry,
          DocNum: res?.Data.DocNum,
          NumFE: '',
          CashChange: 0,
          CashChangeFC: 0,
          Title: this.currentTitle,
          TypeReport: this.currentReport
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res)),
      finalize(()=>this.overlayService.Drop())
    ).subscribe({
      next: () => {
        this.RefreshData();
      },
      error: (err) => {
        this.modalService.Continue({
          title: `Se produjo un error creando la ${this.currentTitle}`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  private RefreshData(): void {

    this.overlayService.OnGet();

     forkJoin({
      ExchangeRate: this.exchangeRateService.Get<IExchangeRate>(),
      Warehouses: this.warehouseService.Get<IWarehouse[]>(),
      PriceList: this.priceListService.Get<IPriceList[]>(undefined,ItemsFilterType.InvntItem),
      Items: this.itemsService.GetAll<ItemSearchTypeAhead[]>(this.currentSession?.WhsCode),
      Taxes: this.taxesService.Get<ITaxe[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>(),
      Settings: this.settingService.Get<ISettings[]>(),
      UdfsLines: this.udfsService.Get<IUdfContext[]>(this.DBODataEndPoint, true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment(this.DBODataEndPoint)
        .pipe(catchError(res => of(null))),
    }).pipe(finalize(() => this.overlayService.Drop())).subscribe({
        next: (res => {
          this.priceLists = res.PriceList.Data ?? [];
          this.items = res.Items.Data;
          this.warehouses = res.Warehouses.Data;
          this.permissions = res.Permissions.Data;
          this.setting = res.Settings.Data;
          this.udfsLines = res.UdfsLines?.Data ?? [];
          this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
          this.currentSession.Rate = res.ExchangeRate.Data.Rate;

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

  private ValidateFields(): boolean {

    let data = ValidateLines(this.lines, false, false);

    if (!data.Value) {
      this.alertsService.Toast({type: CLToastType.INFO, message: data.Message});
      return false;
    }

    let indexBin = this.lines.findIndex(x => (!x.DocumentLinesBinAllocations || x.DocumentLinesBinAllocations?.length === 0) && x.ManBinLocation === 'Y' && x.ManSerNum === 'N' && x.ManBtchNum === 'N');

    if (indexBin >= 0) {
      this.alertsService.Toast({type: CLToastType.INFO, message: `El ítem en la línea ${(indexBin + 1)} es manejado por ubicación, seleccione la ubicación en la columna opciones.`});
      return false;
    }

    return true;
  }

  public GetItems(): void {
    this.overlayService.OnGet();
    if(this.DBODataEndPoint == 'OIGE') {
      this.itemService.GetAll<ItemSearchTypeAhead[]>(this.documentForm.controls['WhsCode'].value).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback => {
          this.items = callback.Data;
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      })

    }else{

      this.itemService.GetAllInventory<ItemSearchTypeAhead[]>("").pipe(
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
  }

  getAllItemsFromAllWarehouses(): void {
    this.overlayService.OnGet();

    this.warehousesService.Get<IWarehouse[]>().pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (warehousesResponse) => {
        const warehouses = warehousesResponse.Data;
        const itemRequests: Observable<any>[] = warehouses.map(warehouse =>
          this.itemsService.GetAll<ItemSearchTypeAhead[]>(warehouse.WhsCode, ItemsFilterType.InvntItem)
        );

        forkJoin(itemRequests).subscribe({
          next: (itemsResponses) => {
            this.allItems = itemsResponses.flatMap(response => response.Data);
          },
          error: (err) => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        });
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
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
    this.lines = [];
    this.dropdownDiffList = {};
    this.GetTotals();
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.InflateTableLines();
    this.udfsValue = [];
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

      let Location: IDocumentLinesBinAllocations[] = [];

      if (_item.AbsEntry || 0 > 0) {
        Location = [{
          SerialAndBatchNumbersBaseLine: 0,
          BinAbsEntry: _item.AbsEntry,
          Quantity: cant,
          Stock: _item.OnHand
        } as IDocumentLinesBinAllocations]
      }

      let typeSerial: number = ItemSerialBatch.NA;

      if (_item.ManSerNum === 'Y') {
        typeSerial = ItemSerialBatch.Serie
      }
      if (_item.ManBtchNum === 'Y') {
        typeSerial = ItemSerialBatch.Lote
      }

      let currency = this.priceLists.find(x => x.ListNum === +this.documentForm.controls['PriceList'].value)?.PrimCurr ?? '';

      this.overlayService.OnGet();

      forkJoin({
        Item: this.itemService.Get<ILinesGoodReceip>(
          _item.ItemCode,
          this.documentForm.controls['WhsCode'].value,
          this.documentForm.controls['PriceList'].value,
          '',
          typeSerial,
          _item.SysNumber,
          'N',
          ItemsFilterType.InvntItem
        ),
        Location: this.warehouses.some(x => x.WhsCode === this.documentForm.controls['WhsCode'].value && x.BinActivat === 'Y')
          ? this.binLocationsService.GetLocationForTransfer(this.documentForm.controls['WhsCode'].value) : of(null)
      })
        .pipe(
          finalize(() => {
            this.sharedService.EmitEnableItem();
            this.overlayService.Drop();
          }))
        .subscribe({
          next: (callback) => {
            this.alertsService.Toast({
              type: CLToastType.SUCCESS,
              message: 'Componentes requeridos obtenidos'
            });

            if (callback && callback.Item){

              let totalLine = 0;
              let totalLineFC = 0;
              let totalLineDesc = 0;
              let totalLineDescFC = 0;
              let unitPrice = 0;
              let unitPriceFC = 0;
              let discount = callback.Item.Data.DiscountPercent ? callback.Item.Data.DiscountPercent : 0;

              totalLine = +((callback.Item.Data.UoMMasterData[0].UnitPrice * cant).toFixed(this.DecimalUnitPrice));
              totalLineFC = +((callback.Item.Data.UoMMasterData[0].UnitPriceFC * cant).toFixed(this.DecimalUnitPrice));

              totalLineDesc = +((totalLine - (totalLine * (discount / 100))).toFixed(this.DecimalUnitPrice));
              totalLineDescFC = +((totalLineFC - (totalLineFC * (discount / 100))).toFixed(this.DecimalUnitPrice));

              unitPrice = callback.Item.Data.UoMMasterData[0].UnitPrice;
              unitPriceFC = callback.Item.Data.UoMMasterData[0].UnitPriceFC;

              let maxIdUomEntry = this.lines && this.lines?.length > 0 ? Math.max(...this.lines.map(x => (x.IdDiffBy || 0))) + 1 : 1;

              let item = {
                ItemCode: callback.Item.Data.ItemCode,
                InventoryItem: callback.Item.Data.InventoryItem,
                PurchaseItem: callback.Item.Data.PurchaseItem,
                SalesItem: callback.Item.Data.SalesItem,
                DocEntry: callback.Item.Data.DocEntry,
                WarehouseCode: this.documentForm.controls['WhsCode'].value,
                Quantity: cant,
                TaxCode: callback.Item.Data.TaxCode,
                TaxRate: callback.Item.Data.TaxRate,
                UnitPriceDOL: this.localCurrency.Id === currency ? unitPrice : unitPriceFC,
                UnitPriceFC: unitPriceFC,
                UnitPriceCOL: unitPrice,
                UnitPrice: this.localCurrency.Id === currency ? unitPrice : unitPriceFC,
                DiscountPercent: discount,
                CostingCode: this.userAssign?.CenterCost,
                TotalFC: totalLineFC,
                TotalCOL: totalLine,
                Total: this.localCurrency.Id === currency ? totalLine : totalLineFC,
                TotalDesc: this.localCurrency.Id === currency ? totalLineDesc : totalLineDescFC,
                TotalDescFC: totalLineDescFC,
                TotalDescCOL: totalLineDesc,
                ItemDescription: callback.Item.Data.ItemName,
                OnHand: callback.Item.Data.OnHand,
                UoMEntry: callback.Item.Data.UoMMasterData[0].UoMEntry,
                UoMMasterData: callback.Item.Data.UoMMasterData,
                SerialNumbers: _item.ManSerNum === 'Y' ? this.LoadSerial(_item.SysNumber, _item.DistNumberSerie, cant) : [],
                ManBtchNum: _item.ManBtchNum,
                ManSerNum: _item.ManSerNum,
                BatchNumbers: callback.Item.Data.BatchNumbers ? callback.Item.Data.BatchNumbers : [],
                SysNumber: _item.SysNumber,
                DistNumber: _item.DistNumberSerie,
                IdDiffBy: maxIdUomEntry,
                DocumentLinesBinAllocations: ((_item.ManBtchNum === 'N' && _item.ManSerNum === 'N') ? Location : []),
                BinAbsEntry: _item.AbsEntry,
                ManBinLocation : this.warehouses.find(y => y.WhsCode === this.documentForm.controls['WhsCode'].value)?.BinActivat ?? '',
                IdCurrency: callback.Item.Data.LinesCurrenciesList.find(x => x.DocCurrency == currency)?.Id ?? '0',
                LinesCurrenciesList: this.GetLinesCurrencies(callback.Item.Data),
                CurrNotDefined: this.CurrLinesDifined(callback.Item.Data),
                Currency: currency
              } as ILinesGoodReceip;


              if (this.changeCurrencyLines) {
                let dataCurrency = callback.Item.Data.LinesCurrenciesList.find(x => x.Id == item.IdCurrency);
                if (dataCurrency) {
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
                }
              }


              if (this.udfsLines?.length) {
                SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList);
                MappingDefaultValueUdfsLines(item, this.udfsLines);

              }

              this.lines.push(item);

              if (item.TaxCode === '') {
                this.alertsService.Toast({
                  type: CLToastType.ERROR,
                  message: `Ítem ${item.ItemDescription} no cuenta con el código del impuesto`
                });
              }

              this.ConfigDropdownDiffListTable(item,callback.Location?.Data ? callback.Location.Data : []);

              this.InflateTableLines();
              this.GetTotals();

            }
          },
          error: err => {
            this.alertsService.ShowAlert({HttpErrorResponse: err});
          }
        })

    } catch (e) {
      this.sharedService.EmitEnableItem();
    }
  }

  private ConfigDropdownDiffListTable(_item: ILinesGoodReceip, _location: IBinLocation[]): void {

    let dropdownUoMEntryListByItem: DropdownElement[] = [];

    if (_item.UoMMasterData && _item.UoMMasterData?.length > 0) {

      const dropUoMEntry: DropdownElement[] = _item.UoMMasterData.map(x => ({
        key: x.UoMEntry,
        value: x.UomName,
        by: _item.IdDiffBy
      }));

      dropdownUoMEntryListByItem.push(...dropUoMEntry)
    }

    let dropdownLocationListByItem: DropdownElement[] = [];

    if (_location && _location?.length > 0) {

      const dropLocation: DropdownElement[] = _location.map(element => ({
        key: element.AbsEntry,
        value: element.BinCode,
        by: _item.IdDiffBy,
      }));

      dropdownLocationListByItem.push(...dropLocation);

    }

    let dropdownLinesCurrenciesList: DropdownElement[] = [];
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
        dropdownLinesCurrenciesList.push(...curr);
      }
    }

    this.dropdownDiffList['UoMEntry'] ? this.dropdownDiffList['UoMEntry'].push(...dropdownUoMEntryListByItem) :
      this.dropdownDiffList['UoMEntry'] = dropdownUoMEntryListByItem;

    this.dropdownDiffList['BinAbsEntry'] ? this.dropdownDiffList['BinAbsEntry'].push(...dropdownLocationListByItem) :
      this.dropdownDiffList['BinAbsEntry'] = dropdownLocationListByItem;

    this.dropdownDiffList['IdCurrency'] ? this.dropdownDiffList['IdCurrency'].push(...dropdownLinesCurrenciesList) :
      this.dropdownDiffList['IdCurrency'] = dropdownLinesCurrenciesList;

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

  public GetSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id === this.docCurrency)?.Symbol || '';
  }

  public GetConversionSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id !== this.docCurrency)?.Symbol || '';
  }

  public SelectPriceList(_listNum: number): void {
    this.docCurrency = this.priceLists.find(_x => _x.ListNum === _listNum)?.PrimCurr || '';
    this.lines = this.lines.map(element => {
      return {
        ...element,
        UnitPriceDOL: this.localCurrency.Id === this.docCurrency ? element.UnitPriceFC : element.UnitPriceCOL,
        UnitPrice: this.localCurrency.Id === this.docCurrency ? element.UnitPriceCOL : element.UnitPriceFC,
        Total: this.localCurrency.Id === this.docCurrency ? element.TotalCOL : element.TotalFC,
        TotalImp: this.localCurrency.Id === this.docCurrency ? element.TotalImpCOL : element.TotalImpFC,
        TotalDesc: this.localCurrency.Id === this.docCurrency ? element.TotalDescCOL : element.TotalDescFC
      }
    });
    this.InflateTableLines();
    this.GetTotals();
  }

  //#region Udfs

  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs?.length > 0;
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

    MappingUdfsDevelopment<IInventoryEntryOutput>(this.documentForm.value, this.udfsValue, this.udfsDevelopment);

    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);

    MappingUdfsDevelopment<IUserDev>({User: this.User} as IUserDev, this.udfsValue, this.udfsDevelopment);

  }

  //#endregion
  private SetInitialData(): void {


    this.canChangePriceList = this.permissions.some(x => x.Name === 'Inventory_Documents_ChangePriceList');

    //#region PERMISOS DE LA TABLA
    this.editableFieldConf =
      {
        Permissions: this.permissions,
        Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(x => x.Name === _columnPerm.Name),
        Columns: this.editableField,

      };

    this.lineMappedDisplayColumns.editableFieldConf = this.editableFieldConf;
    //#endregion

    //#region VALORES POR DEFECTO DEL FORMULARIO
    this.documentForm.reset();
    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['Quantity'].setValue(1);
    this.documentForm.controls['PriceList'].setValue(this.priceLists[0]?.ListNum);
    this.documentForm.controls['WhsCode'].setValue(this.currentSession.WhsCode);
    this.docCurrency = this.priceLists[0]?.PrimCurr;
    //#endregion

    //#region CONFIGURACIONES DE LOS SETTINGS
    if (this.setting.some(x => x.Code === SettingCode.Decimal)) {

      let data = this.setting.find(x => x.Code === SettingCode.Decimal);
      let companyDecimal: IDecimalSetting[] = JSON.parse(data?.Json || '');

      if (companyDecimal && companyDecimal?.length > 0) {

        let decimalCompany = companyDecimal.find(x => x.CompanyId === this.selectedCompany?.Id) as IDecimalSetting;

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
    let payment = this.setting.find((element) => element.Code == SettingCode.Payment);
    if (payment && payment.Json) {
      let data = JSON.parse(payment.Json) as IPaymentSetting[];
      if (data) {
        this.disableDragAndDrop = !!data.find(x => x.CompanyId === this.selectedCompany?.Id)?.OrderLine;
      }
    }
    //#endregion

    //#region AGREGAR UDFS A NIVEL DE LINEA
    if (this.udfsLines && this.udfsLines?.length > 0) {
      MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns, this.dropdownColumns);
      this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
    }
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    //#endregion

    //#region CAMPOS FACTURA
    if (this.setting.some(s => s.Code === SettingCode.FieldsInvoice)) {
      let Settings = JSON.parse(this.setting.find(s => s.Code === SettingCode.FieldsInvoice)?.Json || '[]') as IFieldsInvoiceSetting[];

      let fieldsInvoiceSetting = Settings.find(s =>
        s.CompanyId === this.selectedCompany?.Id) as IFieldsInvoiceSetting;

      if (fieldsInvoiceSetting)
      {

        this.changeCurrencyLines = fieldsInvoiceSetting.ChangeCurrencyLine;
      }

    }
    //#endregion

    //#region VALIDAR SI MANEJA MONEDA A NIVEL DE LINEA

    if (!this.changeCurrencyLines)
    {
      this.lineMappedDisplayColumns.ignoreColumns?.push('IdCurrency');
    }
    //#endregion

    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
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
          this.itemService.GetByScan<ItemSearchScan[]>(response, this.currentSession.WhsCode, ItemsFilterType.InvntItem)
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
      case 'output':
        if (this.ValidateAttachmentsTables) {
          let setting = this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.InventoryOuput)
          if (setting) {
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.InventoryOuput);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

      case 'entry':
        if (this.ValidateAttachmentsTables) {
          let setting = this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.InventoryEntry)
          if (setting) {
            if ('Active' in setting) {
              this.IsVisibleAttachTable = setting.Active != true ? false : true;
            } else {
              this.IsVisibleAttachTable = false;
            }
          }
        }
        if(this.companyReportValidateAutomaticPrinting){
          let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.InventoryEntry);
          this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
        }
        break;

    }
  }

  /**
   * Retrieves a list of items from the specified warehouse and assigns them to the component's item list.
   *
   * - Calls the item service using the provided warehouse code.
   * - Displays a loading overlay while the request is in progress.
   * - On success, assigns the retrieved items to the `items` array.
   * - On error, shows an alert with the error response.
   *
   * @param WhsCode Optional warehouse code to filter the items. Defaults to an empty string.
   */
  public GetItemsOut(WhsCode:string=""): void {
    this.overlayService.OnGet();
    this.itemService.GetAll<ItemSearchTypeAhead[]>(WhsCode).pipe(
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

  /**
   * METODO PARA OBTENER LOS ITEMS DEL NUEVO ALMACEN EN ENTRADA INVENTARIO
   * @private
   */
  public GetItemsEntry(WhsCode:string=""): void {
    this.overlayService.OnGet();
    this.itemService.GetAllInventory<ItemSearchTypeAhead[]>("").pipe(
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


  /**
   * ESTE METODO MAPEA LAS MONEDAS A NIVEL DE LINEA
   * @param _data
   * @constructor
   * @private
   */
  private GetLinesCurrencies(_data: IDocumentLine): ILinesCurrencies[] {
    if (this.changeCurrencyLines) {
      let currency = this.priceLists.find(x => x.ListNum === +this.documentForm.controls['PriceList'].value)?.PrimCurr ?? '';
      if (_data.LinesCurrenciesList && _data.LinesCurrenciesList.length > 0) {
        return _data.LinesCurrenciesList;
      } else {
        let curr = this.currencies.find(x => x.Id === currency);
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


  /**
   * ESTE METODO VALIDA SI UNA LINEA NO TIENE  LISTA DE PRECIOS
   * @param _data
   * @constructor
   * @private
   */
  private CurrLinesDifined(_data: IDocumentLine): boolean {
    if (this.changeCurrencyLines) {
      let currency = this.priceLists.find(x => x.ListNum === +this.documentForm.controls['PriceList'].value)?.PrimCurr ?? '';

      if (_data.LinesCurrenciesList && _data.LinesCurrenciesList.length > 0) {
        return false;
      } else {
        let curr = this.currencies.find(x => x.Id === currency);
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
  private PrintInvoiceDocument(_docEntry: number): Observable<Structures.Interfaces.ICLResponse<IDownloadBase64> | null> {
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
  };

  /**
 * Retrieves available batches for a given document line item and opens a batch selection dialog if permitted.
 *
 * - Checks if the user has permission to edit item batches.
 * - Validates that the item is batch-managed.
 * - Retrieves batches from the service and opens the edit dialog if data is returned.
 * - Displays appropriate toast notifications if no permission or no batches apply.
 *
 * @param _item The document line item to retrieve batches for.
 * @param _idx The index of the line item in the document lines array.
 * @param _fieldBin Whether to include bin-related logic (default is true).
 * @returns An observable with the response containing the list of batches, or `EMPTY` if not applicable.
 */
  public GetBatches(_item: IDocumentLine, _idx: number, _fieldBin = true): Observable<Structures.Interfaces.ICLResponse<IBatches[]>> {
      let canEditItemBatch = this.permissions.some(x => x.Name === 'Inventory_Documents_Entry_EditItemBatch');
      const tree: UrlTree = this.router.parseUrl(this.sharedService.GetCurrentRouteSegment());
      const urlSegmentGroup: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
      const urlSegment: UrlSegment[] = urlSegmentGroup?.segments;

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
                ValidateStockBatch: false,
                View: (urlSegment[1].path == 'entry') ? ViewBatches.INVENTORY_ENTRY : ViewBatches.INVENTORY_OUTPUT
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
  

    /**
     * Opens a modal dialog to edit batch and bin allocations for a specific document line.
     *
     * - Pre-fills the dialog with the quantity, selected batches, and bin locations of the targeted line.
     * - Checks and assigns batch edit permissions.
     * - After the dialog closes, updates the corresponding line with the selected batches and locations if changes were made.
     * - Refreshes the table to reflect the updated data.
     *
     * @param _batch The batch selection data including available and selected batches and locations.
     * @param _idx The index of the line item to be edited in the document lines array.
     */
    public OpenEditBatchesDialog(_batch: IBatchSelected, _idx: number): void {
  
      if (this.lines[_idx]) {
        _batch.Quantity = this.lines[_idx].Quantity;
        _batch.LotesSelected = this.lines[_idx].BatchNumbers;
        _batch.LocationsSelected = this.lines[_idx].DocumentLinesBinAllocations;
      }
  
      _batch.Permission = this.permissions.some(x => x.Name === 'Inventory_Documents_Entry_EditItemBatch');
  
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
}
