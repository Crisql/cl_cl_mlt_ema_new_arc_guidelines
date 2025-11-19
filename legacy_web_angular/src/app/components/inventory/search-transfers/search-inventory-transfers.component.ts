import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown } from "@clavisco/linker";
import { AlertsService, CLModalType, CLToastType, ModalService } from "@clavisco/alerts";
import { OverlayService } from "@clavisco/overlay";
import { catchError, finalize, forkJoin, Observable, of, startWith, Subscription, switchMap } from "rxjs";
import { IActionButton } from "@app/interfaces/i-action-button";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { map } from "rxjs/operators";
import { ISalesPerson } from "@app/interfaces/i-sales-person";
import { IStructures } from "@app/interfaces/i-structures";
import { ICLTableButton, MapDisplayColumns, MappedColumns } from "@clavisco/table";
import {CLPrint, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import { TableData } from "@app/interfaces/i-table-data";
import { ISearchTransferRequestFilter } from "@app/interfaces/i-document-type";
import { InventoryTrasferRequestService } from "@app/services/inventory-trasfer-request.service";
import { formatDate } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ISearchTransfersRequestResolvedData } from "@app/interfaces/i-resolvers";
import {ControllerName, PreloadedDocumentActions, SettingCode} from "@app/enums/enums";
import { Copy, PrinterWorker, SharedService } from "@app/shared/shared.service";
import { SalesPersonService } from "@app/services/sales-person.service";
import { StructuresService } from "@app/services/structures.service";
import { IStockTransferRequest } from "@app/interfaces/i-stockTransferRequest";
import Validation from "@app/custom-validation/custom-validators";
import { IDownloadBase64 } from "@app/interfaces/i-files";
import { ReportsService } from "@app/services/reports.service";
import { PrinterWorkerService } from "@app/services/printer-worker.service";
import { MatTooltip } from '@angular/material/tooltip';
import { IPermissionbyUser } from '@app/interfaces/i-roles';
import {IPrintFormatSetting, ISettings} from "@app/interfaces/i-settings";
import {ICompany} from "@app/interfaces/i-company";
import {StorageKey} from "@app/enums/e-storage-keys";

@Component({
  selector: 'app-search-transfers',
  templateUrl: './search-inventory-transfers.component.html',
  styleUrls: ['./search-inventory-transfers.component.scss']
})
export class SearchInventoryTransfersComponent implements OnInit, OnDestroy {

  /*LISTAS*/
  actionButtons: IActionButton[] = [];
  documentStates: IStructures[] = [];
  documentStatesToShow!: IStructures[];
  documentTypes: IStructures[] = [];
  salesPersons: ISalesPerson[] = [];
  documents: IStockTransferRequest[] = [];
  userPermissions: IPermissionbyUser[] = [];

  /*TABLA*/
  shouldPaginateRequest: boolean = true;
  docTbColumns: { [key: string]: string } = {
    DocNum: 'Número de documento',
    DocDateFormatted: 'Fecha',
    DocStatus: 'Estado',
    SlpName: 'Encargado de compras',
    DocEntry: ''
  }
  buttons: ICLTableButton[] = [];
  tableButtons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: 'OWTQ,OWTR'
    },
    {
      Title: `Copiar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `file_copy`,
      Color: `primary`,
      Options: [
        {
          Title: `Transferencia de stock`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_2,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'OWTQ'
        }
      ],
      Data: 'OWTQ'
    },
    {
      Title: `Duplicar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_5,
      Icon: `note_add`,
      Color: `primary`,
      Data: 'OWTQ, OWTR'
    },
    {
      Title: `Imprimir`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_4,
      Icon: `print`,
      Color: `primary`,
      Data: 'OIGE,OIGN,OWTQ,OWTR'
    },
  ];

  documentsTableId: string = 'TABLE-SEARCH-INVENTORY';
  docTbMappedColumns!: MappedColumns;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;

  /*FORMULARIOS*/
  searchForm!: FormGroup;
  tooltip: MatTooltip | any;


  /*OBSERVABLES*/
  filteredSalesPersons$!: Observable<ISalesPerson[]>;
  controllerToSendRequest: string = '';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  hasItemsSelection: boolean = false;

  /**
   * List of print report
   */
  companyPrintFormat: IPrintFormatSetting[] = [];

  /**
   * Contains object for print report setting
   */
  reportConfigured!: IPrintFormatSetting;

  /**
   * Use to defined company selected
   */
  selectedCompany!: ICompany | null;

  /**
   * Contains object for setting
   */
  settings: ISettings[] = [];

  constructor(
    @Inject("LinkerService") private linkerService: LinkerService,
    private overlayService: OverlayService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private inventoryTransferRequestService: InventoryTrasferRequestService,
    private sharedService: SharedService,
    private salesPersonsService: SalesPersonService,
    private structuresService: StructuresService,
    private alertsService: AlertsService,
    private reportsService: ReportsService,
    private modalService: ModalService,
    private printerWorkerService: PrinterWorkerService
  ) {
    this.ConfigTableDocs();
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  private OnLoad(): void {
    this.InitForm();
    this.LoadInitialData();
    this.InitAutocomplete();
    this.SetValidatorAutoComplete();
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetRecords, this.callbacks);
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatColor: 'primary',
        MatIcon: 'search',
        Text: 'Buscar',
        DisabledIf: _form => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar'
      }
    ];
    this.allSubscriptions.add(this.sharedService.OnActionButtonClicked(this.OnActionButtonClicked));
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );
  }

  private LoadInitialData(): void {
    this.activatedRoute.data.subscribe({
      next: (data) => {
        const resolvedData = data['resolvedData'] as ISearchTransfersRequestResolvedData;

        this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);

        if (resolvedData) {
          this.salesPersons = resolvedData.SalesPersons;
          this.documentStates = resolvedData.DocStates;
          this.documentTypes = resolvedData.DocTypes;
          this.userPermissions = resolvedData.Permissions;

          this.settings = resolvedData.Settings;
          if (this.settings) {
            let printFormatsSetting = this.settings.find((element) => element.Code == SettingCode.PrintFormat);
            if (printFormatsSetting) {
              this.companyPrintFormat = JSON.parse(printFormatsSetting.Json || '');
            }
            if (this.companyPrintFormat && this.companyPrintFormat.length > 0) {
              let dataCompany = this.companyPrintFormat.find(x => x.CompanyId === this.selectedCompany?.Id) as IPrintFormatSetting;
              if (dataCompany) {
                this.reportConfigured = dataCompany;
              }
            }
          }
          
          this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
          this.OnChangeDocumentType();
        }
      }
    });

  }

  private InitForm(): void {
    this.searchForm = this.fb.group({
      SalesPerson: [''],
      Customer: [''],
      DocNum: [null],
      DocStatus: [null, Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocType: [null, Validators.required],
    });


  }

  SetValidatorAutoComplete(): void {
    this.searchForm.get('SalesPerson')?.addValidators(Validation.validateValueAutoComplete(this.salesPersons));
  }

  /**
   * Updates the document states based on the selected document type.
   * If the current document state is not valid for the selected type,
   * it sets the default document state.
   */
  GetDocStateByDocType() {
    let docType = this.searchForm.get('DocType')?.value || '';

    // Filters the document states based on the selected document type.
    this.documentStatesToShow = this.documentStates.filter(state =>
      !state.Prop1 || state.Prop1.split(',').map(s => s.trim()).includes(docType)
    );

    let docState = this.searchForm.get('DocStatus')?.value || '';

    // If the current document state is not in the filtered list, set the default state.
    if (!this.documentStatesToShow.some(state => state.Key == docState)) {
      this.searchForm.get('DocStatus')?.setValue(
        this.documentStatesToShow.find(ds => ds.Default)?.Key || ''
      );
    }
  }

  /**
   * Method to obtain inventory documents
   */
  private GetRecords = (): void => {

    let frmValue = this.searchForm.getRawValue() as ISearchTransferRequestFilter;

    this.overlayService.OnGet();
    this.inventoryTransferRequestService.GetDocuments<IStockTransferRequest>(
      this.controllerToSendRequest,
      (frmValue?.DocNum ?? 0),
      (frmValue?.SalesPerson?.SlpCode ?? 0),
      frmValue.DateFrom,
      frmValue.DateTo,
      frmValue.DocStatus
    ).pipe(
      finalize(() => this.overlayService.Drop())
    ).subscribe(
      {
        next: (callback => {
          this.documents = callback.Data.map(element => {
            return {
              ...element,
              DocDateFormatted: formatDate(element.DocDate, 'MMMM d, y hh:mm a', 'en'),
              DocStatus: element.DocStatus === 'C' ? 'Cerrado' : element.DocStatus === 'P'? 'Pagado': 'Abierto'
            }
          });

          const NEW_TABLE_STATE = {
            Records: this.documents,
            RecordsCount: this.documents.length
          };

          this.linkerService.Publish({
            CallBack: CL_CHANNEL.INFLATE,
            Target: this.documentsTableId,
            Data: JSON.stringify(NEW_TABLE_STATE)
          });
        }),
        error: (err) => {
          this.alertsService.ShowAlert({ HttpErrorResponse: err });
        }
      }
    );

  }

  private ConfigTableDocs(): void {
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.documents,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['DocEntry', 'SlpCode', 'DocDate'],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' }
      ],
    });
  }

  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted from the table buttons
   * @constructor
   */
  private OnTableButtonClicked = (_event: ICLEvent): void => {

    let data: TableData = JSON.parse(_event.Data);

    let rowSelectDocument: IStockTransferRequest = JSON.parse(data.Data);



    switch (data.Action) {

      case Structures.Enums.CL_ACTIONS.UPDATE:
        if (rowSelectDocument.DocStatus === 'Cerrado') {

          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }
        let typeDocuments: string = this.searchForm.controls['DocType'].value.toLowerCase();
        switch (typeDocuments) {
          case 'stocktransfers':
            this.sharedService.SetCurrentPage('Transferencia de stock');
            this.router.navigate(['inventory', 'transfer'], {
              queryParams: {
                DocEntry: rowSelectDocument.DocEntry,
                Action: PreloadedDocumentActions.EDIT
              }
            });
            break;
          case 'inventorytransferrequests':
            this.sharedService.SetCurrentPage('Solicitud de traslado');
            this.router.navigate(['inventory', 'transfer-request'], {
              queryParams: {
                DocEntry: rowSelectDocument.DocEntry,
                Action: PreloadedDocumentActions.EDIT
              }
            });
            break;
        }
        break
      case Structures.Enums.CL_ACTIONS.OPTION_2:

        if (rowSelectDocument.DocStatus === 'Cerrado') {

          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }
        this.sharedService.SetCurrentPage('Transferencia de stock');
        this.router.navigate(['inventory', 'transfer'], {
          queryParams: {
            DocEntry: rowSelectDocument.DocEntry,
            Action: PreloadedDocumentActions.COPY
          }
        });
        break;
      case Structures.Enums.CL_ACTIONS.OPTION_4:
        this.overlayService.OnGet();
        let printReport$: Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>> | null = null;
        
        switch (this.controllerToSendRequest) {
          case 'InventoryGenEntries':
            let validateInventoryGenEntries = this.ValidateValueFormatSetting(this.reportConfigured,'GoodsReceipt');
            if(validateInventoryGenEntries != null && validateInventoryGenEntries != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'GoodsReceipt');
            }
            break;
          case 'InventoryGenExits':
            let validateInventoryGenExits = this.ValidateValueFormatSetting(this.reportConfigured,'GoodsIssue');
            if(validateInventoryGenExits != null && validateInventoryGenExits != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'GoodsIssue');
            }
            break
          case 'StockTransfers':
            let validateStockTransfers = this.ValidateValueFormatSetting(this.reportConfigured,'InventoryTransfer');
            if(validateStockTransfers != null && validateStockTransfers != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'InventoryTransfer');
            }
            break;
          case 'InventoryTransferRequests':
            let validateInventoryTransferRequests = this.ValidateValueFormatSetting(this.reportConfigured,'InventoryTransferRequest');
            if(validateInventoryTransferRequests != null && validateInventoryTransferRequests != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'InventoryTransferRequest');
            }
            break;
        }

        if(printReport$ != null){
          printReport$?.pipe(
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
            finalize(() => this.overlayService.Drop()))
            .subscribe();
        } else {
          this.overlayService.Drop();
          this.alertsService.Toast({
            type: CLToastType.ERROR,
            message: 'No se ha configurado el formato de impresion para este documento.'
          });
        }
        break;
      case Structures.Enums.CL_ACTIONS.OPTION_5:
        let typeDocument: string = this.searchForm.controls['DocType'].value.toLowerCase();
        switch (typeDocument) {
          case 'stocktransfers':
            // printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'InventoryTransfer');
            this.sharedService.SetCurrentPage('Transferencia de stock');
            this.router.navigate(['inventory', 'transfer'], {
              queryParams: {
                DocEntry: rowSelectDocument.DocEntry,
                Action: PreloadedDocumentActions.DUPLICATE
              }
            });
            break;
          case 'inventorytransferrequests':
            this.sharedService.SetCurrentPage('Solicitud de traslado');
            this.router.navigate(['inventory', 'transfer-request'], {
              queryParams: {
                DocEntry: rowSelectDocument.DocEntry,
                Action: PreloadedDocumentActions.DUPLICATE
              }
            });
            break;
        }
        break
    }
  }

  /**
   * Initializes the autocomplete for the SalesPerson field.
   * Filters the list of salespersons based on the input value.
   */
  private InitAutocomplete(): void {
      this.filteredSalesPersons$ = this.searchForm.get('SalesPerson')!.valueChanges.pipe(
      startWith(''),
      map((value: string | ISalesPerson) => {
        return this.FilterSalesPersons(value);
      })
    );


  }

  private FilterSalesPersons(_value: string | ISalesPerson): ISalesPerson[] {

    if (typeof _value != 'string' && typeof _value != 'object')
      return [];

    if (typeof _value == 'object' && _value) {

      return this.salesPersons.filter(slp => slp.SlpCode === _value.SlpCode);
    }
    return this.salesPersons.filter(slp => (`${slp.SlpCode}${slp.SlpName}`).toLowerCase().includes(_value?.toLowerCase() || ''))
  }

  public DisplaySalesPersons(_salesPerson: ISalesPerson): string {
    return _salesPerson && Object.keys(_salesPerson).length ? `${_salesPerson.SlpCode} - ${_salesPerson.SlpName}` : '';
  }

  private SearchDocuments(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.documentsTableId,
      Data: ''
    });
  }

  public OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SearchDocuments();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  private Clear(): void {
    this.overlayService.OnGet();
    forkJoin({
      SalesPersons: this.salesPersonsService.Get<ISalesPerson[]>(),
      DocStates: this.structuresService.Get('DocStates'),
      DocType: this.structuresService.Get('DocTypesForSearchDocsInventory')
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback => {
          this.salesPersons = callback.SalesPersons.Data;
          this.documentStates = callback.DocStates.Data;
          this.documentTypes = callback.DocType.Data;
          this.ResetDocument();
          this.LoadForm();
          this.InitAutocomplete();
          this.SetValidatorAutoComplete();
          this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
          this.GetDocStateByDocType();
          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        }),
        error: (err) => {
          this.alertsService.ShowAlert({ HttpErrorResponse: err });
        }
      });
  }

  private ResetDocument(): void {
    this.documents = [];
    const EMPTY_TABLE_STATE = {
      Records: this.documents,
      RecordsCount: 0
    }
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(EMPTY_TABLE_STATE)
    });
  }

  /**
   * Handles changes in the document type selection.
   * Updates document states, validates the form, and filters action buttons accordingly.
   *
   * @param _event - Optional event parameter triggered on document type change.
   */
  OnChangeDocumentType(_event?: any): void {

    this.GetDocStateByDocType();

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    let docSearchForm: ISearchTransferRequestFilter = this.searchForm.value as ISearchTransferRequestFilter;

    this.controllerToSendRequest = docSearchForm.DocType;
    let filterButtonsFunction = (_type: 'OIGE' | 'OIGN' | 'OWTQ' | 'OWTR', _buttons: ICLTableButton[]): ICLTableButton[] => {
      return Copy<ICLTableButton[]>(_buttons).reduce((acc, val) => {
        if (val.Data?.includes(_type)) {
          val.Options = val.Options?.reduce((acc, val) => {
            if (val.Data?.includes(_type)) {
              acc.push(val);
            }
            return acc;
          }, [] as ICLTableButton[]);

          acc.push(val);
        }
        return acc;
      }, [] as ICLTableButton[]);
    }

    switch (docSearchForm.DocType) {
      case 'InventoryGenEntries':
        this.buttons = filterButtonsFunction('OIGN', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OIGN', this.buttons);
        break;
      case 'InventoryGenExits':
        this.buttons = filterButtonsFunction('OIGE', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OIGE', this.buttons);
        break;
      case 'InventoryTransferRequests':
        this.buttons = filterButtonsFunction('OWTQ', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OWTQ', this.buttons);
        break;
      case 'StockTransfers':
        this.buttons = filterButtonsFunction('OWTR', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OWTR', this.buttons);
        break;
    }

    if (this.controllerToSendRequest) {
      this.ResetDocument();
      // Emito un evento para que tabla establezca todos los datos de paginacion
      this.linkerService.Publish({
        CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
        Target: this.documentsTableId,
        Data: ''
      });
    }
  }

  FilterButtonsByPermission(_type: 'OIGE' | 'OIGN' | 'OWTQ' | 'OWTR', _buttons: ICLTableButton[]): ICLTableButton[] {
    let userPermissions = this.userPermissions.map(userPermission => userPermission.Name);
    const buttonsPermision: ICLTableButton[] = [];
    const permissionsMap: { [key: string]: { [key: string]: string } } = {
      'OWTQ': {
        'editar': 'Inventory_SearchTransfers_EditInventoryTransferRequest',
        'imprimir': 'Inventory_SearchTransfers_PrintInventoryTransferRequest',
        'copiar': 'Inventory_SearchTransfers_CopyInventoryTransferRequest',
        'duplicar': 'Inventory_SearchTransfers_DuplicateInventoryTransferRequest'
      },
      'OWTR': {
        'editar': 'Inventory_SearchTransfers_EditStockTransfers',
        'imprimir': 'Inventory_SearchTransfers_PrintStockTransfers',
        'duplicar': 'Inventory_SearchTransfers_DuplicateStockTransfers'
      },
      'OIGE': {
        'imprimir': 'Inventory_SearchTransfers_PrintInventoryEntries'
      },
      'OIGN': {
        'imprimir': 'Inventory_SearchTransfers_PrintInventoryExits'
      }
    };
    if (permissionsMap[_type]) {
      _buttons.forEach(button => {
        const permission = permissionsMap[_type][button.Title.toLowerCase()];
        if (permission && userPermissions.includes(permission)) {
          buttonsPermision.push(button);
        }
      });
    }
    return buttonsPermision;
  }

  LoadForm(): void {
    this.searchForm = this.fb.group({
      SalesPerson: [''],
      Customer: [''],
      DocNum: [null],
      DocStatus: [null, Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocType: [null, Validators.required],
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
}
