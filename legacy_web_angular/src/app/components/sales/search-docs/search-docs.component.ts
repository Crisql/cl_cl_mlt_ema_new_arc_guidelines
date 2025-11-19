import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { IActionButton } from "@app/interfaces/i-action-button";
import { ICLTableButton, MapDisplayColumns, MappedColumns } from "@clavisco/table";
import { CLPrint, GetError, PrintBase64File, Repository, Structures } from "@clavisco/core";
import { CL_CHANNEL, ICLCallbacksInterface, ICLEvent, LinkerService, Register, Run, StepDown } from "@clavisco/linker";
import { catchError, finalize, forkJoin, Observable, of, Subscription, switchMap, throwError } from "rxjs";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IDocumentSearchFilter, } from "@app/interfaces/i-document-type";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Copy, PrinterWorker, SharedService } from "@app/shared/shared.service";
import { SalesDocumentService } from "@app/services/sales-document.service";
import { OverlayService } from "@clavisco/overlay";
import { AlertsService, CLModalType, CLToastType, ModalService } from "@clavisco/alerts";
import { IDocument } from "@app/interfaces/i-sale-document";
import { ISearchDocumentsResolvedData } from "@app/interfaces/i-resolvers";
import { IBusinessPartner } from "@app/interfaces/i-business-partner";
import { ISalesPerson } from "@app/interfaces/i-sales-person";
import { map } from "rxjs/operators";
import { formatDate } from "@angular/common";
import { IStructures } from "@app/interfaces/i-structures";
import { ControllerName, CopyFrom, PreloadedDocumentActions, SettingCode } from "@app/enums/enums";
import { ReportsService } from "@app/services/reports.service";
import { IDownloadBase64 } from "@app/interfaces/i-files";
import { MatDialog } from "@angular/material/dialog";
import { DocPreviewComponent } from "./doc-preview/doc-preview.component";
import { IPreviewDocumentDialogData } from "@app/interfaces/i-dialog-data";
import { PPTransactionService } from "@app/services/pp-transaction.service";
import { ITerminals } from "@app/interfaces/i-terminals";
import { SalesPersonService } from "@app/services/sales-person.service";
import { BusinessPartnersService } from "@app/services/business-partners.service";
import { StructuresService } from "@app/services/structures.service";
import { TerminalsService } from "@app/services/terminals.service";
import { PrinterWorkerService } from "@app/services/printer-worker.service";
import Validation from "@app/custom-validation/custom-validators";
import { ISearchModalComponentDialogData, SearchModalComponent } from "@clavisco/search-modal";
import { MatTooltip } from '@angular/material/tooltip';
import { IPermissionbyUser } from '@app/interfaces/i-roles';
import { IPrintFormatSetting, ISettings } from "@app/interfaces/i-settings";
import { ICompany } from "@app/interfaces/i-company";
import { StorageKey } from "@app/enums/e-storage-keys";
import { error } from 'console';
import { HttpStatusCode } from '@angular/common/http';


@Component({
  selector: 'app-search-docs',
  templateUrl: './search-docs.component.html',
  styleUrls: ['./search-docs.component.scss']
})
export class SearchDocsComponent implements OnInit, OnDestroy, AfterViewInit {

  documentTypes!: IStructures[];
  documentTypesSecondFilter!: IStructures[];
  userPermissions: IPermissionbyUser[] = [];
  documentStates!: IStructures[];
  documentStatesToShow!: IStructures[];
  searchForm!: FormGroup;
  documents!: IDocument[];
  customers!: IBusinessPartner[];
  DefaultBusinessPartner!: IBusinessPartner | null;
  salesPersons!: ISalesPerson[];
  filteredSalesPersons$!: Observable<ISalesPerson[]>;
  actionButtons!: IActionButton[];
  documentsTableId: string = 'DOCS-TABLE';
  hasStandardHeaders: boolean = true;
  shouldSplitPascal: boolean = false;
  docTbMappedColumns!: MappedColumns;
  hasItemsSelection: boolean = false;
  buttons: ICLTableButton[] = [];
  tooltip: MatTooltip | any;
  Terminals!: ITerminals[];
  shouldPaginateRequest: boolean = true;
  docTbColumns: { [key: string]: string } = {
    DocNum: 'Número de documento',
    DocEntry: 'DocEntry de documento',
    CardName: 'Cliente',
    DocStatus: 'Estado',
    DocCurrency: 'Moneda',
    DocDateFormatted: "Fecha",
    DocTotal: 'Total'
  }
  //#endregion
  // Variables Segundo Filtro
  secondFilterVisible: boolean = false;

  //#region component search
  searchModalId = "searchModalId";
  //#endregion
  controllerToSendRequest: string = '';
  controllerToSendRequestObjectType: string = '';

  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  allSubscriptions: Subscription;
  tableButtons: ICLTableButton[] = [
    {
      Title: `Editar`,
      Action: Structures.Enums.CL_ACTIONS.UPDATE,
      Icon: `edit`,
      Color: `primary`,
      Data: 'OQUT,ORDR'
    },
    {
      Title: `Copiar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_1,
      Icon: `file_copy`,
      Color: `primary`,
      Options: [
        {
          Title: `Orden`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_2,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'OQUT'
        },
        {
          Title: `Factura`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_3,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'ORDR,OQUT'
        },
        {
          Title: `Nota de crédito`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_7,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'OINV,ODPI,RINV'
        },
        {
          Title: `Entrega`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_8,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'RINV'
        },
        {
          Title: `Documento base`,
          Action: Structures.Enums.CL_ACTIONS.OPTION_9,
          Icon: `receipt`,
          Color: `primary`,
          Data: 'ODRF'
        }
      ],
      Data: 'OQUT,ORDR,OINV,ODPI,RINV,ODRF'
    },
    {
      Title: `Imprimir`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_4,
      Icon: `print`,
      Color: `primary`,
      Data: 'OQUT,ORDR,OINV,ODPI,RINV,ODRF,ODLN,ORIN'
    },
    {
      Title: `Previsualizar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_5,
      Icon: `info`,
      Color: `primary`,
      Data: 'OQUT,ORDR,OINV,ODPI,RINV,ODRF,ODLN,ORIN'
    },
    {
      Title: `Duplicar`,
      Action: Structures.Enums.CL_ACTIONS.OPTION_6,
      Icon: `note_add`,
      Color: `primary`,
      Data: 'OQUT,ORDR,OINV,ORIN'
    },
    {
      Title: `Cancelar`,
      Action: Structures.Enums.CL_ACTIONS.DELETE,
      Icon: `cancel`,
      Color: `primary`,
      Data: 'OQUT,ORDR,ODRF'
    }
  ];
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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private salesService: SalesDocumentService,
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private sharedService: SharedService,
    private reportsService: ReportsService,
    private dialog: MatDialog,
    private ppTransactionService: PPTransactionService,
    @Inject("LinkerService") private linkerService: LinkerService,
    private salesPersonsService: SalesPersonService,
    private businessPartnerService: BusinessPartnersService,
    private structuresService: StructuresService,
    private terminalsService: TerminalsService,
    private printerWorkerService: PrinterWorkerService,
    private modalService: ModalService,
    private matDialog: MatDialog,
    private changeDetector: ChangeDetectorRef
  ) {
    this.allSubscriptions = new Subscription();
    this.docTbMappedColumns = MapDisplayColumns({
      dataSource: [],
      renameColumns: this.docTbColumns,
      ignoreColumns: ['DocEntry'],
      stickyColumns: [
        { Name: 'Options', FixOn: 'right' },
        { Name: 'DocTotal', FixOn: 'right' }
      ]
    });
  }

  ngOnInit(): void {
    this.InitVariables();
    this.HandleResolvedData();
    this.SetValidatorAutoComplete();
  }

  ngAfterViewInit(): void {
    this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
    this.GetDocStateByDocType();

    this.OnChangeDocumentType();
    this.changeDetector.detectChanges();
  }

  HandleResolvedData(): void {
    this.allSubscriptions.add(
      this.activatedRoute.data.subscribe({
        next: (data) => {
          const resolvedData = data['resolvedData'] as ISearchDocumentsResolvedData;

          this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);

          if (resolvedData) {
            this.salesPersons = resolvedData.SalesPersons;
            this.filteredSalesPersons$ = of(this.salesPersons);
            this.Terminals = resolvedData.Terminals;
            this.documentTypes = resolvedData.DocTypes;
            this.documentTypesSecondFilter = resolvedData.DocTypes.filter(dt => dt.Key !== 'Draft');
            this.documentStates = resolvedData.DocStates;
            this.userPermissions = resolvedData.Permissions;
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

  InitVariables(): void {
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.OUTPUT, this.OnTableButtonClicked, this.callbacks);
    Register<CL_CHANNEL>(this.documentsTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);
    this.documentTypes = [];
    this.documentStates = [];
    this.documentStatesToShow = [];
    this.filteredSalesPersons$ = of([]);
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
    this.documents = [];

    this.LoadForm();


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

  LoadForm(): void {
    this.searchForm = this.fb.group({
      SalePerson: [''],
      Customer: [''],
      DocNum: [null],
      DocStatus: [null, Validators.required],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocType: ['', Validators.required],
      ObjType: ['']
    });


    this.searchForm.get('SalePerson')!.valueChanges.pipe(
      map((value: string | ISalesPerson) => {
        this.filteredSalesPersons$ = of(this.FilterSalesPersons(value));
      })
    ).subscribe();

    this.searchForm.get('Customer')!.valueChanges.pipe(
      map((value: string) => {
        if (value !== this.getDisplayValue(this.DefaultBusinessPartner as IBusinessPartner)) {
          this.DefaultBusinessPartner = null;
          this.searchForm.patchValue({ Customer: '' });
        }
      })
    ).subscribe();

  }

  SetValidatorAutoComplete(): void {
    this.searchForm.get('SalePerson')?.addValidators(Validation.validateValueAutoComplete(this.salesPersons));
  }

  SetFormDefaultValues(): void {
    this.OnChangeDocumentType();
  }

  DisplaySalesPersons(_salesPerson: ISalesPerson): string {
    return _salesPerson && Object.keys(_salesPerson).length ? `${_salesPerson.SlpCode} - ${_salesPerson.SlpName}` : '';
  }

  private getDisplayValue(value: IBusinessPartner): string {
    return value ? `${value.CardCode} - ${value.CardName}` : '';
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


  FilterSalesPersons(_value: string | ISalesPerson): ISalesPerson[] {
    if (!_value) return this.salesPersons;
    if (typeof _value !== 'string') {
      return this.salesPersons.filter(slp => slp.SlpCode === _value.SlpCode);
    }
    return this.salesPersons.filter(slp => (`${slp.SlpCode}${slp.SlpName}`).toLowerCase().includes(_value.toLowerCase()))
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
            this.searchForm.patchValue({ Customer: this.getDisplayValue(this.DefaultBusinessPartner) });
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
    this.businessPartnerService.GetbyFilter<IBusinessPartner[]>(VALUE?.SearchValue)
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

  OnActionButtonClicked(_actionButton: IActionButton): void {
    switch (_actionButton.Key) {
      case 'SEARCH':
        // Emito un evento para que tabla establezca todos los datos de paginacion
        this.linkerService.Publish({
          CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
          Target: this.documentsTableId,
          Data: ''
        });
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
      DocTypes: this.structuresService.Get('DocTypesForSearchDocs'),
      DocStates: this.structuresService.Get('DocStates'),
      Terminals: this.terminalsService.Get<ITerminals[]>(),
    })
      .pipe(
        catchError(err => {
          return of(null);
        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: res => {
          if (res) {
            this.DefaultBusinessPartner = null;
            this.salesPersons = res.SalesPersons.Data;
            this.filteredSalesPersons$ = of(this.salesPersons);
            this.Terminals = res.Terminals.Data;
            this.documentTypes = res.DocTypes.Data;
            this.documentStates = res.DocStates.Data;
            this.secondFilterVisible = false;
            this.ResetDocument();
          }
          this.alertsService.Toast({ type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos' });
        },
        error: err => {
          this.alertsService.ShowAlert({ HttpErrorResponse: err });
        }
      });
  }

  private ResetDocument(): void {
    this.ResetTable();
    this.LoadForm();

    this.searchForm.get('DateFrom')?.setValue(new Date());
    this.searchForm.get('DateTo')?.setValue(new Date());

    this.searchForm.get('DocType')?.setValue(this.documentTypes.find(dt => dt.Default)?.Key || '');
    this.GetDocStateByDocType();

  }

  /**
   * Method to define the resulting events for the table buttons
   * @param _event - Event emitted in the table button when selecting a document
   * @constructor
   */
  OnTableButtonClicked = (_event: ICLEvent): void => {
    const clickedButton = JSON.parse(_event.Data) as ICLTableButton;

    const row = JSON.parse(clickedButton.Data!) as IDocument;

    const document = this.documents.find(d => d.DocEntry === row.DocEntry)!;
    let currentPage: string = '';

    switch (clickedButton.Action) {

      case Structures.Enums.CL_ACTIONS.UPDATE:

        if (document.DocStatus === 'C') {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        switch (this.controllerToSendRequest) {
          case 'Quotations':
            this.sharedService.SetCurrentPage('Cotización');
            this.router.navigate(['sales', 'documents', 'quotations'], {
              queryParams: {
                DocEntry: document.DocEntry,
                Action: PreloadedDocumentActions.EDIT
              }
            });
            break;
          case 'Orders':
            this.sharedService.SetCurrentPage('Orden');
            this.router.navigate(['sales', 'documents', 'orders'], {
              queryParams: {
                DocEntry: document.DocEntry,
                Action: PreloadedDocumentActions.EDIT
              }
            })
            break;
          case 'Invoices':
            this.sharedService.SetCurrentPage('Factura (Contado /Crédito)');
            this.router.navigate(['sales', 'documents', 'invoices'], {
              queryParams: {
                DocEntry: document.DocEntry,
                Action: PreloadedDocumentActions.EDIT
              }
            })
            break;
        }
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_4:

        let isDocuementWithPayment: boolean = false;

        this.overlayService.OnGet();

        let printReport$: Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>> | null = null;
        switch (this.controllerToSendRequest) {
          case 'Quotations':
            let validateQuotations = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintSaleOffers');
            if(validateQuotations != null && validateQuotations != '') {
              printReport$ = this.reportsService.PrintReport(document.DocEntry, 'ReprintSaleOffers');
            }
            break;
          case 'Orders':
            let validateOrders = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintSaleOrders');
            if(validateOrders != null && validateOrders != '') {
              printReport$ = this.reportsService.PrintReport(document.DocEntry, 'ReprintSaleOrders');
            }
            break;
          case 'Invoices/GetReserveInvoice':
            let validateReserveInvoice = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintReserveInvoice');
            if(validateReserveInvoice != null && validateReserveInvoice != '') {
              printReport$ = this.reportsService.PrintReport(document.DocEntry, 'ReprintReserveInvoice');
            }
            break;
          case 'Draft':
            let validateDraft = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintPreliminary');
            if(validateDraft != null && validateDraft != '') {
              printReport$ = this.reportsService.PrintReport(document.DocEntry, 'ReprintPreliminary');
            }
            break;
          case 'DeliveryNotes':
            let validateDeliveryNotes = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintDeliveryNotes');
            if(validateDeliveryNotes != null && validateDeliveryNotes != '') {
              printReport$ = this.reportsService.PrintReport(document.DocEntry, 'ReprintDeliveryNotes');
            }
            break;
          case 'CreditNotes':
            let validateCreditNotes = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintCreditNotes');
            if(validateCreditNotes != null && validateCreditNotes != '') {
              printReport$ = this.reportsService.PrintReport(document.DocEntry, 'ReprintCreditNotes');
            }
            break;
          case 'DownPayments':
            isDocuementWithPayment = true;
            this.ppTransactionService.GetPPTransactionDetails(document.InvoiceNumber).pipe(
              switchMap(callback => {
                if (callback.Data && callback.Data.length > 0) {

                  let rawData = `>count:${callback.Data.length}`;

                  callback.Data.forEach((x, index) => {

                    const EMVS_STREAM = JSON.parse(callback.Data[index].SerializedTransaction)['EMVStreamResponse'];
                    const RIGHT_SIDE = +EMVS_STREAM.salesAmount.slice(0, -2);
                    const LEFT_SIDE = +`0.${EMVS_STREAM.salesAmount.slice(-2, EMVS_STREAM.salesAmount.length)}`;

                    const TERMINAL: ITerminals = this.Terminals.find(y => y.TerminalCode == x.TerminalId) || { Currency: ' ' } as ITerminals;

                    if (TERMINAL) {
                      const IS_QUICK_PAY = (RIGHT_SIDE + LEFT_SIDE <= TERMINAL.QuickPayAmount)
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
                    }
                  });
                  let validatePrint = this.ValidateValueFormatSetting(this.reportConfigured,'PinpadDownPayment');
                  if(validatePrint != null && validatePrint!=''){
                    return this.reportsService.PrintReportPinpad(document.DocEntry, rawData, 'PinpadDownPayment', true).pipe(
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
                          PrintBase64File({ base64File: res.Data, blobType: 'application/pdf', onNewWindow: false });
                          return of(res);
                        }
                      }),
                      catchError(error => {
                        this.alertsService.ShowAlert({ HttpErrorResponse: error });
                        return of(null);
                      })
                    );
                  } else {
                    this.overlayService.Drop();
                    this.alertsService.Toast({
                      type: CLToastType.ERROR,
                      message: 'No se ha configurado el formato de impresion'
                    });
                    return of(null);
                  }
                } else {
                  let validatePrint = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintArDownPayment');
                  if(validatePrint != null && validatePrint != ''){
                    return this.reportsService.PrintReport(document.DocEntry, 'ReprintArDownPayment').pipe(
                      switchMap(callback => {
                        if (PrinterWorker()) {
                          return this.printerWorkerService.Post(callback.Data.Base64)
                            .pipe(
                              map(printLocal => callback),
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
                          PrintBase64File({
                            base64File: callback.Data.Base64,
                            blobType: callback.Data.BlobType,
                            onNewWindow: false
                          });
                          return of(callback);
                        }
                      })
                    );
                  } else {
                    this.overlayService.Drop();
                    this.alertsService.Toast({
                      type: CLToastType.ERROR,
                      message: 'No se ha configurado el formato de impresion'
                    });
                    return of(null);
                  }
                }
              }),
              finalize(() => this.overlayService.Drop())
            ).subscribe();


            break;
          case 'Invoices':
            isDocuementWithPayment = true;
            let validatePrint = this.ValidateValueFormatSetting(this.reportConfigured,'ReprintInvoices');
            printReport$ = this.ppTransactionService.GetPPTransactionDetails(document.InvoiceNumber).pipe(
              switchMap(callback => {
                if (callback.Data && callback.Data.length > 0) {

                  let rawData = `>count:${callback.Data.length}`;
                  callback.Data.forEach((x, index) => {

                    const EMVS_STREAM = JSON.parse(callback.Data[index].SerializedTransaction)['EMVStreamResponse'];
                    const RIGHT_SIDE = +EMVS_STREAM.salesAmount.slice(0, -2);
                    const LEFT_SIDE = +`0.${EMVS_STREAM.salesAmount.slice(-2, EMVS_STREAM.salesAmount.length)}`;

                    const TERMINAL: ITerminals = this.Terminals.find(y => y.TerminalCode == x.TerminalId) || { Currency: ' ' } as ITerminals;

                    if (TERMINAL) {
                      const IS_QUICK_PAY = (RIGHT_SIDE + LEFT_SIDE <= TERMINAL.QuickPayAmount)
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
                    }
                  });

                  let validatePinpadPrint = this.ValidateValueFormatSetting(this.reportConfigured,'PinPadInvoices');

                  if(validatePinpadPrint != null && validatePinpadPrint!=''){
                    return this.reportsService.PrintReportPinpad(document.DocEntry, rawData, 'PinPadInvoices', true).pipe(
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
                          PrintBase64File({ base64File: res.Data, blobType: 'application/pdf', onNewWindow: false });
                          return of(res);
                        }
                      })
                    );
                  } else if(validatePrint != null && validatePrint!=''){
                    return this.reportsService.PrintReport(document.DocEntry, 'ReprintInvoices')
                  } else {
                    return throwError(() => new Error('No se ha configurado el formato de impresion'));
                  }
                } else {
                  if(validatePrint != null && validatePrint!=''){
                    return this.reportsService.PrintReport(document.DocEntry, 'ReprintInvoices');
                  } else {
                    return throwError(() => new Error('No se ha configurado el formato de impresion'));
                  }
                }
              })
            );
            break;
        }
        if (printReport$!=null) {
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
            catchError(error => {
              this.modalService.ShowAlert({ HttpErrorResponse: error });
              return of(null);
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
        this.router.navigate([this.sharedService.GetCurrentRouteSegment()], {
          relativeTo: this.activatedRoute,
          queryParams: {
            dialog: 'preview',
            docEntry: document.DocEntry,
            controller: this.controllerToSendRequest
          }
        });
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_7:

        if (document.DocStatus === 'C' && this.controllerToSendRequest.includes('GetReserveInvoice')) {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        this.sharedService.SetCurrentPage('Notas de crédito');
        this.router.navigate(['sales', 'credit-memo'], {
          queryParams: {
            DocEntry: document.DocEntry,
            Action: PreloadedDocumentActions.COPY,
            From: this.controllerToSendRequest.includes('GetReserveInvoice') ? 'Invoices' : this.controllerToSendRequest
          }
        });

        break;

      case Structures.Enums.CL_ACTIONS.OPTION_2:

        if (document.DocStatus === 'C') {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        this.sharedService.SetCurrentPage('Orden');
        this.router.navigate(['sales', 'documents', 'orders'], {
          queryParams: {
            DocEntry: document.DocEntry,
            Action: PreloadedDocumentActions.COPY,
            From: this.controllerToSendRequest
          }
        });
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_3:

        if (document.DocStatus === 'C') {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        this.sharedService.SetCurrentPage('Factura (Contado/Crédito)');
        this.router.navigate(['sales', 'documents', 'invoices'], {
          queryParams: {
            DocEntry: document.DocEntry,
            Action: PreloadedDocumentActions.COPY,
            From: this.controllerToSendRequest
          }
        })
        break;

      case Structures.Enums.CL_ACTIONS.OPTION_6:

        let typeDocument: string = this.searchForm.controls['DocType'].value.toLowerCase();

        if (typeDocument === 'creditnotes') {
          this.sharedService.SetCurrentPage('Notas de crédito');
          this.router.navigate(['sales', 'credit-memo'], {
            queryParams: {
              DocEntry: document.DocEntry,
              Action: PreloadedDocumentActions.DUPLICATE,
              From: this.controllerToSendRequest
            }
          })
        } else {


          if (typeDocument === 'orders') {
            currentPage = 'Orden'
          } else if (typeDocument === 'quotations') {
            currentPage = 'Cotización'
          } else if (typeDocument === 'invoices') {
            currentPage = 'Factura (Contado/Crédito)';
          }

          this.sharedService.SetCurrentPage(currentPage);
          this.router.navigate(['sales', 'documents', typeDocument], {
            queryParams: {
              DocEntry: document.DocEntry,
              Action: PreloadedDocumentActions.DUPLICATE,
              From: this.controllerToSendRequest
            }
          })
        }


        break;

      case Structures.Enums.CL_ACTIONS.OPTION_8:

        if (document.DocStatus === 'C') {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        this.sharedService.SetCurrentPage('Entrega');
        this.router.navigate(['sales', 'documents', 'delivery'], {
          queryParams: {
            DocEntry: document.DocEntry,
            Action: PreloadedDocumentActions.COPY,
            From: 'Invoices'
          }
        });

        break;
      
      case Structures.Enums.CL_ACTIONS.OPTION_9:

        currentPage = '';
        let controllerToSendPreliminary = '';

        switch (document.ObjType && +document.ObjType) {

          case CopyFrom.ORDR:
            currentPage = 'Orden';
            controllerToSendPreliminary = 'orders';
            break;
          case CopyFrom.OQUT:
            currentPage = 'Cotización';
            controllerToSendPreliminary = 'quotations';
            break;
          case CopyFrom.OINV:
            if(document.ReserveInvoice == 'N'){
              currentPage = 'Factura (Contado/Crédito)';
              controllerToSendPreliminary = 'invoices';
              
            } else {
              currentPage = 'Factura de reserva';
              controllerToSendPreliminary = 'reserve-invoice';
            }
            break;
        }

        this.sharedService.SetCurrentPage(currentPage);
        this.router.navigate(['sales', 'documents', controllerToSendPreliminary], {
          queryParams: {
            DocEntry: document.DocEntry,
            Action: PreloadedDocumentActions.CREATE_FROM_DRAFT,
            From: this.controllerToSendRequest
          }
        });

        break;
      
      case Structures.Enums.CL_ACTIONS.DELETE:

        if (document.DocStatus === 'C') {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: 'Documento en estado cerrado'
          });
          return;
        }

        this.modalService.CancelAndContinue({
          type: CLModalType.WARNING,
          title: `Cancelación de documento # ${document.DocNum}`,
          subtitle:`Usted va a cancelar el documento, no podra recuperarlo, ¿desea continuar?`,
        }).subscribe({
          next: (callback => {
            if(callback){
              this.overlayService.OnPost();

              switch (this.controllerToSendRequest) {
                case 'Quotations':
                  this.salesService.Cancel(this.controllerToSendRequest, document.DocEntry).pipe(finalize(() => {
                    this.overlayService.Drop();
                    this.linkerService.Publish({
                      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
                      Target: this.documentsTableId,
                      Data: ''
                    });
                  })).subscribe(response => {
                    if (response.Code === HttpStatusCode.NoContent) {
                      this.alertsService.Toast({
                        type: CLToastType.SUCCESS,
                        message: 'Cotización cancelada correctamente'
                      });
                    } else {
                      this.alertsService.Toast({
                        type: CLToastType.WARNING,
                        message: 'No se pudo cancelar la cotización'
                      });
                    }
                  }, error => {
                    this.alertsService.ShowAlert({ HttpErrorResponse: error });
                  });
                  break;
                case 'Orders':
                  this.salesService.Cancel(this.controllerToSendRequest, document.DocEntry).pipe(finalize(() => {
                    this.overlayService.Drop();
                    this.linkerService.Publish({
                      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
                      Target: this.documentsTableId,
                      Data: ''
                    });
                  })).subscribe(response => {
                    if (response.Code === HttpStatusCode.NoContent) {
                      this.alertsService.Toast({
                        type: CLToastType.SUCCESS,
                        message: 'Orden cancelada correctamente'
                      });
                    } else {
                      this.alertsService.Toast({
                        type: CLToastType.WARNING,
                        message: 'No se pudo cancelar la orden'
                      });
                    }
                  }, error => {
                    this.alertsService.ShowAlert({ HttpErrorResponse: error });
                  });
                  break;
                case 'Draft':
                  this.salesService.Cancel(this.controllerToSendRequest, document.DocEntry).pipe(finalize(() => {
                    this.overlayService.Drop();
                    this.linkerService.Publish({
                      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
                      Target: this.documentsTableId,
                      Data: ''
                    });
                  })).subscribe(resposen => {
                    if (resposen.Code === HttpStatusCode.NoContent) {
                      this.alertsService.Toast({
                        type: CLToastType.SUCCESS,
                        message: 'Borrador cancelado correctamente'
                      });
                    } else {
                      this.alertsService.Toast({
                        type: CLToastType.WARNING,
                        message: 'No se pudo cancelar el borrador'
                      });
                    }
                  }, error => {
                    this.alertsService.ShowAlert({ HttpErrorResponse: error });
                  });
                  break;
                default:
                  this.overlayService.Drop();
                  this.alertsService.Toast({
                    type: CLToastType.WARNING,
                    message: 'No se puede cancelar el documento'
                  });
                  return;
              }
            }
          })
        });
    }
  }

  /**
   * Method that is executed when changing document type
   * @param _event - Event get docuement type
   * @constructor
   */
  OnChangeDocumentType(_event?: any): void {

    this.secondFilterVisible = this.searchForm.get('DocType')?.value === 'Draft';
    this.GetDocStateByDocType();

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    let docSearchForm: IDocumentSearchFilter = this.searchForm.value as IDocumentSearchFilter;

    this.controllerToSendRequest = docSearchForm.DocType;
    this.controllerToSendRequestObjectType = this.GetObjType(docSearchForm.ObjType);
    let filterButtonsFunction = (_type: 'OQUT' | 'ORDR' | 'OINV' | 'ODPI' | 'RINV' | 'ODRF' | 'ODLN' | 'ORIN', _buttons: ICLTableButton[]): ICLTableButton[] => {
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
      case 'Quotations':
        this.buttons = filterButtonsFunction('OQUT', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OQUT', this.buttons);
        break;
      case 'Orders':
        this.buttons = filterButtonsFunction('ORDR', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ORDR', this.buttons);
        break;
      case 'Invoices':
        this.buttons = filterButtonsFunction('OINV', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('OINV', this.buttons);
        break;
      case 'DownPayments':
        this.buttons = filterButtonsFunction('ODPI', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ODPI', this.buttons);
        break;
      case 'Invoices/GetReserveInvoice':
        this.buttons = filterButtonsFunction('RINV', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('RINV', this.buttons);
        break;
      case 'Draft':
        this.buttons = filterButtonsFunction('ODRF', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ODRF', this.buttons);
        break;
      case 'DeliveryNotes':
        this.buttons = filterButtonsFunction('ODLN', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ODLN', this.buttons);
        break;
      case 'CreditNotes':
        this.buttons = filterButtonsFunction('ORIN', this.tableButtons);
        this.buttons = this.FilterButtonsByPermission('ORIN', this.buttons);
        break;
    }

    if (this.controllerToSendRequest && !this.activatedRoute.snapshot.queryParams['dialog']) {
      this.documents = [];
      this.ResetTable();
      // Emito un evento para que tabla establezca todos los datos de paginacion
      this.linkerService.Publish({
        CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
        Target: this.documentsTableId,
        Data: ''
      });
    }
  }

  FilterButtonsByPermission(_type: 'OQUT' | 'ORDR' | 'OINV' | 'ODPI' | 'RINV' | 'ODRF' | 'ODLN' | 'ORIN', _buttons: ICLTableButton[]): ICLTableButton[] {
    let userPermissions = this.userPermissions.map(userPermission => userPermission.Name);
    const buttonsPermision: ICLTableButton[] = [];
    const permissionsMap: { [key: string]: { [key: string]: string } } = {
        'OQUT': {
            'editar': 'Sales_SearchDocs_EditQuotations',
            'imprimir': 'Sales_SearchDocs_PrintQuotations',
            'previsualizar': 'Sales_SearchDocs_PreviewQuotations',
            'duplicar': 'Sales_SearchDocs_DuplicateQuotations',
            'copiar': 'Sales_SearchDocs_CopyQuotations',
            'cancelar': 'Sales_SearchDocs_CancelQuotations'
        },
        'ORDR': {
            'editar': 'Sales_SearchDocs_EditOrders',
            'imprimir': 'Sales_SearchDocs_PrintOrders',
            'previsualizar': 'Sales_SearchDocs_PreviewOrders',
            'duplicar': 'Sales_SearchDocs_DuplicateOrders',
            'copiar': 'Sales_SearchDocs_CopyOrders',
            'cancelar': 'Sales_SearchDocs_CancelOrders'
        },
        'OINV': {
            'imprimir': 'Sales_SearchDocs_PrintInvoices',
            'previsualizar': 'Sales_SearchDocs_PreviewInvoices',
            'duplicar': 'Sales_SearchDocs_DuplicateInvoices',
            'copiar': 'Sales_SearchDocs_CopyInvoices'
        },
        'ODPI': {
            'imprimir': 'Sales_SearchDocs_PrintDownPayments',
            'previsualizar': 'Sales_SearchDocs_PreviewDownPayments',
            'copiar': 'Sales_SearchDocs_CopyDownPayments'
        },
        'RINV': {
            'imprimir': 'Sales_SearchDocs_PrintInvoices/GetReserveInvoice',
            'previsualizar': 'Sales_SearchDocs_PreviewInvoices/GetReserveInvoice',
            'copiar': 'Sales_SearchDocs_CopyInvoices/GetReserveInvoice'
        },
        'ODRF': {
            'imprimir': 'Sales_SearchDocs_PrintDraft',
            'previsualizar': 'Sales_SearchDocs_PreviewDraft',
            'copiar': 'Sales_SearchDocs_CopyDraft',
            'cancelar': 'Sales_SearchDocs_CancelDraft'
        },
        'ODLN': {
            'imprimir': 'Sales_SearchDocs_PrintDeliveryNotes',
            'previsualizar': 'Sales_SearchDocs_PreviewDeliveryNotes',
        },
        'ORIN': {
            'imprimir': 'Sales_SearchDocs_PrintCreditNotes',
            'previsualizar': 'Sales_SearchDocs_PreviewCreditNotes',
            'duplicar': 'Sales_SearchDocs_DuplicateCreditNotes',
        },
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
      'CreditNotes': '14',
      'DeliveryNotes': '15',
      'DownPayments': '203',
      'Invoices': '13',
      'Invoices/GetReserveInvoice': '13',
      'Orders': '17',
      'Quotations': '23',
    };
    return objTypeMap[ObjType] || '';
  }

  /**
   * Method to obtain sales documents
   * @constructor
   */
  GetDocuments = (): void => {
    let filter: IDocumentSearchFilter = this.searchForm.value as IDocumentSearchFilter;
    this.overlayService.OnGet();
    this.allSubscriptions.add(
      this.salesService.GetDocuments(
        this.controllerToSendRequest,
        this.DefaultBusinessPartner?.CardName ?? '',
        filter.SalePerson.SlpCode,
        filter.DateFrom,
        filter.DateTo,
        this.DefaultBusinessPartner?.CardCode ?? '',
        filter.DocNum,
        filter.DocStatus,
        this.controllerToSendRequestObjectType
      ).pipe(finalize(() => this.overlayService.Drop()))
        .subscribe({
          next: (callback) => {
            this.documents = callback.Data;
            const NEW_TABLE_STATE = {
              Records: this.documents.map(d => this.sharedService.MapTableColumns({
                ...d,
                CardName: `${d.CardCode} - ${d.CardName}`,
                DocDateFormatted: formatDate(d.DocDate, 'MMMM d, y hh:mm a', 'en'),
                DocStatus: d.DocStatus === 'C' ? 'Cerrado' : d.DocStatus === 'P'? 'Pagado': 'Abierto'
              }, Object.keys(this.docTbColumns))),
            };

            this.linkerService.Publish({
              CallBack: CL_CHANNEL.INFLATE,
              Target: this.documentsTableId,
              Data: JSON.stringify(NEW_TABLE_STATE)
            });
          }
        }));
  }

  ResetTable(): void {
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

  OpenPreviewDocumentDialog(_docEntry: number, _controller: string): void {
    this.dialog.open(DocPreviewComponent, {
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

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
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
  }
}
