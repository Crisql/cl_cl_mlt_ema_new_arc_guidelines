import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IBusinessPartner } from "../../../interfaces/i-business-partner";
import { catchError, finalize, forkJoin, Observable, of, Subscription, switchMap } from "rxjs";
import { ISalesPerson } from "../../../interfaces/i-sales-person";
import { delay, map } from "rxjs/operators";
import { ISearchPurchaseDocumentsResolvedData } from "../../../interfaces/i-resolvers";
import { CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown } from "@clavisco/linker";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { OverlayService } from "@clavisco/overlay";
import { IStructures } from "../../../interfaces/i-structures";
import { IActionButton } from "../../../interfaces/i-action-button";
import { ICLTableButton, MapDisplayColumns, MappedColumns } from "@clavisco/table";
import { IDocument } from "../../../interfaces/i-sale-document";
import {CLPrint, GetError, PrintBase64File, Repository, Structures} from "@clavisco/core";
import { IPurchaseDocumentSearchFilter } from "../../../interfaces/i-document-type";
import { PurchaseSearchDocsService } from "../../../services/purchase-search-docs.service";
import {
  AlertsService,
  CLModalType,
  CLToastType,
  ModalService,
} from "@clavisco/alerts";
import { formatDate } from "@angular/common";
import { Copy, PrinterWorker, SharedService } from "../../../shared/shared.service";
import { TableData } from "../../../interfaces/i-table-data";
import {
  ControllerName,
  CopyFrom,
  PreloadedDocumentActions,
  PurchaseTypeDocuments,
  SettingCode
} from "../../../enums/enums";
import { SalesPersonService } from "@app/services/sales-person.service";
import { SuppliersService } from "@app/services/suppliers.service";
import { StructuresService } from "@app/services/structures.service";
import Validation from "@app/custom-validation/custom-validators";
import { ReportsService } from "@app/services/reports.service";
import { IDownloadBase64 } from "@app/interfaces/i-files";
import { PrinterWorkerService } from "@app/services/printer-worker.service";
import { ISearchModalComponentDialogData, SearchModalComponent } from "@clavisco/search-modal";
import { MatDialog } from "@angular/material/dialog";
import { DocPreviewComponent } from "@Component/sales/search-docs/doc-preview/doc-preview.component";
import { IPreviewDocumentDialogData } from "@app/interfaces/i-dialog-data";
import { MatTooltip } from '@angular/material/tooltip';
import { IPermissionbyUser } from '@app/interfaces/i-roles';
import {ICompany} from "@app/interfaces/i-company";
import {IPrintFormatSetting, ISettings} from "@app/interfaces/i-settings";
import {StorageKey} from "@app/enums/e-storage-keys";

@Component({
  selector: 'app-order',
  templateUrl: './purchase-search-docs.component.html',
  styleUrls: ['./purchase-search-docs.component.scss']
})
export class PurchaseSearchDocsComponent implements OnInit, OnDestroy, AfterViewInit  {

  /*LISTAS**/
  documentStates: IStructures[] = [];
  documentStatesToShow!: IStructures[];
  documents: IDocument[] = [];
  customers: IBusinessPartner[] = [];
  DefaultBusinessPartner!: IBusinessPartner | null
  salesPersons: ISalesPerson[] = [];
  filteredSalesPersons$!: Observable<ISalesPerson[]>;
  actionButtons: IActionButton[] = [];
  documentTypes!: IStructures[];
  documentTypesSecondFilter!: IStructures[];
  userPermissions: IPermissionbyUser[] = [];
  buttons: ICLTableButton[] = [];

  /**FORMULARIOS*/
  frmSearchDocument!: FormGroup;

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions!: Subscription;
  controllerToSendRequest: string = '';
  controllerToSendRequestObjectType: string = '';
  tooltip: MatTooltip | any;

  /*CONFIGURACION DE LA TABLA*/
  shouldPaginateRequest: boolean = true;
  docTbColumns: { [key: string]: string } = {
    DocNum: 'Número de documento',
    CardCode: 'Código proveedor',
    CardName: 'Proveedor',
    DocStatus: 'Estado',
    DocCurrency: 'Moneda',
    DocDateFormatted: "Fecha",
    DocTotal: 'Total',
    DocEntry: 'Número interno',
    ObjType: 'ObjType'
  }
  documentsTableId: string = 'DOCS-TABLE';
  docTbMappedColumns!: MappedColumns;

  tableButtons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: 'OPOR'
    },
    {
      Title: `Imprimir`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_4,
      Icon: `print`,
      Color: `primary`,
      Data: 'OPDN, OPCH, ORPD,ODPO,ODRF,OPOR'
    },
    {
      Title: `Copiar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `receipt`,
      Color: `primary`,
      Options: [
        {
          Title: `Entrada de mercancías`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_2,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'OPOR'
        },
        {
          Title: `Documento base`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_9,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'ODRF'
        }
      ],
      Data: 'OPOR,ODRF'
    },
    {
      Title: `Duplicar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_5,
      Icon: `note_add`,
      Color: `primary`,
      Data: 'OPCH, OPDN,ODPO,ORPD,OPOR'
    },
    {
      Title: `Previsualizar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_6,
      Icon: `info`,
      Color: `primary`,
      Data: 'ODRF,OPOR,OPDN,ORPD,OPCH,ODPO'
    },
  ];

  // Variabels Segundo Filtro
  secondFilterVisible: boolean = false;

  //#region component search
  searchModalId = "searchModalId";
  //#endregion
  previousUrl: string = '';

  /**
   * List of print report
   */
  companyPrintFormat: IPrintFormatSetting[] = [];

  /**
   * Contains object for print report setting
   */
  reportConfigured!:  IPrintFormatSetting;

  /**
   * Use to defined company selected
   */
  selectedCompany!: ICompany | null;

  /**
   * Contains object for setting
   */
  settings: ISettings[] = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private overlayService: OverlayService,
    private purchaseService: PurchaseSearchDocsService,
    @Inject("LinkerService") private linkerService: LinkerService,
    private alertsService: AlertsService,
    private sharedService: SharedService,
    private salesPersonsService: SalesPersonService,
    private suppliersService: SuppliersService,
    private structuresService: StructuresService,
    private reportsService: ReportsService,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService,
    private matDialog: MatDialog,
    private changeDetector: ChangeDetectorRef
  ) {
    this.configTableDocs();
    this.allSubscriptions = new Subscription();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.onLoad();
  }
  ngAfterViewInit(): void {
    this.frmSearchDocument.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
    this.GetDocStateByDocType();
    this.OnChangeDocumentType();
    this.changeDetector.detectChanges();
  }

  private onLoad(): void {
    this.initForm();
    this.documentTypes = [];

    this.frmSearchDocument.get('SalesPerson')!.valueChanges.pipe(
      map((value: string | ISalesPerson) => {
        this.filteredSalesPersons$ = of(this.filterSalesPersons(value));
      })
    ).subscribe();


    this.handleResolvedData();
    this.SetValidatorAutoComplete()
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.onTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.REQUEST_RECORDS, this.getRecords, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
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
    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.allSubscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.previousUrl = this.router.url;
        }
      })
    );
    this.ReadQueryParameters();
  }

  /**
   * Method to get draft docuement
   * @constructor
   */
  ReadQueryParameters(): void {
    this.allSubscriptions.add(
      this.activatedRoute.queryParams.subscribe({
        next: (params) => {
          let dialog = params['dialog'];

          if (dialog) {
            let documentEntry = (params['docEntry']);

            if (isNaN(documentEntry)) {
              this.alertsService.Toast({
                type: CLToastType.ERROR,
                message: 'Número de documento con formato incorrecto'
              });
            }

            let controllerToRequest = params['controller'];

            if (!controllerToRequest) {
              this.alertsService.Toast({ type: CLToastType.ERROR, message: 'No se especificó el tipo de documento' });
            }

            if (dialog === 'preview' && !isNaN(documentEntry) && controllerToRequest) {
              this.OpenPreviewDocumentDialog(documentEntry, controllerToRequest);
            }
          }
        }
      })
    );
  }


  /**
   * Updates the document states based on the selected document type.
   * If the current document state is not valid for the selected type,
   * it sets the default document state.
   */
  GetDocStateByDocType() {
    let docType = this.frmSearchDocument.get('DocType')?.value || '';

    // Filters the document states based on the selected document type.
    this.documentStatesToShow = this.documentStates.filter(state =>
      !state.Prop1 || state.Prop1.split(',').map(s => s.trim()).includes(docType)
    );

    let docState = this.frmSearchDocument.get('DocStatus')?.value || '';

    // If the current document state is not in the filtered list, set the default state.
    if (!this.documentStatesToShow.some(state => state.Key == docState)) {
      this.frmSearchDocument.get('DocStatus')?.setValue(
        this.documentStatesToShow.find(ds => ds.Default)?.Key || ''
      );
    }
  }

  /**
   * Method to load modal preview document
   * @param _docEntry DocEntry document to show
   * @constructor
   */
  OpenPreviewDocumentDialog(_docEntry: number, _controller: string): void {
    this.matDialog.open(DocPreviewComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      minWidth: '50vw',
      minHeight: '50vh',
      disableClose: true,
      data: {
        DocEntry: _docEntry,
        Controller: _controller
      } as IPreviewDocumentDialogData
    })
      .afterClosed()
      .subscribe({
        next: (result) => {
          this.router.navigate([this.sharedService.GetCurrentRouteSegment()]);
        }
      });
  }

  /**
   * Method to obtain purchasing documents
   */
  private getRecords = (): void => {
    let data: IPurchaseDocumentSearchFilter = this.frmSearchDocument.value as IPurchaseDocumentSearchFilter;
    if (this.frmSearchDocument.valid) {

      this.overlayService.OnGet();
      this.purchaseService.GetDocuments<IDocument>(
        this.controllerToSendRequest,
        data.SalesPerson?.SlpCode ?? 0,
        data.DocNum ?? 0,
        this.DefaultBusinessPartner?.CardCode ?? '',
        this.DefaultBusinessPartner?.CardName ?? '',
        data.DocStatus,
        data.DateFrom,
        data.DateTo,
        this.controllerToSendRequestObjectType
      ).pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (res => {
          this.documents = res.Data;
          const NEW_TABLE_STATE = {
            Records: this.documents.map(d => this.sharedService.MapTableColumns({
              ...d,
              DocDateFormatted: formatDate(d.DocDate, 'MMMM d, y hh:mm a', 'en'),
              DocStatus: d.DocStatus === 'C' ? 'Cerrado' : d.DocStatus === 'P'? 'Pagado': 'Abierto'
            }, Object.keys(this.docTbColumns))),
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
      });
    } else this.frmSearchDocument.markAllAsTouched();

  }

  /**
   * METODO
   * @private
   */
  private initForm(): void {
    this.frmSearchDocument = this.fb.group({
      SalesPerson: [''],
      Customer: [''],
      DocNum: [null],
      DocStatus: [null, Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocType: ['', Validators.required],
      ObjType: ['']
    });

    this.frmSearchDocument.get('Customer')!.valueChanges.pipe(
      map((value: string) => {
        if (value !== this.getDisplayValue(this.DefaultBusinessPartner as IBusinessPartner)) {
          this.DefaultBusinessPartner = null;
          this.frmSearchDocument.patchValue({ Customer: '' });
        }
      })
    ).subscribe();
  }
  SetFormDefaultValues(): void {
    this.frmSearchDocument.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
    this.GetDocStateByDocType();
    this.OnChangeDocumentType();
  }

  SetValidatorAutoComplete(): void {
    this.frmSearchDocument.get('SalesPerson')?.addValidators(Validation.validateValueAutoComplete(this.salesPersons));
  }

  private getDisplayValue(value: IBusinessPartner): string {
    return value ? `${value.CardCode} - ${value.CardName}` : '';
  }

  /**
   * METODO PARA INICIALIZAR LA TABLA
   * @private
   */
  private configTableDocs(): void {
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: this.documents,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['DocEntry', 'ObjType'],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' },
        { Name: 'DocTotal', FixOn: 'right' }
      ],
    });
  }



  /**
   * METODO PARA FILTRO DEL AUTOCOMPLETE
   * @param _value
   * @private
   */
  private filterSalesPersons(_value: string | ISalesPerson): ISalesPerson[] {
    if (typeof _value !== 'string') {
      return this.salesPersons.filter(slp => slp.SlpCode === _value.SlpCode);
    }
    return this.salesPersons.filter(slp => (`${slp.SlpCode}${slp.SlpName}`).toLowerCase().includes(_value.toLowerCase()))
  }

  /**
   * METODO QUE SE EJECUTA AL INICIAR EL COMPONENTE Y MAPEA LA DATA INICIAL
   * @private
   */
  private handleResolvedData(): void {
    this.allSubscriptions.add(
      this.activatedRoute.data.subscribe({
        next: (data) => {
          const resolvedData = data['resolvedData'] as ISearchPurchaseDocumentsResolvedData;

          this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);

          if (resolvedData) {
            this.salesPersons = resolvedData.SalesPersons;
            this.filteredSalesPersons$ = of(this.salesPersons)
            this.documentStates = resolvedData.DocStates;
            this.documentTypes = resolvedData.DocTypes;
            this.userPermissions = resolvedData.Permissions;
            this.documentTypesSecondFilter = resolvedData.DocTypes.filter(dt => dt.Key !== 'Draft');
            if (this.previousUrl == this.sharedService.GetCurrentRouteSegment()) { this.SetFormDefaultValues(); }

            this.settings = resolvedData.Settings;
            if(this.settings){
              let printFormatsSetting = this.settings.find((element) => element.Code == SettingCode.PrintFormat);

              if (printFormatsSetting) {
                this.companyPrintFormat = JSON.parse(printFormatsSetting.Json || '');
              }

              if (this.companyPrintFormat && this.companyPrintFormat.length > 0) {
                let dataCompany = this.companyPrintFormat.find(x => x.CompanyId === this.selectedCompany?.Id) as IPrintFormatSetting;

                if (dataCompany) {
                  this.reportConfigured=dataCompany;
                }
              }
            }
          }
        }
      })
    );
  }

  /**
   * METODO PARA MOSTRAR LOS DATOS QUE REQUIERO EN EL AUTOCOMPLETE
   * @param _salesPerson
   */
  public displaySalesPersons(_salesPerson: ISalesPerson): string {
    return _salesPerson && Object.keys(_salesPerson).length ? `${_salesPerson.SlpCode} - ${_salesPerson.SlpName}` : '';
  }

  /**
   * Show business partner search modal
   * @constructor
   */
  ShowModalSearchBusinnesPartner(): void {
    this.matDialog.open(SearchModalComponent, {
      width: '65%',
      height: "80%",
      data: {
        Id: this.searchModalId,
        ModalTitle: 'Lista de socios de negocios',
        MinInputCharacters: 2,
        InputDebounceTime: 200,
        ShouldPaginateRequest: true,
        TableMappedColumns: {
          IgnoreColumns: ['Id', 'Vendedor', 'GroupCode', 'CardType', 'Phone1', 'PayTermsGrpCode', 'DiscountPercent', 'MaxCommitment', 'FederalTaxID', 'PriceListNum', 'SalesPersonCode', 'Currency', 'EmailAddress', 'Series', 'CashCustomer',
            'TypeAheadFormat', 'TypeIdentification', 'Provincia', 'Canton', 'Distrito', 'Barrio', 'Direccion', 'Frozen', 'Valid', 'FatherType', 'FatherCard', 'ConfigurableFields', 'BPAddresses', 'Udfs', 'IsCompanyDirection', 'ShipToDefault', 'BilltoDefault', 'AttachmentEntry', 'CreateDate', 'Device'],
          RenameColumns: {
            CardCode: 'Codigo',
            CardName: 'Nombre',
          }
        }
      } as ISearchModalComponentDialogData<IBusinessPartner>
    }).afterClosed()
      .subscribe({
        next: (value: IBusinessPartner) => {
          if (value) {
            this.DefaultBusinessPartner = value;
            this.frmSearchDocument.patchValue({ Customer: `${value.CardCode} - ${value.CardName}` });
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
          this.customers = callback.Data;

          this.InflateTableBusinnesPartner();

          this.alertsService.Toast({
            type: CLToastType.SUCCESS,
            message: 'Componentes requeridos obtenidos'
          });
        },
        error: (err) => {
          this.alertsService.ShowAlert({ HttpErrorResponse: err });
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
      Records: this.customers,
      RecordsCount: this.customers.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }




  /**
   * METODO QUE SE EJECUTA EN EL BOTON DE BUSCAR O LIMPIAR
   * @param _actionButton - Event emitted in the table button when selecting a document
   */
  public onActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        this.searchDocuments();
        break;
      case 'CLEAN':
        this.Clear();
        break;
    }
  }

  /**
   * METODO QUE SE EJECUTA EN LOS BOTONES DE LA TABLA
   * @param _event
   */
  private onTableButtonClicked = (_event: ICLEvent): void => {

    let data = JSON.parse(_event.Data) as ICLTableButton;

    let rowSelectDocument = JSON.parse(data.Data!) as IDocument;

    let currentPage: string = '';

    switch (data.Action) {

      case Structures.Enums.CL_ACTIONS.UPDATE:
        if (rowSelectDocument.DocStatus === 'Cerrado') {

          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        this.sharedService.SetCurrentPage('Orden de compra');
        this.router.navigate(['/purchases', 'order'], {
          queryParams: {
            DocEntry: rowSelectDocument.DocEntry,
            Action: PreloadedDocumentActions.EDIT
          }
        });

        break;
      case Structures.Enums.CL_ACTIONS.OPTION_2:
        if (rowSelectDocument.DocStatus === 'Cerrado') {

          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }
        this.sharedService.SetCurrentPage('Entradas de mercancías');
        this.router.navigate(['/purchases', 'good-receipt'], {
          queryParams: {
            DocEntry: rowSelectDocument.DocEntry,
            Action: PreloadedDocumentActions.COPY,
            From: this.controllerToSendRequest
          }
        });
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_4:
        this.overlayService.OnPost();
        let printReport$: Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>> | null = null;
        switch (this.controllerToSendRequest) {
          case 'PurchaseDeliveryNotes':
            let validatePurchaseDeliveryNotes = this.ValidateValueFormatSetting(this.reportConfigured,'GoodsReceiptPO');
            if(validatePurchaseDeliveryNotes != null && validatePurchaseDeliveryNotes != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'GoodsReceiptPO');
            }
            break;
          case 'PurchaseInvoices':
            let validatePurchaseInvoices = this.ValidateValueFormatSetting(this.reportConfigured,'APInvoice');
            if(validatePurchaseInvoices != null && validatePurchaseInvoices != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'APInvoice');
            }
            break;
          case 'PurchaseReturns':
            let validatePurchaseReturns = this.ValidateValueFormatSetting(this.reportConfigured,'GoodsReturn');
            if(validatePurchaseReturns != null && validatePurchaseReturns != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'GoodsReturn');
            }
            break;
          case 'PurchaseDownPayments':
            let validatePurchaseDownPayments = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintApDownPayment');
            if(validatePurchaseDownPayments != null && validatePurchaseDownPayments != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'ReprintApDownPayment');
            }
            break;
          case 'Draft':
            let validatePurchaseDraft = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintPreliminary');
            if(validatePurchaseDraft != null && validatePurchaseDraft != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'ReprintPreliminary');
            }
            break;
          case 'PurchaseOrders':
            let validatePurchaseOrders = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintPurchaseOrder');
            if(validatePurchaseOrders != null && validatePurchaseOrders != '') {
              printReport$ = this.reportsService.PrintReport(rowSelectDocument.DocEntry, 'ReprintPurchaseOrder');
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
                PrintBase64File({ base64File: res.Data.Base64, blobType: 'application/pdf', onNewWindow: false });
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

        let typeDocument: string = this.frmSearchDocument.controls['DocType'].value.toLowerCase();

        switch (typeDocument) {
          case PurchaseTypeDocuments.purchaseDeliveryNotes.toLowerCase():
            currentPage = 'Entradas de mercancías'
            typeDocument = 'good-receipt'
            break;
          case PurchaseTypeDocuments.purchaseInvoices.toLowerCase():
            currentPage = 'Factura de proveedores'
            typeDocument = 'invoice'
            break;
          case PurchaseTypeDocuments.PurchaseDownPayments.toLowerCase():
            currentPage = 'Factura anticipos';
            typeDocument = 'down-payments';
            break;
          case PurchaseTypeDocuments.PurchaseReturns.toLowerCase():
            currentPage = 'Devolución de mercancías';
            typeDocument = 'return-good';
            break;
          case PurchaseTypeDocuments.PurchaseOrders.toLowerCase():
            currentPage = 'Orden de compra';
            typeDocument = 'order';
            break;
        }

        this.sharedService.SetCurrentPage(currentPage);
        this.router.navigate(['purchases', typeDocument], {
          queryParams: {
            DocEntry: rowSelectDocument.DocEntry,
            Action: PreloadedDocumentActions.DUPLICATE,
            From: this.controllerToSendRequest
          }
        })

        break;
      case Structures.Enums.CL_ACTIONS.OPTION_6:
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute,
          queryParams: {
            dialog: 'preview',
            docEntry: rowSelectDocument.DocEntry,
            controller: this.controllerToSendRequest
          }
        });
        break;
      case Structures.Enums.CL_ACTIONS.OPTION_9:
        let controllerToSendPreliminary = ''

        switch (+rowSelectDocument.ObjType!) {
          case CopyFrom.OPOR:
            currentPage = 'Orden de compra';
            controllerToSendPreliminary = 'order';
            break;
          case CopyFrom.OPDN:
            currentPage = 'Entradas de mercancías';
            controllerToSendPreliminary = 'good-receipt';
            break;
          case CopyFrom.ORPD:
            currentPage = 'Devolución de mercancías';
            controllerToSendPreliminary = 'return-good';
            break;
          case CopyFrom.OPCH:
            currentPage = 'Factura de proveedores';
            controllerToSendPreliminary = 'invoice';
            break;
          case CopyFrom.ODPO:
            currentPage = 'Factura anticipos';
            controllerToSendPreliminary = 'down-payments';
            break;
        }

        this.sharedService.SetCurrentPage(currentPage);
        this.router.navigate(['purchases', controllerToSendPreliminary], {
          queryParams: {
            DocEntry: rowSelectDocument.DocEntry,
            Action: PreloadedDocumentActions.CREATE_FROM_DRAFT,
            From: this.controllerToSendRequest
          }
        });
        break;

    }
  }

  /**
   * METODO QUE LIMPIA LA DATA
   * @private
   */
  private Clear(): void {
    this.overlayService.OnGet();
    forkJoin({
      SalesPersons: this.salesPersonsService.Get<ISalesPerson[]>(),
      DocTypes: this.structuresService.Get('DocTypesForSearchDocsPurchases'),
      DocStates: this.structuresService.Get('DocStates')
    })
      .pipe(
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (res => {
          this.initForm();
          this.customers = [];
          this.DefaultBusinessPartner = null;
          this.salesPersons = res.SalesPersons.Data;
          this.filteredSalesPersons$ = of(this.salesPersons)
          this.documentStates = res.DocStates.Data;
          this.ResetDocument();
          this.SetFormDefaultValues();
          this.SetValidatorAutoComplete();
          this.secondFilterVisible = false;
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
      Records: [],
      RecordsCount: 0
    }
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.documentsTableId,
      Data: JSON.stringify(EMPTY_TABLE_STATE)
    });

  }

  private searchDocuments(): void {
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.documentsTableId,
      Data: ''
    });
  }

  OnChangeDocumentType(_event?: any): void {

    this.secondFilterVisible = this.frmSearchDocument.get('DocType')?.value === 'Draft';
    this.GetDocStateByDocType();

    if (this.frmSearchDocument.invalid) {
      this.frmSearchDocument.markAllAsTouched();
      return;
    }

    let docSearchForm: IPurchaseDocumentSearchFilter = this.frmSearchDocument.value as IPurchaseDocumentSearchFilter;

    this.controllerToSendRequest = docSearchForm.DocType;
    this.controllerToSendRequestObjectType = this.GetObjType(docSearchForm.ObjType);


    let filterButtonsFunction = (_type: 'OPOR' | 'OPCH' | 'OPDN' | 'ORPD' | 'ODPO' | 'ODRF', _buttons: ICLTableButton[]): ICLTableButton[] => {
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

    // Show field en approvals document
    if (this.controllerToSendRequest === ControllerName.Draft) {
      let renameColumns = this.docTbColumns;
      renameColumns['Approval_Status'] = 'Estado de aprobación'
      this.docTbMappedColumns.RenameColumns = renameColumns;

    } else {
      delete this.docTbColumns['Approval_Status'];
      this.docTbMappedColumns.RenameColumns = this.docTbColumns;
    }

    switch (docSearchForm.DocType) {
      case 'PurchaseOrders':
        this.buttons = filterButtonsFunction('OPOR', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OPOR', this.buttons);
        break;
      case 'PurchaseInvoices':
        this.buttons = filterButtonsFunction('OPCH', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OPCH', this.buttons);
        break;
      case 'PurchaseDeliveryNotes':
        this.buttons = filterButtonsFunction('OPDN', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OPDN', this.buttons);
        break;
      case 'PurchaseReturns':
        this.buttons = filterButtonsFunction('ORPD', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ORPD', this.buttons);
        break;
      case 'PurchaseDownPayments':
        this.buttons = filterButtonsFunction('ODPO', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ODPO', this.buttons);
        break;
      case ControllerName.Draft:
        this.buttons = filterButtonsFunction('ODRF', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ODRF', this.buttons);
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

  FilterButtonsByPermission(_type: 'OPOR' | 'OPCH' | 'OPDN' | 'ORPD' | 'ODPO' | 'ODRF', _buttons: ICLTableButton[]): ICLTableButton[] {
    let userPermissions = this.userPermissions.map(userPermission => userPermission.Name);
    const buttonsPermision: ICLTableButton[] = [];
    const permissionsMap: { [key: string]: { [key: string]: string } } = {
        'OPOR': {
            'editar': 'Purchases_SearchDocs_EditPurchasesOrders',
            'imprimir': 'Purchases_SearchDocs_PrintPurchasesOrders',
            'previsualizar': 'Purchases_SearchDocs_PreviewPurchasesOrders',
            'duplicar': 'Purchases_SearchDocs_DuplicatePurchasesOrders',
            'copiar': 'Purchases_SearchDocs_CopyPurchasesOrders'
        },
        'OPCH': {
            'imprimir': 'Purchases_SearchDocs_PrintPurchaseInvoices',
            'previsualizar': 'Purchases_SearchDocs_PreviewPurchaseInvoices',
            'duplicar': 'Purchases_SearchDocs_DuplicatePurchaseInvoices'
        },
        'OPDN': {
            'imprimir': 'Purchases_SearchDocs_PrintPurchaseDeliveryNotes',
            'previsualizar': 'Purchases_SearchDocs_PreviewPurchaseDeliveryNotes',
            'duplicar': 'Purchases_SearchDocs_DuplicatePurchaseDeliveryNotes'
        },
        'ORPD': {
            'imprimir': 'Purchases_SearchDocs_PrintPurchaseReturns',
            'previsualizar': 'Purchases_SearchDocs_PreviewPurchaseReturns',
            'duplicar': 'Purchases_SearchDocs_DuplicatePurchaseReturns'
        },
        'ODPO': {
            'imprimir': 'Purchases_SearchDocs_PrintPurchaseDownPayments',
            'previsualizar': 'Purchases_SearchDocs_PreviewPurchaseDownPayments',
            'duplicar': 'Purchases_SearchDocs_DuplicatePurchaseDownPayments'
        },
        'ODRF': {
            'imprimir': 'Purchases_SearchDocs_PrintDraft',
            'previsualizar': 'Purchases_SearchDocs_PreviewDraft',
            'copiar': 'Purchases_SearchDocs_CopyDraft'
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


  GetObjType(ObjType: string): string {
    const objTypeMap: { [key: string]: string } = {
      'PurchaseDeliveryNotes': '20',
      'PurchaseDownPayments': '204',
      'PurchaseInvoices': '18',
      'PurchaseOrders': '22',
      'PurchaseReturns': '21'
    };
    return objTypeMap[ObjType] || '';
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


