import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown} from "@clavisco/linker";
import {PrinterWorker, SharedService} from "@app/shared/shared.service";
import {catchError, filter, finalize, forkJoin, map, merge, Observable, of, startWith, Subject, Subscription, switchMap} from "rxjs";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {IActionButton} from "@app/interfaces/i-action-button";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {ItemsTransfer} from "@app/interfaces/i-items";
import {ITransferInventoryResolveData} from "@app/interfaces/i-resolvers";
import {ActivatedRoute, Router} from "@angular/router";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {ItemsService} from "@app/services/items.service";
import {BatchesService} from "@app/services/batches.service";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {BinLocationsService} from "@app/services/bin-locations.service";
import {IBatches, IBatchSelected, IBinLocation} from "@app/interfaces/i-serial-batch";
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns, RowColors} from "@clavisco/table";
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {IStockTransfer, IStockTransferLinesBinAllocations, IStockTransferRows, IStockTransferRowsSelected} from "@app/interfaces/i-stockTransfer";
import {DropdownElement, IInputColumn, IRowByEvent} from "@clavisco/table/lib/table.space";
import {LotComponent} from "@Component/sales/document/lot/lot.component";
import {MatDialog} from "@angular/material/dialog";
import {DocumentTypes, LineStatus, PermissionEditDocumentsDates, PreloadedDocumentActions, SettingCode, ViewBatches} from "@app/enums/enums";
import {StockTransferService} from "@app/services/stock-transfer.service";
import {IUdf, IUdfContext, IUdfDevelopment, UdfSourceLine} from "@app/interfaces/i-udf";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {StorageKey} from "@app/enums/e-storage-keys";
import {FormatDate, GetIndexOnPagedTable, GetUdfsLines, MappingDefaultValueUdfsLines, MappingUdfsDevelopment, MappingUdfsLines, SetDataUdfsLines, SetUdfsLineValues, ZoneDate} from "@app/shared/common-functions";
import {IUniqueId, ULineMappedColumns} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {CommonService} from "@app/services/common.service";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {WarehousesService} from "@app/services/warehouses.service";
import {SalesPersonService} from "@app/services/sales-person.service";
import {UdfsService} from "@app/services/udfs.service";
import {IUserAssign} from "@app/interfaces/i-user";
import {IStockTransferRequest, IStockTransferRequestRows, IWarehouseBinLocation} from "@app/interfaces/i-stockTransferRequest";
import {IPaymentSetting, IPrintFormatSetting, ISettings, IValidateAttachmentsSetting, IValidateInventory, IValidateInventorySetting} from "@app/interfaces/i-settings";
import {ICompany} from "@app/interfaces/i-company";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {IAttachments2Line} from "@app/interfaces/i-business-partner";
import {formatDate} from "@angular/common";
import {AttachmentsService} from "@app/services/Attachments.service";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {ReportsService} from "@app/services/reports.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";

@Component({
  selector: 'app-transfer',
  templateUrl: './inventory-transfer.component.html',
  styleUrls: ['./inventory-transfer.component.scss']
})
export class InventoryTransferComponent implements OnInit, OnDestroy, AfterViewInit {

  /* Formularios */
  documentForm!: FormGroup;
  onItemControlFocused$: Subject<string> = new Subject<string>();

  /* Tabla */
  searchItemModalId = "searchItemModalId";
  searchModalWarehousesId = "searchModalWarehousesId";
  searchModalFromBinLocationsId = "searchModalFromBinLocationsId";
  searchModalToBinLocationsId = "searchModalToBinLocationsId";
  shouldPaginateRequest: boolean = false;
  uniqueId!: string;
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;
  dropdownColumns: string[] = ['BinAbsOrigin', 'BinAbsDestino'];
  dropdownDiffList: DropdownList = {};
  dropdownDiffBy: string = 'IdBinLocation';
  lineTableId: string = "LINE-TABLE-TRANSFER";
  lineMappedColumns!: MappedColumns;
  InputColumns: IInputColumn[] = [
    {
      ColumnName: 'Quantity', 
      FieldType: 'number'
    }
  ];
  headerTableColumns: { [key: string]: string } = {
    Id: '#',
    ItemCode: 'Artículo',
    ItemDescription: 'Descripción',
    Quantity: 'Cantidad',
    FromNameWhsCode: 'Almacén Origen',
    BinAbsOrigin: 'Ubicación Origen',
    ToNameWarehouse: 'Almacén Destino',
    BinAbsDestino: 'Ubicación Destino',
    DistNumber: 'Serie',
    SysNumber: '',
    WarehouseCode: '',
    FromWarehouseCode: '',
    SerialNumbers: '',
    BatchNumbers: '',
    StockTransferLinesBinAllocations: '',
    Stock: '',
    ManSerNum: '',
    ManBtchNum: '',
    LineNum: '',
    BinActivat: ''
  };
  /* mapped Table */
  lineMappedDisplayColumns: ULineMappedColumns<IStockTransferRowsSelected, IPermissionbyUser> = {
    dataSource: [] as IStockTransferRowsSelected[],
    inputColumns: this.InputColumns,
    renameColumns: this.headerTableColumns,
    stickyColumns: [
      {Name: 'Options', FixOn: 'right'}
    ],
    ignoreColumns: ['SysNumber', 'WarehouseCode', 'FromWarehouseCode', 'SerialNumbers', 'BatchNumbers',
      'StockTransferLinesBinAllocations', 'Stock', 'ManSerNum', 'ManBtchNum', 'LineNum', 'BinActivat',
      'LocationsFrom', 'LocationsTo', 'OnHandByBin', 'BaseType', 'BaseEntry', 'BaseLine', 'Udfs', 'IdBinLocation','LineStatus','RowColor']
  };

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  /* Observables */
  allSubscriptions!: Subscription;
  items$!: Observable<ItemsTransfer[]>

  /* Listas */
  actionButtons: IActionButton[] = [];
  warehouses: IWarehouse[] = [];
  toLocations: IBinLocation[] = [];
  fromLocations: IBinLocation[] = [];
  items: ItemsTransfer[] = [];
  itemModal: ItemsTransfer[] = [];
  salesPersons: ISalesPerson[] = [];
  tableButtons: ICLTableButton[] = [];
  lines: IStockTransferRowsSelected[] = [];
  udfsLines: IUdfContext[] = [];
  permissions: IPermissionbyUser[] = [];
  settings: ISettings[] = [];
  companyPrintFormat: IPrintFormatSetting[] = [];

  /* Variables */
  blockInput: boolean = false;
  disableDragAndDrop: boolean = false;
  selectedCompany!: ICompany | null;
  setting!: ISettings;
  accion: string = '';

  /* Udfs */
  udfsLinesValue: UdfSourceLine[] = [];
  udfsDataHeader: IUdf[] = [];
  udfsDevelopment: IUdfDevelopment[] = []
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'OWTR';
  isVisible: boolean = true;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || '';
  userAssing!: IUserAssign | null;
  validatorItem: ValidatorFn = Validators.nullValidator;
  canChangeDocDate: boolean = true;
  canChangeTaxDate: boolean = true;
  isButtonModalDisabled: boolean = true;
  isButtonModalFromBinLocationDisabled: boolean = true;
  isButtonModalToBinLocationDisabled: boolean = true;
  currentReport!: keyof IPrintFormatSetting;
  reportConfigured!:  IPrintFormatSetting;

  documentAttachment: IDocumentAttachment = {
    AbsoluteEntry: 0,
    Attachments2_Lines: []
  } as IDocumentAttachment;

  attachmentFiles: File[] = [];
  attachmentTableId: string = "InventoryTransferAttachmentTableId";
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

  preloadedDocActionType: PreloadedDocumentActions | undefined;
  docEntry: number = 0;
  docNum: number = 0;
  requestingItem: boolean = false;
  private onScanCode$ = new Subject<string>();
  scannedCode: string = '';

  ValidateAttachmentsTables?: IValidateAttachmentsSetting=undefined;
  IsVisibleAttachTable:boolean=false;

  /* Objects */
  FromWarehouse!: IWarehouse | null;
  ToWarehouse!: IWarehouse | null;
  FromBinLocation!: IBinLocation | null;
  ToBinLocation!: IBinLocation | null;
  isDrafts: boolean = false;
  vldInventoryCompany: IValidateInventorySetting[] = [];
  vldInventory!: IValidateInventory;

  constructor(
    @Inject('LinkerService') private linkerService: LinkerService,
    private fb: FormBuilder,
    private itemsService: ItemsService,
    private batchesService: BatchesService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private alertsService: AlertsService,
    private router: Router,
    private overlayService: OverlayService,
    private binLocationService: BinLocationsService,
    private matDialog: MatDialog,
    private stockTransferService: StockTransferService,
    private modalService: ModalService,
    private commonService: CommonService,
    private warehousesService: WarehousesService,
    private salesPersonService: SalesPersonService,
    private udfsService: UdfsService,
    private attachmentService: AttachmentsService,
    private reportsService: ReportsService,
    private printerWorkerService: PrinterWorkerService,
  ) {
    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.allSubscriptions = new Subscription();
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
  }

  /**
   * Lifecycle hook called when the component is destroyed.
   * Used for cleanup tasks such as unsubscribing from observables or detaching handlers.
   *
   * @returns void  - Description of the return value.
   */
  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  /**
   * Lifecycle hook called after the component's view (and its children) has been fully initialized.
   * Typically used to perform DOM-dependent logic.
   *
   * @returns void  - Description of the return value.
   */
  ngAfterViewInit(): void {
    if (this.udfsDataHeader && this.udfsDataHeader.length > 0) {
      this.SetUDFsValues();
    }
  }

  /**
   * Initializes the component after Angular has set all data-bound properties.
   * Ideal for calling setup logic such as fetching data or configuring components.
   *
   * @returns void  - Description of the return value.
   */
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.accion !== '') {
        this.router.navigateByUrl('/').then(() => {
          this.router.navigate(['inventory', 'transfer']);
        })
      }
    });
    this.OnLoad();
  }

  /**
   * Handles the main loading sequence for the component after initialization.
   * Typically used to trigger the first data requests or UI setup.
   *
   * @returns void  - Description of the return value.
   */
  private OnLoad(): void {
    this.InitForm();
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.userAssing = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign);
    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalWarehousesId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalWarehousesRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalFromBinLocationsId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalFromBinLocationRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalToBinLocationsId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalToBinLocationRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalItemRequestRecords, this.callbacks);
    this.actionButtons = [
      {
        Key: 'ADDPRE',
        MatIcon: 'save',
        Text: 'Crear Preliminar',
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

    this.tableButtons = [
      {
        Title: `Editar`,
        Action: Structures.Enums.CL_ACTIONS.OPTION_1,
        Icon: `edit`,
        Color: `primary`,
        Options: [
          {
            Title: `Lotes`,
            Action: Structures.Enums.CL_ACTIONS.OPTION_2,
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

    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    if(this.ValidateAttachmentsTables)
    {

      let setting=this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.TransferRequest)
      if(setting){
        if ('Active' in setting) {
          this.IsVisibleAttachTable = setting.Active != true ? false : true;
        } else {
          this.IsVisibleAttachTable = false;
        }
      }
    }
    this.ReadQueryParameters();
    this.LoadInitialData();
    this.InitAutocomplete();
    this.ValidatePermissionToEditDate();
    this.DefineActionButtonByPreloadedDocAction();
    this.ListenScan();
  }

  /**
   * Builds or refreshes the internal table of document lines for rendering in the UI.
   *
   * @returns void  - Description of the return value.
   */
  private InflateTableLines(): void {
    this.lines = this.lines.map((x, index) => {
      this.GetRowColorMessage(x);
      return {
        ...x,
        Id: index + 1,
        StockTransferLinesBinAllocations: x.StockTransferLinesBinAllocations && x.StockTransferLinesBinAllocations.length > 0
          ? x.StockTransferLinesBinAllocations.map(allocation => ({
            ...allocation,
            BaseLineNumber: index
          }))
          : x.StockTransferLinesBinAllocations
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
   * SetSelectInRows function.
   *
   * @param _data - Description of `_data`.
   * @returns void  - Description of the return value.
   */
  private SetSelectInRows(_data: IStockTransferRowsSelected): void {
    let dropFromLocation: DropdownElement[] = [];
    let dropToLocation: DropdownElement[] = [];

    if (_data.LocationsFrom && _data.LocationsFrom.length > 0) {
      dropFromLocation = _data.LocationsFrom.map(element => {
        return {
          key: element.AbsEntry,
          value: element.BinCode,
          by: _data.IdBinLocation
        } as DropdownElement
      });
    }

    if (_data.LocationsTo && _data.LocationsTo.length > 0) {
      dropToLocation = _data.LocationsTo.map(element => {
        return {
          key: element.AbsEntry,
          value: element.BinCode,
          by: _data.IdBinLocation
        } as DropdownElement
      });
    }

    this.dropdownDiffList['BinAbsOrigin'] ? this.dropdownDiffList['BinAbsOrigin'].push(...dropFromLocation) :
                                            this.dropdownDiffList['BinAbsOrigin'] = dropFromLocation;

    this.dropdownDiffList['BinAbsDestino'] ? this.dropdownDiffList['BinAbsDestino'].push(...dropToLocation) :
                                             this.dropdownDiffList['BinAbsDestino'] = dropToLocation;
  }

  /**
   * Method to edit a table
   * @param _event - Event emitted in the table button when selecting a line
   */
  private OnTableActionActivated = (_event: ICLEvent): void => {

    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as IStockTransferRowsSelected;
      if (ACTION.LineStatus === 'C'||ACTION.LineStatus ===  LineStatus.bost_Close) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'No se puede modificar ítem en estado cerrado.'
        });
        return;
      }
      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.DELETE:
          this.DeleteRow(ACTION);
          break;
        case Structures.Enums.CL_ACTIONS.OPTION_2:
          this.OpenDialogLotes(ACTION);
          break;
      }
    }
  }

  /**
   * DeleteRow function.
   *
   * @param _item - Description of `_item`.
   * @returns void  - Description of the return value.
   */
  private DeleteRow(_item: IStockTransferRowsSelected): void {
    if (this.lines && this.lines.length > 0) {
      this.lines.splice((_item?.Id || 0) - 1, 1);

      Object.keys(this.dropdownDiffList)?.forEach((key) => {
        this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== _item.IdBinLocation);
      });

      this.InflateTableLines();
    }
  }

  /**
   * Method to update a table record
   * @param _event - Event emitted from the table to edit
   */
  private EventColumn = (_event: ICLEvent): void => {
    try {

      const ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IStockTransferRowsSelected>;
      if (+(ALL_RECORDS.Row.Quantity) <= 0) {
        this.InflateTableLines();
        return;
      }
      if (ALL_RECORDS.Row.LineStatus === 'C'||ALL_RECORDS.Row.LineStatus ===  LineStatus.bost_Close) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: 'No se puede modificar ítem en estado cerrado.'
        });
        this.InflateTableLines();
        return;
      }

      let rowSelected = ALL_RECORDS.Row;
      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);

      if (ALL_RECORDS.EventName === 'Dropped') {
        this.InflateTableLines();
        return;
      }

      if (ALL_RECORDS.EventName === 'InputField') {

        if (rowSelected.BinAbsOrigin === -1 && (rowSelected.LocationsFrom && rowSelected.LocationsFrom.length > 0)) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `Primero debe seleccionar la ubicación de origen.`
          });
        }

        if (+(rowSelected.Quantity) > rowSelected.Stock) {
          this.alertsService.Toast({type: CLToastType.INFO, message: `La cantidad ingresada supera el stock disponible. Disponible: ${rowSelected.Stock}`})
        }

        this.lines[INDEX] = ALL_RECORDS.Row;

        this.lines[INDEX].Quantity = rowSelected.Quantity;

        ALL_RECORDS.Row.ManBtchNum !== 'Y' && ALL_RECORDS.Row.StockTransferLinesBinAllocations && ALL_RECORDS.Row.StockTransferLinesBinAllocations.length > 0 ? ALL_RECORDS.Row.StockTransferLinesBinAllocations.forEach(x => x.Quantity = +(ALL_RECORDS.Row.Quantity)) : [];

        this.lines[INDEX].StockTransferLinesBinAllocations = ALL_RECORDS.Row.StockTransferLinesBinAllocations;
      }

      if (ALL_RECORDS.EventName === 'Dropdown') {

        if (this.lines[INDEX].BinAbsOrigin !== rowSelected.BinAbsOrigin) {

          let index = rowSelected.StockTransferLinesBinAllocations.findIndex(x => x.BinActionType === 'batFromWarehouse' && (x.BaseLineNumber === ((rowSelected?.Id || 0) - 1)));

          if (index < 0) {
            rowSelected.StockTransferLinesBinAllocations.push({
              BinActionType: 'batFromWarehouse',
              BinAbsEntry: rowSelected.BinAbsOrigin,
              Quantity: rowSelected.Quantity,
              BaseLineNumber: ((rowSelected?.Id || 0) - 1),
              SerialAndBatchNumbersBaseLine: 0
            } as IStockTransferLinesBinAllocations)
          } else {
            rowSelected.StockTransferLinesBinAllocations[index].BinAbsEntry = rowSelected.BinAbsOrigin ?? -1;
          }
        }

        if (this.lines[INDEX].BinAbsDestino !== rowSelected.BinAbsDestino) {

          let index = rowSelected.StockTransferLinesBinAllocations.findIndex(x => x.BinActionType === 'batToWarehouse' && (x.BaseLineNumber === ((rowSelected?.Id || 0) - 1)));

          if (index < 0) {
            rowSelected.StockTransferLinesBinAllocations.push({
              BinActionType: 'batToWarehouse',
              BinAbsEntry: rowSelected.BinAbsDestino,
              Quantity: rowSelected.Quantity,
              BaseLineNumber: ((rowSelected?.Id || 0) - 1),
              SerialAndBatchNumbersBaseLine: 0
            } as IStockTransferLinesBinAllocations)
          } else {
            rowSelected.StockTransferLinesBinAllocations[index].BinAbsEntry = rowSelected.BinAbsDestino ?? -1;
          }

        }
        this.lines[INDEX] = rowSelected;

        this.lines[INDEX].Stock = rowSelected.OnHandByBin?.find(x => x.AbsEntry === rowSelected.BinAbsOrigin)?.OnHandQty ?? rowSelected.Stock;
      }

      this.InflateTableLines();
    } catch (error) {
      CLPrint({data: error, clType: Structures.Enums.CL_DISPLAY.ERROR});
    }
  }

  /**
   * LoadInitialData function.
   *
   * @returns void  - Description of the return value.
   */
  private LoadInitialData(): void {
    this.activatedRoute.data.subscribe({
      next: (res) => {
        const resolvedData = res['resolvedData'] as ITransferInventoryResolveData;

        if (resolvedData) {
          this.warehouses = resolvedData.Warehouses ?? [];
          this.salesPersons = resolvedData.SalesPerson;
          this.udfsLines = resolvedData.UdfsLines;
          this.udfsDevelopment = resolvedData.UdfsDevelopment;
          this.udfsDataHeader = resolvedData.UdfsDataHeader || [];
          this.udfsLinesValue = resolvedData.UdfsData || [];
          this.setting = resolvedData.Setting;
          this.settings = resolvedData.Settings;
          this.permissions = resolvedData.Permissions || [];
          this.ValidateAttachmentsTables = resolvedData?.ValidateAttachmentsTables??undefined;
          this.SetInitialData();

          if (resolvedData.TransfersRequest&& (this.preloadedDocActionType==PreloadedDocumentActions.COPY)) {
            this.accion = 'copy';
            this.SetDataForCopy(resolvedData.TransfersRequest);
            this.DBODataEndPoint = 'OWTQ';
            this.items = resolvedData.Items;
            this.fromLocations = resolvedData.LocationsFrom;
            this.toLocations = resolvedData.LocationsTo;
          }

          if (resolvedData.StockTransfersRequest && (this.preloadedDocActionType==PreloadedDocumentActions.EDIT||this.preloadedDocActionType==PreloadedDocumentActions.DUPLICATE)){
            this.accion = 'copy';
            this.docEntry = resolvedData?.StockTransfersRequest?.DocEntry ?? 0;
            this.docNum = resolvedData?.StockTransfersRequest?.DocNum ?? 0;
            this.SetDataForDuplicate(resolvedData.StockTransfersRequest);
            this.DBODataEndPoint = 'OWTR';
            this.items = resolvedData.Items;
            this.fromLocations = resolvedData.LocationsFrom;
            this.toLocations = resolvedData.LocationsTo;
            this.documentAttachment.Attachments2_Lines = resolvedData.Attachments || [];
            this.InflateAttachmentTable();
          }

          if(this.settings){
            let printFormatsSetting = this.settings.find((setting) => setting.Code == SettingCode.PrintFormat);

            if(printFormatsSetting){
              this.companyPrintFormat = JSON.parse(printFormatsSetting.Json || '');
            }

            if(this.companyPrintFormat && this.companyPrintFormat.length){
              let dataCompany = this.companyPrintFormat.find(x => x.CompanyId === this.selectedCompany?.Id) as IPrintFormatSetting;

              if(dataCompany){
                this.reportConfigured = dataCompany
              }
            }
          }
        }
      }
    })
  }

  /**
   * ValidatePermissionToEditDate function.
   *
   * @returns void  - Description of the return value.
   */
  private ValidatePermissionToEditDate(): void {
    this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferChangeDocDate);
    this.canChangeTaxDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferChangeTaxDate);
    if (!this.canChangeDocDate) {
      this.documentForm.controls['DocDate'].disable();
    }
    if (!this.canChangeTaxDate) {
      this.documentForm.controls['TaxDate'].disable();
    }

  }

  /**
   * SetDataForCopy function.
   *
   * @param _data - Description of `_data`.
   * @returns void  - Description of the return value.
   */
  private SetDataForCopy(_data: IStockTransferRequest): void {
    try {
      this.FromWarehouse = this.warehouses.find((warehouse: IWarehouse) => warehouse.WhsCode == _data.FromWarehouse) || null;
      this.ToWarehouse = this.warehouses.find((warehouse:IWarehouse) => warehouse.WhsCode == _data.ToWarehouse) || null;
      this.documentForm.controls['Comments'].setValue(_data.Comments);
      this.documentForm.controls['SalesPersonCode'].setValue(_data.SalesPersonCode);
      this.documentForm.controls['FromWarehouse'].setValue(_data.FromWarehouse);
      this.documentForm.controls['ToWarehouse'].setValue(_data.ToWarehouse);
      this.documentForm.controls['DocDate'].setValue(_data.DocDate);
      this.documentForm.controls['TaxDate'].setValue(_data.TaxDate);

      this.lines = _data.StockTransferLines.filter(x => x.LineStatus != 'C').map((element, index) => {
        let data = {
          FromNameWhsCode: this.GetWhsName(element.FromWarehouseCode),
          ToNameWarehouse: this.GetWhsName(element.WarehouseCode),
          SysNumber: 0,
          DistNumber: '',
          Stock: this.GetStock(element),
          ManSerNum: element.ManSerNum,
          ManBtchNum: element.ManBtchNum,
          LocationsFrom: this.GetLocationFrom(element.LocationsFrom, element.BinAbs),
          LocationsTo: element.LocationsTo,
          LineNum: element.BaseLine,
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          WarehouseCode: element.WarehouseCode,
          FromWarehouseCode: element.FromWarehouseCode,
          SerialNumbers: element.ManSerNum === 'Y' ? [
            {
              SystemSerialNumber: element.SysNumber,
              Quantity: 1,
              DistNumber: element.DistNumber,
              BinCode: ''
            }
          ] : [],
          BatchNumbers: [],
          StockTransferLinesBinAllocations: element.BinAbs > 0 ? this.GetBin(index, element.BinAbs) : [],
          BinActivat: element.BinActivat,
          BinAbsOrigin: element.BinAbs > 0 ? element.BinAbs : -1,
          BinAbsDestino: -1,
          BaseType: element.BaseType,
          BaseLine: element.BaseLine,
          BaseEntry: element.BaseEntry,
          OnHandByBin: element.LocationsFrom,
          LineStatus:LineStatus.bost_Open,
          IdBinLocation: index+1,
          Udfs: []
        } as IStockTransferRowsSelected

        this.SetSelectInRows(data);

        if (this.udfsLines?.length) {
          SetUdfsLineValues(this.udfsLines, data, this.dropdownDiffList, true);
        }

        return data;
      });

      if (this.udfsLines?.length) {
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);
      }
      this.InflateTableLines();
      this.GetLocation(_data.FromWarehouse,1)
      this.GetLocation(_data.ToWarehouse,2)
    } catch (Exception) {
      CLPrint({data: Exception, clDisplay: Structures.Enums.CL_DISPLAY.ERROR});
    }
  }

  /**
   * GetBin function.
   *
   * @param _index - Description of `_index`.
   * @param _binAbs - Description of `_binAbs`.
   * @returns IStockTransferLinesBinAllocations[]  - Description of the return value.
   */
  private GetBin(_index: number, _binAbs: number): IStockTransferLinesBinAllocations[] {
    let bin: IStockTransferLinesBinAllocations[] = [];

    bin.push({
      BinAbsEntry: _binAbs,
      Quantity: 1,
      BaseLineNumber: _index,
      SerialAndBatchNumbersBaseLine: 0,
      BinActionType: 'batFromWarehouse'
    });

    return bin;
  }

  /**
   * GetStock function.
   *
   * @param _element - Description of `_element`.
   * @returns number  - Description of the return value.
   */
  private GetStock(_element: IStockTransferRequestRows): number {
    return _element.BinActivat === 'Y' &&
    _element.LocationsFrom &&
    _element.LocationsFrom.length > 0
      ? _element.LocationsFrom[0].OnHandQty
      : _element.Stock;
  }

  /**
   * GetLocationFrom function.
   *
   * @param _locationFrom - Description of `_locationFrom`.
   * @param _binAbs - Description of `_binAbs`.
   * @returns IBinLocation[]  - Description of the return value.
   */
  private GetLocationFrom(_locationFrom: IWarehouseBinLocation[], _binAbs: number): IBinLocation[] {
    if (_binAbs === 0) {
      return _locationFrom?.map(x => {
        return {AbsEntry: x.AbsEntry, BinCode: x.BinCode} as IBinLocation
      });
    } else {
      return _locationFrom?.filter(x => x.AbsEntry === _binAbs).map(x => {
        return {AbsEntry: x.AbsEntry, BinCode: x.BinCode} as IBinLocation
      })
    }
  }

  /**
   * GetWhsName function.
   *
   * @param _whsCode - Description of `_whsCode`.
   * @returns string  - Description of the return value.
   */
  private GetWhsName(_whsCode: string): string {
    return this.warehouses.find(x => x.WhsCode === _whsCode)?.WhsName || '';
  }

  /**
   * InitForm function.
   *
   * @returns void  - Description of the return value.
   */
  private InitForm(): void {
    this.documentForm = this.fb.group({
      FromWarehouse: [null, [Validators.required]],
      ToWarehouse: [null, [Validators.required]],
      FromBinLocation: [null],
      ToBinLocation: [null],
      SalesPersonCode: [''],
      Comments: [''],
      Item: [''],
      DocDate: ['',[Validators.required]],
      TaxDate: ['',[Validators.required]]
    });
  }

  /**
   * InitAutocomplete function.
   *
   * @returns void  - Description of the return value.
   */
  private InitAutocomplete(): void {
    this.items$ = merge(this.onItemControlFocused$, this.documentForm.controls['Item'].valueChanges).pipe(
      startWith(''),
      map(value => {
        return this.FilterItems(value);
      }),
    );
  }

  /**
   * OnActionButtonClicked function.
   *
   * @param _actionButton - Description of `_actionButton`.
   * @returns void  - Description of the return value.
   */
  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.isDrafts=false;
        this.OnSubmit();
        break;
      case 'CLEAN':
        this.Clear();
        break;
      case 'UPDATE':
        this.OnSubmit();
        break;
      case 'ADDPRE':
        this.isDrafts=true;
        this.OnSubmit();
        break;

    }
  }

  /**
   * Clear function.
   *
   * @returns void  - Description of the return value.
   */
  private Clear(): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: () => {
        this.RefreshData();
        this.isButtonModalDisabled = true;
        this.isButtonModalFromBinLocationDisabled = true;
        this.isButtonModalToBinLocationDisabled = true;
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  /**
   * FilterItems function.
   *
   * @param _value - Description of `_value`.
   * @returns ItemsTransfer[]  - Description of the return value.
   */
  private FilterItems(_value: string | ItemsTransfer): ItemsTransfer[] {
    if (typeof _value != 'string' && typeof _value != 'object')
      return [];

    if (typeof _value == 'object' && _value) {
      return this.GetItemsTypehead(_value.Typehead);
    }

    return this.GetItemsTypehead(_value || '');
  }

  /**
   * GetItemsTypehead function.
   *
   * @param _term - Description of `_term`.
   * @returns ItemsTransfer[]  - Description of the return value.
   */
  private GetItemsTypehead(_term: string): ItemsTransfer[] {
    return this.items.filter((v) => {

      if (_term.indexOf('*') == -1) {
        return v.Typehead.toLowerCase().indexOf(_term.toLowerCase()) > -1;
      }

      let a = v.Typehead.toLowerCase();

      const stringSize = a.length;

      const t = _term.toLowerCase();

      const b = t.split("*").filter((x) => x !== "");

      const size = b.length;

      let isSorted = true;

      if (size > 1) {

        let indexes: number[] = [];

        for (let c = 0; c < size; c++) {

          b[c] = b[c].replace(' ', '');
          let ii = a.indexOf(b[c]);

          if (ii > -1) {
            ii++;

            a = a.slice(ii, stringSize);

            if (indexes.length > 0)
              indexes.push(indexes[indexes.length - 1] + ii);
            else indexes.push(ii);
          }
        }

        let sizeIndexes = indexes.length;

        if (sizeIndexes === size) {
          for (let c = 0; c < sizeIndexes - 1; c++) {
            if (indexes[c] > indexes[c + 1]) {
              isSorted = false;
              c = sizeIndexes;
            }
          }
          return isSorted;
        }
      }

      return (v.Typehead.toLowerCase().indexOf(_term.toLowerCase()) > -1);

    }).sort((x, y) =>
      x.Typehead.toLowerCase().indexOf(_term.toLowerCase()) - y.Typehead.toLowerCase().indexOf(_term.toLowerCase())
    ).slice(0, 50);
  }

  /**
   * DisplayFnItem function.
   *
   * @param _item - Description of `_item`.
   * @returns string  - Description of the return value.
   */
  public DisplayFnItem(_item: ItemsTransfer): string {
    return _item && Object.keys(_item).length ? `${_item.ItemCode} - ${_item.ItemName}` : '';
  }

  /**
   * GetLocation function.
   *
   * @param _whsCode - Description of `_whsCode`.
   * @param _type - Description of `_type`.
   * @returns void  - Description of the return value.
   */
  public GetLocation(_whsCode: string, _type: number): void {

    this.overlayService.OnGet();
    this.binLocationService.GetLocationForTransfer(_whsCode).pipe(
      switchMap(result => {

        if (_type === 1) {
          this.fromLocations = result.Data ?? [];
          this.documentForm.controls['FromBinLocation'].setValue(null);
        } else {
          this.toLocations = result.Data ?? [];
          this.documentForm.controls['ToBinLocation'].setValue(null);
        }

        const isDataEmpty = (!result.Data || result.Data.length === 0);
        if(_type === 1){
          this.isButtonModalFromBinLocationDisabled = isDataEmpty;
          this.isButtonModalDisabled = !isDataEmpty;
        } else {
          this.isButtonModalToBinLocationDisabled = isDataEmpty;
        }

        if ((!result.Data || result.Data.length === 0) && _type === 1) {
          return this.itemsService.GetItemForTransfer(_whsCode, (this.documentForm.controls['FromBinLocation'].value) ?? 0);
        } else {
          if (_type === 1) {
            this.items = [];
          }
          return of(null);
        }
      }),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {

        if (callback && callback.Data) {
          this.items = callback.Data;
        }

        if (this.items.length === 0) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `No se obtuvieron ítems.`
          });
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  /**
   * GetItems function.
   *
   * @returns void  - Description of the return value.
   */
  public GetItems(): void {
    this.overlayService.OnGet();
    this.isButtonModalDisabled = false;
    this.itemsService.GetItemForTransfer(this.FromWarehouse?.WhsCode ?? "", this.FromBinLocation?.AbsEntry).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe(
      {
        next: (callback) => {
          if (callback.Data && callback.Data.length > 0) {
            this.items = callback.Data;
          } else {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'No se obtuvieron ítems.'
            });
          }
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      }
    );
  }

  /**
   * OnSelectItem function.
   *
   * @param _item - Description of `_item`.
   * @returns void  - Description of the return value.
   */
  public OnSelectItem(_item: ItemsTransfer): void {

    this.blockInput = true;
    let groupLine: boolean = false;

    try {
      if (!this.ValidateData()) {
        setTimeout(() => {
          this.documentForm.controls['Item'].setValue('');
          this.blockInput = false;
        }, 0)
        return;
      }

      if (this.lines.some(x => x.ManSerNum === 'Y' && x.SysNumber === _item.SysNumber)) {

        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El ítem ${_item.ItemCode} ya ha sido agregado con la serie ${_item.DistNumber}`
        });

      } else {

        if (_item.ManSerNum === 'N' && this.lines.some(x => x.ItemCode === _item.ItemCode && x.FromWarehouseCode === this.FromWarehouse?.WhsCode)) {

          groupLine = true;

          if (this.toLocations && this.toLocations.length > 0) {
            groupLine = this.lines.some(x => x.ItemCode === _item.ItemCode
              && x.FromWarehouseCode === this.FromWarehouse?.WhsCode
              && x.BinAbsDestino === +(this.ToBinLocation?.AbsEntry ?? 0));
          }
        }

        if (groupLine) {

          let index: number = this.lines.findIndex(x => x.ItemCode === _item.ItemCode && x.FromWarehouseCode === this.FromWarehouse?.WhsCode);

          this.lines[index].Quantity+=1;

          if ( _item.ManBtchNum === 'N') {
            this.lines[index].StockTransferLinesBinAllocations.forEach(location => location.Quantity=this.lines[index].Quantity);
          }
        } else {

          let Location: IStockTransferLinesBinAllocations[] = [];

          this.toLocations && this.toLocations.length > 0 ?
            Location = [{
              BinAbsEntry: this.ToBinLocation?.AbsEntry || -1,
              Quantity: 1,
              BaseLineNumber: -1,
              SerialAndBatchNumbersBaseLine: 0,
              BinActionType: 'batToWarehouse'
            } as IStockTransferLinesBinAllocations] : [];

          if (this.fromLocations && this.fromLocations.length > 0 && _item.ManBtchNum === 'N') {

            Location.push(
              {
                BinAbsEntry: this.FromBinLocation?.AbsEntry || -1,
                Quantity: 1,
                BaseLineNumber: -1,
                SerialAndBatchNumbersBaseLine: 0,
                BinActionType: 'batFromWarehouse'
              }
            );
          }

          let IdBinLocation = this.lines && this.lines.length > 0 ? Math.max(...this.lines.map(x => (x.IdBinLocation || 0))) + 1 : 1;
          let setFromLocations : IBinLocation[]=[];

          this.overlayService.OnGet()
          this.stockTransferService.GetWarehousesBinLocation(this.FromWarehouse?.WhsCode ?? "", _item.ItemCode).
          pipe(finalize(()=> this.overlayService.Drop())).
          subscribe( (result) => {
            if(result.Data.length>0){
              setFromLocations=result.Data;
            }else{
              setFromLocations=[];
            }

            const fromBinAbsOrigin = this.FromBinLocation?.AbsEntry ?? 0;
            const toBinAbsOrigin = this.ToBinLocation?.AbsEntry ?? 0;

            let item = {
              ItemCode: _item.ItemCode,
              ItemDescription: _item.ItemName,
              Quantity: 1,
              WarehouseCode: this.ToWarehouse?.WhsCode,
              FromWarehouseCode: this.FromWarehouse?.WhsCode,
              SerialNumbers: _item.ManSerNum === 'Y' ? [{SystemSerialNumber: _item.SysNumber, Quantity: 1}] : [],
              BatchNumbers: [],
              StockTransferLinesBinAllocations: Location,
              FromNameWhsCode: (this.warehouses.find(x => x.WhsCode === this.FromWarehouse?.WhsCode)?.WhsName || ''),
              ToNameWarehouse: (this.warehouses.find(x => x.WhsCode === this.ToWarehouse?.WhsCode)?.WhsName || ''),
              DistNumber: _item.ManSerNum === 'Y' ? _item.DistNumber : 'N/A',
              SysNumber: _item.ManSerNum === 'Y' ? _item.SysNumber : 0,
              Stock: +(_item.Stock),
              ManSerNum: _item.ManSerNum,
              ManBtchNum: _item.ManBtchNum,
              LineNum: 0,
              BinActivat: '',
              BinAbsOrigin: +fromBinAbsOrigin,
              BinAbsDestino: +toBinAbsOrigin,
              LocationsFrom: setFromLocations?.length>0 ? setFromLocations: [],
              LocationsTo: this.toLocations.length>0 ? this.toLocations: [],
              OnHandByBin: setFromLocations?.length>0 ? setFromLocations as IWarehouseBinLocation[]: [],
              Udfs: [],
              IdBinLocation: IdBinLocation,
              LineStatus:LineStatus.bost_Open
            } as IStockTransferRowsSelected;

            if (this.udfsLines && this.udfsLines.length > 0) {
              MappingDefaultValueUdfsLines(item, this.udfsLines);
            }

            this.SetSelectInRows(item);

            if (this.udfsLines?.length) {
              SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList, true);
            }

            this.lines.push(item);
            this.InflateTableLines();
          });
        }

      }

      this.InflateTableLines();

    } catch (error) {
      CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR);
    }


    setTimeout(() => {
      this.documentForm.controls['Item'].setValue('');
    }, 0);
    this.blockInput = false;
  }

  /**
   * ValidateData function.
   *
   * @returns boolean  - Description of the return value.
   */
  private ValidateData(): boolean {
    if (this.documentForm.invalid) {
      this.alertsService.Toast({type: CLToastType.INFO, message: `Por favor ingrese los datos del encabezado.`});
      return false;
    }

    let frm = this.documentForm.value;

    if (this.fromLocations && this.fromLocations.length > 0) {
      if (!frm.FromBinLocation || frm.FromBinLocation === '') {
        this.alertsService.Toast({type: CLToastType.INFO, message: `Selecione la ubicación de origen.`});
        return false;
      }
    }

    if (this.toLocations && this.toLocations.length > 0) {
      if (!frm.ToBinLocation || frm.ToBinLocation === '') {
        this.alertsService.Toast({type: CLToastType.INFO, message: `Selecione la ubicación de destino.`});
        return false;
      }
    }

    if (frm.FromWarehouse === frm.ToWarehouse) {
      if (this.toLocations && this.toLocations.length > 0 && this.fromLocations && this.fromLocations.length > 0) {
        if (frm.FromBinLocation === frm.ToBinLocation) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `La ubicación de origen y destino no pueden ser la misma dentro del mismo almacén.`
          });
          return false;
        }
      } else {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El almacén de origen y destino no pueden ser el mismo.`
        });
        return false;
      }
    }

    return true;
  }

  /**
   * OpenDialogLotes function.
   *
   * @param _item - Description of `_item`.
   * @returns void  - Description of the return value.
   */
  private OpenDialogLotes(_item: IStockTransferRowsSelected): void {

    if (_item.ManBtchNum === 'Y' && _item.BinActivat === 'Y') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'Seleccione la ubicación de origen.'
      });
      return;
    }

    if (_item.ManBtchNum === 'Y') {

      let BinAbsOrigin = _item.LocationsFrom && _item.LocationsFrom.length > 0 ? _item.LocationsFrom[0].AbsEntry : 0;

      this.overlayService.OnGet();
      this.batchesService.GetBatchesForTransfer(_item.ItemCode, _item.FromWarehouseCode, BinAbsOrigin).pipe(
        filter(result => {
          this.overlayService.Drop();

          if (result.Data && result.Data.length > 0) {
            return true;
          } else {
            this.alertsService.Toast({
              type: CLToastType.INFO,
              message: 'No se obtuvieron lotes.'
            });
            return false;
          }
        }),
        switchMap(result => this.matDialog.open(LotComponent, {
          maxWidth: '100vw',
          minWidth: '40vw',
          maxHeight: 'calc(100vh - 20px)',
          disableClose: true,
          data: {
            Permission: true,
            Lotes: result.Data,
            LotesSelected: [],
            LocationsSelected: [],
            Quantity: _item.Quantity,
            ValidateStockBatch: true,
            View: ViewBatches.TRANSFER_INVENTORY
          } as IBatchSelected
        }).afterClosed()),
        filter(result => result),
        finalize(() => {
          this.overlayService.Drop()
        })
      ).subscribe({
        next: (callback => {
          if(callback){
            this.LotesSelected(callback, ((_item.Id || 0) - 1));
          }
        }),
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
        }
      });

    } else {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: 'El ítem seleccionado no es un ítem manejado por lotes.'
      });
    }

  }

  /**
   * LotesSelected function.
   *
   * @param _data - Description of `_data`.
   * @param _index - Description of `_index`.
   * @returns void  - Description of the return value.
   */
  private LotesSelected(_data: IBatches[], _index: number): void {

    let form = this.documentForm.value;

    this.lines[_index].BatchNumbers = _data.map(element => {
      return {
        BatchNumber: element.DistNumber,
        SystemSerialNumber: element.SysNumber,
        Quantity: element.Quantity
      }
    });

    if (!this.lines[_index].StockTransferLinesBinAllocations)
      this.lines[_index].StockTransferLinesBinAllocations = [];

    if (form.FromBinLocation > 0) {

      this.lines[_index].StockTransferLinesBinAllocations = this.lines[_index].StockTransferLinesBinAllocations
        .filter(x => x.BinActionType === 'batToWarehouse');

      this.lines[_index].BatchNumbers.forEach((element, index) => {
        this.lines[_index].StockTransferLinesBinAllocations.push({
          BinAbsEntry: form.FromBinLocation,
          Quantity: element.Quantity,
          BaseLineNumber: _index,
          SerialAndBatchNumbersBaseLine: index,
          BinActionType: 'batToWarehouse'
        });
      });
    }
  }

  /**
   * OnSubmit function.
   *
   * @returns void  - Description of the return value.
   */
  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else this.SaveChanges();
  }

  /**
   * SaveChanges function.
   *
   * @returns void  - Description of the return value.
   */
  private SaveChanges(): void {
    if (!this.lines || this.lines.length === 0) {
      this.alertsService.Toast({type: CLToastType.INFO, message: `No se han ingresado líneas.`});
      return;
    }

    let index = this.lines.findIndex(x => x.Quantity > x.Stock);

    if(this.vldInventory.ValidateInventory) {
      if (index >= 0) {
        let rowItem = this.lines[index];
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El ítem ${rowItem.ItemCode}, en la línea ${(index + 1)} no puede tener una cantidad mayor al disponible. Disponible: ${rowItem.Stock}.`
        });
        return;
      }
    }

    index = this.lines.findIndex(x => x.ManBtchNum === 'Y' && (!x.BatchNumbers || x.BatchNumbers.length === 0));

    if (index >= 0) {
      let rowItem = this.lines[index];
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El ítem ${rowItem.ItemCode} en la línea ${(index + 1)} es manejado por lotes por favor ingrese la cantidad por lote en la columna de opciones.`
      });
      return;
    }

    index = this.lines.findIndex(x => x.ManSerNum === 'Y' && (!x.SerialNumbers || x.SerialNumbers.length === 0));

    if (index >= 0) {
      let rowItem = this.lines[index];
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El ítem ${rowItem.ItemCode} en la línea ${(index + 1)} es manejado por series por favor ingrese la serie en la columna de opciones.`
      });
      return;
    }

    if (this.lines.some(x => x.BinActivat === 'Y' && x.BinAbsOrigin === -1)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Verifique que todas las líneas tengan la ubicación de origen asignada, si no posee ubicación en la columna (Ubicación origen), el ítem no tiene stock en ninguna ubicación.`
      });
      return;
    }

    if (this.lines.some(x => x.BinAbsDestino === -1 && x.LocationsTo && x.LocationsTo.length > 0)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Verifique que todas las líneas tengan la ubicación de destino asignada.`
      });
      return;
    }
    this.SetUdfsDevelopment();

    let slpCode: string = this.documentForm.controls['SalesPersonCode'].value;

    let data: IStockTransfer = {
      DocEntry: this.preloadedDocActionType==PreloadedDocumentActions.EDIT ?this.docEntry :0,
      DocNum: this.preloadedDocActionType==PreloadedDocumentActions.EDIT ? this.docNum : 0,
      AttachmentEntry: 0,
      Comments: this.documentForm.controls['Comments'].value,
      ToWarehouse: this.ToWarehouse?.WhsCode || '',
      FromWarehouse: this.FromWarehouse?.WhsCode || '',
      DocDate : this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferChangeDocDate)? FormatDate(this.documentForm.controls['DocDate'].value): undefined,
      TaxDate : this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferChangeTaxDate)?FormatDate(this.documentForm.controls['TaxDate'].value):undefined,
      SalesPersonCode: Number(slpCode),
      Udfs: this.udfsValue,
      StockTransferLines: this.lines.map(element => {
        return {
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          WarehouseCode: element.WarehouseCode,
          FromWarehouseCode: element.FromWarehouseCode,
          SerialNumbers: element.SerialNumbers,
          BatchNumbers: element.BatchNumbers,
          BaseType: element.BaseType,
          BaseLine: element.BaseLine,
          BaseEntry: element.BaseEntry,
          LineStatus:element.LineStatus,
          StockTransferLinesBinAllocations: element.StockTransferLinesBinAllocations.map(
            (line: IStockTransferLinesBinAllocations, index: number) => ({ ...line, SerialAndBatchNumbersBaseLine: index })),
          Udfs: GetUdfsLines(element, this.udfsLines)
        } as IStockTransferRows
      })
    }
    if(this.isDrafts) {
      this.PostStockTransfersDrafts(data)
    } else {
      if(this.preloadedDocActionType!=PreloadedDocumentActions.EDIT){
      data.DocDate=FormatDate(this.documentForm.controls['DocDate'].value);
      data.TaxDate=FormatDate(this.documentForm.controls['TaxDate'].value);
      this.overlayService.OnPost();
      this.stockTransferService.Post(data, this.documentAttachment, this.attachmentFiles).pipe(
        switchMap(res => {
          if (res && res.Data) {
            return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
              map(print => {
                return {Data: res.Data, Print: print};
              }));
          } else {
            return of(null);
          }
        }),
        map(res => {
          this.overlayService.Drop();
          return {
            DocEntry: res?.Data.DocEntry,
            DocNum: res?.Data.DocNum,
            NumFE: '',
            CashChange: 0,
            CashChangeFC: 0,
            Title: 'Transferencia',
            TypeReport: 'InventoryTransfer'
          } as ISuccessSalesInfo;
        }),
        switchMap(res => this.OpenDialogSuccessSales(res)),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: () => {
          this.RefreshData();
        },
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error creando la Transferencia',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });
    } else {
        this.overlayService.OnPost();
        this.stockTransferService.Patch(data, this.documentAttachment, this.attachmentFiles).pipe(
          map(res => {
            this.overlayService.Drop();
            return {
              DocEntry: this.docEntry,
              DocNum: this.docNum,
              NumFE: '',
              CashChange: 0,
              CashChangeFC: 0,
              Title: 'Preliminar Transferencia',
              TypeReport: 'InventoryTransfer'
            } as ISuccessSalesInfo;
          }),
          switchMap(res => this.OpenDialogSuccessSales(res)),
          finalize(() => this.overlayService.Drop())
        ).subscribe({
          next: () => {
            this.RefreshData();
          },
          error: (err) => {
            this.modalService.Continue({
              title: 'Se produjo un error creando el preliminar de Transferencia de stock',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });
      }
    }
  }

  /**
   * ResetDocument function.
   *
   * @returns void  - Description of the return value.
   */
  private ResetDocument(): void {
    try {
      this.documentAttachment = {
        Attachments2_Lines: [],
        AbsoluteEntry: 0
      };
      this.preloadedDocActionType = undefined;
      this.attachmentFiles = [];
      this.dropdownDiffList = {};
      this.InflateAttachmentTable();

      this.documentForm.reset();
      this.lines = [];
      this.udfsValue = [];
      this.uniqueId = this.commonService.GenerateDocumentUniqueID();
      this.docEntry=0;
      this.docNum=0;
      this.isDrafts= false;
      this.InflateTableLines();
      if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferChangeDocDate)) {
        this.documentForm.controls['DocDate'].enable();
      }
      if (this.accion !== '') {
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
        if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferCreateDraft)) {
          this.actionButtons = [{
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          }, ...this.actionButtons]
        }
        this.router.navigate(['inventory', 'transfer']);
      }
      this.accion = '';
      this.CleanFields();
    } catch (Exception) {
      CLPrint(Exception, Structures.Enums.CL_DISPLAY.ERROR);
    }
  }

  /**
   * RefreshData function.
   *
   * @returns void  - Description of the return value.
   */
  private RefreshData(): void {
    if (this.accion !== ''){
      this.ResetDocument();
      return;
    }

    this.overlayService.OnGet();

    forkJoin({
      Warehouses: this.warehousesService.Get<IWarehouse[]>(),
      SalesPerson: this.salesPersonService.Get<ISalesPerson[]>(),
      UdfsLine: this.udfsService.Get<IUdfContext[]>('OWTR', true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OWTR')
        .pipe(catchError(res => of(null))),
    }).pipe(finalize(() => this.overlayService.Drop())).subscribe({
      next: (res => {
        this.warehouses = res.Warehouses.Data;
        this.salesPersons = res.SalesPerson.Data;
        this.udfsLines = res.UdfsLine?.Data ?? [];
        this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
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

  /**
   * CleanFields function.
   *
   * @returns void  - Description of the return value.
   */
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
   * SetUDFsValues function.
   *
   * @returns void  - Description of the return value.
   */
  public SetUDFsValues(): void {

    this.linkerService.Publish({
      Target: this.UdfsId,
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(this.udfsDataHeader)
    });
  }

  /**
   * Handles the event to load dynamic User-Defined Fields (UDFs) from a triggered action.
   *
   * Sets the component visibility flag based on whether any UDFs are returned in the event payload.
   *
   * @param _event - The event containing serialized UDF data in its `Data` field.
   */
  public ContentUdf = (_event: ICLEvent): void => {
    let udfs: DynamicsUdfPresentation.Structures.Interfaces.IUdf[] = JSON.parse(_event.Data);
    this.isVisible = udfs.length > 0;
  }

  /**
   * Handles the UDF interaction event when the user confirms or submits changes.
   *
   * Parses and stores the UDF values, then initiates the save process.
   *
   * @param _event - The event containing updated UDF data as a JSON string.
   */
  public OnClickUdfEvent = (_event: ICLEvent): void => {
    this.udfsValue = JSON.parse(_event.Data) as IUdfContext[];
    this.SaveChanges();
  }

  /**
   * OpenDialogSuccessSales function.
   *
   * @param _data - Description of `_data`.
   * @returns Observable<ISuccessSalesInfo>  - Description of the return value.
   */
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
   * GetConfiguredUdfs function.
   *
   * @returns void  - Description of the return value.
   */
  public GetConfiguredUdfs(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.DATA_LINE_1,
      Data: '',
      Target: this.UdfsId
    });
  }

  /**
   * SetUdfsDevelopment function.
   *
   * @returns void  - Description of the return value.
   */
  private SetUdfsDevelopment(): void {
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);
  }

  /**
   * FindItem function.
   *
   * @param _event - Description of `_event`.
   * @returns void  - Description of the return value.
   */
  public FindItem(_event: KeyboardEvent): void {
    if (_event.key === 'Enter') {
      let barcode = this.documentForm.controls['Item'].value;
      if (typeof barcode === 'string') {
        let item = this.items.find(x => x.Barcode === barcode);
        if (item) {
          this.OnSelectItem(item);
        } else {
          this.documentForm.controls['Item'].setValue('');
          this.alertsService.Toast({type: CLToastType.INFO, message: `No existe ${barcode}.`})
        }
      }
    }
  }

  /**
   * SetInitialData function.
   *
   * @returns void  - Description of the return value.
   */
  private SetInitialData(): void {
    this.documentForm.controls['SalesPersonCode'].setValue(+(this.userAssing?.SlpCode || -1));
    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));

    if (this.setting && this.setting.Json) {
      let data = JSON.parse(this.setting.Json) as IPaymentSetting[];
      if (data) {
        this.disableDragAndDrop = !!data.find(x => x.CompanyId === this.selectedCompany?.Id)?.OrderLine;
      }
    }

    if (this.udfsLines && this.udfsLines.length > 0) {
      MappingUdfsLines(this.udfsLines, this.headerTableColumns, this.InputColumns, this.dropdownColumns);
      this.lineMappedDisplayColumns.renameColumns = this.headerTableColumns;
      this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    }

    if (this.settings.find((element) => element.Code == SettingCode.ValidateInventory)) {
      this.vldInventoryCompany = JSON.parse(this.settings.find((element) => element.Code == SettingCode.ValidateInventory)?.Json || '');
    }

    if (this.vldInventoryCompany && this.vldInventoryCompany.length > 0) {
      let dataInventoryCompany = this.vldInventoryCompany.find(x => x.CompanyId === this.selectedCompany?.Id) as IValidateInventorySetting;

      if (dataInventoryCompany && dataInventoryCompany.Validate.length > 0) {
        this.vldInventory = dataInventoryCompany.Validate.filter(x => x.Table === DocumentTypes.TransferRequest)[0] ?? {} as IValidateInventory;
      }
    }
  }

  /**
   * OnAttachFile function.
   *
   * @param _event - Description of `_event`.
   * @returns void  - Description of the return value.
   */
  OnAttachFile(_event: Event): void {
    let files = (_event.target as HTMLInputElement).files;

    if(!files) return;

    let hasDuplicatesFiles: boolean = false;

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
   * InflateAttachmentTable function.
   *
   * @returns void  - Description of the return value.
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
   */
  private OnAttachmentTableRowModified = (_event: ICLEvent): void => {
    let ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IAttachments2Line>;

    let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1, true);

    this.documentAttachment.Attachments2_Lines[INDEX].FreeText = ALL_RECORDS.Row.FreeText;
  }

  /**
   * Handles the modal event triggered to fetch warehouse records by a search value.
   *
   * - Parses the event payload to extract the filter criteria.
   * - Calls the warehouse service to retrieve matching warehouse records.
   * - Updates the internal list and refreshes the UI table.
   * - Displays success or error feedback accordingly.
   *
   * @param _event - The event containing the search criteria as JSON in the `Data` property.
   */
  OnModalWarehousesRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.warehousesService.GetbyFilter<IWarehouse[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.warehouses = callback.Data;
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
   * InflateTableWarehouse function.
   *
   * @returns void  - Description of the return value.
   */
  private InflateTableWarehouse(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.warehouses,
      RecordsCount: this.warehouses.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalWarehousesId
    });
  }

  /**
   * Handles the modal event triggered to fetch bin locations for the source warehouse.
   *
   * - Parses the search criteria from the event payload.
   * - Requests bin locations using the source warehouse code and provided filter.
   * - Updates the internal `fromLocations` list and refreshes the corresponding table.
   * - Displays a toast notification or an error alert based on the response.
   *
   * @param _event - The event containing the search criteria as a JSON string.
   */
  OnModalFromBinLocationRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.binLocationService.GetLocationForTransferPagination(this.FromWarehouse?.WhsCode ?? "", VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.fromLocations = callback.Data;
        this.InflateTableFromBinLocations();
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
   * InflateTableFromBinLocations function.
   *
   * @returns void  - Description of the return value.
   */
  private InflateTableFromBinLocations(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.fromLocations,
      RecordsCount: this.fromLocations.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalFromBinLocationsId
    });
  }

  /**
   * Handles the modal event triggered to fetch bin locations for the destination warehouse.
   *
   * - Parses the event payload to extract the search criteria.
   * - Calls the bin location service using the destination warehouse code and the search filter.
   * - Updates the `toLocations` list and refreshes the corresponding table in the UI.
   * - Displays a success toast or an error alert depending on the outcome.
   *
   * @param _event - The event object containing a serialized search query in the `Data` field.
   */
  OnModalToBinLocationRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.binLocationService.GetLocationForTransferPagination(this.ToWarehouse?.WhsCode ?? "", VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.toLocations = callback.Data;
        this.InflateTableToBinLocations();
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
   * InflateTableToBinLocations function.
   *
   * @returns void  - Description of the return value.
   */
  private InflateTableToBinLocations(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.toLocations,
      RecordsCount: this.toLocations.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalToBinLocationsId
    });
  }

  /**
   * Handles the modal event triggered to retrieve item records available for transfer.
   *
   * - Extracts the search value from the event payload.
   * - Fetches items filtered by source warehouse and bin location.
   * - Updates the modal item list and table UI if results are found.
   * - Adds a validator for the autocomplete field based on retrieved items.
   * - Shows appropriate toast messages depending on the response.
   *
   * @param _event - The event containing the item search filter in the `Data` property as JSON.
   */
  OnModalItemRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    let value = this.documentForm.value;
    this.overlayService.OnGet();
    this.itemsService.GetItemForTransferPagination(this.FromWarehouse?.WhsCode ?? "", this.FromBinLocation?.AbsEntry ?? 0, VALUE?.SearchValue ?? "")
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        if (callback.Data && callback.Data.length > 0) {
          this.itemModal = callback.Data;
          this.InflateTableItems();
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        } else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'No se obtuvieron ítems.'
          });
        }
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * InflateTableItems function.
   *
   * @returns void  - Description of the return value.
   */
  private InflateTableItems(): void {
    const NEXT_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.itemModal,
      RecordsCount: this.itemModal.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchItemModalId
    });
  }

  /**
   * Handle the event of attachment table when a button is clicked
   * @param _event The object with the event information
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
   * SetDataForDuplicate function.
   *
   * @param _data - Description of `_data`.
   * @returns Promise<void>  - Description of the return value.
   */
  private async SetDataForDuplicate(_data: IStockTransfer): Promise<void> {
    try {
      let articulos:ItemsTransfer[]=[];
      let fromLocationsD:IBinLocation[]=[];
      let toLocationsD:IBinLocation[]=[];
      for (let index = 0; index < _data.StockTransferLines.length; index++) {
        const element = _data.StockTransferLines[index];
        this.FromWarehouse = this.warehouses.find(warehouse => warehouse.WhsCode == _data.FromWarehouse) || null;
        this.ToWarehouse = this.warehouses.find(warehouse => warehouse.WhsCode == _data.ToWarehouse) || null;
        this.documentForm.controls['FromWarehouse'].setValue(this.FromWarehouse?.WhsName);
        this.documentForm.controls['ToWarehouse'].setValue(this.ToWarehouse?.WhsName);

        if (element.StockTransferLinesBinAllocations.some(x => x.BinActionType == 'batFromWarehouse')) {
          this.documentForm.controls['FromBinLocation'].setValue(element.StockTransferLinesBinAllocations.find(x => x.BinActionType == 'batFromWarehouse')?.BinAbsEntry);
        }

        if (element.StockTransferLinesBinAllocations.some(x => x.BinActionType == 'batToWarehouse')) {
          this.documentForm.controls['ToBinLocation'].setValue(element.StockTransferLinesBinAllocations.find(x => x.BinActionType == 'batToWarehouse')?.BinAbsEntry);
        }

        fromLocationsD = await this.GetWarehousesBinLocationFrom(element.FromWarehouseCode, element.ItemCode,1);
        toLocationsD = await this.GetLocations(element.WarehouseCode, 2);
        articulos = await this.SetItem(
          element.FromWarehouseCode,
          (element.StockTransferLinesBinAllocations.find(x => x.BinActionType == 'batFromWarehouse')?.BinAbsEntry) ?? 0,
          fromLocationsD,
          toLocationsD,
          element
        );
      }

      if (this.udfsLines?.length) {
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);
      }

      this.InflateTableLines();

      this.FromWarehouse = this.warehouses.find(warehouse => warehouse.WhsCode == _data.FromWarehouse) || null;
      this.ToWarehouse = this.warehouses.find(warehouse => warehouse.WhsCode == _data.ToWarehouse) || null;

      this.documentForm.controls['Comments'].setValue(_data.Comments);
      this.documentForm.controls['SalesPersonCode'].setValue(_data.SalesPersonCode);
      this.documentForm.controls['FromWarehouse'].setValue(this.FromWarehouse?.WhsName);
      this.documentForm.controls['ToWarehouse'].setValue(this.ToWarehouse?.WhsName);

      if(this.preloadedDocActionType==PreloadedDocumentActions.DUPLICATE){
        this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
        this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));
      }else{
        this.documentForm.controls['DocDate'].setValue(_data.DocDate);
        this.documentForm.controls['TaxDate'].setValue(_data.TaxDate);
      }
      this.GetLocation(_data.FromWarehouse,1)
      this.GetLocation(_data.ToWarehouse,2)

    } catch (Exception) {
      CLPrint({data: Exception, clDisplay: Structures.Enums.CL_DISPLAY.ERROR});
    }
  }

  /**
   * ReadQueryParameters function.
   *
   * @returns void  - Description of the return value.
   */
  public ReadQueryParameters(): void {
    let params = this.activatedRoute.snapshot.queryParams

    if (params['Action']) {
      this.preloadedDocActionType = params['Action'] as PreloadedDocumentActions;
    }
  }

  /**
   * GetLocations function.
   *
   * @param _whsCode - Description of `_whsCode`.
   * @param _type - Description of `_type`.
   * @returns Promise<IBinLocation[]>  - Description of the return value.
   */
  async GetLocations(_whsCode: string, _type: number): Promise<IBinLocation[]> {
    return new Promise((resolve, reject) => {
      this.binLocationService.GetLocationForTransfer(_whsCode).pipe().subscribe({
        next: (result) => {
          if (_type === 1) {
            this.fromLocations = result.Data ?? [];
          } else {
            this.toLocations = result.Data ?? [];
          }
          resolve(result.Data);
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          reject(err);
        }
      });
    });
  }

  /**
   * SetItem function.
   *
   * @param _whsCode - Description of `_whsCode`.
   * @param _binAbs - Description of `_binAbs`.
   * @param fromLocationsD - Description of `fromLocationsD`.
   * @param toLocationsD - Description of `toLocationsD`.
   * @param element - Description of `element`.
   * @returns Promise<ItemsTransfer[]>  - Description of the return value.
   */
  async SetItem(_whsCode: string, _binAbs: number = 0,fromLocationsD:IBinLocation[], toLocationsD:IBinLocation[], element:IStockTransferRows): Promise<ItemsTransfer[]> {
    return new Promise((resolve, reject) => {
      this.itemsService.GetItemForTransfer(_whsCode, _binAbs).pipe().subscribe({
        next:(value )=> {
          let articulos=value.Data;
          let articulo = articulos.find(x => x.ItemCode === element.ItemCode);
          if (articulo) {
            let item:IStockTransferRowsSelected = {
              ItemCode: articulo.ItemCode,
              ItemDescription: articulo.ItemName,
              Quantity: element.Quantity,
              WarehouseCode: element.WarehouseCode,
              FromWarehouseCode: element.FromWarehouseCode,
              SerialNumbers: articulo.ManSerNum === 'Y' ? [{SystemSerialNumber: articulo.SysNumber, Quantity: 1 , DistNumber: articulo.DistNumber, Assigned:true}] : [],
              BatchNumbers: element.BatchNumbers??[],
              StockTransferLinesBinAllocations: element.StockTransferLinesBinAllocations.length > 0 ? element.StockTransferLinesBinAllocations : [],
              FromNameWhsCode: this.GetWhsName(element.FromWarehouseCode),
              ToNameWarehouse: this.GetWhsName(element.WarehouseCode),
              DistNumber: articulo.ManSerNum === 'Y' ? articulo.DistNumber : 'N/A',
              SysNumber: articulo.ManSerNum === 'Y' ? articulo.SysNumber : 0,
              Stock: +(articulo.Stock),
              ManSerNum: articulo.ManSerNum,
              ManBtchNum: articulo.ManBtchNum,
              LineNum: 0,
              BinActivat: '',
              BinAbsOrigin: element.StockTransferLinesBinAllocations.some(x=>x.BinActionType=='batFromWarehouse') ? element.StockTransferLinesBinAllocations.find(x=>x.BinActionType=='batFromWarehouse')?.BinAbsEntry : -1,
              BinAbsDestino: element.StockTransferLinesBinAllocations.some(x=>x.BinActionType=='batToWarehouse') ? element.StockTransferLinesBinAllocations.find(x=>x.BinActionType=='batToWarehouse')?.BinAbsEntry :-1,
              LocationsFrom: fromLocationsD.length>0 ? fromLocationsD : [],
              LocationsTo: toLocationsD.length > 0 ? toLocationsD : [],
              Udfs: [],
              IdBinLocation: this.lines && this.lines.length > 0 ? Math.max(...this.lines.map(x => (x.IdBinLocation || 0))) + 1 : 1,
              BaseEntry: this.preloadedDocActionType==PreloadedDocumentActions.DUPLICATE ? undefined: element.BaseEntry,
              BaseLine: this.preloadedDocActionType==PreloadedDocumentActions.DUPLICATE ? -1: element.BaseLine,
              BaseType: this.preloadedDocActionType==PreloadedDocumentActions.DUPLICATE ? undefined: element.BaseType,
              LineStatus:element.LineStatus,
              OnHandByBin:fromLocationsD.length>0 ? fromLocationsD as IWarehouseBinLocation[] : []
            };

            if (this.udfsLines?.length) {
              MappingDefaultValueUdfsLines(item, this.udfsLines);
              SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList, true);
            }

            this.SetSelectInRows(item);

            this.lines.push(item);
            resolve(value.Data)
          }},
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          reject(err);
        }
      })
    });
  }

  /**
   * GetRowColorMessage function.
   *
   * @param _item - Description of `_item`.
   * @returns void  - Description of the return value.
   */
  private GetRowColorMessage(_item: IStockTransferRowsSelected): void {
    let message = '';
    let color = '';

    if (_item.LineStatus === 'C' ||_item.LineStatus==LineStatus.bost_Close) {
      color = RowColors.LightGray;
      message = 'Línea estado cerrada'
    }
    _item.RowMessage = message;
    _item.RowColor = color;

  }

  /**
   * DefineActionButtonByPreloadedDocAction function.
   *
   * @returns void  - Description of the return value.
   */
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
        if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferCreateDraft)) {
          this.actionButtons = [{
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          }, ...this.actionButtons]
        }
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
        if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferCreateDraft)) {
          this.actionButtons = [{
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          }, ...this.actionButtons]
        }
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
        if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsStockTransferCreateDraft)) {
          this.actionButtons = [{
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          }, ...this.actionButtons]
        }
        break;
    }
  }

  /**
   * GetWarehousesBinLocationFrom function.
   *
   * @param _whsCode - Description of `_whsCode`.
   * @param _itemCode - Description of `_itemCode`.
   * @param _type - Description of `_type`.
   * @returns Promise<IBinLocation[]>  - Description of the return value.
   */
  async GetWarehousesBinLocationFrom(_whsCode: string,_itemCode: string, _type: number): Promise<IBinLocation[]> {
    return new Promise((resolve, reject) => {
      this.stockTransferService.GetWarehousesBinLocation(_whsCode, _itemCode).pipe().subscribe({
        next: (result) => {
          if (_type === 1) {
            this.fromLocations = result.Data ?? [];
          } else {
            this.toLocations = result.Data ?? [];
          }
          resolve(result.Data);
        },
        error: (err) => {
          this.alertsService.ShowAlert({HttpErrorResponse: err});
          reject(err);
        }
      });
    });
  }

  /**
   * ShowModalSearchWarehouses function.
   *
   * @param _isFromWarehouse - Description of `_isFromWarehouse`.
   * @param _type - Description of `_type`.
   * @returns void  - Description of the return value.
   */
  ShowModalSearchWarehouses(_isFromWarehouse: boolean, _type: number): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalWarehousesId,
        ModalTitle: 'Lista de almacenes',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: ['BinActivat'],
          RenameColumns: {
            WhsCode: 'Código',
            WhsName: 'Almacén',
          }
        }
      } as ISearchModalComponentDialogData<IWarehouse>
    }).afterClosed().subscribe({
      next: (value) => {
        if (value) {
          if(_isFromWarehouse){
            this.FromWarehouse = value
            this.documentForm.controls['FromWarehouse'].setValue(value.WhsName);
            this.GetLocation(value.WhsCode, 1)
          } else {
            this.ToWarehouse = value
            this.documentForm.controls['ToWarehouse'].setValue(value.WhsName);
            this.GetLocation(value.WhsCode, 2)
          }
        }
      }
    });
  }

  /**
   * ShowModalSearchLocations function.
   *
   * @param locationType - Description of `locationType`.
   * @returns void  - Description of the return value.
   */
  ShowModalSearchLocations(locationType: string): void {
    const isFromBinLocation = locationType === 'FromBinLocation';
    const identificador = isFromBinLocation
      ? this.searchModalFromBinLocationsId
      : this.searchModalToBinLocationsId;

    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: '80%',
      data: {
        Id: identificador,
        ModalTitle: 'Lista de Ubicaciones',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: ['Stock', 'Quantity'],
          RenameColumns: {
            AbsEntry: 'Código',
            BinCode: 'Ubicación',
          }
        }
      } as ISearchModalComponentDialogData<IBinLocation>
    }).afterClosed().subscribe({
      next: (value) => {
        if (value) {
          const formControlName = isFromBinLocation ? 'FromBinLocation' : 'ToBinLocation';
          const binLocation = isFromBinLocation ? 'FromBinLocation' : 'ToBinLocation';
          this[binLocation] = value;
          this.documentForm.controls[formControlName].setValue(value.BinCode);
          if (isFromBinLocation) {
            this.GetItems();
          }
        }
      }
    });
  }

  /**
   * Opens a modal dialog to search and select items for inventory transfer.
   *
   * - Configures the search modal with title, input debounce, and table column mappings.
   * - Handles the result when the modal is closed and processes the selected item.
   */
  ShowModalSearchItem() {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchItemModalId,
        ModalTitle: 'Lista ítems',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: ['ManSerNum', 'ManBtchNum', 'SysNumber', 'Typehead'],
          RenameColumns: {
            ItemCode: 'Codigo',
            ItemName: 'Nombre',
            Barcode: 'Codigo de Barras',
            Stock: 'Disponible',
            DistNumber: 'Numero de Serie'
          }
        }
      } as ISearchModalComponentDialogData<ItemsTransfer>
    }).afterClosed()
      .subscribe({
        next: (value) => {
          if (value) this.OnSelectItem(value)
        }
      });
  }

  /**
   * Handles keyboard input events globally, used for barcode scanning logic.
   *
   * - Ignores input if focus is on a text field.
   * - Buffers characters typed into `scannedCode`.
   * - When `Enter` is pressed, triggers the scan process if a source warehouse is selected.
   * - Uses an observable (`onScanCode$`) to emit the scanned code.
   *
   * @param _event - The global keyboard event captured via HostListener.
   */
  @HostListener('window:keydown', ['$event'])
  async HandleScannerInput(_event: KeyboardEvent): Promise<void>
  {
    if (_event.target instanceof HTMLInputElement) {
      return ;
    } else {
      if(this.requestingItem) return;

      if(_event.key == 'Enter')
      {
        let value = this.documentForm.value;
        if(value.FromWarehouse == undefined){
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `Debes seleccionar primero un almacén de origen para poder usar la función de Scaneo`
          });
          return;
        }
        this.onScanCode$.next(this.scannedCode);

        this.scannedCode = '';
      }
      else if(_event.key.length == 1)
      {
        this.scannedCode += _event.key;
      }
    }
  }

  /**
   * Subscribes to the `onScanCode$` observable and handles scanned item lookups.
   *
   * - Triggers a service call to fetch item data based on the scanned code and selected warehouse/bin location.
   * - Updates the item list and auto-selects the first item if found.
   * - Displays appropriate user feedback if the item is not found or an error occurs.
   * - Shows/hides a loading overlay and manages a flag to prevent concurrent scan requests.
   */
  ListenScan(): void
  {
    this.onScanCode$
      .pipe()
      .subscribe({
        next: (response) => {
          this.requestingItem=true;
          this.overlayService.OnGet();
          let value = this.documentForm.value;
          this.itemsService.GetItemForTransferScan(value.FromWarehouse ?? 0, value.FromBinLocation ?? 0, response)
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
                message: `Error: ${err.Message}`
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

  /**
   * ValidateValueFormatSetting function.
   *
   * @param printSetting - Description of `printSetting`.
   * @param key - Description of `key`.
   * @returns any  - Description of the return value.
   */
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
      return this.reportsService.PrintReport(_docEntry, 'InventoryTransfer').pipe(
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
   * PostStockTransfersDrafts function.
   *
   * @param data - Description of `data`.
   * @returns void  - Description of the return value.
   */
  private PostStockTransfersDrafts(data: IStockTransfer): void {
    this.overlayService.OnPost();
    this.stockTransferService.PostStockTransfersDrafts(data, this.documentAttachment, this.attachmentFiles).pipe(
      map(res => {
        this.overlayService.Drop();
        return {
          DocEntry: res.Data.DocEntry,
          DocNum: res.Data.DocNum,
          NumFE: '',
          CashChange: 0,
          CashChangeFC: 0,
          Title: 'Preliminar Transferencia',
          TypeReport: 'Preliminary'
        } as ISuccessSalesInfo;
      }),
      switchMap(res => this.OpenDialogSuccessSales(res)),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: () => {
        this.RefreshData();
      },
      error: (err) => {
        this.modalService.Continue({
          title: 'Se produjo un error creando el preliminar de Transferencia de stock',
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }
}