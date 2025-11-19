import {AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit} from '@angular/core';
import {DropdownList, ICLTableButton, MapDisplayColumns, MappedColumns} from "@clavisco/table";
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
import {FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {
  catchError,
  filter,
  finalize,
  forkJoin,
  map, merge,
  Observable,
  of,
  startWith, Subject,
  Subscription,
  switchMap,
} from "rxjs";
import {ItemsTransfer} from "@app/interfaces/i-items";
import {IWarehouse} from "@app/interfaces/i-warehouse";
import {IActionButton} from "@app/interfaces/i-action-button";
import {AddValidatorAutoComplete, PrinterWorker, SharedService} from "@app/shared/shared.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AlertsService, CLModalType, CLToastType, ModalService, NotificationPanelService} from "@clavisco/alerts";
import {OverlayService} from "@clavisco/overlay";
import {MatDialog} from "@angular/material/dialog";
import {IStockTransferRowsSelected} from "@app/interfaces/i-stockTransfer";
import {ITransferRequestResolveData} from "@app/interfaces/i-resolvers";
import {ISalesPerson} from "@app/interfaces/i-sales-person";
import {LinkerEvent} from "@app/enums/e-linker-events";
import {CLPrint, DownloadBase64File, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import {IInputColumn, IRowByEvent} from "@clavisco/table/lib/table.space";
import {ItemsService} from "@app/services/items.service";
import {IStockTransferRequest, IStockTransferRequestRows} from "@app/interfaces/i-stockTransferRequest";
import {InventoryTrasferRequestService} from "@app/services/inventory-trasfer-request.service";
import {IUserAssign} from "@app/interfaces/i-user";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IUdf, IUdfContext, IUdfDevelopment, UdfSourceLine} from "@app/interfaces/i-udf";
import {environment} from "@Environment/environment";
import {IUserToken} from "@app/interfaces/i-token";
import {
  ActionDocument, FormatDate,
  GetIndexOnPagedTable,
  GetUdfsLines,
  MappingDefaultValueUdfsLines,
  MappingUdfsDevelopment,
  MappingUdfsLines,
  SetDataUdfsLines, SetUdfsLineValues,
  ValidateUdfsLines, ZoneDate
} from "@app/shared/common-functions";
import {IUniqueId, ULineMappedColumns} from "@app/interfaces/i-document-type";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {DynamicsUdfPresentation} from "@clavisco/dynamics-udfs-presentation";
import {CommonService} from "@app/services/common.service";
import {ISuccessSalesInfo} from "@app/interfaces/i-success-sales-info";
import {SuccessSalesModalComponent} from "@Component/sales/document/success-sales-modal/success-sales-modal.component";
import {WarehousesService} from "@app/services/warehouses.service";
import {SalesPersonService} from "@app/services/sales-person.service";
import {UdfsService} from "@app/services/udfs.service";
import {
  DocumentTypes,
  LineStatus,
  PermissionEditDocumentsDates,
  PreloadedDocumentActions,
  SettingCode
} from "@app/enums/enums";
import {ICompany} from "@app/interfaces/i-company";
import {
  IPaymentSetting,
  IPrintFormatSetting,
  ISettings,
  IValidateAttachmentsSetting,
  IValidateAutomaticPrintingsSetting, IValidateInventory, IValidateInventorySetting
} from "@app/interfaces/i-settings";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {PermissionService} from "@app/services/permission.service";
import {formatDate} from "@angular/common";
import {IAttachments2Line} from "@app/interfaces/i-business-partner";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";
import {AttachmentsService} from "@app/services/Attachments.service";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IDownloadBase64} from "@app/interfaces/i-files";
import {ReportsService} from "@app/services/reports.service";
import {PrinterWorkerService} from "@app/services/printer-worker.service";


@Component({
  selector: 'app-transfer-request',
  templateUrl: './inventory-transfer-request.component.html',
  styleUrls: ['./inventory-transfer-request.component.scss']
})
export class InventoryTransferRequestComponent implements OnInit, OnDestroy, AfterViewInit {

  /*Formularios*/
  documentForm!: FormGroup;
  onItemControlFocused$: Subject<string> = new Subject<string>();

  /*Observables*/
  allSubscriptions!: Subscription;
  items$!: Observable<ItemsTransfer[]>

  /*Objects*/
  userAssign!: IUserAssign | null;
  selectedCompany!: ICompany | null;
  setting!: ISettings;
  validatorItem: ValidatorFn = Validators.nullValidator;
  FromWarehouse!: IWarehouse | null
  ToWarehouse!: IWarehouse | null
  currentReport!: keyof IPrintFormatSetting;
  reportConfigured!:  IPrintFormatSetting;
  companyReportValidateAutomaticPrinting!: IValidateAutomaticPrintingsSetting;

  /*Tabla*/
  shouldPaginateRequest: boolean = false;
  lineTableId: string = "LINE-TABLE-TRANSFER-REQUEST";
  lineMappedColumns!: MappedColumns;
  InputColumns: IInputColumn[] = [
    {ColumnName: 'Quantity', FieldType: 'number'}];
  dropdownDiffList: DropdownList = {};
  dropdownDiffBy = 'IdBinLocation';
  dropdownColumns: string[] = [];
  headerTableColumns: { [key: string]: string } = {
    Id: '#',
    ItemCode: 'Código',
    ItemDescription: 'Descripción',
    Quantity: 'Cantidad',
    FromNameWhsCode: 'Almacén Origen',
    ToNameWarehouse: 'Almacén Destino',
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
    LineNum: ''
  };
  //mapped Table
  lineMappedDisplayColumns: ULineMappedColumns<IStockTransferRowsSelected, IPermissionbyUser> = {

    dataSource: [] as IStockTransferRowsSelected[],
    inputColumns: this.InputColumns,
    renameColumns: this.headerTableColumns,
    stickyColumns: [
      {Name: 'Options', FixOn: 'right'}
    ],
    ignoreColumns: ['WarehouseCode', 'FromWarehouseCode', 'SerialNumbers', 'BatchNumbers', 'StockTransferLinesBinAllocations',
      'Stock', 'ManSerNum', 'ManBtchNum', 'LineNum', 'SysNumber', 'BinActivat',
      'LocationsFrom', 'LocationsTo', 'OnHandByBin', 'BaseType', 'BaseEntry', 'BaseLine', 'BinAbsOrigin', 'BinAbsDestino', 'Udfs', 'IdBinLocation', 'LineStatus']
  };

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };

  /*Listas*/
  actionButtons: IActionButton[] = [];
  warehouses: IWarehouse[] = [];
  salesPersons: ISalesPerson[] = [];
  lines: IStockTransferRowsSelected[] = [];
  tableButtons: ICLTableButton[] = [];
  items: ItemsTransfer[] = [];
  itemModal: ItemsTransfer[] = [];
  udfsLines: IUdfContext[] = [];
  permissions: IPermissionbyUser[] = [];
  settings: ISettings[] = [];
  companyPrintFormat: IPrintFormatSetting[] = [];
  companyValidateAutomaticPrinting: IValidateAutomaticPrintingsSetting[] = [];

  /*Variable*/
  //#region Reasignación de índices que no estén en ocupados para editar documentos
  indexMaxUpdate: number = -1;
  IndexMinUpdate: number = 0;
  //#endregion
  blockInput: boolean = false;
  docEntry: number = 0;
  docNum: number = 0;
  hasCompanyAutomaticPrinting: boolean = false;

  //#region Udfs
  uniqueId!: string;
  udfsDevelopment: IUdfDevelopment[] = []
  udfsDataHeader: IUdf[] = [];
  udfsLinesValue: UdfSourceLine[] = [];
  udfsValue: IUdf[] = [];
  UdfsId: string = 'Udf';
  Title: string = 'Udfs';
  ApiUrl: string = environment.apiUrl;
  DBODataEndPoint: string = 'OWTQ';
  isVisible: boolean = true;
  disableDragAndDrop: boolean = false;
  Token: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.access_token || "";
  preloadedDocActionType?: PreloadedDocumentActions;
  canChangeDocDate: boolean = true;
  canChangeDocDueDate: boolean = true;
  canChangeTaxDate: boolean = true;
  isButtonModalDisabled: boolean = true;
  //#endregion

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
  attachmentTableId: string = "InvetoryTransDocumentAttachmentTableId";
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
   * Indicates whether the current operation is a draft.
   *
   * @type {boolean}
   * @default false
   *
   * This property is used to determine if the current document or operation
   * is being saved as a draft. When set to `true`, the operation is considered
   * a draft, and when set to `false`, it is considered a finalized operation.
   */
  isDrafts: boolean = false;

  vldInventoryCompany: IValidateInventorySetting[] = [];
  vldInventory!: IValidateInventory;

  constructor(
    private fb: FormBuilder,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private alertsService: AlertsService,
    private router: Router,
    private overlayService: OverlayService,
    private matDialog: MatDialog,
    private itemsService: ItemsService,
    private inventoryTransferRequestService: InventoryTrasferRequestService,
    private commonService: CommonService,
    private warehousesService: WarehousesService,
    private salesPersonService: SalesPersonService,
    private udfsService: UdfsService,
    private modalService: ModalService,
    private permisionService: PermissionService,
    private attachmentService: AttachmentsService,
    private reportsService: ReportsService,
    private printerWorkerService: PrinterWorkerService,
  ) {

    this.lineMappedColumns = MapDisplayColumns(this.lineMappedDisplayColumns);
    this.allSubscriptions = new Subscription();
    this.attachmentLineMappedColumns = MapDisplayColumns(this.attachmentLineMappedColumnsArgs as any);
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (this.docEntry && this.docEntry > 0) {
        this.router.navigateByUrl('/').then(() => {
          this.router.navigate(['inventory', 'transfer-request']);
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

    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.userAssign = Repository.Behavior.GetStorageObject<IUserAssign>(StorageKey.CurrentUserAssign);
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);

    this.InitForm();

    Register<CL_CHANNEL>(LinkerEvent.ActionButton, CL_CHANNEL.OUTPUT, this.OnActionButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT, this.OnTableActionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.lineTableId, CL_CHANNEL.OUTPUT_3, this.EventColumn, this.callbacks);
    Register(this.UdfsId, CL_CHANNEL.OUTPUT, this.OnClickUdfEvent, this.callbacks);
    Register<CL_CHANNEL>(this.UdfsId, CL_CHANNEL.OUTPUT_2, this.ContentUdf, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT, this.OnAttachmentTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.attachmentTableId, CL_CHANNEL.OUTPUT_3, this.OnAttachmentTableRowModified, this.callbacks);
    Register<CL_CHANNEL>(this.searchItemModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalItemRequestRecords, this.callbacks);


    this.actionButtons = [
      {
        Key: 'ADD',
        MatIcon: 'save',
        Text: 'Crear',
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

    this.LoadInitialData();
    this.InitAutocomplete();
    this.ValidatePermissionToEditDate();
    this.ListenScan();

    if (this.ValidateAttachmentsTables) {
      let setting = this.ValidateAttachmentsTables.Validate.find(value => value.Table == DocumentTypes.Transfer)
      if (setting) {
        if ('Active' in setting) {
          this.IsVisibleAttachTable = setting.Active != true ? false : true;
        } else {
          this.IsVisibleAttachTable = false;
        }
      }
    }

    if(this.companyReportValidateAutomaticPrinting){
      let settingValidateAutomaticPrinting = this.companyReportValidateAutomaticPrinting.Validate.find(value => value.Table === DocumentTypes.Transfer);
      this.hasCompanyAutomaticPrinting = settingValidateAutomaticPrinting?.Active || false;
    }
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
      RecordsCount: this.lines.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.lineTableId
    });
  }

  /**
   * Method to update a table record
   * @param _event - Event emitted from the table to edit
   * @constructor
   */
  private EventColumn = (_event: ICLEvent): void => {
    try {
      const ALL_RECORDS = JSON.parse(_event.Data) as IRowByEvent<IStockTransferRowsSelected>;
      if (+(ALL_RECORDS.Row.Quantity) <= 0) {
        this.InflateTableLines();
        return;
      }

      if (ALL_RECORDS.EventName === 'Dropped') {
        this.InflateTableLines();
        return;
      }

      let INDEX = GetIndexOnPagedTable(ALL_RECORDS.ItemsPeerPage, ALL_RECORDS.RowIndex, ALL_RECORDS.CurrentPage + 1);

      this.EditRow(ALL_RECORDS.Row, INDEX);
      this.InflateTableLines();
    } catch (error) {
      CLPrint({data: error, clType: CL_DISPLAY.ERROR});
    }
  }

  /**
   * Deletes a row from the lines array and updates related dropdown values.
   *
   * @param _index - The index of item to be deleted.
   */
  private DeleteRow(_index: number): void {
    if (this.lines && this.lines.length > 0) {

      // Update the dropdown list by filtering out values associated with the deleted item
      Object.keys(this.dropdownDiffList)?.forEach((key) => {
        this.dropdownDiffList[key] = this.dropdownDiffList[key]?.filter((x: any) => x.by !== this.lines[_index].IdBinLocation);
      });

      this.lines.splice(_index, 1);

      this.InflateTableLines();
    }
  }

  /**
   * Updates the quantity of a stock transfer row if it does not exceed available stock.
   * Shows an info toast if the entered quantity is greater than the available stock.
   *
   * @param _row - The selected stock transfer row with updated quantity.
   * @param _index - The index of the row in the lines array.
   */
  private EditRow(_row: IStockTransferRowsSelected, _index: number): void {
    if (_row.Quantity <= _row.Stock) {
      this.lines[_index].Quantity = _row.Quantity;
    } else {
      this.alertsService.Toast({type: CLToastType.INFO, message: `La cantidad ingresada supera el stock disponible. Disponible: ${_row.Stock}`})
    }
    this.lines[_index] = _row;
  }

  /**
   * Method to edit a table
   * @param _event - Event emitted in the table button when selecting a line
   * @constructor
   */
  private OnTableActionActivated = (_event: ICLEvent): void => {

    if (_event.Data) {
      const BUTTON_EVENT = JSON.parse(_event.Data);
      const ACTION = JSON.parse(BUTTON_EVENT.Data) as IStockTransferRowsSelected;

      switch (BUTTON_EVENT.Action) {
        case Structures.Enums.CL_ACTIONS.DELETE:
          this.DeleteRow((ACTION?.Id || 0) - 1);
          break;
      }
    }
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'ADD':
        this.isDrafts=false;
        this.OnSubmit();
        break;
      case 'CLEAN':
        this.Clear();
        break;
      case 'ADDPRE':
        this.isDrafts=true;
        this.OnSubmit();
        break;

    }
  }

  private Clear(): void {
    this.modalService.CancelAndContinue({
      type: CLModalType.QUESTION,
      title: `Está seguro de que desea limpiar campos?`,
    }).pipe(
      filter(res => res),
    ).subscribe({
      next: (callback) => {
        this.RefreshData();
        this.isButtonModalDisabled = true;
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });

  }

  private InitForm(): void {
    this.documentForm = this.fb.group({
      FromWarehouse: [null, [Validators.required]],
      ToWarehouse: [null, [Validators.required]],
      SalesPersonCode: [''],
      Comments: [''],
      Quantity: [1, [Validators.required, Validators.min(1)]],
      Item: [''],
      DocDate: ['', [Validators.required]],
      DueDate: ['', [Validators.required]],
      TaxDate: ['', [Validators.required]]
    });
  }

  private InitAutocomplete(): void {

    this.items$ = merge(this.onItemControlFocused$, this.documentForm.controls['Item'].valueChanges).pipe(
      startWith(''),
      map(value => {
        return this.FilterItems(value);
      }),
    );
  }

  private FilterItems(_value: string | ItemsTransfer): ItemsTransfer[] {
    if (typeof _value != 'string' && typeof _value != 'object')
      return [];

    if (typeof _value == 'object' && _value) {
      return this.GetItemsTypehead(_value.Typehead);
    }

    return this.GetItemsTypehead(_value || '');
  }

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

    }).sort((x, y) => x.Typehead.toLowerCase()
      .indexOf(_term.toLowerCase()) - y.Typehead.toLowerCase()
      .indexOf(_term.toLowerCase())
    ).slice(0, 50);
  }

  private LoadInitialData(): void {
    this.activatedRoute.data.subscribe({
      next: (res) => {
        const resolvedData = res['resolvedData'] as ITransferRequestResolveData;

        if (resolvedData) {
          this.warehouses = resolvedData.Warehouses ?? [];
          this.salesPersons = resolvedData.SalesPerson;
          this.udfsLines = resolvedData.UdfsLines;
          this.setting = resolvedData.Setting;
          this.settings = resolvedData.Settings;
          this.udfsLinesValue = resolvedData.UdfsData || [];
          this.udfsDataHeader = resolvedData.UdfsDataHeader || [];
          this.udfsDevelopment = resolvedData.UdfsDevelopment;
          this.permissions = resolvedData.Permissions || [];
          this.ValidateAttachmentsTables = resolvedData?.ValidateAttachmentsTables??undefined;

          let params = this.activatedRoute.snapshot.queryParams

          this.SetInitialData();
          this.documentAttachment.Attachments2_Lines = resolvedData.Attachments || [];

          if (params['Action']) {
            this.preloadedDocActionType = params['Action'] as PreloadedDocumentActions;
          }

          if (resolvedData.TransfersRequest) {
            this.SetDataForEdit(resolvedData.TransfersRequest);
            this.items = resolvedData.Items;
          }

          if (this.preloadedDocActionType === PreloadedDocumentActions.EDIT) {
            this.actionButtons = [
              {
                Key: 'ADD',
                MatIcon: 'edit',
                Text: 'Actualizar',
                MatColor: 'primary'
              },
              {
                Key: 'CLEAN',
                MatIcon: 'mop',
                Text: 'Limpiar'
              }
            ];
            if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsTransferRequestCreateDraft)) {
              this.actionButtons = [{
                Key: 'ADDPRE',
                MatIcon: 'draft',
                Text: 'Crear preliminar',
                MatColor: 'primary',
                DisabledIf: (_form?: FormGroup) => _form?.invalid || false
              }, ...this.actionButtons]
            }
          } else {
            this.actionButtons = [
              {
                Key: 'ADD',
                MatIcon: 'save',
                Text: 'Crear',
                MatColor: 'primary'
              },
              {
                Key: 'CLEAN',
                MatIcon: 'mop',
                Text: 'Limpiar'
              }
            ];
              if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsTransferRequestCreateDraft)) {
                this.actionButtons = [{
                  Key: 'ADDPRE',
                  MatIcon: 'draft',
                  Text: 'Crear preliminar',
                  MatColor: 'primary',
                  DisabledIf: (_form?: FormGroup) => _form?.invalid || false
                }, ...this.actionButtons];
              }
          }

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
   * Validates if the current user has permissions to edit the document date
   * @constructor
   * @private
   */
  private ValidatePermissionToEditDate(): void {
    this.canChangeDocDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsTransferRequestChangeDocDate);
    this.canChangeDocDueDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsTransferRequestChangeDocDueDate);
    this.canChangeTaxDate = this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsTransferRequestChangeTaxDate);
    if (!this.canChangeDocDate) {
      this.documentForm.controls['DocDate'].disable();
    }
    if (!this.canChangeDocDueDate) {
      this.documentForm.controls['DueDate'].disable();
    }
    if (!this.canChangeTaxDate) {
      this.documentForm.controls['TaxDate'].disable();
    }

  }

  public DisplayFnItem(_item: ItemsTransfer): string {
    return _item && Object.keys(_item).length ? `${_item.ItemCode} - ${_item.ItemName}` : '';
  }

  public GetItems(_whsCode: string): void {

    this.overlayService.OnGet();
    this.itemsService.GetItemForTransferRequest(_whsCode).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.items = callback.Data;
        this.validatorItem = AddValidatorAutoComplete(this.documentForm, callback.Data, 'Item', this.validatorItem);
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

  /**
   * Resets the document to its initial state, clearing all data and configurations.
   */
  private ResetDocument(): void {
    try {
      this.preloadedDocActionType = undefined;
      if (this.docEntry > 0) {
        this.router.navigate(['inventory', 'transfer-request']);
        this.actionButtons = [
          {
            Key: 'ADD',
            MatIcon: 'save',
            Text: 'Crear',
            MatColor: 'primary'
          },
          {
            Key: 'CLEAN',
            MatIcon: 'mop',
            Text: 'Limpiar'
          }
        ];
        if(this.permissions.some(x => x.Name === PermissionEditDocumentsDates.InventoryDocumentsTransferRequestCreateDraft)) {
          this.actionButtons = [{
            Key: 'ADDPRE',
            MatIcon: 'draft',
            Text: 'Crear preliminar',
            MatColor: 'primary',
            DisabledIf: (_form?: FormGroup) => _form?.invalid || false
          }, ...this.actionButtons]
        }
      }

      this.dropdownDiffList = {};
      this.uniqueId = this.commonService.GenerateDocumentUniqueID();
      this.docEntry = 0;
      this.docNum = 0;
      this.documentForm.reset();
      this.documentForm.controls['SalesPersonCode'].setValue(+(this.userAssign?.SlpCode || -1));
      this.documentForm.controls['Quantity'].setValue(1);
      this.lines = [];
      this.udfsValue = [];
      this.FromWarehouse = null;
      this.ToWarehouse = null;
      this.InflateTableLines();
      this.CleanFields();
      this.isDrafts=false;
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

  /**
   * Method to load data
   * @private
   */
  private RefreshData(): void {
    if (this.docEntry && this.docEntry > 0) {
      this.ResetDocument();
      return;
    }

    this.overlayService.OnGet();

    forkJoin({
      Warehouses: this.warehousesService.Get<IWarehouse[]>(),
      SalesPerson: this.salesPersonService.Get<ISalesPerson[]>(),
      UdfsLine: this.udfsService.Get<IUdfContext[]>('OWTQ', true, true)
        .pipe(catchError(res => of(null))),
      UdfsDevelopment: this.udfsService.GetUdfsDevelopment('OWTQ')
        .pipe(catchError(res => of(null))),
      Permissions: this.permisionService.Get<IPermissionbyUser[]>()
    })
      .pipe(finalize(() => this.overlayService.Drop())).subscribe({
      next: (res => {
        this.warehouses = res.Warehouses.Data;
        this.salesPersons = res.SalesPerson.Data;
        this.udfsLines = res.UdfsLine?.Data ?? [];
        this.udfsDevelopment = res.UdfsDevelopment?.Data ?? [];
        this.permissions = res.Permissions.Data ?? [];

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

  private CleanFields(): void {
    if (this.isVisible) {
      this.linkerService.Publish({
        Target: this.UdfsId,
        Data: '',
        CallBack: CL_CHANNEL.RESET
      });
    }
  }

  private OnSubmit(): void {
    if (this.isVisible)
      this.GetConfiguredUdfs();
    else this.SaveChanges();
  }

  private SaveChanges(): void {

    if (!this.ValidateUdfsLines()) return;
    if (!this.lines || this.lines.length === 0) {
      this.alertsService.Toast({type: CLToastType.INFO, message: `No se han ingresado líneas.`});
      return;
    }

    if(this.vldInventory.ValidateInventory){
      //Valido l acantidad disponible ya sea por almacen o ubicaion
      let index = this.lines.findIndex(x => x.Quantity > x.Stock);

      if (index >= 0) {
        let rowItem = this.lines[index];
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `El ítem ${rowItem.ItemCode}, en la línea ${(index + 1)} no puede tener una cantidad mayor al disponible. Disponible: ${rowItem.Stock}.`
        });
        return;
      }
    }

    this.SetUdfsDevelopment();
    let form = this.documentForm.value;

    let data = {
      DocEntry: this.preloadedDocActionType === PreloadedDocumentActions.EDIT ? this.docEntry : 0,
      DocNum: 0,
      Comments: form.Comments,
      FromWarehouse: this.FromWarehouse?.WhsCode,
      ToWarehouse: this.ToWarehouse?.WhsCode,
      SalesPersonCode: form.SalesPersonCode,
      Udfs: this.udfsValue,
      DocDate: FormatDate(form.DocDate),
      DueDate: FormatDate(form.DueDate),
      TaxDate: FormatDate(form.TaxDate)
    } as IStockTransferRequest

    let IsUpdate = false;

    if (this.docEntry > 0 && this.preloadedDocActionType === PreloadedDocumentActions.EDIT) {
      IsUpdate = true;
      if ((this.lines.length - 1) < this.IndexMinUpdate) {
        this.indexMaxUpdate = -1;
      }
    }


    data.StockTransferLines = this.lines.map(element => {
      element.LineNum == -1 ? this.indexMaxUpdate = this.indexMaxUpdate + 1 : this.indexMaxUpdate;
      return {
        ItemCode: element.ItemCode,
        ItemDescription: element.ItemDescription,
        Quantity: element.Quantity,
        WarehouseCode: element.WarehouseCode,
        FromWarehouseCode: element.FromWarehouseCode,
        SerialNumbers: element.SerialNumbers,
        Udfs: GetUdfsLines(element, this.udfsLines),
        LineNum: IsUpdate ? element.LineNum == -1 ? this.indexMaxUpdate : element.LineNum : element.LineNum,
      } as IStockTransferRequestRows;
    })


    let request$;
    let currentAction = 'creada';
    let currentActionError = 'creando';

    this.overlayService.OnPost();

    if (this.docEntry > 0 && this.preloadedDocActionType === PreloadedDocumentActions.EDIT && !this.isDrafts) {
      request$ = this.inventoryTransferRequestService.Patch(data, this.documentAttachment, this.attachmentFiles);
      currentAction = 'actualizada';
      currentActionError = 'actualizando';
    } else {
      if(this.isDrafts){
        request$ = this.inventoryTransferRequestService.PostInventoryTransferRequestsDrafts(data, this.documentAttachment, this.attachmentFiles);
      }else{
        request$ = this.inventoryTransferRequestService.Post(data, this.documentAttachment, this.attachmentFiles);
      }
    }

    request$.pipe(
      switchMap(res => {
        if (res && res.Data) {
          if(this.hasCompanyAutomaticPrinting){
            return this.PrintInvoiceDocument(res.Data.DocEntry).pipe(
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
        return {
          DocEntry: this.docEntry > 0 && this.preloadedDocActionType === PreloadedDocumentActions.EDIT && !this.isDrafts ? this.docEntry : res?.Data.DocEntry,
          DocNum: this.docEntry > 0 && this.preloadedDocActionType === PreloadedDocumentActions.EDIT && !this.isDrafts ? this.docNum : res?.Data.DocNum,
          NumFE: '',
          CashChange: 0,
          CashChangeFC: 0,
          Title: this.isDrafts ? 'Preliminar solicitud de transferencia':'Solicitud de transferencia',
          Accion: currentAction,
          TypeReport: this.isDrafts ? 'Preliminary' : 'InventoryTransferRequest'
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
          title: `Se produjo un error ${currentActionError} la Solicitud de transferencia`,
          subtitle: GetError(err),
          type: CLModalType.ERROR
        });
      }
    });
  }

  public OnSelectItem(_item: ItemsTransfer): void {

    this.blockInput = true;

    try {
      let cant = +this.documentForm.controls['Quantity'].value;

      if (cant <= 0) {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `Cantidad permitida mayor a 0`
        });
        this.sharedService.EmitEnableItem();
        return;
      }
      if (!this.ValidateData()) {
        setTimeout(() => {
          this.documentForm.controls['Item'].setValue(null);
          this.blockInput = false;
        }, 0)
        return;
      }


      if (this.lines.some(x => x.ItemCode === _item.ItemCode && x.FromWarehouseCode === this.FromWarehouse?.WhsCode && x.ManSerNum !== 'Y')) {

        let index = this.lines.findIndex(x => x.ItemCode === _item.ItemCode && x.FromWarehouseCode === this.FromWarehouse?.WhsCode)
        if (index >= 0) {
          this.lines[index].Quantity += cant;
        }

      } else {
        let idBinLocation = this.lines && this.lines.length > 0 ? Math.max(...this.lines.map(x => (x.IdBinLocation || 0))) + 1 : 1;

        let item = {
          ItemCode: _item.ItemCode,
          ItemDescription: _item.ItemName,
          Quantity: cant,
          WarehouseCode: this.ToWarehouse?.WhsCode,
          FromWarehouseCode: this.FromWarehouse?.WhsCode,
          SerialNumbers: _item.ManSerNum === 'Y' ? [{SystemSerialNumber: _item.SysNumber, Quantity: 1}] : [],
          BatchNumbers: [],
          StockTransferLinesBinAllocations: [],
          FromNameWhsCode: (this.FromWarehouse?.WhsName || ''),
          ToNameWarehouse: (this.ToWarehouse?.WhsName || ''),
          DistNumber: _item.ManSerNum === 'Y' ? _item.DistNumber : 'N/A',
          SysNumber: _item.ManSerNum === 'Y' ? _item.SysNumber : 0,
          Stock: +(_item.Stock),
          ManSerNum: _item.ManSerNum,
          ManBtchNum: _item.ManBtchNum,
          LineNum: -1,
          BinActivat: '',
          LocationsTo: [],
          LocationsFrom: [],
          LineStatus: LineStatus.bost_Open,
          IdBinLocation: idBinLocation,
          Udfs: []
        } as IStockTransferRowsSelected;

        if (this.udfsLines?.length) {
          SetUdfsLineValues(this.udfsLines, item, this.dropdownDiffList, true);
          MappingDefaultValueUdfsLines(item, this.udfsLines);
        }


        this.lines.push(item);
      }


      this.InflateTableLines();

    } catch (Exception) {
      CLPrint({data: Exception, clDisplay: CL_DISPLAY.ERROR});
    } finally {
      this.documentForm.controls['Item'].setValue(null);
    }
  }

  private ValidateData(): boolean {

    if (this.documentForm.invalid) {
      this.alertsService.Toast({type: CLToastType.INFO, message: `Por favor ingrese los datos del encabezado.`});
      return false;
    }

    if (this.FromWarehouse?.WhsCode === this.ToWarehouse?.WhsCode) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El almacén de origen y destino no pueden ser el mismo.`
      });
      return false;
    }

    return true;
  }

  /**
   * Load data from request to edit
   * @param _data
   * @constructor
   * @private
   */
  private SetDataForEdit(_data: IStockTransferRequest): void {

    try {
      this.FromWarehouse = this.warehouses.find(warehouse => warehouse.WhsCode == _data.FromWarehouse) || null;
      this.ToWarehouse = this.warehouses.find(warehouse => warehouse.WhsCode == _data.ToWarehouse) || null;

      this.documentForm.patchValue({
        Comments: _data.Comments,
        SalesPersonCode: _data.SalesPersonCode,
        Quantity: 1,
        FromWarehouse: this.FromWarehouse?.WhsName,
        ToWarehouse: this.ToWarehouse?.WhsName,
        DocDate: _data.DocDate,
        DueDate: _data.DueDate,
        TaxDate: _data.TaxDate
      })

      this.docEntry = _data.DocEntry;
      this.docNum = _data.DocNum;
      this.indexMaxUpdate = _data?.StockTransferLines.reduce((acc, i) => (i.BaseLine > acc.BaseLine ? i : acc)).BaseLine || 0;
      this.IndexMinUpdate = _data?.StockTransferLines.reduce((acc, i) => (i.BaseLine < acc.BaseLine ? i : acc)).BaseLine || 0;

      this.lines = _data.StockTransferLines.map((element, index) => {
        let data = {
          ItemCode: element.ItemCode,
          ItemDescription: element.ItemDescription,
          Quantity: element.Quantity,
          WarehouseCode: element.WarehouseCode,
          FromWarehouseCode: element.FromWarehouseCode,
          SerialNumbers: [],
          BatchNumbers: [],
          BaseType: '',
          BaseLine: element.BaseLine,
          BaseEntry: 0,
          StockTransferLinesBinAllocations: [],
          FromNameWhsCode: this.GetWhsName(element.FromWarehouseCode),
          ToNameWarehouse: this.GetWhsName(element.WarehouseCode),
          SysNumber: 0,
          DistNumber: '',
          Stock: element.Stock,
          ManSerNum: element.ManSerNum,
          ManBtchNum: element.ManBtchNum,
          LineNum: element.BaseLine,
          BinActivat: '',
          BinAbsOrigin: -1,
          BinAbsDestino: -1,
          LocationsFrom: [],
          LocationsTo: [],
          OnHandByBin: [],
          LineStatus: element.LineStatus,
          IdBinLocation: index+1,
          Udfs: []
        } as IStockTransferRowsSelected

        if (this.udfsLines?.length) {
          SetUdfsLineValues(this.udfsLines, data, this.dropdownDiffList, true);
        }

        return data;

      });

      if (this.udfsLines && this.udfsLines.length > 0) {
        SetDataUdfsLines(this.lines, this.udfsLinesValue, this.headerTableColumns);
      }

      this.InflateTableLines();
      this.GetItems(this.FromWarehouse?.WhsCode || '');

    } catch (Exception) {
      CLPrint({data: Exception, clDisplay: CL_DISPLAY.ERROR});
    }
  }

  private GetWhsName(_whsCode: string): string {
    return this.warehouses.find(x => x.WhsCode === _whsCode)?.WhsName || '';
  }

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

  private SetUdfsDevelopment(): void {
    MappingUdfsDevelopment<IUniqueId>({uniqueId: this.uniqueId} as IUniqueId, this.udfsValue, this.udfsDevelopment);
  }

  //#endregion

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

  private SetInitialData(): void {

    //#region SETEO INICIAL

    this.documentForm.controls['SalesPersonCode'].setValue(+(this.userAssign?.SlpCode || -1));
    this.documentForm.controls['DocDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['DueDate'].setValue(new Date(ZoneDate()));
    this.documentForm.controls['TaxDate'].setValue(new Date(ZoneDate()));

    //#endregion


    //#region DESACTIVAR EL DRAG AND DROP

    if (this.setting && this.setting.Json) {
      let data = JSON.parse(this.setting.Json) as IPaymentSetting[];
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

    //#region VALIDACION DE INVENTARIO

    if (this.settings.find((element) => element.Code == SettingCode.ValidateInventory)) {
      this.vldInventoryCompany = JSON.parse(this.settings.find((element) => element.Code == SettingCode.ValidateInventory)?.Json || '');
    }

    if (this.vldInventoryCompany && this.vldInventoryCompany.length > 0) {

      let dataInventoryCompany = this.vldInventoryCompany.find(x => x.CompanyId === this.selectedCompany?.Id) as IValidateInventorySetting;

      if (dataInventoryCompany && dataInventoryCompany.Validate.length > 0) {

        this.vldInventory = dataInventoryCompany.Validate.filter(x => x.Table === DocumentTypes.TransferRequest)[0] ?? {} as IValidateInventory;
      }
    }
    //#endregion
  }

  /**
   * Listening event of component search-modal
   * @param _event - Event gets data from modal
   * @constructor
   */
  OnModalRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    this.overlayService.OnGet();
    this.warehousesService.GetbyFilter<IWarehouse[]>(VALUE?.SearchValue)
      .pipe(finalize(() => this.overlayService.Drop())
      ).subscribe({
      next: (callback) => {
        this.warehouses = callback.Data;

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
      Records: this.warehouses,
      RecordsCount: this.warehouses.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  OnModalItemRequestRecords = (_event: ICLEvent): void => {
    const VALUE = JSON.parse(_event.Data);
    let value = this.FromWarehouse?.WhsCode;
    this.overlayService.OnGet();
    this.itemsService.GetItemForTransferRequestPagination(value ?? "", VALUE.SearchValue ?? "").pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.itemModal = callback.Data;
        this.InflateTableItems()
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    });
  }

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
   * Show business partner search modal
   * @constructor
   */
  ShowModalSearchWarehouses(_isFromWarehouses: boolean): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de almacenes',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: ['BinActivat'],
          RenameColumns: {
            WhsCode: 'Codigo',
            WhsName: 'Nombre',
          }
        }
      } as ISearchModalComponentDialogData<IWarehouse>
    }).afterClosed()
      .subscribe({
        next: (value: IWarehouse) => {
          if (value) {
            if (_isFromWarehouses) {
              this.FromWarehouse = value;
              this.documentForm.patchValue({FromWarehouse: value.WhsName});
              this.GetItems(this.FromWarehouse.WhsCode);
              this.isButtonModalDisabled = false;
            } else {
              this.ToWarehouse = value;
              this.documentForm.patchValue({ToWarehouse: value.WhsName});
            }
          }
        }
      });
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

  ShowModalSearchItem() {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchItemModalId,
        ModalTitle: 'Lista ítems',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest : true,
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
          if (value) {
            this.OnSelectItem(value)
          }
        }
      });
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
        let value = this.FromWarehouse?.WhsCode;
        if(value == undefined ){
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

  ListenScan(): void
  {
    this.onScanCode$
      .pipe()
      .subscribe({
        next: (response) => {
          this.requestingItem=true;
          this.overlayService.OnGet();
          let value = this.FromWarehouse?.WhsCode;
          this.itemsService.GetItemForTransferRequestScan(value ?? "", response)
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
      return this.reportsService.PrintReport(_docEntry, 'InventoryTransferRequest').pipe(
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
}


