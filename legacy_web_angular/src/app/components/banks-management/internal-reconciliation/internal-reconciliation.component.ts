import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {filter, finalize, map, Observable, of, startWith, Subscription, switchMap} from "rxjs";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";
import {ISettings} from "@app/interfaces/i-settings";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {ICurrencies} from "@app/interfaces/i-currencies";
import {IActionButton} from "@app/interfaces/i-action-button";
import {InvoiceOpen} from "@app/interfaces/i-invoice-payment";
import {IEditableField, IEditableFieldConf} from "@clavisco/table/lib/table.space";
import {
  IInternalReconciliationRows, IInternalReconciliations,
  IPayInAccount
} from "@app/interfaces/i-pay-in-account";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MapDisplayColumns, MappedColumns} from "@clavisco/table";
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
import {ICompany, IPorts} from "@app/interfaces/i-company";
import { IDecimalSetting, IPaymentSetting } from "../../../interfaces/i-settings";
import {ICurrentSession} from "@app/interfaces/i-localStorage";
import {CLPrint, GetError, Repository, Structures} from "@clavisco/core";
import {IUserToken} from "@app/interfaces/i-token";
import {StorageKey} from "@app/enums/e-storage-keys";
import {OverlayService} from "@clavisco/overlay";
import {
  AlertsService,
  CLModalType,
  CLNotificationType,
  CLToastType,
  ModalService,
  NotificationPanelService
} from "@clavisco/alerts";
import {SharedService} from "@app/shared/shared.service";
import {ActivatedRoute} from "@angular/router";
import {SalesDocumentService} from "@app/services/sales-document.service";
import {MatDialog} from "@angular/material/dialog";
import {IncomingPaymentsService} from "@app/services/incoming-payments.service";
import {CommonService} from "@app/services/common.service";
import {CheckboxColumnSelection} from "@app/interfaces/i-table-data";
import {IInternalReconciliationResolveData,} from "@app/interfaces/i-resolvers";
import {SettingCode} from "@app/enums/enums";
import {CLTofixed, GetIndexOnPagedTable,} from "@app/shared/common-functions";
import {formatDate} from "@angular/common";
import {CreditNotesService} from "@app/services/credit-notes.service";
import {InternalReconciliationService} from "@app/services/internal-reconciliation.service";
import Validation from "@app/custom-validation/custom-validators";
import {ISearchModalComponentDialogData, SearchModalComponent} from "@clavisco/search-modal";
import {BusinessPartnersService} from "@app/services/business-partners.service";

@Component({
  selector: 'app-internal-reconciliation',
  templateUrl: './internal-reconciliation.component.html',
  styleUrls: ['./internal-reconciliation.component.scss']
})
export class InternalReconciliationComponent implements OnInit, OnDestroy {

  /*LISTAS*/
  settings: ISettings[] = [];
  permissions: IPermissionbyUser[] = []
  BusinessPartners: IBusinessPartner[] = [];
  currencies: ICurrencies[] = [];
  actionButtons: IActionButton[] = [];
  documents: InvoiceOpen[] = [];
  invoicesEditableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'Pago',
      Permission: {Name: 'Banks_InternalReconciliation_EditInvoicesPaymentAmount'}
    },
  ];
  creditMemoEditableField: IEditableField<IPermissionbyUser>[] = [
    {
      ColumnName: 'Pago',
      Permission: {Name: 'Banks_InternalReconciliation_EditCreditMemoPaymentAmount'}
    },
  ];

  /*Formularios*/
  documentForm!: FormGroup;

  /*TABLA NC*/
  shouldPaginateRequestNC:boolean = true;
  shouldPaginateRequestFactura:boolean = true;
  TableIdCreditnemo: string = 'NC-TABLE';
  creditMemosTbMappedColumns!: MappedColumns;
  creditMemoEditableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  creditMemoTbColumns: { [key: string]: string } = {
    Assigned: 'Seleccionar',
    CardName: 'Cliente',
    DocumentType: 'Tipo documento',
    DocNum: 'Número de documento',
    InstlmntID: 'Plazos',
    DocCurrency: 'Moneda',
    DateFormatted: 'Fecha de factura',
    DateFormattedV: 'Vencimiento',
    Pago: 'Pago',
    TotalTable: 'Total',
    SaldoTable: 'Saldo',
    DocEntry: '',
    ObjType: ''
  }
  creditMemoMapDisplayColumnsArgs: any;
  creditnemos: InvoiceOpen[] = [];
  conciliationTotal: number = 0;
  conciliationTotalFC: number = 0;
  symbolCurrency: string = '';
  /*TABLA*/
  docTableId: string = 'INVOICE-TABLE';
  docTbMappedColumns!: MappedColumns;
  invoicesEditableFieldConf!: IEditableFieldConf<IPermissionbyUser>;
  callbacks: ICLCallbacksInterface<CL_CHANNEL> = {
    Callbacks: {},
    Tracks: [],
  };
  checkboxColumns: string[] = ['Assigned'];
  allSubscriptions: Subscription;
  docTbColumns: { [key: string]: string } = {
    Assigned: 'Seleccionar',
    CardName: 'Cliente',
    DocumentType: 'Tipo documento',
    DocNum: 'Número de documento',
    InstlmntID: 'Plazos',
    DocCurrency: 'Moneda',
    DateFormatted: 'Fecha de factura',
    DateFormattedV: 'Vencimiento',
    Pago: 'Pago',
    TotalTable: 'Total',
    SaldoTable: 'Saldo',
    DocEntry: '',
    ObjType: ''
  }
  docTbMapDisplayColumnsArgs: any;

  /*VARIABLES*/
  totalInvoice: number = 0;
  totalCreditNemo: number = 0;
  totalInvoiceFC: number = 0;
  totalCreditNemoFC: number = 0;
  currency: string = '';
  uniqueId: string = '';
  TO_FIXED_TOTALDOCUMENT: string = '1.0-0';
  User!: string;
  /*OBJECTS*/
  DecimalTotalDocument = 0; //Decimal configurado por compania para total de documento

  paymentConfiguration!: IPaymentSetting;
  selectedCompany!: ICompany | null;
  currentSession!: ICurrentSession;
  localCurrency!: ICurrencies;
  //#region component search
  searchModalId = "searchModalId";
  //#endregion
  DefaultBusinessPartner!: IBusinessPartner | null;
  constructor(
    private overlayService: OverlayService,
    private alertsService: AlertsService,
    private modalService: ModalService,
    private fb: FormBuilder,
    @Inject('LinkerService') private linkerService: LinkerService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private documentService: SalesDocumentService,
    private commonService: CommonService,
    private creditNotesService: CreditNotesService,
    private internalReconciliationService: InternalReconciliationService,
    private matDialog: MatDialog,
    private businessPartnersService: BusinessPartnersService,
  ) {


    this.allSubscriptions = new Subscription();

    this.docTbMapDisplayColumnsArgs = {
      dataSource: [] as InvoiceOpen[],
      inputColumns: [
        {ColumnName: 'Pago', FieldType: 'number'}],
      stickyColumns: [
        {Name: 'TotalTable', FixOn: 'right'},
        {Name: 'SaldoTable', FixOn: 'right'}
      ],
      editableFieldConf: this.invoicesEditableFieldConf,
      renameColumns: this.docTbColumns,
      ignoreColumns: ['DocEntry', 'NumAtCard', 'Saldo', 'SaldoUSD', 'Total', 'TotalUSD', 'TransId', 'CardCode', 'DocDate', 'DocDueDate', 'ObjType']
    };

    this.docTbMappedColumns = MapDisplayColumns(this.docTbMapDisplayColumnsArgs);

    this.creditMemoMapDisplayColumnsArgs = {
      dataSource: [] as InvoiceOpen[],
      editableFieldConf: this.creditMemoEditableFieldConf,
      inputColumns: [
        {ColumnName: 'Pago', FieldType: 'number'}],
      renameColumns: this.creditMemoTbColumns,
      ignoreColumns: ['DocEntry', 'NumAtCard', 'Saldo', 'SaldoUSD', 'Total', 'TotalUSD', 'TransId', 'CardCode', 'DocDate', 'DocDueDate', 'ObjType']
    };

    this.creditMemosTbMappedColumns = MapDisplayColumns(this.creditMemoMapDisplayColumnsArgs);
  }

  ngOnInit(): void {
    this.OnLoad();
  }

  ngOnDestroy(): void {
    this.sharedService.SetActionButtons([]);
    this.allSubscriptions.unsubscribe();
  }

  private OnLoad(): void {

    this.currentSession = Repository.Behavior.GetStorageObject<ICurrentSession>(StorageKey.CurrentSession) as ICurrentSession;
    this.uniqueId = this.commonService.GenerateDocumentUniqueID();
    this.selectedCompany = Repository.Behavior.GetStorageObject<ICompany>(StorageKey.CurrentCompany);
    this.User = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';
    this.InitForm();
    this.actionButtons = [
      {
        Key: 'SEARCH',
        MatIcon: 'search',
        Text: 'Buscar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'RECONCILIATION',
        MatIcon: 'save',
        Text: 'Crear',
        MatColor: 'primary',
        //DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
      {
        Key: 'CLEAN',
        MatIcon: 'mop',
        Text: 'Limpiar',
        MatColor: 'primary',
        DisabledIf: (_form?: FormGroup) => _form?.invalid || false
      },
    ]
    Register<CL_CHANNEL>(this.TableIdCreditnemo, CL_CHANNEL.REQUEST_RECORDS, this.GetCreditsNemo, this.callbacks);
    Register<CL_CHANNEL>(this.TableIdCreditnemo, CL_CHANNEL.OUTPUT_3, this.OnTableCreditNemoItemSelectionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.REQUEST_RECORDS, this.GetDocuments, this.callbacks);
    Register<CL_CHANNEL>(this.docTableId, CL_CHANNEL.OUTPUT_3, this.OnTableInvoiceItemSelectionActivated, this.callbacks);
    Register<CL_CHANNEL>(this.searchModalId, CL_CHANNEL.REQUEST_RECORDS, this.OnModalRequestRecords, this.callbacks);

    this.allSubscriptions.add(
      this.linkerService.Flow()?.pipe(
        StepDown<CL_CHANNEL>(this.callbacks),
      ).subscribe({
        next: callback => Run(callback.Target, callback, this.callbacks.Callbacks),
        error: error => CLPrint(error, Structures.Enums.CL_DISPLAY.ERROR)
      })
    );

    this.HandleResolvedData();
    this.RefreshRate();
  }


  public OnActionButtonClicked(_actionButton: IActionButton): void {

    switch (_actionButton.Key) {
      case 'SEARCH':
        this.SearchDocuments();
        break;
      case 'RECONCILIATION':
        this.Reconciliation();
        break;
      case 'CLEAN':
        this.ResetDocument();
        break;
    }
  }

  /**
   * Method to select invoice to apply internal reconciliation
   * @param _event - Event emitted from the table to select document
   * @constructor
   */
  public OnTableInvoiceItemSelectionActivated = (_event: ICLEvent): void => {

    let data: CheckboxColumnSelection<InvoiceOpen> = JSON.parse(_event.Data);

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequestFactura);

    if (data.Row.Pago <= data.Row.SaldoTable) {

      this.documents[INDEX].Assigned = data.Row.Assigned;

      if (data.EventName === 'InputField') {
        if (+(data.Row.Pago) <= 0) {
          this.InflateTable();
          return;
        }

        this.documents[INDEX].Pago = data.Row.Pago;

      } else {
        this.documents[INDEX].Pago = data.Row.Assigned ? data.Row.SaldoTable : 0;
      }

      this.GetTotals();

      this.InflateTable();

    } else {

      this.documents[INDEX].Assigned = false;

      this.documents[INDEX].Pago = 0;
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto ingresado no puede ser mayor al saldo del documento.`
      });
      this.InflateTable();
    }
  }

  GetTotals(): void {

    this.totalInvoice = this.documents.filter(_x => _x.Assigned)
      .reduce((acc, value) => acc + this.GetTotalByCurrency(value.Pago, value.DocCurrency), 0);

    this.totalCreditNemo = this.creditnemos.filter(_x => _x.Assigned)
      .reduce((acc, value) => acc + this.GetTotalByCurrency(value.Pago, value.DocCurrency), 0);

    this.totalInvoiceFC = this.totalInvoice / this.currentSession.Rate;
    this.totalCreditNemoFC = this.totalCreditNemo / this.currentSession.Rate;

    this.conciliationTotal = this.totalInvoice - this.totalCreditNemo;
    this.conciliationTotalFC = this.conciliationTotal / this.currentSession.Rate;

  }

  private GetTotalByCurrency(_pay: number, _currency: string): number {

    if (_currency === this.localCurrency.Id) {
      return +_pay;
    } else {
      return +_pay * this.currentSession.Rate;
    }
  }

  /**
   * Method to select credit nemo to apply internal reconciliation
   * @param _event - Event emitted from the table to select document
   * @constructor
   */
  public OnTableCreditNemoItemSelectionActivated = (_event: ICLEvent): void => {

    let data: CheckboxColumnSelection<InvoiceOpen> = JSON.parse(_event.Data);

    let INDEX = GetIndexOnPagedTable(data.ItemsPeerPage, data.RowIndex, data.CurrentPage + 1, this.shouldPaginateRequestNC);

    if (data.Row.Pago <= data.Row.SaldoTable) {

      this.creditnemos[INDEX].Assigned = data.Row.Assigned;

      if (data.EventName === 'InputField') {

        if (+(data.Row.Pago) <= 0) {
          this.InflateTableCreditNemo();
          return;
        }
        this.creditnemos[INDEX].Pago = data.Row.Pago;

      } else {
        this.creditnemos[INDEX].Pago = data.Row.Assigned ? data.Row.SaldoTable : 0;
      }

      this.GetTotals();
      this.InflateTableCreditNemo();

    } else {

      this.creditnemos[INDEX].Assigned = false;

      this.creditnemos[INDEX].Pago = 0;
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto ingresado no puede ser mayor al saldo del documento.`
      });
      this.InflateTableCreditNemo();
    }

  }

  /**
   * Load initial data required of component
   * @constructor
   * @private
   */
  private HandleResolvedData(): void {
    this.activatedRoute.data
      .subscribe({
        next: (data) => {
          const dataResolved = data['resolvedData'] as IInternalReconciliationResolveData;

          if (dataResolved) {
            this.currencies = dataResolved.Currencies;
            this.localCurrency = this.currencies.find(c => c.IsLocal)!;
            this.symbolCurrency = this.localCurrency?.Symbol;
            this.permissions = dataResolved.Permissions;
            this.settings = dataResolved.Settings;
            this.documentForm.patchValue({
              DocCurrency: this.currencies.find(x => x.IsLocal)?.Id
            });
            this.currency = this.documentForm.controls['DocCurrency'].value;

            //#region Permission
            this.invoicesEditableFieldConf =
              {
                Permissions: this.permissions ?? [],
                Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(p => p.Name === _columnPerm.Name),
                Columns: this.invoicesEditableField,
              };

            this.docTbMapDisplayColumnsArgs.editableFieldConf = this.invoicesEditableFieldConf;
            this.docTbMappedColumns = MapDisplayColumns(this.docTbMapDisplayColumnsArgs);

            this.creditMemoEditableFieldConf =
              {
                Permissions: this.permissions ?? [],
                Condition: (_columnPerm: IPermissionbyUser, _permissions: IPermissionbyUser[]) => !_permissions.some(p => p.Name === _columnPerm.Name),
                Columns: this.creditMemoEditableField,
              };

            this.creditMemoMapDisplayColumnsArgs.editableFieldConf = this.creditMemoEditableFieldConf;
            this.creditMemosTbMappedColumns = MapDisplayColumns(this.creditMemoMapDisplayColumnsArgs);
            //#endregion

            //#region DECIMALES
            if (this.settings) {
              let companyDecimal: IDecimalSetting[] = JSON.parse((this.settings.find((element) => element.Code == SettingCode.Decimal)?.Json || '[]'));
              if (companyDecimal && companyDecimal.length > 0) {

                let decimalCompany = companyDecimal.find(x => x.CompanyId === this.selectedCompany?.Id) as IDecimalSetting;

                if(decimalCompany) {
                  this.TO_FIXED_TOTALDOCUMENT = `1.${decimalCompany.TotalDocument}-${decimalCompany.TotalDocument}`;
                  this.DecimalTotalDocument = decimalCompany.TotalDocument;
                }
              }
            }
            //#endregion

            //#region CONFIG DE PINPAD
            if (this.settings.some((element) => element.Code == SettingCode.Payment)) {
              let paymentSettings = JSON.parse(this.settings.find((element) => element.Code == SettingCode.Payment)?.Json || '') as IPaymentSetting[];
              if (paymentSettings && paymentSettings.length > 0) {
                let dataPayment = paymentSettings.find(x => x.CompanyId === this.selectedCompany?.Id) as IPaymentSetting;
                if (dataPayment) {
                  this.paymentConfiguration = dataPayment;
                }
              }
            }
            //#endregion
          }
        }
      });
  }

  /**
   * Initialize business partner form
   * @constructor
   * @private
   */
  private InitForm(): void {
    this.documentForm = this.fb.group({
      BusinessPartner: ['', [Validators.required]],
      DateFrom: [new Date(), Validators.required],
      DateTo: [new Date(), Validators.required],
      DocCurrency: ['', [Validators.required]],
    });

    this.documentForm.get('BusinessPartner')!.valueChanges.pipe(
      map((value: string) => {
        if (value !== this.getDisplayValue(this.DefaultBusinessPartner as IBusinessPartner)) {
          this.DefaultBusinessPartner = null;
          this.documentForm.patchValue({ BusinessPartner: '' });
        }
      })
    ).subscribe();

  }

  private getDisplayValue(value: IBusinessPartner): string {
    return value ? `${value.CardCode} - ${value.CardName}` : '';
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
        next: (value: IBusinessPartner) => {
          if(value){
            this.DefaultBusinessPartner = value;
            this.documentForm.patchValue({ BusinessPartner: `${value.CardCode} - ${value.CardName}`});
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
        this.BusinessPartners = callback.Data;

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
      Records: this.BusinessPartners,
      RecordsCount: this.BusinessPartners.length,
    };

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Data: JSON.stringify(NEXT_TABLE_STATE),
      Target: this.searchModalId
    });
  }

  /**
   * Method to obtain invoices for reconciliation
   * @constructor
   */
  private GetDocuments = (): void => {

    let data = this.documentForm.getRawValue();

    this.overlayService.OnPost();
    this.documentService.GetInvoiceForInternalReconciliation(this.DefaultBusinessPartner?.CardCode ?? '', data.DocCurrency === '##' ? "" : data.DocCurrency, data.DateFrom, data.DateTo).pipe(
      filter(res => {
        if (res.Data && res.Data.length > 0) return true;
        else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `No se obtuvieron documentos.`
          });
          return false
        }
      }),
      map(callback => callback.Data.map(document => {
        return {
          ...document,
          Pago: 0,
          SaldoTable: this.localCurrency.Id === document.DocCurrency ? CLTofixed(this.DecimalTotalDocument, document.Saldo) : CLTofixed(this.DecimalTotalDocument, document.SaldoUSD),
          TotalTable: this.localCurrency.Id === document.DocCurrency ? CLTofixed(this.DecimalTotalDocument, document.Total) : CLTofixed(this.DecimalTotalDocument, document.TotalUSD),
          DateFormattedV: formatDate(document.DocDueDate, 'MMMM d, y hh:mm a', 'en'),
          DateFormatted: formatDate(document.DocDate, 'MMMM d, y hh:mm a', 'en'),
          Assigned: false,
          CardName: `${document.CardCode} - ${document.CardName}`,
          TransId: document.TransId
        }
      })),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.documents = callback;
        this.InflateTable();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * Method to obtain credit nemo for reconciliation
   * @constructor
   */
  private GetCreditsNemo = (): void => {

    let data = this.documentForm.getRawValue();

    this.overlayService.OnPost();
    this.creditNotesService.GetCreditNotesOpen(this.DefaultBusinessPartner?.CardCode ?? '', data.DocCurrency === '##' ? "" : data.DocCurrency, data.DateFrom, data.DateTo).pipe(
      filter(res => {
        if (res.Data && res.Data.length > 0) return true;
        else {
          this.alertsService.Toast({
            type: CLToastType.INFO,
            message: `No se obtuvieron documentos.`
          });
          return false
        }
      }),
      map(callback => callback.Data.map(document => {
        return {
          ...document,
          Pago: 0,
          SaldoTable: this.localCurrency.Id === document.DocCurrency ? CLTofixed(this.DecimalTotalDocument, document.Saldo) : CLTofixed(this.DecimalTotalDocument, document.SaldoUSD),
          TotalTable: this.localCurrency.Id === document.DocCurrency ? CLTofixed(this.DecimalTotalDocument, document.Total) : CLTofixed(this.DecimalTotalDocument, document.TotalUSD),
          DateFormattedV: formatDate(document.DocDueDate, 'MMMM d, y hh:mm a', 'en'),
          DateFormatted: formatDate(document.DocDate, 'MMMM d, y hh:mm a', 'en'),
          Assigned: false,
          CardName: `${document.CardCode} - ${document.CardName}`,
          TransId: document.TransId
        }
      })),
      finalize(() => this.overlayService.Drop())
    ).subscribe({
      next: (callback) => {
        this.creditnemos = callback;
        this.InflateTableCreditNemo();
      },
      error: (err) => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
      }
    })
  }

  /**
   * MUESTRA LOS TOTALES
   * @param _option
   * @constructor
   */
  public DisplayTotal(_option: number): number {
    if (_option === 2) {
      if (this.localCurrency?.Id === this.currency) {
        return this.totalCreditNemo;
      } else {
        return this.totalCreditNemoFC;
      }
    }
    if (_option === 1) {
      if (this.localCurrency?.Id === this.currency) {
        return this.totalInvoice;
      } else {
        return this.totalInvoiceFC;
      }
    } else {
      if (this.localCurrency?.Id === this.currency) {
        return this.conciliationTotal;
      } else {
        return this.conciliationTotalFC;
      }
    }
  }

  /**
   * MUESTRA EL MENSAJE EN EL TOOLTIP CON LA CONVERSION RESPECTIVA
   * @param _option
   * @constructor
   */
  public DisplayTotalHover(_option: number): number {
    if (_option === 2) {
      if (this.localCurrency?.Id === this.currency) {
        return this.totalCreditNemoFC;
      } else {
        return this.totalCreditNemo;
      }
    }
    if (_option === 1) {
      if (this.localCurrency?.Id === this.currency) {
        return this.totalInvoiceFC;
      } else {
        return this.totalInvoice;
      }
    } else {
      if (this.localCurrency?.Id === this.currency) {
        return this.conciliationTotalFC;
      } else {
        return this.conciliationTotal;
      }
    }
  }

  public GetConversionSymbol(): string {
    return this.currencies.filter(c => c.Id !== '##').find(c => c.Id !== this.currency)?.Symbol || '';
  }

  private SearchDocuments(): void {
    this.totalInvoice = 0;
    this.totalCreditNemo = 0;
    this.conciliationTotal = 0;

    let currency = this.documentForm.getRawValue();

    if (currency.DocCurrency === '##') {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `Seleccione moneda`
      });
      return;
    }

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.docTableId,
      Data: ''
    });

    this.linkerService.Publish({
      CallBack: CL_CHANNEL.PRE_REQ_RECORDS,
      Target: this.TableIdCreditnemo,
      Data: ''
    });
  }

  private InflateTable(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.documents,
      RecordsCount: this.documents.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.docTableId,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  private InflateTableCreditNemo(): void {
    const NEW_TABLE_STATE = {
      CurrentPage: 0,
      ItemsPeerPage: 5,
      Records: this.creditnemos,
      RecordsCount: this.creditnemos.length
    };
    this.linkerService.Publish({
      CallBack: CL_CHANNEL.INFLATE,
      Target: this.TableIdCreditnemo,
      Data: JSON.stringify(NEW_TABLE_STATE)
    } as ICLEvent);
  }

  public SelectCurrency(): void {
    this.currency = this.documentForm.controls['DocCurrency'].value;
    if (this.localCurrency.Id === this.currency) {
      this.symbolCurrency = '₡';

    } else if (this.localCurrency.Id !== this.currency) {
      this.symbolCurrency = '$';
    } else {
      let currency = this.currencies.find(x => x.IsLocal);
      if (currency) {
        this.symbolCurrency = this.currencies.find(c => c.Id === currency!.Id)?.Symbol || '';
      }
    }

    this.creditnemos = [];
    this.documents = [];
    this.totalInvoice = 0;
    this.totalCreditNemo = 0;
    this.conciliationTotal = 0;
    this.totalInvoiceFC = 0;
    this.totalCreditNemoFC = 0;
    this.conciliationTotalFC = 0;
    this.InflateTable();
    this.InflateTableCreditNemo();
  }

  private ResetDocument(): void {
    try {
      this.DefaultBusinessPartner = null;
      this.uniqueId = this.commonService.GenerateDocumentUniqueID();
      this.creditnemos = [];
      this.InflateTableCreditNemo();
      this.documents = [];
      this.InflateTable();
      this.totalInvoice = 0;
      this.conciliationTotal = 0;
      this.totalCreditNemo = 0;
      this.InitForm();
      this.documentForm.patchValue({
        DocCurrency: this.currencies?.find(x => x.IsLocal)?.Id
      });
      this.currency = this.documentForm.controls['DocCurrency'].value;
    } catch (Exception) {
      CLPrint(Exception, CL_DISPLAY.ERROR);
    }
  }

  /**
   * Create reconciliation
   * @constructor
   */
  public Reconciliation(): void {

    if (!this.documents.some(x => x.Assigned)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No ha seleccionado facturas`
      });
      return;
    }

    if (!this.creditnemos.some(x => x.Assigned)) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No ha seleccionado notas de crédito`
      });
      return;
    }


    if (this.conciliationTotal !== 0) {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `El monto de conciliación debe ser 0.`
      });
      return;
    }


    let businessPartner = this.documentForm.controls['BusinessPartner'].value as IBusinessPartner;

    let isBusinessPartnerAllCurrency = businessPartner.Currency === '##' && this.currency !== this.localCurrency?.Id;

    let reconciliation = {
      CardOrAccount: 'coaCard',
      InternalReconciliationOpenTransRows: this.creditnemos.filter(x => x.Assigned).map((element, index) => {
        return {
          CreditOrDebit: 'codCredit',
          ReconcileAmount: isBusinessPartnerAllCurrency ? CLTofixed(this.DecimalTotalDocument, +element.Pago * this.currentSession.Rate) : +element.Pago,
          ShortName: businessPartner.CardCode,
          SrcObjAbs: element.DocEntry,
          SrcObjTyp: element.ObjType,
          TransId: +element.TransId,
          TransRowId: 0
        } as IInternalReconciliationRows
      })
    } as IInternalReconciliations;

    this.documents.filter(x => x.Assigned).forEach((element, index) => {
      reconciliation.InternalReconciliationOpenTransRows.push({
        CreditOrDebit: 'codDebit',
        ReconcileAmount: isBusinessPartnerAllCurrency ? CLTofixed(this.DecimalTotalDocument, +element.Pago * this.currentSession.Rate): +element.Pago,
        ShortName: businessPartner.CardCode,
        SrcObjAbs: element.DocEntry,
        SrcObjTyp: element.ObjType,
        TransId: +element.TransId,
        TransRowId: 0
      } as IInternalReconciliationRows)
    });

    if (isBusinessPartnerAllCurrency) {

      this.overlayService.OnGet();
      this.modalService.CancelAndContinue({
        type: CLModalType.QUESTION,
        title: `Reconciliación se creará en moneda local`,
        subtitle: `Cliente es monedas todas y moneda del documento es diferente a moneda local`,
      }).pipe(
        filter(res => res),
        switchMap(res => {
          return this.internalReconciliationService.Post(reconciliation);
        }),
        finalize(() => this.overlayService.Drop())
      ).subscribe({
        next: (callback => {
          this.modalService.Continue({
            title: `La reconciliación se creó correctamente con el número de documento ${callback.Data.ReconNum}`,
            type: CLModalType.SUCCESS
          });
          this.documents = this.documents.filter(x => !x.Assigned);
          this.creditnemos = this.creditnemos.filter(x => !x.Assigned);
          this.GetTotals();
          this.InflateTable();
          this.InflateTableCreditNemo();
        }),
        error: (err) => {
          this.modalService.Continue({
            title: 'Se produjo un error creando la reconciliación',
            subtitle: GetError(err),
            type: CLModalType.ERROR
          });
        }
      });

    } else {
      this.overlayService.OnGet();
      this.internalReconciliationService.Post(reconciliation).pipe(
        finalize(() => this.overlayService.Drop())
      )
        .subscribe({
          next: callback => {
            this.modalService.Continue({
              title: `La reconciliación se creó correctamente con el número de documento ${callback.Data.ReconNum}`,
              type: CLModalType.SUCCESS
            });
            this.documents = this.documents.filter(x => !x.Assigned);
            this.creditnemos = this.creditnemos.filter(x => !x.Assigned);
            this.GetTotals();
            this.InflateTable();
            this.InflateTableCreditNemo();
          },
          error: (err) => {
            this.modalService.Continue({
              title: 'Se produjo un error creando la reconciliación',
              subtitle: GetError(err),
              type: CLModalType.ERROR
            });
          }
        });
    }
  }

  private RefreshRate(): void {
    this.sharedService.refreshRate$.pipe(
      filter((value: number) => {
        return !!(value);
      })
    ).subscribe({
      next: (value) => {
        this.currentSession.Rate = value;
      },
      error: (error) => {
      }
    });
  }
  public ChangeBusinessPartner(): void {
    this.documents = [];
    this.creditnemos= [];
    this.totalInvoice = 0;
    this.totalCreditNemo = 0;
    this.conciliationTotal = 0;
    this.totalInvoiceFC = 0;
    this.totalCreditNemoFC = 0;
    this.conciliationTotalFC = 0;
    this.InflateTable();
    this.InflateTableCreditNemo();
  }
}
