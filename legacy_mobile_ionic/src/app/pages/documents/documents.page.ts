import {IDecimalSetting, ILineModeSetting, IMobileAppConfiguration, IValidateLine} from './../../interfaces/i-settings';
import {ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {Geolocation} from "@ionic-native/geolocation/ngx";
import {TranslateService} from "@ngx-translate/core";
import {Network} from "@ionic-native/network/ngx";
import {catchError, filter, finalize, map, switchMap} from "rxjs/operators";
import {FormBuilder, FormControl, FormGroup, Validators,} from "@angular/forms";

import {ActionSheetButton, ActionSheetController, AlertButton, IonItemSliding, PopoverController} from "@ionic/angular";
// Services
import {
    CardService,
    CheckRouteService,
    CommonService,
    CompanyService,
    CustomerService,
    DiscountHierarchyService,
    DocumentService,
    ExRateService,
    FileService,
    GeoconfigService,
    LocalStorageService,
    PadronService,
    PermissionService,
    PriceListService,
    PrintingService,
    ProductService,
    PublisherService,
    Repository,
    SeriesService,
    TaxService,
    WarehouseService,
} from "src/app/services";
// Common
import {AlertType, CheckType, DocumentType, FEIdentificationType, Geoconfigs, NumberingSeries,} from "src/app/common";
// Models
import {
    CashPayment,
    CreditCardMobile,
    DiscountGroup,
    DiscountHierarchy,
    DocumentLinesBaseModel,
    FocusItemModel,
    IBatchedItem,
    IBlanketAgreement,
    ICompanyInformation,
    ICurrency,
    IExchangeRate,
    IGeoConfig,
    IItemToBatch,
    IItemToFreight,
    IMeasurementUnit,
    ITransferPayment,
    MobInvoiceWithPayment,
    PermissionsSelectedModel,
    PromotionsModel,
    UDFModel2,
} from "src/app/models";
// Components
import {
    CustomerSearchComponent,
    DocumentCreatedComponent,
    DocumentCurrencyComponent, DownPaymentComponent,
    EditDocumentLineComponent,
    ItemToBatchComponent,
    PaymentComponent,
    ProductSearchComponent,
    UdfPresentationComponent,
} from "src/app/components";
import {InvoiceTypes, IsSerial, Structures} from "src/app/common/constants";
import {IIdentificationType, IInvoiceType,} from "src/app/models/db/iinvoice-type";
import {LogManagerService} from "../../services/log-manager.service";
import {
    IDocumentCreateComponentInputData,
    IDocumentCurrencyComponentInputData, IDocumentForDownPaymentInputData,
    IEditDocumentLineComponentData,
    IPaymentComponentInputData,
    IProductSearchComponentInputData,
} from "src/app/models/db/i-modals-data";
import {IBin, IBinRequest, IBinStock} from "src/app/models/db/i-bin";
import {AllocationService} from "../../services";
import {CustomModalController} from "src/app/services/custom-modal-controller.service";
import {IActRouteDestination, IRoute} from "src/app/models/db/route-model";
import {forkJoin, from, Observable, of, Subscription} from "rxjs";
import {
    BatchSerial,
    BoYesNoEnum,
    DocumentSAPTypes,
    DocumentSyncStatus,
    DocumentTypeAcronyms,
    DocumentTypeName,
    LocalStorageVariables,
    LogEvent, PaymentInvoiceType,
    PreLineStatus,
    PublisherVariables,
    ReferencedObjectTypeEnum,
    SeriesTypes,
    SettingCodes,
    TransactionType
} from '../../common/enum';
import {
    IDocumentToSync,
    IDocumentTypeLabel,
    PreloadedDocument,
    PreloadedDocumentInfo
} from "src/app/models/db/Doc-model";
import {IBasicBatch, ICommitedStockLines, IProductWithProblems, SLBatch} from "src/app/models/db/product-model";
import {IPriceListInfo} from '../../models/db/i-price-list-info';
import {ICLResponse} from "../../models/responses/response";
import {IUserAssign} from "../../models/db/user-model";
import {ISearchProduct} from "../../interfaces/i-product";
import {
    IARInvoice,
    IARInvoiceRows,
    ICreditNotes,
    ICreditNotesRows,
    IDeliveryNotes,
    IDeliveryNotesRows, IDownInvoiceWithPayment, IDownPaymentsToDraw,
    IIncomingPayment,
    IPaymentCreditCards,
    IPaymentInvoices,
    ISalesOrder,
    ISalesOrderRows,
    ISalesQuotation,
    ISalesQuotationRows
} from "../../interfaces/i-documents";
import {ICard} from 'src/app/models/i-card';
import {IBatchNumbers} from "../../interfaces/i-batches";
import {ISeries} from "../../interfaces/i-serie";
import {UdfsService} from "../../services/udfs.service";
import {AddDays, AddMonths, CLMathRound, FormatDate, MappingUdfsDevelopment, ZoneDate} from "src/app/common/function";
import {IUdf, IUdfContext, IUdfDevelopment} from "../../interfaces/i-udfs";
import {IDevelopment} from "../../interfaces/i-development";
import {SettingsService} from "src/app/services/settings.service";
import {ICompany} from "src/app/models/db/companys";
import {IFeData} from "../../interfaces/i-feData";
import {IWarehouses} from 'src/app/interfaces/i-warehouse';
import {PrintFormatService} from "../../services/print-format.service";
import {IDocumentLine, ISelectedProducts} from "../../interfaces/i-item";
import {ISalesTaxes} from "../../interfaces/i-sales-taxes";
import {IBusinessPartners} from 'src/app/interfaces/i-business-partners';
import {IDocumentReference} from "../../interfaces/i-documentReference";
import {App} from "@capacitor/core";
import {formatDate} from "@angular/common";
//import {QRScanner, QRScannerStatus} from "@ionic-native/qr-scanner/ngx";
import {FilterDataComponent} from "../../components/filter-data/filter-data.component";
import {IDefaultBusinessPartnerSetting, ISetting, IUdfsFEOffline, IValidateAttachmentsSetting} from "../../models/api/i-setting";
import {CalculationService} from "../../services/calculation.service";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {PayTermsService} from "../../services/pay-terms.service";
import {IPayTerms} from "../../interfaces/i-pay-terms";
import { ILinesToPrint, IOfflineZPLData } from 'src/app/interfaces/i-print';
import { IAttachments2Line, IDocumentAttachment } from 'src/app/interfaces/i-document-attachment';
import { AttachmentsService } from 'src/app/services/attachments.service';
import { AttachmentFilesComponent } from 'src/app/components/attachment-files/attachment-files.component';

@Component({
    selector: "app-documents",
    templateUrl: "./documents.page.html",
    styleUrls: ["./documents.page.scss"],
})
export class DocumentsPage{
    // Components
    @ViewChild(UdfPresentationComponent, { static: false }) udfPresentationComponent: UdfPresentationComponent;
    @ViewChild(AttachmentFilesComponent, { static: false }) attachmentFilesComponent: AttachmentFilesComponent;
    // VARBOX
    docTypesLabels: IDocumentTypeLabel[] = [];
    disableCreateButton: boolean = false;
    transactionType: string;
    createDocumentOutOfRange: boolean;
    documentWithPreloadedCustomer: boolean;
    activeRouteDestination: IActRouteDestination;
    showPriceListButton: boolean = true;
    preloadedDocumentLines: IDocumentLine[] = [];
    binBatchAllocations: IBinRequest[];
    binAllocations: IBin[];
    selectedPriceList: IPriceListInfo;
    commitedBatches: IItemToBatch[] = [];
    hasBatchedItemsWithoutProcess: boolean;
    batchedItems: IDocumentLine[] = [];
    permisionList: PermissionsSelectedModel[] = [];
    activatedRoute: IRoute;
    blanketAgreementName: string[] = [];
    hasSomeBlanketAgreement: boolean = false;
    blanketAgreement: IBlanketAgreement[] = [];
    lastDocEntry: number;
    invoiceTypes: IInvoiceType[];
    visualSubtotal: number;
    appliedAmount: number = 0;
    hasHeaderDiscount: boolean;
    subTotalHeader: number;
    headerDiscount: number;
    totalHeaderDiscount: number;
    isUdfFormToggled: boolean;
    isFeFormToggled: boolean;
    canCalculateFreight: boolean;
    hasFreight: boolean;
    pageTitle: string;
    TO_FIXED_TOTALDOCUMENT: string = '';
    exRate: IExchangeRate;
    wareHouseList: IWarehouses[];
    promotionList: PromotionsModel[];
    companyPrintInfo: ICompanyInformation;
    cards: ICard[];
    customer: IBusinessPartners;
    numberingSeries: ISeries[];
    mUnits: IMeasurementUnit[];
    discountHierarchy: DiscountHierarchy[];
    discounts: DiscountGroup[];
    itemFocusList: FocusItemModel[];
    taxList: ISalesTaxes[] = [];
    currencyList: ICurrency[] = [];
    localCurrency!: ICurrency;
    documentLines: IDocumentLine[] = [];
    payTerms: IPayTerms[] = [];
    actualLat: number;
    actualLng: number;
    SearchCustomerBtn = true;
    SearchProductBtn = false;
    docCurrency: string = '';
    createDocumentCheck: boolean;
    documentKey: string;
    subTotal: number = 0;
    discount: number = 0;
    tax: number = 0;
    total: number = 0;
    cashPayment: CashPayment;
    transferPayment: ITransferPayment;
    cardsPayment: CreditCardMobile[];
    documentType: number;
    documentTypeReserve: number=0;
    y: number;
    printing: string;
    comments: string;
    numAtCard: string;
    PreloadedDocument: PreloadedDocumentInfo;
    slpName: string;
    paymentCurrency: string;
    customerCurrency: string;
    UDFsForm: FormGroup;
    udfs: IUdfContext[] = [];
    udfsValues: IUdf[] = [];
    udfsDevelopment: IUdfDevelopment[] = [];
    routerEventsSubs: Subscription;
    feForm: FormGroup;
    feIdentificationType = FEIdentificationType;
    showFEForm: boolean;
    cardNameFormControl: FormControl;
    showHeader = true;
    committedStockLines: ICommitedStockLines[] = [];
    currentLang: string;
    continueWithAction: boolean;
    UDFsInDocument: UDFModel2[];
    isActionCopyTo: boolean = false;
    isActionDuplicate: boolean = false;
    isEditionMode: boolean = false;
    baseDocumentType: number = 0;
    docToCopyLines: IDocumentLine[];
    // docListNum: number;
    nextLineNum: number;
    newLinesAdded: IDocumentLine[] = [];
    deleteStorageVariableDocType: boolean;
    documentReference: IDocumentReference;
    duplicateHasCustomer: boolean = true;
    G_ChangeDocPriceList: boolean;
    speedTestMbps: number;
    userAssignment: IUserAssign;
    decimalCompany: IDecimalSetting;
    G_ViewPriceCost: boolean=false;
    defaultBusinessPartner!: IDefaultBusinessPartnerSetting ;

    vldLineMode!: IValidateLine;
    vldLineModeSetting!: ILineModeSetting;

    showDateFields = false;
    canChangeDocDate: boolean = true;
    canChangeDocDueDate: boolean = true;
    canChangeTaxDate: boolean = true;
    
    docDate: string;
    dueDate: string
    taxDate: string
    docDueDateLabel: string = this.commonService.Translate('Fecha de vencimiento', 'Expiration date');
    authorizationDescription = this.commonService.Translate(`Documento requiere un proceso de autorización`, `Document require a process authorization`)
    
    //Scanner
    showScanner: boolean = false;
    /**
     * is variable to know if the user has permission to create a draft
     */
    canCreateDraft: boolean = false;
    /**
     * is variable to know if the user to update a draft for since search document
     */
    isActionDraft: boolean = false;
    /**
     * List of down payments available for processing or drawing.
     */
    DownPaymentsToDraw: IDownPaymentsToDraw[] = [];
    /**
     * Total amount of down payments calculated or to be drawn.
     */
    totalDownpayment: number = 0;
    /**
     * Flag indicating whether the current operation involves down payments.
     */
    isDownpayment: boolean = false;
    /**
     * Flag to toggle the visibility of the down payment form in the UI.
     */
    isDownpaymentFormToggled: boolean = false;

    isAttachmentToggled: boolean = false;

    downPaymentPercentage: FormControl = new FormControl(100, [Validators.min(1), Validators.max(100)]);

    totalDiscountDownPayment: number = 0;

    attachmentFiles: File[] = [];
    documentAttachment: IDocumentAttachment = {
            AbsoluteEntry: 0,
            Attachments2_Lines: []
        } as IDocumentAttachment;

    settings: ISetting[] = [];

    validateAttachmentsTables?: IValidateAttachmentsSetting;
    isVisibleAttachSeccion: boolean = false;
    udfsFEOffline: IUdfsFEOffline;

    constructor(
        public translateService: TranslateService,
        private network: Network,
        private geolocation: Geolocation,
        private modalCtrl: CustomModalController,
        private popoverCtrl: PopoverController,
        private formBuilder: FormBuilder,
        private localStorageService: LocalStorageService,
        private commonService: CommonService,
        private calculationService: CalculationService,
        private customerService: CustomerService,
        private geoconfigService: GeoconfigService,
        private discountHierarchyService: DiscountHierarchyService,
        private taxService: TaxService,
        private productService: ProductService,
        private repositoryDocument: Repository.Document,
        private documentService: DocumentService,
        private checkRouteService: CheckRouteService,
        private companyService: CompanyService,
        private printingService: PrintingService,
        private printService: PrintFormatService,
        private padronService: PadronService,
        private exchangeRateService: ExRateService,
        private mWareHouseService: WarehouseService,
        private cardsService: CardService,
        private priceListService: PriceListService,
        private actionSheetController: ActionSheetController,
        private logManagerService: LogManagerService,
        private allocationService: AllocationService,
        private permissionService: PermissionService,
        private publisherService: PublisherService,
        private repositoryRoute: Repository.Route,
        private udfsService: UdfsService,
        private settingsService: SettingsService,
        private seriesService: SeriesService,
        private detectorRef: ChangeDetectorRef,
        private datePicker: DatePicker,
        private payTermsService: PayTermsService,
        private attachmentService: AttachmentsService,
        private fileService: FileService,
        private repositorySerie: Repository.Serie,
    ) {
    }

    ionViewWillEnter() {
        
        this.DefineTitle();
        this.commonService.speedTestMbps.subscribe({
            next: (speedMbps) => {
                this.speedTestMbps = speedMbps;
            }
        });
        this.documentWithPreloadedCustomer = false;
        this.nextLineNum = 0;
        this.docToCopyLines = [];
        this.permisionList = [...this.permissionService.Permissions];
        this.SetPermissionsVariables();
        this.publisherService
            .getObservable()
            .pipe(filter((p) => p.Target === PublisherVariables.Permissions))
            .subscribe({
                next: (callback) => {
                    if (callback) {
                        this.permisionList = [...callback.Data];
                        this.SetPermissionsVariables();
                    }
                },
            });
        this.userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        this.currentLang = this.translateService.currentLang;
        this.UDFsForm = new FormGroup({});
        this.feForm = this.formBuilder.group({
            TipoDocE: [],
            IdType: [this.feIdentificationType[0].Id, Validators.required],
            Identification: ['', Validators.required],
            Email: [''],
            ObservacionFE: ['']
        });
        this.ResetData();
        this.SendInitalRequests();
        this.ValidatePermissionToEditDate();
        this.ValidatePermissionToAvailableDraft();
        this.userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        
        

        //Esto es para cuando se desconecta el internet y no se a vuelto a validar inventario, el motivo de esto es quitar el color rojo del item.
        this.network.onChange().subscribe({
            next: (change) => {
                this.documentLines.forEach(p => this.ItemExcededQuantityAvailable(p));
            }
        });
        
    }
    
    SetPermissionsVariables(): void {
        this.G_ChangeDocPriceList = this.permisionList.some(
            (p) => p.Name === "M_Sales_Documents_EditPriceList"
        );
        this.G_ViewPriceCost = this.permisionList.some(
            (p) => p.Name === "Sales_Document_ViewPriceCost"
        );
    }

    ionViewDidLeave() {
        this.modalCtrl.DismissAll();
    }
    
    /**
     * This method is used to get category of UDFS
     * @constructor
     * @private
     */
    private GetCategory(): string {
        let category = '';

        switch (this.documentType) {
            case DocumentType.SaleOrder:
                category = 'ORDR';
                break;
            case DocumentType.SaleOffer:
                category = 'OQUT';
                break;
            case DocumentType.CreditInvoice:
            case DocumentType.ReserveInvoice:
            case DocumentType.CashReserveInvoice:
            case DocumentType.CashInvoice:
                category = 'OINV';
                break;
            case DocumentType.Delivery:
                category = 'ODLN';
                break;
            case DocumentType.CreditNotes:
                category = 'ORIN';
                break;
            case DocumentType.CashDownInvoice:
            case DocumentType.CreditDownInvoice:
                category = 'ODPI';
                break;
        }

        return category;
    }

    /**
     * Mthod is for get initial data
     * @constructor
     */
    async SendInitalRequests(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();
        forkJoin({
            ExRate: this.exchangeRateService.GetExchangeRate().pipe(catchError(x => of({
                Data: null,
                Message: x
            } as ICLResponse<IExchangeRate>))),
            Warehouses: this.mWareHouseService.GetWarehouses().pipe(catchError(x => of({
                Data: [],
                Message: x
            } as ICLResponse<IWarehouses[]>))),
            Cards: this.cardsService.GetCards().pipe(catchError(x => of({
                Data: [],
                Message: x
            } as ICLResponse<ICard[]>))),
            Labels: this.documentService.GetDocumentTypesLabels().pipe(
                catchError(err => of({
                    Data: [],
                    Message: err
                } as ICLResponse<IDocumentTypeLabel[]>))
            ),
            GeoConfigs: this.geoconfigService.GetGeoConfigurations().pipe(catchError(error => of(({
                Data: [],
                Message: error
            } as ICLResponse<IGeoConfig[]>)))),
            CompanyPrintInfo: this.companyService.GetCompanyInformation().pipe(catchError(x => of({
                Data: null,
                Message: x
            } as ICLResponse<ICompanyInformation>))),
            DiscountHierarchy: this.discountHierarchyService.GetDiscountHierarchies().pipe(catchError(x => of({
                Data: [],
                Message: x
            } as ICLResponse<DiscountHierarchy[]>))),
            Taxes: this.taxService.GetTaxes().pipe(catchError(x => of({ Data: [], Message: x } as ICLResponse<ISalesTaxes[]>))),
            Currencies: this.companyService.GetCurrencies().pipe(catchError(x => of({
                Data: [],
                Message: x
            } as ICLResponse<ICurrency[]>))),
            BillingUDFs: this.udfsService.Get(this.GetCategory()).pipe(catchError(error => of(null))),
            UDFsDevelopment: this.udfsService.GetUdfsDevelopment(this.GetCategory()).pipe(catchError(error => of(null))),
            Geoposition: from(this.geolocation.getCurrentPosition()).pipe(map(x => (x)), catchError(x => of(null))),
            NumberingSeries: this.seriesService.GetSeriesByUser().pipe(catchError(x => of({
                Data: [],
                Message: x
            } as ICLResponse<ISeries[]>))),
            ActiveRoute: this.repositoryRoute.GetActiveRoute(),
            Settings: this.settingsService.GetSettings().pipe(catchError(error => of(null))),
            PayTerms: this.payTermsService.Get<IPayTerms[]>().pipe(catchError(error => of(null))),
        })
            .pipe(finalize(()=> loader?.dismiss()))
            .subscribe({
                next: (callbacks) => {

                    this.activatedRoute = callbacks.ActiveRoute?.Route;
                    //#region SETEO DATA
                    this.numberingSeries = callbacks.NumberingSeries.Data;
                    this.docTypesLabels = callbacks.Labels.Data;
                    this.exRate = callbacks.ExRate.Data;
                    this.wareHouseList = callbacks.Warehouses.Data;
                    this.cards = callbacks.Cards.Data;
                    this.companyPrintInfo = this.commonService.CLMapSubscriptionValue(callbacks.CompanyPrintInfo, {} as ICompanyInformation);
                    this.discountHierarchy = callbacks.DiscountHierarchy?.Data;
                    this.discounts = [];
                    this.taxList = callbacks.Taxes.Data;
                    this.currencyList = callbacks.Currencies?.Data ?? [];
                    this.localCurrency = this.currencyList.find(c => c.IsLocal);
                    this.payTerms = callbacks.PayTerms?.Data || [];
                    this.settings = callbacks.Settings?.Data || [];
                    
                    //#endregion

                    //#region UDFS
                    if (callbacks && callbacks.BillingUDFs && callbacks.BillingUDFs.Data) {
                        this.udfs = callbacks.BillingUDFs.Data;
                        this.udfs.forEach((x) => {
                            this.UDFsForm.addControl(x.Name, new FormControl(''));
                        });
                        this.SetUdfsDataPreloadedDocument();
                    }
                    //#endregion

                    //#region GEO CONFIGS
                    if (callbacks.GeoConfigs) {
                        this.createDocumentCheck = callbacks.GeoConfigs.Data.some((x) => x.Key == Geoconfigs.DocumentCheck);
                        this.createDocumentOutOfRange = callbacks.GeoConfigs.Data.some((x) => x.Key == Geoconfigs.CreateDocumentOutOfRange);
                    }
                    //endregion

                    //#region UDFS DE DESARROLLO
                    if (callbacks && callbacks.UDFsDevelopment && callbacks.UDFsDevelopment.Data) {
                        this.udfsDevelopment = callbacks.UDFsDevelopment.Data;
                    }
                    //#endregion

                    //#region PUNTO DE CREACION DE RUTA AL DOCUMENTO
                    let geoposition = callbacks.Geoposition;
                    if (geoposition) {
                        this.actualLat = geoposition.coords.latitude;
                        this.actualLng = geoposition.coords.longitude;
                    }
                    //#endregion

                    if(this.settings?.length){
                        let decimalSettings = this.settings.find((setting) => setting.Code == SettingCodes.Decimal)?.Json;
                        let mobileAppSettings = this.settings.find((setting) => setting.Code == SettingCodes.MobileAppConfiguration)?.Json;;
                        let settingsLine = this.settings.find((setting) => setting.Code == SettingCodes.LineMode)?.Json;
                        let defaultBusinessPartner = this.settings.find((setting) => setting.Code == SettingCodes.DefaultBusinessPartner)?.Json;
                        let validateAttachments = this.settings.find((setting) => setting.Code == SettingCodes.ValidateAttachments)?.Json;
                        let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany
                        let settingUdfFEOffline = this.settings.find((setting) => setting.Code == SettingCodes.UdfsFEOffline)?.Json;


                        //#region NUMBER OF DECIMALS IN THE COMPANY SETTING
                        let companyDecimal: IDecimalSetting[] = JSON.parse(decimalSettings || '');

                        if (companyDecimal && companyDecimal.length > 0) {
                            let decimalCompany = companyDecimal.find(x => x.CompanyId === company?.Id) as IDecimalSetting;
                            if (decimalCompany) {
                                this.decimalCompany = decimalCompany;
                                this.TO_FIXED_TOTALDOCUMENT = `1.${this.decimalCompany?.TotalDocument}-${this.decimalCompany?.TotalDocument}`;
                            }
                        }
                        //#endregion

                        //#region HAS A FREIGHT COST SETTING
                        let companyMobileAppConfiguration: IMobileAppConfiguration[] = JSON.parse(mobileAppSettings || '');

                        if (companyMobileAppConfiguration && companyMobileAppConfiguration.length > 0) {
                            let mobileAppSetting = companyMobileAppConfiguration.find(x => x.CompanyId === company?.Id) as IMobileAppConfiguration;
                            if (mobileAppSetting) {
                                this.hasFreight = mobileAppSetting.UseFreight;
                            }
                        }
                        //#endregion

                        //#region LINE GROUPING FOR ARTICLES SETTING
                        let ICompanyValidateLine = JSON.parse(settingsLine || '');
                        
                        if (ICompanyValidateLine && ICompanyValidateLine.length > 0) {
                            this.vldLineModeSetting = ICompanyValidateLine.find(x => x.CompanyId === company?.Id) as ILineModeSetting;
                            this.DefineSettingLine();
                        }
                        //#endregion

                        //#region DEFAULT BUSINESS PARTNER SETTING
                        let companyDefaultBusinessPartner = JSON.parse(defaultBusinessPartner|| '') as IDefaultBusinessPartnerSetting[];
                        if (companyDefaultBusinessPartner && companyDefaultBusinessPartner.length > 0) {
                            
                            this.defaultBusinessPartner =  companyDefaultBusinessPartner.find(x => x.CompanyId === company?.Id) as IDefaultBusinessPartnerSetting;
                        }
                        //#endregion

                        //#region ATTACHMENT SETTING
                        let validateAttachmentsSetting = JSON.parse(validateAttachments || '') as IValidateAttachmentsSetting[];

                        if (validateAttachmentsSetting?.length) {

                            let attachmentsSettingByCompany = validateAttachmentsSetting.find(x => x.CompanyId === company?.Id) as IValidateAttachmentsSetting;

                            if (attachmentsSettingByCompany) {

                                attachmentsSettingByCompany.Validate.forEach(element => {
                                    let validate =  attachmentsSettingByCompany.Validate.find((x) => x.Table == element.Table);
                                    if (validate) {
                                    element.Active = validate.Active;
                                    }
                                });

                                this.validateAttachmentsTables = {
                                    Validate:attachmentsSettingByCompany.Validate,
                                    CompanyId:attachmentsSettingByCompany.CompanyId
                                } as IValidateAttachmentsSetting;
                            }
                        }
                        //#endregion

                        //#region UDFS FE OFFLINE
                        this.udfsFEOffline = JSON.parse(settingUdfFEOffline || '') as IUdfsFEOffline;

                        //#endregion
                    }
                    
                    this.CheckIfPreloadedDocument();
                    this.ValidateAttachSetting();
                    
                },
                error: (err) => {
                    this.commonService.alert(AlertType.ERROR, err);
                }
            })
    }

    /**
     * Define el titulo de la pagina de documentos
     * @param docTypeFromStorage Indica si el documentType se obtiene desde el local storage
     */
    DefineTitle(): void {
        this.documentType = +this.localStorageService.data.get(LocalStorageVariables.DocumentType);
        switch (this.documentType) {
            case DocumentType.SaleOffer:
                this.transactionType = TransactionType.SaleOffer;
                this.pageTitle = this.commonService.Translate('Cotizaciones', 'Quotations');
                this.docDueDateLabel = this.commonService.Translate('Válido hasta', 'Valid until');
                break;
            case DocumentType.SaleOrder:
                this.transactionType = TransactionType.SaleOrder;
                this.pageTitle = this.commonService.Translate('Orden de venta', 'Sale order');
                this.docDueDateLabel = this.commonService.Translate('Fecha de entrega', 'Delivery date');
                break;
            case DocumentType.CreditInvoice:
                this.transactionType = TransactionType.CreditInvoice;
                this.pageTitle = this.commonService.Translate('Factura crédito', 'Credit Invoice');
                break;
            case DocumentType.ReserveInvoice:
                this.transactionType = TransactionType.ReserveInvoice;
                this.pageTitle = this.commonService.Translate('Factura de reserva crédito', 'Credit reserve invoice');
                break;
            case DocumentType.CashInvoice:
                this.transactionType = TransactionType.CashInvoice;
                this.pageTitle = this.commonService.Translate('Factura contado', 'Cash Invoice');
                break;
            case DocumentType.Delivery:
                this.transactionType = TransactionType.Delivery;
                this.pageTitle = this.commonService.Translate('Entrega', 'Delivery');
                break;
            case DocumentType.CreditNotes:
                this.transactionType = TransactionType.CreditNotes;
                this.pageTitle = this.commonService.Translate('Notas de crédito', 'Credit note');
                break;
            case DocumentType.CashReserveInvoice:
                this.transactionType = TransactionType.ReserveInvoice;
                this.documentType = DocumentType.ReserveInvoice;
                this.documentTypeReserve = DocumentType.CashReserveInvoice;
                this.pageTitle = this.commonService.Translate('Factura de reserva contado', 'Cash reserve invoice');
                break;
            case DocumentType.CashDownInvoice:
                this.transactionType = TransactionType.DownInvoice;
                this.pageTitle = this.commonService.Translate('Factura de anticipo contado', 'Cash down invoice');
                break;
            case DocumentType.CreditDownInvoice:
                this.transactionType = TransactionType.DownInvoice;
                this.pageTitle = this.commonService.Translate('Factura de anticipo crédito', 'Credit down invoice');
                break;
        }
    }

    /**
     * Validates if the current user has permissions to edit the document date
     */
    ValidatePermissionToEditDate(): void {
        this.documentType = +this.localStorageService.data.get(LocalStorageVariables.DocumentType);
        switch (this.documentType) {
            case DocumentType.SaleOffer:
                this.canChangeDocDate = this.VerifyPermission('Sales_Documents_Quotations_ChangeDocDate');
                this.canChangeDocDueDate = this.VerifyPermission('Sales_Documents_Quotations_ChangeDocDueDate');
                this.canChangeTaxDate = this.VerifyPermission('Sales_Documents_Quotations_ChangeTaxDate');
                break;
            case DocumentType.SaleOrder:
                this.canChangeDocDate = this.VerifyPermission('Sales_Documents_Orders_ChangeDocDate');
                this.canChangeDocDueDate = this.VerifyPermission('Sales_Documents_Orders_ChangeDocDueDate');
                this.canChangeTaxDate = this.VerifyPermission('Sales_Documents_Orders_ChangeTaxDate');
                break;
            case DocumentType.CashInvoice:
            case DocumentType.CreditInvoice:
                this.canChangeDocDate = this.VerifyPermission('Sales_Documents_Invoices_ChangeDocDate');
                this.canChangeDocDueDate = this.VerifyPermission('Sales_Documents_Invoices_ChangeDocDueDate');
                this.canChangeTaxDate = this.VerifyPermission('Sales_Documents_Invoices_ChangeTaxDate');
                break;
            case DocumentType.CashReserveInvoice:
            case DocumentType.ReserveInvoice:
                this.canChangeDocDate = this.VerifyPermission('Sales_Documents_ReserveInvoice_ChangeDocDate');
                this.canChangeDocDueDate = this.VerifyPermission('Sales_Documents_ReserveInvoice_ChangeDocDueDate');
                this.canChangeTaxDate = this.VerifyPermission('Sales_Documents_ReserveInvoice_ChangeTaxDate');
                break;
            case DocumentType.Delivery:
                this.canChangeDocDate = this.VerifyPermission('Sales_Documents_Delivery_ChangeDocDate');
                this.canChangeDocDueDate = this.VerifyPermission('Sales_Documents_Delivery_ChangeDocDueDate');
                this.canChangeTaxDate = this.VerifyPermission('Sales_Documents_Delivery_ChangeTaxDate');
                break;
            case DocumentType.CreditNotes:
                this.canChangeDocDate = this.VerifyPermission('Sales_Documents_CreditMemo_ChangeDocDate');
                this.canChangeDocDueDate = this.VerifyPermission('Sales_Documents_CreditMemo_ChangeDocDueDate');
                this.canChangeTaxDate = this.VerifyPermission('Sales_Documents_CreditMemo_ChangeTaxDate');
                break;
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
     * This method is used to change the due date according to the payment terms
     * @constructor
     */
    public ApplyDueDateByPayTerms(): void {
        this.documentType = +this.localStorageService.data.get(LocalStorageVariables.DocumentType);
        
        if(this.documentType == DocumentType.SaleOffer || this.documentType == DocumentType.SaleOrder){
            return
        }
        
        let payTerms = this.payTerms.find(x => x.GroupNum == this.customer.PayTermsGrpCode) as IPayTerms;
        
        if (payTerms) {
            if (payTerms.Days) {
                this.dueDate = AddDays(payTerms.Days).toISOString();
            } else if (payTerms.Months) {
                this.dueDate = AddMonths(payTerms.Months).toISOString();
            } 
        }
    }


    ResetData(_loadDefaultBP: boolean = false): void {
        this.udfsValues = [];
        this.batchedItems = [];
        this.commitedBatches = [];
        this.binBatchAllocations = [];
        this.blanketAgreementName = [];
        this.hasSomeBlanketAgreement = false;
        this.blanketAgreement = [];
        this.localStorageService.Remove('cardCode');
        this.docCurrency = '';
        this.lastDocEntry = 0;
        this.invoiceTypes = [...InvoiceTypes];
        this.appliedAmount = 0;
        this.hasHeaderDiscount = this.localStorageService.GetHasHeaderDiscount();
        this.visualSubtotal = 0;
        this.totalHeaderDiscount = 0;
        this.headerDiscount = 0;
        this.isUdfFormToggled = false;
        this.isFeFormToggled = false;
        this.canCalculateFreight = false;
        this.cardNameFormControl = new FormControl();
        this.PreloadedDocument = null;
        this.SearchCustomerBtn = true;
        this.SearchProductBtn = false;
        this.customer = null;
        this.documentLines = [];
        this.cardsPayment = [];
        this.cashPayment = {
            account: '',
            amount: 0,
            curr: '',
        };
        this.transferPayment = {
            Account: '',
            Amount: 0,
            Currency: '',
            Reference: '',
        } as ITransferPayment;
        this.subTotal = 0;
        this.discount = 0;
        this.tax = 0;
        this.total = 0;
        this.comments = '';
        this.numAtCard = '';
        this.documentKey = '';
        this.printing = null;
        this.UDFsForm.reset();
        this.feForm.reset();
        this.customerCurrency = '';
        this.paymentCurrency = '';
        this.docToCopyLines = [];
        this.baseDocumentType = -1;
        this.isActionCopyTo = false;
        this.isEditionMode = false;
        this.duplicateHasCustomer = true;
        this.documentReference = null;
        this.isActionDuplicate = false;
        this.showPriceListButton = true;
        this.isActionDraft = false;
        this.totalDownpayment = 0;
        this.DownPaymentsToDraw = [];
        this.isDownpayment=false;
        this.showDateFields = false;
        this.docDate= new Date().toISOString();
        this.dueDate= new Date().toISOString();
        this.taxDate= new Date().toISOString();
        this.downPaymentPercentage.setValue(100);
        this.totalDiscountDownPayment = 0;
        this.documentAttachment = {
        AbsoluteEntry: 0,
        Attachments2_Lines: []
        };
        this.isAttachmentToggled = false;

        this.attachmentFiles = [];

        this.documentType = +this.localStorageService.data.get(LocalStorageVariables.DocumentType);
        if(this.documentType == DocumentType.SaleOffer){
            this.dueDate = this.GetAdjustedDate().toISOString();
        }
        
        
        
        if(_loadDefaultBP){
            this.CheckIfBillingForPreselectedCustomer();
            
        }
    }

    /**
     * Retrieves the price list currency based on the provided price list number.
     */
    async GetPriceListCurr(priceListNum: number): Promise<void> {
        
        let loader = await this.commonService.Loader();
        loader.present();

        this.priceListService.GetPriceListInfo(priceListNum)
            .pipe(finalize(() => loader.dismiss()))
            .subscribe(
            (response) => {
                if (response.Data) {
                    this.selectedPriceList = response.Data;
                    
                    this.showPriceListButton = this.selectedPriceList === undefined;
                    
                    this.docCurrency = response.Data.PrimCurr;
                    
                    this.paymentCurrency = response.Data.PrimCurr;
                } 
                else 
                {
                    this.commonService.alert(
                        AlertType.ERROR,
                        `${response?.Message}`
                    );
                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        `${response.Message}`,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );
                }
            },
            (error) => {
                this.commonService.alert(AlertType.ERROR, `${error.message || error}`);
                this.logManagerService.Log(
                    LogEvent.ERROR,
                    error,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );
            }
        );
    }

    /**
     * Retrieves a price list for editing based on the provided price list number.
     *
     * @param priceListNum The number identifying the price list to retrieve for editing.
     */
    async GetPriceListForEdit(priceListNum: number): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();
        this.priceListService.GetPriceListInfo(priceListNum)
            .pipe(finalize(() => loader.dismiss()))
            .subscribe(
                (response) => {
                    if (response.Data)
                    {
                        this.selectedPriceList = response.Data;
                        this.showPriceListButton = this.selectedPriceList === undefined;
                        this.docCurrency = this.PreloadedDocument.DocCurrency;
                        this.paymentCurrency = this.PreloadedDocument.DocCurrency;
                    }
                    else
                    {
                        this.commonService.alert(
                            AlertType.ERROR,
                            `${response?.Message}`
                        );
                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            `${response.Message}`,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );
                    }
                },
                (error) => {
                    this.commonService.alert(AlertType.ERROR, `${error.message || error}`);
                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        error,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );
                }
            );
    }

    /**
     * Verifica si hay un socio precargado desde rutas y consulta sus datos
     *
     */
    async CheckIfBillingForPreselectedCustomer() {

        if (!this.exRate || this.exRate.Rate === 0) {
            let message: string = this.commonService.Translate(
                `No se ha encontrado el tipo de cambio`,
                `Exchange rate is not defined`
            );
            this.commonService.alert(AlertType.ERROR, message);
            this.logManagerService.Log(
                LogEvent.ERROR,
                `${message}`,
                this.GetDocumentTypeName(),
                this.documentKey
            );
            return;
        }

        let cardCode = this.localStorageService.data.get(LocalStorageVariables.PreselectedCustomerCardCode) || this.userAssignment?.SellerCode || this.defaultBusinessPartner?.BusinessPartnerCustomer;

        if (!cardCode) return;
        
        this.localStorageService.data.delete(LocalStorageVariables.PreselectedCustomerCardCode);

        let loader = await this.commonService.Loader();
        loader.present();
        this.customerService.GetBp(cardCode)
            .pipe(finalize(()=> loader.dismiss()))
            .subscribe({
                next: (callback) => {
                    if (callback.Data) {
                        this.ResetData();

                        this.customer = callback.Data;

                        this.documentWithPreloadedCustomer = this.customer !== undefined;

                        this.localStorageService.set(LocalStorageVariables.CardCode, this.customer.CardCode, true);

                        this.cardNameFormControl = new FormControl(
                            this.customer.CardName,
                            Validators.required
                        );

                        this.SearchCustomerBtn = false;

                        this.SearchProductBtn = true;

                        this.GetPriceListCurr(this.customer.PriceListNum);

                        this.documentKey = this.commonService.GenerateDocumentUniqueID();

                        this.GetBlanketAgreement(this.customer.CardCode);

                        this.customerCurrency = this.customer.Currency;
                        this.RefreshInvoiceType();
                        this.ApplyDueDateByPayTerms();
                    } else {
                        this.commonService.Alert(AlertType.ERROR, callback.Message, callback.Message);
                    }
                },
                error: (error) => {
                    this.logManagerService.Log(LogEvent.ERROR, error);
                }
            });
    }

    // #endregion

    // #region Modals

    /**
     * Edits the values of a document line if no sliding action is in progress.
     *
     * @param _index The index of the document line to be edited.
     * @param _item The document line item to be edited.
     * @param _itemSliding The ion-item-sliding element associated with the document line (if applicable).
     * @constructor
     */
    async ModifyDocumentLine(_index: number, _item: IDocumentLine, _itemSliding?: IonItemSliding): Promise<void> {
        try {
            let slidingRatio: number = await _itemSliding?.getSlidingRatio();

            if (_itemSliding && slidingRatio === -1) {
                if (this.isActionDuplicate && !this.duplicateHasCustomer) {
                    this.commonService.Alert(
                        AlertType.INFO,
                        'Debe seleccionar un cliente',
                        'You must select a customer'
                    );

                    return;
                }

                let warehouseListCopy = JSON.parse(JSON.stringify(this.wareHouseList));

                let itemCopy = {..._item};

                let modal = await this.modalCtrl.create({
                    component: EditDocumentLineComponent,
                    componentProps: {
                        data: {
                            item: itemCopy,
                            wareHouseList: warehouseListCopy,
                            priceList: this.selectedPriceList.ListNum,
                            cardCode: this.customer.CardCode,
                            documentTable: this.commonService.GetDocumentTable(
                                this.documentType
                            ),
                            docType: this.documentType,
                            taxes: this.taxList,
                            decimalCompany: this.decimalCompany,
                            isLocal: this.GetCurrency(this.docCurrency)?.IsLocal,
                            exchangeRate: this.exRate?.Rate
                        } as IEditDocumentLineComponentData,
                    },
                });
                modal.present();

                modal.onDidDismiss<IDocumentLine>().then(async (result) => {

                    if (result.data) {
                        this.documentLines[_index] = result.data;
                        this.canCalculateFreight = this.documentLines.some((x) => x.Freight);
                        this.UpdateTotals();
                        this.RefreshBlanketAgreementStatus();
                        this.UpdateBatchedItems();
                        this.ResetAmountApplied();
                    }
                });
            }

        } catch (error) {
            this.commonService.alert(AlertType.ERROR, error);
            this.logManagerService.Log(LogEvent.ERROR, error);
        } finally {
            _itemSliding?.close();
        }
    }

    /**
     *  Sets the state of the scanner visibility.
     * @param _isScanner
     * @constructor
     */
    IsOpenScanner( _isScanner: boolean){
        this.showScanner = _isScanner
        this.detectorRef.detectChanges()
    }

    /**
     * Processes the selected products from the scanner.
     * @param _products
     * @constructor
     */
    ScannedItem( _products: ISelectedProducts){
        this.ProcessProductsSelected(_products, true);
    }

    /**
     *  Generates input data for the product search component.
     * @constructor
     */
    GenerateProductSearchInputData(): IProductSearchComponentInputData{
        let userAssignment: IUserAssign = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        return {
            PriceListNum: this.selectedPriceList?.ListNum, // this.customer.PriceListNum,
            ItemFocusList: [], // this.itemFocusList - > esta instrucción estaba antes, pero se reemplaza por [] para garantizar que no se use en el componente que se llama
            UserWarehouse: userAssignment.WhsCode,
            PromotionList: [], // this.promotionList -> esta instrucción estaba antes, pero se reemplaza por [] para garantizar que no se use en el componente que se llama
            MeasurementUnits: this.mUnits,
            Discounts: this.discounts,
            DiscountHierarchy: this.discountHierarchy,
            CustomerGroup: this.customer?.GroupCode,
            CustomerTaxCode: '',
            CustomerDiscount: this.customer?.DiscountPercent,
            HeaderDiscount: 0, // Este campo ya no se usa a modo de sumatoria
            CustomerCode: this.customer?.CardCode,
            TaxList: this.taxList,
            BlanketAgreements: this.blanketAgreement,
            Warehouses: this.wareHouseList,
            DocumentTable: this.commonService.GetDocumentTable(this.documentType),
            DocTypeName: this.GetDocumentTypeName(),
            DocType: this.documentType,
            qtyDecimal: this.decimalCompany,
            Currency: this.docCurrency,
            IsLocalCurrency: this.GetCurrency(this.docCurrency)?.IsLocal,
            ExchangeRate: this.exRate?.Rate
        } as IProductSearchComponentInputData;
    }

    /**
     *  * Processes the selected products and updates the document lines accordingly.
     * @param _products
     * @param _isProductsToScanner
     * @constructor
     */
    ProcessProductsSelected(_products: ISelectedProducts, _isProductsToScanner: boolean = false){
        if (_products?.Items?.length) {
            if (this.documentLines && this.documentLines.length > 0) {
                if (this.vldLineMode?.LineGroup || _isProductsToScanner) {
                    for (let i = 0; i < _products?.Items.length; i++){
                        let index: number = this.documentLines?.findIndex((x) => x.ItemCode ===  _products?.Items[i].ItemCode);

                        if (index != -1) {
                            this.documentLines[index].Quantity += _products?.Items[i].Quantity;
                            this.CalculateTotalAmount(index);
                        }else{
                            this.documentLines.push(_products?.Items[i]);
                        }
                    }
                }else{
                    _products?.Items.forEach(element => {
                        element.Hash =
                            Math.floor(Math.random() * 100) + Date.now().toString();

                        element.BillOfMaterial?.forEach(x => {
                            x["Hash"] = Math.floor(Math.random() * 100) + Date.now().toString();
                            x.Quantity = x.Quantity * element.Quantity;
                        });
                    });
                    this.documentLines.push(..._products?.Items ?? []);
                }
            } else {
                if (this.vldLineMode?.LineGroup || _isProductsToScanner) {
                    for (let i = 0; i < _products?.Items.length; i++){
                        let index: number = this.documentLines?.findIndex((x) => x.ItemCode ===  _products?.Items[i]?.ItemCode);

                        if (index != -1) {
                            this.documentLines[index].Quantity += _products?.Items[i]?.Quantity;
                            this.CalculateTotalAmount(index);
                        }else{
                            this.documentLines.push(_products?.Items[i]);
                        }
                    }
                }else{
                    _products?.Items.forEach(element => {
                        element.Hash =
                            Math.floor(Math.random() * 100) + Date.now().toString();

                        element.BillOfMaterial?.forEach(x => {
                            x["Hash"] = Math.floor(Math.random() * 100) + Date.now().toString();
                            x.Quantity = x.Quantity * element.Quantity;
                        });
                    });

                    this.documentLines = _products?.Items;
                }
            }

            this.blanketAgreementName = _products.BlanketAgreementName;

            let inconsistenceCurrencyPriceList: boolean = false;

            if (!_products.BlanketAgreementName) this.blanketAgreementName = [];

            // Alertas de lista de precios inconsistente
            if (inconsistenceCurrencyPriceList)
                this.commonService.Alert(AlertType.WARNING, 'Listas de precios inconsistentes', 'Inconsistent price lists');


            this.canCalculateFreight = this.documentLines.some((x) => x.Freight);

            this.UpdateTotals();

            this.ResetAmountApplied();
            this.UpdateBatchedItems();

        }
    }


    /**
     * This method is use to calculate totalamount
     * @constructor
     */
    CalculateTotalAmount(index: number): void {
        this.documentLines[index].PriceDiscount = CLMathRound(this.decimalCompany.Price, this.documentLines[index].UnitPrice - (this.documentLines[index].UnitPrice * (this.documentLines[index].DiscountPercent / 100)));
        this.documentLines[index].TotalDesc = CLMathRound(this.decimalCompany.Price, (this.documentLines[index].UnitPrice - this.documentLines[index].PriceDiscount) * this.documentLines[index].Quantity);
        this.documentLines[index].TaxRate = this.taxList?.find(x => this.documentLines[index].TaxCode === x.TaxCode)?.TaxRate || 0;
        this.documentLines[index].TotalImp = CLMathRound(this.decimalCompany.Price, (this.documentLines[index].VATLiable == false ? 0: this.documentLines[index].PriceDiscount * this.documentLines[index].Quantity) * (this.documentLines[index].TaxRate / 100));
        this.documentLines[index].Total = CLMathRound(this.decimalCompany.TotalLine, this.documentLines[index].TotalImp + (this.documentLines[index].PriceDiscount * this.documentLines[index].Quantity));
        this.documentLines[index].TotalCOL = this.CalculateTotalByCurrency(index);
        this.documentLines[index].TotalFC = this.CalculateTotalByCurrency(index, true);
    }

    /**
     * calculate the total in local currency
     * @param isFC
     * @param index
     * @constructor
     */
    CalculateTotalByCurrency (index: number, isFC: boolean = false): number {
        let unitPrice = isFC? this.documentLines[index].UnitPriceFC: this.documentLines[index].UnitPriceCOL;

        let priceDiscount = CLMathRound(this.decimalCompany.Price, unitPrice - (unitPrice * (this.documentLines[index].DiscountPercent / 100)));
        let totalImp = CLMathRound(this.decimalCompany.Price, (this.documentLines[index].VATLiable == false ? 0: (priceDiscount * this.documentLines[index].Quantity) * (this.documentLines[index].TaxRate / 100)));
        return CLMathRound(this.decimalCompany.TotalLine, totalImp + (priceDiscount * this.documentLines[index].Quantity));
    }


    /**
     * This method is used to search products
     * @constructor
     */
    async SearchProduct(): Promise<void> {
        let chooseModal = await this.modalCtrl.create({
            component: ProductSearchComponent,
            componentProps: {
                data: this.GenerateProductSearchInputData()
            },
        });
        chooseModal.present();

        let loader = await this.commonService.Loader();
        chooseModal.onDidDismiss<ISearchProduct>().then( (result) => {
            loader?.present();
            this.ProcessProductsSelected(result.data as ISelectedProducts);

        }).finally(() => loader?.dismiss())
    }
    /**
     * Searches for a customer, potentially associated with an ion-item-sliding element.
     * @param _slidingCustomer The ion-item-sliding element associated with the customer search (if applicable).
     * @constructor
     */
    async SearchCustomer(_slidingCustomer: IonItemSliding) {

        let loader = await this.commonService.Loader();
        
        try {
            this.hasSomeBlanketAgreement = false;
            let modal = await this.modalCtrl.create({
                component: CustomerSearchComponent,
            });
            modal.present();
            modal.onDidDismiss().then(async (result) => {
                loader?.present();

                if (result.data) {
                    if (!this.exRate || this.exRate.Rate === 0) {
                        let message: string = this.commonService.Translate(
                            `No se ha encontrado el tipo de cambio`,
                            `Exchange rate is not defined`
                        );
                        this.commonService.alert(AlertType.ERROR, message);
                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            `${message}`,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );
                        return;
                    }

                    if (this.documentWithPreloadedCustomer && this.customer && this.customer.CardCode !== result.data.CardCode) {
                        let message: string = this.commonService.Translate(
                            `El socio precargado ${this.customer.CardCode} fue cambiado por ${result.data.CardCode}`,
                            `The preloaded partner ${this.customer.CardCode} was changed to ${result.data.CardCode}`
                        );

                        this.logManagerService.Log(
                            LogEvent.WARNING,
                            `${message}`,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );
                    }


                    if (!this.isActionDuplicate) this.ResetData();
                    this.customer = result.data;
                    this.customerCurrency = this.customer.Currency;
                    this.localStorageService.set("cardCode", this.customer.CardCode, true);
                    this.RefreshInvoiceType();
                    this.ApplyDueDateByPayTerms();

                    this.headerDiscount = this.hasHeaderDiscount ? this.customer.DiscountPercent : 0;
                    this.cardNameFormControl = new FormControl(this.customer.CardName, Validators.required);
                    this.SearchCustomerBtn = false;
                    this.SearchProductBtn = true;
                    this.documentKey = this.commonService.GenerateDocumentUniqueID();
                    if (!this.selectedPriceList || !this.isActionDuplicate) {
                        this.GetPriceListCurr(this.customer.PriceListNum);
                    } else if (this.isActionDuplicate) {
                        this.commonService.Alert(
                            AlertType.INFO,
                            "La lista de precios del socio y la lista de precios del documento no son iguales, se mantendrá la lista de precios del documento",
                            "Customer price list and document price list are not the same, document price list will be kept"
                        );
                    }

                    this.GetBlanketAgreement(this.customer.CardCode);

                    this.itemFocusList = [];

                    if (this.isActionDuplicate) {
                        this.duplicateHasCustomer = true;

                        this.canCalculateFreight = this.documentLines.some((x) => x.Freight);

                        if (this.canCalculateFreight && this.hasFreight) {
                            let buttons = [
                                {
                                    text: this.commonService.Translate("Continuar", "Continue"),
                                    handler: () => {
                                        this.CalculateFreight();
                                    },
                                },
                            ];

                            this.commonService.Alert(
                                AlertType.INFO,
                                "Se realizará el cálculo en costos de fletes",
                                "Will be calculate the freight cost",
                                "Información",
                                "Information",
                                buttons
                            );
                        }

                        this.UpdateTotals();
                    }
                }
            }).finally(()=>loader?.dismiss())
        } catch (error) {
            this.commonService.alert(AlertType.ERROR, error);
            this.logManagerService.Log(LogEvent.ERROR, error);
        } finally {
            loader?.dismiss();
            _slidingCustomer?.close();
        }
    }

    RefreshInvoiceType(): void {
        let TipoDocE: string;

        if (this.customer && !this.customer.CashCustomer) {
            TipoDocE = 'FE';
        } else {
            if (
                this.customer &&
                this.customer.CashCustomer &&
                this.feForm.value.Identification &&
                this.feForm.value.Email
            ) {
                TipoDocE = 'FE';
            } else {
                TipoDocE = 'TE';
            }
        }

        this.feForm.patchValue({
            TipoDocE: TipoDocE,
        });
    }

    async OpenPaymentModal(): Promise<void> {

        if (this.documentLines.some(p => !p.UnitPrice)) {
            await this.ShowLinesWithoutPrice();
            return;
        }

        if (this.documentLines.some(p => !p.TaxCode)) {
            await this.ShowLinesWithoutTaxes();
            return;
        }
        this.ResetAmountApplied();
        if (this.isDownpayment){
            if(this.customer && this.documentLines ) {
                let paymentModal = await this.modalCtrl.create({
                    component: DownPaymentComponent,
                    componentProps: {
                        data: {
                            DocTotal: this.GetAmount(this.docCurrency, this.currencyList.find(cur => cur.Id === this.docCurrency).IsLocal, this.total),
                            Decimal: this.decimalCompany.Price,
                            Rate: this.exRate.Rate,
                            Currencies: this.currencyList,
                            Currency: this.docCurrency,
                            Impuesto: this.tax,
                            Subtotal: this.subTotal,
                            CardCode: this.customer.CardCode,
                        } as IDocumentForDownPaymentInputData,
                    },
                });
                paymentModal.present();
                paymentModal.onDidDismiss().then(async (result) => {

                    let loader = await this.commonService.GetTopLoader();
                    if (result.role === 'success') {
                        this.DownPaymentsToDraw = result.data?.downPayment;
                        // let totalDownpayment= this.DownPaymentsToDraw?.reduce((acc, value) => acc + value.AmountToDraw, 0) ?? 0;
                        this.totalDownpayment = result.data?.amountPayment ?? 0;
                       
                        this.paymentCurrency = this.docCurrency;
                        if (this.totalDownpayment < this.total && result.data?.amountPayment != 0) {
                            let paymentModal2 = await this.modalCtrl.create({
                                component: PaymentComponent,
                                componentProps: {
                                    data: {
                                        total: this.GetAmount(this.docCurrency, true, CLMathRound(this.decimalCompany.TotalDocument, (this.total > this.totalDownpayment && this.totalDownpayment == 0) ? this.total : this.total - this.totalDownpayment)),
                                        totalFC: this.GetAmount(this.docCurrency, false, CLMathRound(this.decimalCompany.TotalDocument, (this.total > this.totalDownpayment && this.totalDownpayment == 0) ? this.total : this.total - this.totalDownpayment)),
                                        decimalCompany: this.decimalCompany,
                                        currency: this.docCurrency,
                                        cashPayment: this.cashPayment,
                                        transferPayment: this.transferPayment,
                                        cards: this.cardsPayment,
                                        exRate: this.exRate.value,
                                        cardsTypesList: this.cards ?? [],
                                        definedTotal: true,
                                        customerCurrency: this.customerCurrency,
                                        currencies: this.currencyList
                                    } as IPaymentComponentInputData,
                                },
                            });
                            paymentModal2.present();

                            paymentModal2.onDidDismiss().then(async (result) => {

                                let loader = await this.commonService.GetTopLoader();

                                if (result.role === 'success') {
                                    this.cardsPayment = result.data?.cards;
                                    this.cashPayment = result.data?.cashPayment;
                                    this.transferPayment = result.data?.transferPayment as ITransferPayment;
                                    let totalCards = this.cardsPayment?.reduce((acc, value) => acc + value.CreditSum, 0) ?? 0;
                                    this.appliedAmount = CLMathRound(
                                        this.decimalCompany.TotalDocument,
                                        totalCards +
                                        this.cashPayment.amount +
                                        this.transferPayment.Amount 
                                    );
                                }
                                this.paymentCurrency = this.cashPayment.curr;

                                loader.dismiss();
                            });
                        }
                    }

                    loader.dismiss();
                });
            }else{
                let message: string = this.commonService.Translate(
                    'Debe agregar un cliente y al menos un producto para agregar el pago',
                    'Must add a customer and at least a product to add the payment'
                );
                this.commonService.alert(AlertType.WARNING, message);
                this.logManagerService.Log(
                    LogEvent.WARNING,
                    `${message}`,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );
            }
        }else {
            if (this.customer && this.documentLines && !this.isDownpayment) {
                let paymentModal = await this.modalCtrl.create({
                    component: PaymentComponent,
                    componentProps: {
                        data: {
                            total: this.GetAmount(this.docCurrency, true, this.total),
                            totalFC: this.GetAmount(this.docCurrency, false, this.total),
                            decimalCompany: this.decimalCompany,
                            currency: this.docCurrency,
                            cashPayment: this.cashPayment,
                            transferPayment: this.transferPayment,
                            cards: this.cardsPayment,
                            exRate: this.exRate.value,
                            cardsTypesList: this.cards ?? [],
                            definedTotal: true,
                            customerCurrency: this.customerCurrency,
                            currencies: this.currencyList
                        } as IPaymentComponentInputData,
                    },
                });
                paymentModal.present();

                paymentModal.onDidDismiss().then(async (result) => {

                    let loader = await this.commonService.GetTopLoader();

                    if (result.role === 'success') {
                        this.cardsPayment = result.data?.cards;
                        this.cashPayment = result.data?.cashPayment;
                        this.transferPayment = result.data?.transferPayment as ITransferPayment;
                        let totalCards = this.cardsPayment?.reduce((acc, value) => acc + value.CreditSum, 0) ?? 0;
                        this.appliedAmount = CLMathRound(
                            this.decimalCompany.TotalDocument,
                            totalCards +
                            this.cashPayment.amount +
                            this.transferPayment.Amount
                        );
                    }
                    this.paymentCurrency = this.cashPayment.curr;

                    loader.dismiss();
                });
            } else {
                let message: string = this.commonService.Translate(
                    'Debe agregar un cliente y al menos un producto para agregar el pago',
                    'Must add a customer and at least a product to add the payment'
                );
                this.commonService.alert(AlertType.WARNING, message);
                this.logManagerService.Log(
                    LogEvent.WARNING,
                    `${message}`,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );
            }
        }
    }

    async OpenSelectDocCurrencyPopover($event: any): Promise<void> {
        let popover = await this.popoverCtrl.create({
            component: FilterDataComponent,
            componentProps: {
                inputData: this.currencyList.filter(currency => currency.Symbol !== '##'),
                inputTitle: "CURRENCY.AVAILABLE",
                inputFilterProperties: ['Name'],
                isPopover: true
            },
            event: $event,
        });

        popover.present();

        popover.onDidDismiss<ICurrency>().then((result) => {
            if (result.data) {
                this.docCurrency = result.data?.Id || this.docCurrency;
                
                this.AlertDifferentCurrency(this.customerCurrency);
                
                if(!this.documentLines || this.documentLines.length <= 0) return
                
                this.documentLines.forEach(line=>{
                    line.Currency = this.docCurrency;
                    line.UnitPrice = this.localCurrency.Id === line.Currency ? line.UnitPriceCOL : line.UnitPriceFC;
                    line.Total = this.localCurrency.Id ===line.Currency ? line.TotalCOL : line.TotalFC;
                    line.PriceDiscount = CLMathRound(this.decimalCompany.Price, line.UnitPrice - (line.UnitPrice * (line.DiscountPercent / 100)));
                    line.TotalDesc = CLMathRound(this.decimalCompany.Price, (line.UnitPrice - line.PriceDiscount) * line.Quantity);
                    line.TotalImp = CLMathRound(this.decimalCompany.Price, (line.PriceDiscount * line.Quantity) * (line.TaxRate / 100));
                })
                
                this.UpdateTotals();
                this.UpdateBatchedItems();
            }
        });
    }

    /**
     * Validate the type of currency is allowed for the selected client
     * @constructor
     * @private
     */
    private AlertDifferentCurrency(_currency: string): void {
        if (_currency && _currency !== '##') {
            if (this.docCurrency !== _currency) {
                this.commonService.Alert(
                    AlertType.INFO,
                    'El socio de negocio no soporta la moneda seleccionada en el encabezado del documento',
                    'The business partner does not support the currency selected in the document header'
                );
            }
        }
    }

    async OpenPriceListPopover($event: any): Promise<void> {
        let popover = await this.popoverCtrl.create({
            component: DocumentCurrencyComponent,
            componentProps: {
                data: {
                    listNum: this.selectedPriceList.ListNum, // this.customer.PriceListNum,
                } as IDocumentCurrencyComponentInputData,
            },
            event: $event,
        });

        popover.present();

        popover.onDidDismiss().then((result) => {
            if (result.data) {
                if (this.documentLines.length <= 0 || result.data.ListNum === this.selectedPriceList.ListNum) {
                    this.selectedPriceList = result.data;
                    this.showPriceListButton = this.selectedPriceList === undefined;
                    this.docCurrency = result.data.PrimCurr;
                    this.paymentCurrency = result.data.PrimCurr;
                } else {
                    this.commonService.Alert(
                        AlertType.INFO,
                        'Debe eliminar las lineas antes de cambiar la lista de precios',
                        'You should clear document lines before change the price list'
                    );
                }
            }
        });
    }

    //#endregion

    //#region Create documents
    /**
     * Initiates the process of creating a document after performing necessary validations.
     * Depending on the document type and whether it's a draft, it calls the appropriate creation method.
     *
     * @param draft - A boolean indicating whether the document is a draft.
     * @param _isEdit - A boolean indicating whether the document is being edited.
     * @returns A promise that resolves when the document creation process is complete.
     */
    async CreateDocument(draft:boolean, _isEdit:boolean): Promise<void> {
        this.disableCreateButton = true;

        if (this.documentLines.some(p => !p.UnitPrice)) 
        {
            await this.ShowLinesWithoutPrice();
           
            this.disableCreateButton = false;
            
            return;
        }

        if (this.documentLines.some(p => p.UnitPrice<=p.LastPurchasePrice))
        {
           let line: IDocumentLine=this.documentLines.find(p => p.UnitPrice<=p.LastPurchasePrice);
           let message: string = this.commonService.Translate(`Precio del articulo ${line.ItemName} es menor o igual al precio de costo, modifique el precio por favor. Precio venta:${line.UnitPrice} Precio costo: ${line.LastPurchasePrice}`, `Price of item ${line.ItemName} is less than or equal to the cost price, please modify the price. Sale price:${line.UnitPrice} Cost price: ${line.LastPurchasePrice}`);
           this.commonService.toast(
               message,
               "dark",
               "bottom"
            );
            this.disableCreateButton = false;
            return;
        }

        if (this.documentLines.some(p => !p.TaxCode)) 
        {
            await this.ShowLinesWithoutTaxes();
        
            this.disableCreateButton = false;
        
            let message: string = this.commonService.Translate('El item no cuenta con el código del impuesto', 'The item does not have the tax code');
        
            this.commonService.alert(AlertType.WARNING, message, message);
        
            return;
        }

        if (!this.customer) 
        {
            let message: string = this.commonService.Translate('Debe seleccionar un cliente para realizar la transacción', 'You must select a customer to perform the transaction');
        
            this.commonService.alert(AlertType.WARNING, message, message);
        
            this.logManagerService.Log(LogEvent.INFO, `${message}`, this.GetDocumentTypeName(), this.documentKey);
        
            this.disableCreateButton = false;
        
            return;
        }

        if (!this.documentLines.length) 
        {
            let message: string = this.commonService.Translate('Debe poseer al menos un producto para realizar la transacción', 'You must own at least one product to complete the transaction');
        
            this.commonService.alert(AlertType.INFO, message);
        
            this.logManagerService.Log(LogEvent.INFO, `${message}`, this.GetDocumentTypeName(), this.documentKey);
        
            this.disableCreateButton = false;
        
            return;
        }

        if (!this.createDocumentOutOfRange && this.activeRouteDestination && this.companyPrintInfo.UseBillingRange && !(this.companyPrintInfo.BillingRange >= this.commonService.DistanceBetweenTowPoints(
            this.actualLat,
            this.actualLng,
            Number(this.activeRouteDestination.Latitude),
            Number(this.activeRouteDestination.Longitude)
        ))) 
        {
            let message: string = this.commonService.Translate('Estas fuera del rango permitido para la creación de documentos', 'You are outside the allowed range for document creation');
           
            this.commonService.alert(AlertType.INFO, message);
           
            this.logManagerService.Log(LogEvent.INFO, `${message}`, this.GetDocumentTypeName(), this.documentKey);
           
            this.disableCreateButton = false;
           
            return;
        }


        if (!this.documentKey && !draft) 
        {
            this.commonService.Alert(AlertType.INFO, `No se pudo generar el identificador de la aplicación, por favor recargue la página`, `Cant generate app identificator, please reload page`);
        
            this.logManagerService.Log(LogEvent.ERROR, `Socio corrupto: ${JSON.stringify(this.customer)}`, 'IncomingPaymennt', this.documentKey);
        
            this.disableCreateButton = false;
        
            return;
        }else {
            this.documentKey = this.commonService.GenerateDocumentUniqueID();
        }

        if (this.documentType !== DocumentType.SaleOffer && this.documentType !== DocumentType.SaleOrder && this.documentType !== DocumentType.Delivery) 
        {
            if (this.customer.CashCustomer && this.feForm.value.TipoDocE == 'FE' && (!this.feForm.value.Identification || !this.feForm.value.Email)) 
            {
                let message: string = this.commonService.Translate(`La cédula y el tipo de identificación no pueden estar vacios cuando el cliente es de contado y es factura electrónica`, `Identification and identificacion type can not be empty when cash customer is selected and is an Electronic invoice`);
            
                this.commonService.alert(AlertType.WARNING, message);
            
                this.logManagerService.Log(LogEvent.ERROR, `${message}`, this.GetDocumentTypeName(), this.documentKey);
            
                this.disableCreateButton = false;
            
                return;
            }
        }
        
        this.AutomaticDocumentCheckProcess(this.customer.CardCode, this.customer.CardName);

        this.attachmentFiles = this.attachmentFilesComponent.GetattachmentFiles() || [];
        this.documentAttachment = this.attachmentFilesComponent.GetDocumentAttachment() || {
            AbsoluteEntry: 0,
            Attachments2_Lines: []
        } as IDocumentAttachment;

        if(!draft) {
            switch (this.documentType) {
                case DocumentType.SaleOrder:
                    this.CreateOrder();
                    break;
                case DocumentType.SaleOffer:
                    this.CreateQuotation();
                    break;
                case DocumentType.Delivery:
                    this.CreateDelivery();
                    break;
                case DocumentType.CreditInvoice:
                case DocumentType.ReserveInvoice:
                    this.CreateInvoice();
                    break;
                case DocumentType.CreditNotes:
                    this.CreateCreditNotes();
                    break;
                case DocumentType.CreditDownInvoice:
                    this.CreateDownInvoice();
                    break;
            }
        } else {
            switch (this.documentType) {
                case DocumentType.SaleOrder:
                    this.CreateOrderDraft(_isEdit);
                    break;
                case DocumentType.SaleOffer:
                    this.CreateQuotationDraft(_isEdit);
                    break;
                case DocumentType.Delivery:
                    break;
                case DocumentType.CreditInvoice:
                case DocumentType.ReserveInvoice:
                    this.CreateInvoiceDraft(_isEdit);
                    break;
                case DocumentType.CreditNotes:
                    break;
            }
        }
    }

    /**
     * This methos is for create an delivery document
     */
    private async CreateDelivery(): Promise<void> 
    {
        let loader = await this.commonService.Loader();
        
        loader.present();
        
        let lines: IDeliveryNotesRows[] = [];

        this.documentLines.forEach(element => {
            let line = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                BaseType: element.BaseType,
                BaseEntry: !this.isActionDraft ? element.BaseEntry : 0,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                CostingCode: '',
                LineTotal: element.Total,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                TaxOnly: element.TaxOnly,
                UoMEntry: element.UoMEntry,
            } as IDeliveryNotesRows;
            lines.push(line);
        });

        let document: IDeliveryNotes = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: 0,
            DocNum: 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs()
        } as IDeliveryNotes;


        this.documentService.CreateDelivery(document, this.documentAttachment, this.attachmentFiles).pipe(
            switchMap(callback => this.printService.GetDocumentPrintFormat(callback.Data.DocEntry, 0, this.documentType, 0, '').pipe(
                map(response => {
                    return {
                        FormatDocument: response.Data,
                        Document: callback.Data
                    }
                }),
                catchError((error) => {
                    this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                    return of({
                        FormatDocument: null,
                        Document: callback.Data
                    })
                })
            )),
            finalize(() => {
                this.disableCreateButton = false;
                loader.dismiss()
            })
        ).subscribe({
            next: async (callback) => {
                if (callback.Document) 
                {
                    this.printing = callback.FormatDocument?.PrintFormat ?? '';
                    
                    this.lastDocEntry = callback.Document.ConfirmationEntry ? callback.Document.ConfirmationEntry : callback.Document.DocEntry;
                    
                    let userAsing = this.localStorageService.get(LocalStorageVariables.UserAssignment) as IUserAssign;
                    
                    let message: string = this.commonService.Translate(`${this.GetDocumentTypeName(true)} creada con éxito, DocNum: ${callback.Document.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${callback.Document.DocNum}`);
                    
                    this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, userAsing?.Id);
                    
                    this.ShowDocumentInfo({
                        FEKey: '',
                        ConsecutiveNumber: '',
                        DocNum: callback.Document.DocNum.toString(),
                        DocEntry: callback.Document.DocEntry,
                        DocType: this.documentType,
                        AllowPrint: true,
                        PrintInformation: this.printing,
                        AdditionalInformation: callback.Document?.ConfirmationEntry ? this.authorizationDescription: ''
                    } as IDocumentCreateComponentInputData);
                }
            },
            error: (error: any) => {
                this.HandlerDocumentCreationError({
                    Document: null,
                    TransactionType: this.transactionType
                }, error);
            },
        });
    }

    private async CreateCreditNotes(): Promise<void>
    {
        let loader = await this.commonService.Loader();

        loader.present();

        let lines: ICreditNotesRows[] = [];

        this.documentLines.forEach(element => {
            let line = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                BaseType: element.BaseType,
                BaseEntry: !this.isActionDraft ? element.BaseEntry : 0,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                CostingCode: '',
                LineTotal: element.Total,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                TaxOnly: element.TaxOnly,
                UoMEntry: element.UoMEntry,
            } as ICreditNotesRows;
            lines.push(line);
        });

        let document: ICreditNotes = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: 0,
            DocNum: 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs()
        } as ICreditNotes;

        this.documentService.CreateCreditNotes(document, this.documentAttachment, this.attachmentFiles).pipe(
            switchMap(callback => this.printService.GetDocumentPrintFormat(callback.Data.DocEntry, 0, this.documentType, 0, '').pipe(
                map(response => {
                    return {
                        FormatDocument: response.Data,
                        Document: callback.Data
                    }
                }),
                catchError((error) => {
                    this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                    return of({
                        FormatDocument: null,
                        Document: callback.Data
                    })
                })
            )),
            finalize(() => {
                this.disableCreateButton = false;
                loader.dismiss()
            })
        ).subscribe({
            next: async (callback) => {
                if (callback.Document)
                {
                    this.printing = callback.FormatDocument?.PrintFormat ?? '';

                    this.lastDocEntry = callback.Document?.ConfirmationEntry ? callback.Document.ConfirmationEntry : callback.Document.DocEntry;

                    let userAsing = this.localStorageService.get(LocalStorageVariables.UserAssignment) as IUserAssign;

                    let message: string = this.commonService.Translate(`${this.GetDocumentTypeName(true)} creada con éxito, DocNum: ${callback.Document.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${callback.Document.DocNum}`);

                    this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, userAsing?.Id);

                    this.ShowDocumentInfo({
                        FEKey: '',
                        ConsecutiveNumber: '',
                        DocNum: callback.Document.DocNum.toString(),
                        DocEntry: callback.Document.DocEntry,
                        DocType: this.documentType,
                        AllowPrint: true,
                        PrintInformation: this.printing,
                        AdditionalInformation: callback.Document?.ConfirmationEntry ? this.authorizationDescription: ''
                    } as IDocumentCreateComponentInputData);
                }
            },
            error: (error: any) => {
                this.HandlerDocumentCreationError({
                    Document: null,
                    TransactionType: this.transactionType
                }, error);
            },
        });
    }
    
    /**
     * Method is for create sale offter document
     * @param _edit
     * @constructor
     * @private
     */
    private async CreateQuotation(_edit: boolean = false): Promise<void> 
    {
       
        
        let lines: ISalesQuotationRows[] = [];

        this.documentLines.forEach(element => {
            let line: ISalesQuotationRows = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                BaseType: element.BaseType,
                BaseEntry: !this.isActionDraft ? element.BaseEntry : 0,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                CostingCode: '',
                LineTotal: element.Total,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                Udfs: [],
                UoMEntry: element.UoMEntry,
                TaxOnly: element.TaxOnly,
            };
            lines.push(line);
        });

        let docModel: ISalesQuotation = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: this.PreloadedDocument?.DocNum ?? 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.PreloadedDocument?.PaymentGroupCode ?? this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs(),
        };

        if (this.isActionDuplicate && !this.isActionDraft)
            docModel.DocumentReferences = [{ ...this.documentReference }];

        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice")) 
        {
            this.RaiseBatchingProcess();
            this.disableCreateButton = false;
            return;
        }

        if (this.network.type !== 'none') 
        {
             let loader: HTMLIonLoadingElement = await this.commonService.Loader();
        
            loader.present();

            let logMessage: string = this.commonService.Translate(`Se envió a crear la ${this.GetDocumentTypeName(true)} ${this.documentKey}`, `Sent to create the ${this.GetDocumentTypeName(true)} ${this.documentKey}`);
          
            this.logManagerService.Log(LogEvent.INFO, logMessage, this.GetDocumentTypeName(), this.documentKey);

            let createOrUpdate$: Observable<ICLResponse<ISalesQuotation>>;

            if (!_edit) 
            {
                createOrUpdate$ = this.documentService.CreateQuotation(docModel, this.documentAttachment, this.attachmentFiles);
            } 
            else 
            {
                createOrUpdate$ = this.documentService.UpdateQuotation(docModel, this.documentAttachment, this.attachmentFiles);
            }

            createOrUpdate$.pipe(
                switchMap(callback => {
                    if (!_edit) 
                    {
                        return this.printService.GetDocumentPrintFormat(callback.Data.DocEntry, callback.Data.ConfirmationEntry, this.documentType, 0, '').pipe(
                            map(response => {
                                return {
                                    FormatDocument: response.Data,
                                    Document: callback.Data
                                }
                            }),
                            catchError((error) => {
                                this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                return of({
                                    FormatDocument: null,
                                    Document: callback.Data
                                })
                            }))
                    } 
                    else 
                    {
                        return of({
                            FormatDocument: null,
                            Document: null
                        })
                    }
                }
                ),
                finalize(() => {
                    this.disableCreateButton = false;
                    loader.dismiss();
                })
            ).subscribe(
                async (next) => {
                    if (!_edit) 
                    {
                        if (next.Document) 
                        {
                            this.lastDocEntry = next.Document?.ConfirmationEntry > 0 ? next.Document.ConfirmationEntry : next.Document.DocEntry;
                            
                            this.printing = next.FormatDocument?.PrintFormat ?? '';
                            
                            let message: string = '';
                            
                            if (next.Document?.ConfirmationEntry > 0) 
                            {
                                message = this.commonService.Translate(`Documento requiere un proceso de autorización, DocNum: ${next.Document?.DocNum}`, `Document require a process authorization`);
                            } 
                            else 
                            {
                                message = this.commonService.Translate(`${this.GetDocumentTypeName(true)} creada con éxito, DocNum: ${next.Document?.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${next.Document.DocNum}`);
                            }
                            
                            let isPreliminar = next.Document?.ConfirmationEntry > 0;
                            
                            this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);
                            
                            this.ShowDocumentInfo({
                                FEKey: '0',
                                ConsecutiveNumber: '0',
                                DocNum: next.Document.DocNum.toString(),
                                DocEntry: next.Document.DocEntry,
                                DocType: this.documentType,
                                AllowPrint: true,
                                Edit: false,
                                IsPreliminary: isPreliminar,
                                PrintInformation: this.printing,
                                AdditionalInformation: next.Document?.ConfirmationEntry ? this.authorizationDescription : ''
                            } as IDocumentCreateComponentInputData)
                        }
                    } 
                    else 
                    {
                        this.commonService.Alert(AlertType.INFO, 'Cotización editada con éxito', 'Successfully edited sales offer');
                       
                        this.ResetData(true);
                    }
                },
                (error) => {

                    let logMessage: string = this.commonService.Translate(
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detalle: ${error}`,
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detail: ${error}`
                    );

                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        logMessage,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );

                    this.HandlerDocumentCreationError({
                        Document: docModel,
                        TransactionType: this.transactionType
                    }, error);
                }
            );
        } 
        else 
        {
            this.disableCreateButton = false;

            this.HandlerDocumentCreationError(
                { Document: docModel, TransactionType: this.transactionType },
                this.translateService.currentLang === "en"
                    ? "No internet connection"
                    : "No hay conexión a internet"
            );
        }
    }

    /**
     * Method is for Create or Update SaleOrder
     * @param _edit 
     * @returns 
     */
    private async CreateOrder(_edit: boolean = false): Promise<void> {

        
        
        let lines: ISalesOrderRows[] = [];
        
        this.documentLines.forEach(element => {
            let line: ISalesOrderRows = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                BaseType: element.BaseType,
                BaseEntry: !this.isActionDraft ? element.BaseEntry : 0,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                CostingCode: '',
                LineTotal: element.Total,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                UoMEntry: element.UoMEntry,
                SerialNumbers: element.SerialNumbers,
                BatchNumbers: this.commitedBatches?.find(x => x.ItemCode === element.ItemCode)?.Batches?.filter(y => y.Quantity > 0).map(bacth => {
                    return {
                        BatchNumber: bacth.BatchNumber,
                        Quantity: bacth.Quantity
                    } as IBatchNumbers
                }) ?? [],
                DocumentLinesBinAllocations: [],
                Udfs: [],
                TaxOnly: element.TaxOnly
            };
            lines.push(line);
        });

        let docModel: ISalesOrder = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: this.PreloadedDocument?.DocNum ?? 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode:  this.PreloadedDocument?.PaymentGroupCode ?? this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs()
        };

        if (this.isActionDuplicate && !this.isActionDraft)
            docModel.DocumentReferences = [{ ...this.documentReference }];


        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice")) 
        {
            this.RaiseBatchingProcess();
            
            this.disableCreateButton = false;
            
            return;
        }


        if (this.network.type !== 'none') 
        {
            let loader = await this.commonService.Loader();
        
            loader.present();

            let logMessage: string = this.commonService.Translate(`Se envió a crear la ${this.GetDocumentTypeName(true)} ${this.documentKey}`, `Sent to create the ${this.GetDocumentTypeName(true)} ${this.documentKey}`);
            
            this.logManagerService.Log(LogEvent.INFO, logMessage, this.GetDocumentTypeName(), this.documentKey);

            let createOrUpdate$: Observable<ICLResponse<ISalesOrder>>;

            if (!_edit) 
            {
                createOrUpdate$ = this.documentService.CreateOrder(docModel, this.documentAttachment, this.attachmentFiles);
            } 
            else 
            {
                createOrUpdate$ = this.documentService.UpdateOrder(docModel, this.documentAttachment, this.attachmentFiles);
            }

            createOrUpdate$.pipe(
                switchMap(callback => {
                    if (!_edit) 
                    {
                        return this.printService.GetDocumentPrintFormat(callback.Data.DocEntry, 0, this.documentType, 0, '').pipe(
                            map(response => {
                                return {
                                    FormatDocument: response.Data,
                                    Document: callback.Data
                                }
                            }),
                            catchError((error) => {
                                this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                return of({
                                    FormatDocument: null,
                                    Document: callback.Data
                                })
                            })
                        )
                    } 
                    else 
                    {
                        return of({
                            FormatDocument: null,
                            Document: null
                        });
                    }
                }
                ),
                finalize(() => {
                    this.disableCreateButton = false;
                    loader.dismiss();
                })
            )
                .subscribe(
                async (response) => {
                    if (!_edit) 
                    {
                        if (response.Document) 
                        {
                            this.printing = response.FormatDocument?.PrintFormat ?? '';
                            
                            this.lastDocEntry = response.Document.ConfirmationEntry ? response.Document.ConfirmationEntry : response.Document.DocEntry;
                            
                            let message: string = this.commonService.Translate(`${this.GetDocumentTypeName(true)} creada con éxito, DocNum: ${response.Document.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${response.Document.DocNum}`);
                           
                            this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);
                           
                            this.ShowDocumentInfo({
                                FEKey: '0',
                                ConsecutiveNumber: '0',
                                DocNum: response.Document.DocNum.toString(),
                                DocEntry: response.Document.DocEntry,
                                DocType: this.documentType,
                                AllowPrint: true,
                                PrintInformation: this.printing,
                                AdditionalInformation: response.Document?.ConfirmationEntry ? this.authorizationDescription : ''
                            } as IDocumentCreateComponentInputData)
                        }
                    } 
                    else 
                    {
                        this.commonService.Alert(AlertType.INFO, 'Orden editada con éxito', 'Successfully edited sales order');
                        
                        this.ResetData(true);
                    }
                },
                (error) => {

                    let logMessage: string = this.commonService.Translate(
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detalle: ${error}`,
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detail: ${error}`
                    );

                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        logMessage,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );

                    this.HandlerDocumentCreationError({
                        Document: docModel,
                        TransactionType: this.transactionType
                    }, error);
                }
            );
        } 
        else 
        {
            this.disableCreateButton = false;

            this.HandlerDocumentCreationError(
                { Document: docModel, TransactionType: this.transactionType },
                this.translateService.currentLang === "en"
                    ? "No internet connection"
                    : "No hay conexión a internet"
            );
        }
    }

    /**
     * This method is used for create document
     * @param _edit Indicate if is edition document
     * @returns 
     */
    private async CreateInvoice(_edit: boolean = false): Promise<void> 
    {
        

        let lines: IARInvoiceRows[] = [];

        this.documentLines.forEach((element, index) => {
            let line = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                UoMEntry: element.UoMEntry,
                TaxOnly: element.TaxOnly,
                BatchNumbers: this.GetCommiteBatches(element),
                BaseType: element.BaseType,
                BaseEntry: !this.isActionDraft ? element.BaseEntry : 0,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                DocumentLinesBinAllocations: element.DocumentLinesBinAllocations,
                SerialNumbers: element.SerialNumbers,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                LineTotal: element.Total
            } as IARInvoiceRows;
            lines.push(line);
        });

        let recerveInvoice: string =
            BoYesNoEnum[+(this.documentType === DocumentType.ReserveInvoice)||+(this.documentType === DocumentType.CashReserveInvoice)];

        let docModel = {
            DocumentType: DocumentType.CreditInvoice,
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: this.PreloadedDocument?.DocNum ?? 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.PreloadedDocument?.PaymentGroupCode ?? this.customer.PayTermsGrpCode,
            Series: 0,
            ReserveInvoice: recerveInvoice,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs(),
            DownPaymentsToDraw:this.DownPaymentsToDraw,
            DownPaymentPercentage:100,
            DownPaymentType:'dptInvoice',
            IsDownPayment:true
        } as IARInvoice;

        if (this.isActionDuplicate && !this.isActionDraft) docModel.DocumentReferences = [{ ...this.documentReference }];

        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice")) 
        {
            this.RaiseBatchingProcess();
            this.disableCreateButton = false;
            return;
        }

        if (this.network.type !== "none") 
        {
            let logMessage: string = this.commonService.Translate(
                `Se envió a crear la ${this.GetDocumentTypeName(true)} ${this.documentKey
                }`,
                `Sent to create the ${this.GetDocumentTypeName(true)} ${this.documentKey
                }`
            );

            this.logManagerService.Log(
                LogEvent.INFO,
                logMessage,
                this.GetDocumentTypeName(),
                this.documentKey
            );

            let loader = await this.commonService.Loader();

            loader.present();

            let createOrUpdate$: Observable<ICLResponse<IARInvoice>>;

            if (!_edit) 
            {
                createOrUpdate$ = this.documentService.CreateInvoice(docModel, this.documentAttachment, this.attachmentFiles);
            } 
            else 
            {
                createOrUpdate$ = this.documentService.UpdateInvoice(docModel, this.documentAttachment, this.attachmentFiles);
            }

            
                createOrUpdate$.pipe(
                    switchMap(callback => {
                        if(!_edit){
                           return this.printService.GetDocumentPrintFormat(callback.Data.DocEntry, callback.Data.ConfirmationEntry, this.documentType == 15 ? DocumentType.ReserveInvoice : this.documentType, 0, callback.Data['ClaveFE']).pipe(
                                map(response => {
                                    return {
                                        FormatDocument: response.Data,
                                        Document: callback.Data
                                    }
                                }),
                                catchError((error) => {
                                    this.logManagerService.Log(LogEvent.ERROR, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                    return of({
                                        FormatDocument: null,
                                        Document: callback.Data
                                    })
                                })
                            )

                        }
                        else 
                        {
                            return of({
                                FormatDocument: null,
                                Document: null
                            });
                        }
                    }),
                    finalize(() => {
                        this.disableCreateButton = false;
                        loader.dismiss();
                    }))
                .subscribe(
                    async (next) => {
                        if(!_edit){
                            if (next.Document) {
                                this.printing = next.FormatDocument?.PrintFormat ?? '';
                                this.lastDocEntry = next.Document?.ConfirmationEntry > 0 ? next.Document.ConfirmationEntry : next.Document.DocEntry;
                                let message: string = this.commonService.Translate(`${this.GetDocumentTypeName(true)} creada con éxito, DocNum: ${next.Document.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${next.Document.DocNum}`);
                                this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);
                                let isPreliminar = next.Document?.ConfirmationEntry > 0;
                                this.ShowDocumentInfo({
                                    FEKey: next.Document['ClaveFE'],
                                    ConsecutiveNumber: next.Document['NumFE'],
                                    DocNum: next.Document.DocNum.toString(),
                                    DocEntry: next.Document.DocEntry,
                                    DocType: this.documentType,
                                    AllowPrint: true,
                                    Edit: false,
                                    IsPreliminary: isPreliminar,
                                    PrintInformation: this.printing,
                                    AdditionalInformation: next.Document?.ConfirmationEntry ? this.authorizationDescription: ''
                                } as IDocumentCreateComponentInputData);
                            }
                        } 
                        else 
                        {
                            this.commonService.Alert(AlertType.INFO, `${this.GetDocumentTypeName(true)} editada con éxito`, `Successfully edited ${this.GetDocumentTypeName(true)}`);
                            
                            this.ResetData(true);
                        }
                    },
                    (error) => {

                        let logMessage: string = this.commonService.Translate(
                            `${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detalle: ${error}`,
                            `${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detail: ${error}`
                        );

                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            logMessage,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );

                        this.HandlerDocumentCreationError({
                            Document: docModel,
                            TransactionType: this.transactionType
                        }, error);
                    }
                );
        } 
        else 
        {
            this.disableCreateButton = false;
            
            this.HandlerDocumentCreationError(
                { Document: docModel, TransactionType: this.transactionType },
                this.translateService.currentLang === "en"
                    ? "No internet connection"
                    : "No hay conexión a internet"
            );
        }
    }

    /**
     * This Method is for obtained amount
     * @param _currency 
     * @param _isLocal 
     * @param _amountCash 
     * @returns 
     */
    private GetAmount(_currency: string, _isLocal: boolean, _amountCash: number): number {

        let data = this.currencyList.find(element => element.Id === _currency);
        let amount = 0;

        if (data) {
            if (data.IsLocal && _isLocal) {
                amount = _amountCash;
            } else if (!data.IsLocal && _isLocal) {
                amount = CLMathRound(this.decimalCompany?.TotalDocument, _amountCash * this.exRate.Rate);
            } else if (!data.IsLocal && !_isLocal) {
                amount = _amountCash;
            } else if (data.IsLocal && !_isLocal) {
                amount = CLMathRound(this.decimalCompany?.TotalDocument, _amountCash / this.exRate.Rate);
            }
        }

        return amount;
    }

    /**
     * This Method is used create document with payment
     */
    async CreateInvWithPayment(): Promise<void> {
        this.disableCreateButton = true;
      
        if (this.cardsPayment.length === 0 && this.cashPayment.amount === 0 && this.transferPayment.Amount === 0 && this.totalDownpayment === 0) {
            let message: string = this.commonService.Translate('Información de pago faltante', 'Missing payment information');
            this.commonService.alert(AlertType.ERROR, message);
            this.logManagerService.Log(LogEvent.ERROR, `${message}`, this.GetDocumentTypeName(), this.documentKey);
            this.disableCreateButton = false;
            return;
        }

        if (this.documentLines.some(p => !p.UnitPrice)) {
            await this.ShowLinesWithoutPrice();
            this.disableCreateButton = false;
            return;
        }

        if (this.documentLines.some(p => !p.TaxCode)) {
            await this.ShowLinesWithoutTaxes();
            this.disableCreateButton = false;
            return;
        }

        if (
            !this.createDocumentOutOfRange &&
            this.activeRouteDestination &&
            this.companyPrintInfo.UseBillingRange &&
            !(this.companyPrintInfo.BillingRange >=
                this.commonService.DistanceBetweenTowPoints(
                    this.actualLat,
                    this.actualLng,
                    Number(this.activeRouteDestination.Latitude),
                    Number(this.activeRouteDestination.Longitude)
                ))
        ) {
            let message: string = this.commonService.Translate('Estas fuera del rango permitido para la creación de documentos', 'You are outside the allowed range for document creation');
            this.commonService.alert(AlertType.INFO, message);

            this.logManagerService.Log(LogEvent.INFO, `${message}`, this.GetDocumentTypeName(), this.documentKey);
            this.disableCreateButton = false;
            return;
        }

        if (this.documentType !== 8 && this.documentType !== 4) {
            if (this.customer.CashCustomer && this.feForm.value.TipoDocE == 'FE' && (!this.feForm.value.Identification || !this.feForm.value.Email)) {
                let message: string = this.commonService.Translate(
                    `La cédula y el tipo de identificación no pueden estar vacios cuando el cliente es de contado y es factura electrónica`,
                    `Identification and identificacion type can not be empty when cash customer is selected and is an Electronic invoice`
                );
                this.commonService.alert(AlertType.WARNING, message);
                this.logManagerService.Log(LogEvent.WARNING, `${message}`, this.GetDocumentTypeName(), this.documentKey);
                this.disableCreateButton = false;
                return;
            }
        }

        
        this.AutomaticDocumentCheckProcess(
            this.customer.CardCode,
            this.customer.CardName
        );

        this.attachmentFiles = this.attachmentFilesComponent.GetattachmentFiles() || [];
        this.documentAttachment = this.attachmentFilesComponent.GetDocumentAttachment() || {
            AbsoluteEntry: 0,
            Attachments2_Lines: []
        } as IDocumentAttachment;

        let lines: IARInvoiceRows[] = [];
        this.documentLines.forEach((element, index) => {
            let line = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                UoMEntry: element.UoMEntry,
                TaxOnly: element.TaxOnly,
                BatchNumbers: this.GetCommiteBatches(element),
                BaseType: element.BaseType,
                BaseEntry: !this.isActionDraft ? element.BaseEntry : 0,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                DocumentLinesBinAllocations: element.DocumentLinesBinAllocations,
                SerialNumbers: element.SerialNumbers,
                ItemDescription: element.ItemName,
                LineTotal: element.Total,
                TaxRate: element.TaxRate
            } as IARInvoiceRows;
            lines.push(line);
        });


        let document = {
            DocNum: 0,
            DocEntry: 0,
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            SalesPersonCode: +this.userAssignment.SlpCode,
            DocumentLines: lines,
            Udfs: this.GetValuesUDFs(),
            Comments: this.comments,
            DocumentType: DocumentType.CreditInvoice,
            PaymentGroupCode: this.customer.PayTermsGrpCode,
            ReserveInvoice: BoYesNoEnum[0],
            Series: 0,
            DocTotal: this.total,
            DownPaymentsToDraw:this.DownPaymentsToDraw,
            DownPaymentPercentage:100,
            DownPaymentType:'dptInvoice',
            IsDownPayment:false,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
        } as IARInvoice;

        let incomingPayment = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocDate: FormatDate(),
            DocCurrency: this.cashPayment.curr,
            DocRate: 0,
            CashSum: this.cashPayment.amount,
            CashAccount: this.cashPayment.account,
            TransferSum: this.transferPayment.Amount,
            TransferAccount: this.transferPayment.Account,
            TransferDate: FormatDate(),
            TransferReference: this.transferPayment.Reference,
            PaymentCreditCards: this.cardsPayment.map(transaction => {
                return {
                    CreditCard: transaction.CreditCard,
                    CreditCardNumber: transaction.CreditCardNumber.toString(),
                    CreditAcct: transaction.CreditAcct,
                    CreditSum: transaction.CreditSum,
                    VoucherNum: transaction.VoucherNum,
                    CardValidUntil: transaction.CardValidUntil,
                    U_ManualEntry: '0'
                } as IPaymentCreditCards
            }),
            Remarks: this.comments,
            Udfs: [{ Name: 'U_DocumentKey', Value: this.documentKey }],
            PaymentInvoices: [
                {
                    InvoiceType: this.documentType === DocumentType.CashDownInvoice ? PaymentInvoiceType.it_DownPayment : PaymentInvoiceType.it_Invoice,
                    DocEntry: 0,
                    SumApplied: this.GetAmount(this.cashPayment.curr, true, this.total-this.totalDownpayment),
                    AppliedFC: this.GetAmount(this.cashPayment.curr, false, this.total-this.totalDownpayment)
                } as IPaymentInvoices
            ],
        } as IIncomingPayment;


        let invPlusPayment: MobInvoiceWithPayment = {
            ARInvoice: document,
            IncomingPayment: incomingPayment,
            TransactionType: TransactionType.CashInvoice
        };

        if (this.isActionDuplicate)
            document.DocumentReferences = [this.documentReference];

        if (
            this.hasBatchedItemsWithoutProcess &&
            this.GetDocumentTypeName().includes("invoice")
        ) {
            this.RaiseBatchingProcess();
            this.disableCreateButton = false;
            return;
        }

        let userAsign: number = this.localStorageService.get("Session").userMappId;

        if (this.network.type !== 'none') {
            let logMessage: string = this.commonService.Translate(
                `Se envió a crear la ${this.GetDocumentTypeName(true)} ${this.documentKey
                }`,
                `Sent to create the ${this.GetDocumentTypeName(true)} ${this.documentKey
                }`
            );

            this.logManagerService.Log(
                LogEvent.INFO,
                logMessage,
                this.GetDocumentTypeName(),
                this.documentKey
            );

            let loader = await this.commonService.Loader();
            loader.present();

            if(this.documentType === DocumentType.CashInvoice) {
                if (this.cardsPayment.length === 0 && this.cashPayment.amount === 0 && this.transferPayment.Amount === 0 && this.totalDownpayment === this.total) {
                    this.CreateInvoice().then((value) => {
                        this.disableCreateButton = false;
                        loader.dismiss();
                    }).catch((error) => {
                        this.disableCreateButton = false;
                        loader.dismiss();
                    });
                }else{
                    this.documentService.CreateInvoiceWithPayment(invPlusPayment, this.documentAttachment, this.attachmentFiles)
                        .pipe(
                            switchMap(callback => this.printService.GetDocumentPrintFormat(callback.Data.ARInvoice.DocEntry, callback.Data.ARInvoice.ConfirmationEntry, this.documentType, this.appliedAmount, callback.Data.ARInvoice['ClaveFE']).pipe(
                                map(response => {
                                    return {
                                        FormatDocument: response.Data,
                                        Document: callback.Data
                                    }
                                }),
                                catchError((error) => {
                                    this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                    return of({
                                        FormatDocument: null,
                                        Document: callback.Data
                                    })
                                })
                            )),
                            finalize(() => {
                                this.disableCreateButton = false;
                                loader.dismiss();
                            })).subscribe(
                        async (next) => {
                            if (next.Document) {

                                this.printing = next.FormatDocument?.PrintFormat ?? '';
                                logMessage = this.commonService.Translate(`Se creó la ${this.GetDocumentTypeName(true)} correctamente. DocNum: ${next.Document.ARInvoice.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created. DocNum: ${next.Document.ARInvoice.DocNum}`);

                                this.logManagerService.Log(LogEvent.SUCCESS, logMessage, this.GetDocumentTypeName(), this.documentKey, 0);
                        
                                let paymentErrorDescription: string;

                                if (next.Document.ARInvoice?.ConfirmationEntry) {
                                    this.lastDocEntry = next.Document.ARInvoice.ConfirmationEntry;
                                    paymentErrorDescription = this.commonService.Translate(`Documento requiere un proceso de autorización`, `Document require a process authorization`)
                                } else {
                                    this.lastDocEntry = next.Document.ARInvoice.DocEntry;
                                    logMessage = this.commonService.Translate(`Se creó el pago de la ${this.GetDocumentTypeName(true)} ${next.Document.ARInvoice.DocNum} correctamente. DocNum: ${next.Document.ARInvoice.DocNum}`, `${this.GetDocumentTypeName(true)} ${next.Document.ARInvoice.DocNum} payment was successfully created. DocNum: ${next.Document.ARInvoice.DocNum}`);
                                    this.logManagerService.Log(LogEvent.SUCCESS, logMessage, this.GetDocumentTypeName(), this.documentKey, 0);
                                }
                                let isPreliminar = next.Document.ARInvoice?.ConfirmationEntry > 0;
                                this.ShowDocumentInfo({
                                    FEKey: next.Document.ARInvoice['ClaveFE'],
                                    ConsecutiveNumber: next.Document.ARInvoice['NumFE'],
                                    DocNum: next.Document.ARInvoice.DocNum.toString(),
                                    DocEntry: next.Document.ARInvoice.DocEntry,
                                    DocType: this.documentType,
                                    AllowPrint: true,
                                    Edit: false,
                                    IsPreliminary: isPreliminar,
                                    AdditionalInformation: next.Document.ARInvoice?.ConfirmationEntry ? this.authorizationDescription: '',
                                    PrintInformation: this.printing
                                } as IDocumentCreateComponentInputData);
                            }
                        },
                        (error) => {

                            logMessage = this.commonService.Translate(
                                `Error al crear la ${this.GetDocumentTypeName(true)} ${this.documentKey
                                }. Detalle: ${error}`,
                                `Error when creating the ${this.GetDocumentTypeName(true)} ${this.documentKey
                                }. Detail: ${error}`
                            );

                            this.logManagerService.Log(
                                LogEvent.ERROR,
                                logMessage,
                                this.GetDocumentTypeName()
                            );

                            this.HandlerDocumentCreationError({
                                Document: invPlusPayment.ARInvoice,
                                Payment: invPlusPayment.IncomingPayment,
                                TransactionType: invPlusPayment.TransactionType
                            }, error);
                        }
                    );
                }
            }
            if(this.documentTypeReserve === DocumentType.CashReserveInvoice){

                let recerveInvoice: string =
                    BoYesNoEnum[+(this.documentType === DocumentType.CashReserveInvoice)];
                
                document.ReserveInvoice = recerveInvoice;

                let invPlusPaymentReserve: MobInvoiceWithPayment = {
                    ARInvoice: document,
                    IncomingPayment: incomingPayment,
                    TransactionType: TransactionType.ReserveInvoice
                };
                if (this.cardsPayment.length === 0 && this.cashPayment.amount === 0 && this.transferPayment.Amount === 0 && this.totalDownpayment === this.total) {
                    this.CreateInvoice().then((value) => {
                        this.disableCreateButton = false;
                        loader.dismiss();
                    }).catch((error) => {
                        this.disableCreateButton = false;
                        loader.dismiss();
                    });
                }else{
                    this.documentService.CreateReserveInvoiceWithPayment(invPlusPaymentReserve, this.documentAttachment, this.attachmentFiles)
                        .pipe(
                            switchMap(callback => this.printService.GetDocumentPrintFormat(callback.Data.ARInvoice.DocEntry, callback.Data.ARInvoice.ConfirmationEntry, DocumentType.ReserveInvoice, this.appliedAmount, callback.Data.ARInvoice['ClaveFE']).pipe(
                                map(response => {
                                    return {
                                        FormatDocument: response.Data,
                                        Document: callback.Data
                                    }
                                }),
                                catchError((error) => {
                                    this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                    return of({
                                        FormatDocument: null,
                                        Document: callback.Data
                                    })
                                })
                            )),
                            finalize(() => {
                                this.disableCreateButton = false;
                                loader.dismiss();
                            })).subscribe(
                        async (next) => {
                            if (next.Document) {

                                this.printing = next.FormatDocument?.PrintFormat ?? '';
                                logMessage = this.commonService.Translate(`Se creó la ${this.GetDocumentTypeName(true)} correctamente. DocNum: ${next.Document.ARInvoice.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created. DocNum: ${next.Document.ARInvoice.DocNum}`);

                                this.logManagerService.Log(LogEvent.SUCCESS, logMessage, this.GetDocumentTypeName(), this.documentKey, 0);

                                let paymentErrorDescription: string;

                                if (next.Document.ARInvoice?.ConfirmationEntry) {
                                    this.lastDocEntry = next.Document.ARInvoice.ConfirmationEntry;
                                    paymentErrorDescription = this.commonService.Translate(`Documento requiere un proceso de autorización`, `Document require a process authorization`)
                                } else {
                                    this.lastDocEntry = next.Document.ARInvoice.DocEntry;
                                    logMessage = this.commonService.Translate(`Se creó el pago de la ${this.GetDocumentTypeName(true)} ${next.Document.ARInvoice.DocNum} correctamente. DocNum: ${next.Document.ARInvoice.DocNum}`, `${this.GetDocumentTypeName(true)} ${next.Document.ARInvoice.DocNum} payment was successfully created. DocNum: ${next.Document.ARInvoice.DocNum}`);
                                    this.logManagerService.Log(LogEvent.SUCCESS, logMessage, this.GetDocumentTypeName(), this.documentKey, 0);
                                }
                                let isPreliminar = next.Document.ARInvoice?.ConfirmationEntry > 0;
                                this.ShowDocumentInfo({
                                    FEKey: next.Document.ARInvoice['ClaveFE'],
                                    ConsecutiveNumber: next.Document.ARInvoice['NumFE'],
                                    DocNum: next.Document.ARInvoice.DocNum.toString(),
                                    DocEntry: next.Document.ARInvoice.DocEntry,
                                    DocType: DocumentType.ReserveInvoice,
                                    AllowPrint: true,
                                    Edit: false,
                                    IsPreliminary: isPreliminar,
                                    AdditionalInformation: paymentErrorDescription,
                                    PrintInformation: this.printing
                                } as IDocumentCreateComponentInputData);
                            }
                        },
                        (error) => {

                            logMessage = this.commonService.Translate(
                                `Error al crear la ${this.GetDocumentTypeName(true)} ${this.documentKey
                                }. Detalle: ${error}`,
                                `Error when creating the ${this.GetDocumentTypeName(true)} ${this.documentKey
                                }. Detail: ${error}`
                            );

                            this.logManagerService.Log(
                                LogEvent.ERROR,
                                logMessage,
                                this.GetDocumentTypeName()
                            );

                            this.HandlerDocumentCreationError({
                                Document: invPlusPaymentReserve.ARInvoice,
                                Payment: invPlusPaymentReserve.IncomingPayment,
                                TransactionType: invPlusPaymentReserve.TransactionType
                            }, error);
                        }
                    );
                }
            }
            if(this.documentType === DocumentType.CashDownInvoice){
                
                document.DownPaymentPercentage = this.downPaymentPercentage.value;

                let invPlusPaymentReserve: IDownInvoiceWithPayment = {
                    ARInvoice: document,
                    IncomingPayment: incomingPayment,
                };
                
                
                this.documentService.CreateDownInvoice(invPlusPaymentReserve, this.documentAttachment, this.attachmentFiles)
                    .pipe(
                        switchMap(callback => this.printService.GetDocumentPrintFormat(callback.Data.ARInvoice.DocEntry, callback.Data.ARInvoice.ConfirmationEntry, this.documentType, this.appliedAmount, '').pipe(
                            map(response => {
                                return {
                                    FormatDocument: response.Data,
                                    Document: callback.Data
                                }
                            }),
                            catchError((error) => {
                                this.logManagerService.Log(LogEvent.SUCCESS, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                return of({
                                    FormatDocument: null,
                                    Document: callback.Data
                                })
                            })
                        )),
                        finalize(() => {
                            this.disableCreateButton = false;
                            loader.dismiss();
                        })).subscribe(
                    async (next) => {
                        if (next.Document) {

                            this.printing = next.FormatDocument?.PrintFormat ?? '';
                            logMessage = this.commonService.Translate(`Se creó la ${this.GetDocumentTypeName(true)} correctamente. DocNum: ${next.Document.ARInvoice.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created. DocNum: ${next.Document.ARInvoice.DocNum}`);

                            this.logManagerService.Log(LogEvent.SUCCESS, logMessage, this.GetDocumentTypeName(), this.documentKey, 0);

                            if (next.Document.ARInvoice?.ConfirmationEntry) {
                                this.lastDocEntry = next.Document.ARInvoice.ConfirmationEntry;
                            } else {
                                this.lastDocEntry = next.Document.ARInvoice.DocEntry;
                                logMessage = this.commonService.Translate(`Se creó el pago de la ${this.GetDocumentTypeName(true)} ${next.Document.ARInvoice.DocNum} correctamente. DocNum: ${next.Document.ARInvoice.DocNum}`, `${this.GetDocumentTypeName(true)} ${next.Document.ARInvoice.DocNum} payment was successfully created. DocNum: ${next.Document.ARInvoice.DocNum}`);
                                this.logManagerService.Log(LogEvent.SUCCESS, logMessage, this.GetDocumentTypeName(), this.documentKey, 0);
                            }
                            let isPreliminar = next.Document.ARInvoice?.ConfirmationEntry > 0;
                            this.ShowDocumentInfo({
                                FEKey: '',
                                ConsecutiveNumber: '',
                                DocNum: next.Document.ARInvoice.DocNum.toString(),
                                DocEntry: next.Document.ARInvoice.DocEntry,
                                DocType: DocumentType.ReserveInvoice,
                                AllowPrint: true,
                                Edit: false,
                                IsPreliminary: isPreliminar,
                                AdditionalInformation: next.Document.ARInvoice?.ConfirmationEntry ? this.authorizationDescription: '',
                                PrintInformation: this.printing
                            } as IDocumentCreateComponentInputData);
                        }
                    },
                    (error) => {

                        logMessage = this.commonService.Translate(
                            `Error al crear la ${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detalle: ${error}`,
                            `Error when creating the ${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detail: ${error}`
                        );

                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            logMessage,
                            this.GetDocumentTypeName()
                        );

                        this.HandlerDocumentCreationError({
                            Document: invPlusPaymentReserve.ARInvoice,
                            Payment: invPlusPaymentReserve.IncomingPayment,
                            TransactionType: ''
                        }, error);
                    }
                );
            }
        } else {
            this.disableCreateButton = false;
            this.HandlerDocumentCreationError(
                {
                    Document: invPlusPayment.ARInvoice,
                    Payment: invPlusPayment.IncomingPayment,
                    TransactionType: invPlusPayment.TransactionType
                },
                this.commonService.Translate('No hay conexión a internet', 'No internet connection')
            );
        }
    }

    UpdateDocument(): void {
        this.disableCreateButton = true;

        this.attachmentFiles = this.attachmentFilesComponent.GetattachmentFiles() || [];
        this.documentAttachment = this.attachmentFilesComponent.GetDocumentAttachment() || {
            AbsoluteEntry: 0,
            Attachments2_Lines: []
        } as IDocumentAttachment;
        switch (this.documentType) {
            case DocumentType.SaleOffer:
                this.CreateQuotation(true);
                break;
            case DocumentType.SaleOrder:
                this.CreateOrder(true);
                break;
            case DocumentType.CreditInvoice:
            case DocumentType.ReserveInvoice:
                this.CreateInvoice(true);
                break;
            case DocumentType.CreditDownInvoice:
                this.CreateDownInvoice(true);
                break;
        }
    }

    // #endregion

    // #region printing
    /**
     * Show a modal with the transaction result information
     * @param _args The required information to set up the document create component
     * @constructor
     */
    async ShowDocumentInfo(_args: IDocumentCreateComponentInputData): Promise<void> 
    {
        _args.IsInvoice =
            this.documentType === DocumentType.CashInvoice ||
            this.documentType === DocumentType.CreditInvoice ||
            this.documentType === DocumentType.ReserveInvoice;
        
        let popover = await this.popoverCtrl.create({
            component: DocumentCreatedComponent,
            componentProps: {
                data: _args
            },
            backdropDismiss: false,
        });
        popover.present();
        
        popover.onDidDismiss().then(() => this.ResetData(true));
    }

    //#endregion

    /**
     * Displays detailed information about a specific document line.
     *
     * @param _documentLine The document line for which detailed information needs to be shown.
     */
    ShowLineDetails(_documentLine: IDocumentLine): void {
        if (this.LineIsClose(_documentLine)) 
        {
            this.commonService.Alert(
                AlertType.INFO,
                'Esta linea del documento esta cerrada',
                'This line of the document is closed'
            );

            return;
        }
        
        let currencySymbol = this.currencyList.find(curr => curr.Id === _documentLine.Currency)?.Symbol ?? '';
        let priceMessage= this.G_ViewPriceCost?`<tr>
                     <td><b>Precio costo</b>:</td><td>${currencySymbol}${_documentLine.LastPurchasePrice}</td>
               </tr>`:``;
        let message = `
<table class="line-details-table">
    <tr>
        <td><b>Código</b>:</td><td>${_documentLine.ItemCode}</td>
    </tr>
    <tr>
        <td><b>Nombre</b>:</td><td>${_documentLine.ItemName}</td>
    </tr>
    <tr>
        <td><b>Descuento</b>:</td><td>${_documentLine.DiscountPercent}%</td>
    </tr>
    <tr>
        <td><b>Precio venta</b>:</td><td>${currencySymbol}${_documentLine.UnitPrice}</td>
    </tr>
    ${priceMessage}
    <tr>
        <td><b>Precio descuento</b>:</td><td>${currencySymbol}${_documentLine.PriceDiscount}</td>
    </tr>
    <tr>
        <td><b>Cantidad</b>:</td><td>${_documentLine.Quantity}</td>
    </tr>
    <tr>
        <td><b>Código de impuestos</b>:</td><td>${_documentLine.TaxCode || '-'}</td>
    </tr>
    <tr>
        <td><b>Sujeto a impuestos</b>:</td><td>${_documentLine.VATLiable == false ? 'NO':'SI'}</td>
    </tr>
    <tr>
        <td><b>Tasa de impuesto</b>:</td><td>${_documentLine.TaxRate}%</td>
    </tr>
    <tr>
        <td><b>Total</b>:</td><td>${currencySymbol}${_documentLine.Total}</td>
    </tr>
    <tr>
        <td><b>Total descuento</b>:</td><td>${currencySymbol}${_documentLine.TotalDesc}</td>
    </tr>
    <tr>
        <td><b>Total impuestos</b>:</td><td>${currencySymbol}${_documentLine.VATLiable == false ?0 : _documentLine.TotalImp}</td>
    </tr>
    <tr>
        <td><b>Almacén</b>:</td><td>${_documentLine.WarehouseCode}</td>
    </tr>
</table>`;


        this.commonService.Alert(AlertType.INFO, message, message, 'Detalle del producto', 'Product detail');
    }

    ViewPromoInfo(item: IDocumentLine, slidingItem: IonItemSliding): void {
    }

    /**
     * Removes a document line.
     *
     * @param _index The index of the document line to be removed.
     * @param _item The document line item to be removed.
     * @param _itemSliding The ion-item-sliding element associated with the document line (if applicable).
     * @param _isDeleteButtonAction A boolean indicating whether the removal action was triggered by a delete button.
     * @constructor
     */
    async RemoveDocumentLine(_index: number, _item: IDocumentLine, _itemSliding: IonItemSliding | undefined, _isDeleteButtonAction: boolean = true): Promise<void> {

        try {
            let slidingRatio: number = 0;

            if (_itemSliding) slidingRatio = await _itemSliding.getSlidingRatio();

            // Verifica si el deslizamiento no está en curso y el ratio de deslizamiento es igual a 0
            if (slidingRatio === 1 && _itemSliding) {

                this.documentLines.splice(_index, 1);

                this.documentLines = this.documentLines.filter((x) => !x.IsAServerLine);

                //Si se va a copiar el documento no necesito aumentar o disminuir el numero de linea, ya que daria problemas al obtener el BaseLine de la linea
                //Solo se hace el desplazamiento para las nuevas lineas si la accion de eliminar se hace directamente del boton eliminar
                if (!this.isActionCopyTo && _isDeleteButtonAction) {
                    let isANewLine: boolean = this.newLinesAdded.some((l) => l.LineNum === _item.LineNum);

                    if (isANewLine) {
                        //Se desplazan los lineNum de las lineas nuevas antes de que se elimine la linea
                        let finishLoop: boolean = false;

                        let nextLineNum: number = _item.LineNum;

                        this.documentLines.forEach((p) => {
                            if (!this.LineIsClose(p) && p.LineNum > _item.LineNum && !finishLoop) {
                                let currLineNum: number = p.LineNum;
                                p.LineNum = nextLineNum;
                                nextLineNum = currLineNum;
                            }
                        });
                        this.nextLineNum--;
                    }
                }
                this.canCalculateFreight = this.documentLines.some((x) => x.Freight);

                this.UpdateTotals();
                this.UpdateBatchedItems();
                this.ResetAmountApplied();

                if (this.documentLines.length > 0 && this.canCalculateFreight && _item.Freight && this.hasFreight) {
                    let message = this.commonService.Translate(
                        `Debe recalcular el costo del flete`,
                        `You most recalculate freight`
                    );
                    this.commonService.alert(AlertType.INFO, message);
                    this.logManagerService.Log(
                        LogEvent.INFO,
                        message,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );
                }
            }
        } catch (error) {
            this.commonService.alert(AlertType.ERROR, error);
            this.logManagerService.Log(LogEvent.ERROR, error);
        } finally {
            _itemSliding?.close();
            this.detectorRef.detectChanges();
        }
    }

    ResetAmountApplied(): void {
        try {
            this.cardsPayment = [];
            this.cashPayment = {
                account: "",
                amount: 0,
                curr: "",
            };
            this.transferPayment = {
                Account: "",
                Amount: 0,
                Currency: "",
                Reference: "",
            } as ITransferPayment;

            this.appliedAmount = 0;
            this.totalDownpayment = 0;
            this.DownPaymentsToDraw = [];
        } catch (error) {
            this.logManagerService.Log(
                LogEvent.ERROR,
                `${error.message || error}`,
                this.GetDocumentTypeName(),
                this.documentKey
            );
        }
    }

    CheckAnyLineWithInvalidPrice(): boolean {
        let anyWithError: IDocumentLine;
        anyWithError = this.documentLines.find((x) => !x.Price || x.Price <= 0);

        if (anyWithError) {
            let message: string = this.commonService.Translate(
                `El producto ${anyWithError.ItemName} no tiene precio definido`,
                `The product ${anyWithError.ItemName} doesn't have price`
            );

            this.commonService.alert(AlertType.INFO, message);

            this.logManagerService.Log(
                LogEvent.INFO,
                `${message}`,
                this.GetDocumentTypeName(),
                this.documentKey
            );
        }

        return Boolean(anyWithError);
    }

    /**
     * Create a document check if the user have permission
     * @param _cardCode The card code of the document customer
     * @param _cardName The card name of the document customer
     * @constructor
     */
    async AutomaticDocumentCheckProcess(_cardCode: string, _cardName: string) : Promise<void>
    {
        if (this.createDocumentCheck) 
        {
            let loader = await this.commonService.Loader();
            loader.present();

            this.checkRouteService.CreateRouteHistory(
                CheckType.DocumentCheck,
                this.activatedRoute ? this.activatedRoute.Id : null,
                `Check automático ligado a documento - ${this.GetDocumentTypeName(true)}`,
                _cardCode,
                _cardName
            )
                .pipe(finalize(() => loader.dismiss()))
                .subscribe({
                    next: (response) => {
                        if(!response)
                        {
                            let message: string = this.commonService.Translate(
                                'Verifique que los servicios de ubicación esten activos',
                                'Check if location services are enable'
                            );

                            this.commonService.alert(AlertType.INFO, message);

                            this.logManagerService.Log(
                                LogEvent.INFO,
                                `${message}`,
                                this.GetDocumentTypeName(),
                                this.documentKey
                            );
                        }
                    }
                });
        }
    }

    /**
     * Show an alert with the transaction error details, if is offline will be show the option to store the document locally
     * @param _document The document of the transaction
     * @param _message Transaction details
     * @constructor
     */
    async HandlerDocumentCreationError(_document: IDocumentToSync, _message: string): Promise<void> 
    {
        let buttons: AlertButton[] = [
            {
                text: this.commonService.Translate('Descartar documento', 'Discard document'),
                handler: () => {
                    this.ResetData(true);
                    return true;
                },
            },
            {
                text: this.commonService.Translate('Reintentar creación', 'Retry creation'),
                role: 'cancel',
                handler: () => {
                    return true;
                },
            },
        ];

        this.logManagerService.Log(
            LogEvent.ERROR,
            _message,
            this.GetDocumentTypeName(),
            this.documentKey
        );
        
        let offlineModeIsAllowed = !((this.localStorageService.get(LocalStorageVariables.MobileAppConfiguration) as IMobileAppConfiguration)?.OnlineOnly ?? true);

        if (offlineModeIsAllowed) 
        {
            let logMessage: string = this.commonService.Translate(
                `Se guardará la ${this.GetDocumentTypeName(true)} ${this.documentKey} localmente`,
                `${this.GetDocumentTypeName(true)} ${this.documentKey} will be saved locally`
            );

            let isInvoice: boolean =
                this.documentType === DocumentType.CashInvoice ||
                this.documentType === DocumentType.CreditInvoice;

            let isValidDocumentType: boolean =
                this.documentType !== DocumentType.Delivery &&
                this.documentType !== DocumentType.ReserveInvoice &&
                this.documentType !== DocumentType.CreditDownInvoice &&
                this.documentType !== DocumentType.CashDownInvoice;

            // If is an invoice and don't have item with batches
            if (isInvoice && !this.documentLines.some((line) => line["ManBtchNum"] == BoYesNoEnum[BoYesNoEnum.tYES])) 
            {
                buttons.push({
                    text: this.commonService.Translate('Guardar localmente', 'Save locally'),
                    handler: () => {
                        this.logManagerService.Log(
                            LogEvent.INFO,
                            logMessage,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );

                        this.SaveDocumentLocally(_document);
                        return true;
                    },
                });
            }

            // If is not an invoice and is a valid document like orders or quotations
            if (isValidDocumentType && !isInvoice) 
            {
                buttons.push({
                    text: this.commonService.Translate('Guardar localmente', 'Save locally'),
                    handler: () => {
                        this.logManagerService.Log(
                            LogEvent.INFO,
                            logMessage,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );

                        this.SaveDocumentLocally(_document);
                        return true;
                    },
                });
            }
        }

        //Esto es para solucionar un bug en las alertas.
        if (buttons.length === 2) {
            buttons.push({
                text: this.commonService.Translate('', ''),
                handler: () => true,
            });
        }

        this.commonService.Alert(
            AlertType.QUESTION,
            _message,
            _message,
            "Confirmación",
            "Confirmation",
            buttons,
            true
        );
    }

    /**
     * Check if there are numbering series
     * @constructor
     * @private
     */
    private async AnyNumberingSeries(): Promise<boolean>
    {
        if (!this.numberingSeries || this.numberingSeries.length === 0)
        {

            let message: string = this.commonService.Translate(
                `No se guardó la ${this.GetDocumentTypeName(true)} ${this.documentKey} localmente. Detalles: Series de facturación no encontradas`,
                `${this.GetDocumentTypeName(true)} ${this.documentKey} not saved locally. Details: Numbering series not found`
            );

            this.commonService.alert(AlertType.ERROR, message);

            this.logManagerService.Log(
                LogEvent.ERROR,
                message,
                this.GetDocumentTypeName(),
                this.documentKey
            );

            return false;
        }
        
        return true;
    }

    /**
     * Search the offline document series
     * @param _document The document to find the offline series
     * @constructor
     * @private
     */
    private async GetOfflineNumberingSeries(_document: IDocumentToSync): Promise<ISeries>
    {
        let documentType: number;

        let electronicDocumentType: string = _document.Document.Udfs.find((u) => u.Name === "U_TipoDocE").Value;

        documentType =
            electronicDocumentType === "FE"
                ? NumberingSeries.FacturaFE
                : NumberingSeries.FacturaTE;

        return this.numberingSeries.find((serie) => serie.DocumentType == documentType && [SeriesTypes.Offline].includes(serie.SerieType));//&& serie.FESerie && serie.FESerie.DocType == "01");
    }

    /**
     * Save the built document in the SQL Lite database
     * @param _document The built document to save
     * @constructor
     */
    async SaveDocumentLocally(_document: IDocumentToSync): Promise<void> 
    {
        let offlineDocumentSeries: ISeries;

        let loader: HTMLIonLoadingElement = await this.commonService.Loader();

        loader.present();
        
        try{
            if (this.documentType == DocumentType.CreditInvoice ||
                this.documentType == DocumentType.CashInvoice)
            {
                if(!this.AnyNumberingSeries()) return;

                offlineDocumentSeries = await this.GetOfflineNumberingSeries(_document);

                if (!offlineDocumentSeries)
                {
                    loader.dismiss();

                    let message: string = this.commonService.Translate(
                        `No se guardó la ${this.GetDocumentTypeName(true)} ${this.documentKey} localmente. Detalles: Serie de facturación offline no encontrada`,
                        `${this.GetDocumentTypeName(true)} ${this.documentKey} not saved locally. Details: Offline invoice serie not found`
                    );

                    this.commonService.alert(AlertType.ERROR, message);

                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        message,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );

                    return;
                }

                this.SetFEDataToDocument(_document.Document, offlineDocumentSeries);
            }

            let serializedDocument: string = JSON.stringify(_document);

            let documentKeyUdf = _document.Document?.Udfs?.find((u) => u.Name === "U_DocumentKey");

            if(!documentKeyUdf)
            {
                loader.dismiss();
                this.commonService.Alert(AlertType.ERROR, "No se encontró el UDF 'U_DocumentKey'. Por favor, configúrelo.", "UDF 'U_DocumentKey' not found. Please configure it.");
                return;
            }

            let documentKey: string = documentKeyUdf.Value;

            let userAssignId = this.localStorageService.get(LocalStorageVariables.UserAssignment).Id;

            this.repositoryDocument.StoreDocument({
                RawDocument: serializedDocument,
                ShouldSend: 0,
                DocumentTotal: this.total,
                DocumentType: this.GetDocumentTypeAcronym(),
                TransactionStatus: DocumentSyncStatus.NotSynchronized,
                TransactionDetail: this.commonService.Translate(`Documento sin respaldar`, `Document without backup`),
                DocumentKey: documentKey,
                Id: 0,
                OfflineDate: formatDate(new Date(), "yyyy-MM-dd HH:mm:ss", "en"),
                UserAssignId: userAssignId,
                TransactionType: _document.TransactionType
            })
                .pipe(
                    finalize(() => loader.dismiss())
                )
                .subscribe({
                    next: (insertResult) => {

                        let claveFE: string = _document.Document?.Udfs?.find((u) => u.Name === this.udfsFEOffline.UdfClave || '')?.Value || '';

                        let numFE: string = _document.Document?.Udfs?.find((u) => u.Name === this.udfsFEOffline.UdfConsec || '')?.Value || '';

                         this.lastDocEntry = 0;

                        let message: string = this.commonService.Translate(`${this.GetDocumentTypeName(true)} ${this.documentKey} offline guardada con éxito, DocumentKey: ${documentKey}`,
                            `Offline ${this.GetDocumentTypeName(true)} ${this.documentKey} saved successfully, DocumentKey: ${documentKey}`
                        );

                        this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey
                        );

                        this.logManagerService.Log(
                            LogEvent.INFO,
                            `${this.commonService.Translate('Última sincronización de elementos dinámicos', 'Last dynamic elements sync')} [${JSON.stringify(this.localStorageService.GetSyncDates())}]`,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );


                        if(insertResult){

                            const document = _document.Document;

                            let linesToPrint = (document.DocumentLines as any[]).map((line) => (
                                {
                                    Currency: document.DocCurrency,
                                    ItemName: line.ItemDescription,
                                    Quantity: line.Quantity,
                                    UnitPrice: +line.UnitPrice?.toFixed(2),
                                    DiscountPercent: line.DiscountPercent,
                                    TaxRate: line.TaxRate,
                                    LineTotal: +line.LineTotal?.toFixed(2),
                                    CurrencySymbol: this.GetCurrency(document.DocCurrency).Symbol,
                                } as ILinesToPrint
                                ));

                            let printData: IOfflineZPLData = {
                                CardCode: document.CardCode,
                                CardName: document.CardName,
                                Clave: claveFE,
                                Discount: this.discount,
                                DocCurrency: document.DocCurrency,
                                DocDate: document.DocDate,
                                DocNum: document.DocNum,
                                DocTotal: +document.DocTotal.toFixed(2),
                                DocumentLines: linesToPrint, 
                                DocumentType: this.documentType,
                                EmailAddress: this.customer.Email,
                                FederalTaxId: this.feForm.controls['Identification']?.value || this.customer.LicTradNum || '---',
                                NumFe: numFE,
                                PayTotal: +this.appliedAmount.toFixed(2),
                                Phone:this.customer.Phone1,
                                Salesperson: this.slpName,
                                SubTotal: +this.subTotal.toFixed(2),
                                Tax: +this.tax.toFixed(2),
                                CurrencySymbol: this.GetCurrency(document.DocCurrency).Symbol,
                                DocumentLabel: this.docTypesLabels.find(d => d.DocType === this.documentType)?.Label || '',
                            } as IOfflineZPLData

                            this.printingService.GeneneratePrintFormatOffline(printData).then(zplString => {
                                this.ShowDocumentInfo({
                                    FEKey: claveFE,
                                    ConsecutiveNumber: numFE,
                                    DocNum: document.DocNum ? document.DocNum?.toString() : insertResult.toString(),
                                    DocType: this.documentType,
                                    AllowPrint: !this.VerifyPermission("M_Sales_Documents_PrintOffline"),
                                    PrintInformation: zplString
                                } as IDocumentCreateComponentInputData);

                            }).catch(error => {
                                 this.commonService.Alert(AlertType.ERROR, error, error);

                                 this.ShowDocumentInfo({
                                    FEKey: claveFE,
                                    ConsecutiveNumber: numFE,
                                    DocNum: insertResult.toString(),
                                    DocType: this.documentType,
                                    AllowPrint: !this.VerifyPermission("M_Sales_Documents_PrintOffline"),
                                } as IDocumentCreateComponentInputData);
                            });
                        }

                        // Se comenta debido a que actulamente no hay soporte para configuracion de FESeries
                        if (offlineDocumentSeries) 
                        {
                            offlineDocumentSeries.FESerie.NextNumber++;
                        
                            this.repositorySerie.UpdateSeries(offlineDocumentSeries, true);
                        }
                    
                    },
                    error: (error) => {
                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            this.commonService.Translate(`No se pudo guardar el documento localmente. Detalles: ${error.message || error}`, `Document not saved locally. Details: ${error.message || error}`),
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );

                        this.ResetData(true);
                    }
                });
        }catch (error) {
            this.commonService.alert(AlertType.ERROR, error, error)
            loader.dismiss()
        }

        
    }

    /**
     * Build the FE information and set it to the document
     * @param _document The document to set the FE information
     * @param _offlineDocumentSeries The document series
     * @constructor
     */
    SetFEDataToDocument(_document: IARInvoice | ISalesOrder | ISalesQuotation, _offlineDocumentSeries: ISeries) 
    {
        let date: string = new Date(_document.DocDate).toISOString().split("T")[0];
        
        let dateArray: string[] = date.split("-");

        let branchOffice: string = _offlineDocumentSeries.FESerie.BranchOffice.toString();
        
        let terminal: string = _offlineDocumentSeries.FESerie.Terminal.toString();
        
        let docType: string = "01";
        
        let consecutive: string = _offlineDocumentSeries.FESerie.NextNumber.toString();
        
        let finalConsecutiveNumber: string;
        
        let key: string = "506";
        
        let situation: number = 1;
        
        let companyIdentification: string = this.companyPrintInfo.Identification;

        while (branchOffice.length < 3) 
        {
            branchOffice = `0${branchOffice}`;
        }

        while (terminal.length < 5) 
        {
            terminal = `0${terminal}`;
        }

        while (consecutive.length < 10) 
        {
            consecutive = `0${consecutive}`;
        }

        while (companyIdentification.length < 12) 
        {
            companyIdentification = `0${companyIdentification}`;
        }

        finalConsecutiveNumber = `${branchOffice}${terminal}${docType}${consecutive}`;
        
        key = key + dateArray[2] + dateArray[1] + dateArray[0].substring(2);
        
        key = `${key}${companyIdentification}${finalConsecutiveNumber}${situation}${dateArray[2]}${dateArray[1]}${dateArray[0]}`;

        this.UpsertUdf(_document.Udfs, this.udfsFEOffline.UdfClave, key);
        this.UpsertUdf(_document.Udfs, this.udfsFEOffline.UdfConsec, finalConsecutiveNumber);

        _document.Series = _offlineDocumentSeries.NoSerie;

        if(String(_offlineDocumentSeries.IsSerial) === 'false' || _offlineDocumentSeries.IsSerial === IsSerial.Manual){
            _document.DocNum = _offlineDocumentSeries.FESerie.NextNumber;
        }
    }

    

    /**
     * This method is used set data in UDFsForm
     * @param _udfsData
     * @constructor
     * @private
     */
    private SetUdfsDataPreloadedDocument(): void {
        if (this.udfs && this.udfsValues) {
            let udfsConfigured = Object.keys(this.UDFsForm.value);
            let data = this.udfsValues.filter(element => element.Value && udfsConfigured.includes(element.Name));
            if (data && data.length > 0) {
                data.forEach(element => {
                    this.UDFsForm.controls[element.Name].setValue(element.Value);
                });
            }

            if (this.udfsValues.length > 0) {
                if (!this.udfsValues.some(element => udfsConfigured.includes(element.Name))) {
                    this.commonService.Alert(AlertType.INFO, 'Los UDFs del documento origen no son los mismos que los del documento destino', 'The UDFs of the source document are not the same as those of the destination document');
                } else if (udfsConfigured.length !== this.udfsValues.length) {
                    this.commonService.Alert(AlertType.INFO, 'La cantidad de UDFs del documento destino no coincide con la del documento origen', 'The number of UDFs in the destination document does not match the number of UDFs in the source document');
                }
            }
        }
    }

    /**
     *  Load details data preloaded document
     * @constructor
     */
    async CheckIfPreloadedDocument(): Promise<void> {

        try {
            let documentData = this.localStorageService.data.get(LocalStorageVariables.DocumentToEdit) as PreloadedDocument;
            
            //If we have preloaded any document, the partner data is loaded by default
            if (!documentData){
                this.CheckIfBillingForPreselectedCustomer();
                return;
            } 

            this.PreloadedDocument = documentData.DocumentInfo;
            this.documentLines = documentData.Lines?.map((line) => ({
                ...line,
                WhsCode : line.WarehouseCode,
                Hash: Math.floor(Math.random() * 100) + Date.now().toString(),
                BillOfMaterial: line?.BillOfMaterial?.map((x) => ({
                    ...x,
                    WhsCode : line.WarehouseCode,
                    Hash: Math.floor(Math.random() * 100) + Date.now().toString()
                })) ?? []
            }));
            let listNum: number = this.PreloadedDocument.PriceList;
            this.udfsValues = documentData.UdfsValues;
            this.downPaymentPercentage.setValue(documentData.DocumentInfo.DownPaymentPercentage ?? 0);
            this.isEditionMode = this.localStorageService.data.get(LocalStorageVariables.IsEditionMode) ?? false;
            this.isActionCopyTo = this.localStorageService.data.get(LocalStorageVariables.IsActionCopyTo) ?? false;
            this.isActionDuplicate = this.localStorageService.data.get(LocalStorageVariables.IsActionDuplicate) ?? false;
            this.isActionDraft = this.localStorageService.data.get(LocalStorageVariables.IsActionDraft) ?? false;

            this.documentAttachment = {
              AbsoluteEntry: documentData.DocumentInfo?.AttachmentEntry ?? 0,
              Attachments2_Lines: (documentData.AttachmentLines ?? []).map((attL, index) => ({...attL, Id: index + 1}))
            };

            if (this.isActionDuplicate) {
                this.documentReference = {
                    RefDocEntr: documentData.DocumentInfo.DocEntry,
                    RefDocNum: documentData.DocumentInfo.DocNum,
                    RefObjType: ReferencedObjectTypeEnum[documentData.DocumentInfo.ObjType]
                };
            }

            this.hasHeaderDiscount = this.localStorageService.GetHasHeaderDiscount();


            /**Load data of customer*/
            this.customer = documentData.Customer;
            
            this.customerCurrency = this.GetCurrency(this.customer.Currency)?.Id;
            this.documentKey = this.commonService.GenerateDocumentUniqueID();
            this.localStorageService.set('cardCode', this.customer.CardCode, true);
            this.headerDiscount = this.hasHeaderDiscount ? this.customer.DiscountPercent : 0;
            this.cardNameFormControl = new FormControl(
                this.PreloadedDocument.CardName,
                Validators.required
            );
            this.SearchCustomerBtn = false;
            this.comments = this.PreloadedDocument.Comments;
            this.numAtCard = this.PreloadedDocument.NumAtCard;
            this.docDate = this.PreloadedDocument.DocDate;
            this.dueDate = this.PreloadedDocument.DocDueDate;
            this.taxDate = this.PreloadedDocument.TaxDate;

            this.SearchProductBtn = true;

            //Si es duplicacion de documento no se puede asignar la lista de precios del socio ya que la duplicacion no carga el socio
            if (!listNum && (this.isActionCopyTo || this.isEditionMode)) {
                this.commonService.Alert(AlertType.INFO, 'El documento no posee lista de precios, se selecciona la lista del socio de negocios', 'The document does not have a price list, the list of the business partner is selected');
                listNum = this.customer.PriceListNum;
            }

            if (listNum || this.isActionCopyTo || this.isEditionMode) {
                this.GetPriceListForEdit(listNum);
            }


            // Si se va a copiar el documento no necesito establecer un valor a la variable nextLineNum
            if (this.isEditionMode) {
                let maxLineNum: number = Math.max(...this.documentLines.map((p) => p.LineNum));

                this.nextLineNum = maxLineNum + 1;

                this.documentKey = documentData.DocumentInfo.DocumentKey;
            }

            this.canCalculateFreight = this.documentLines.some((x) => x.Freight);

            this.localStorageService.data.delete(LocalStorageVariables.DocumentToEdit);
            this.localStorageService.data.delete(LocalStorageVariables.IsEditionMode);
            this.localStorageService.data.delete(LocalStorageVariables.IsActionCopyTo);
            this.localStorageService.data.delete(LocalStorageVariables.IsActionDuplicate);
            
            this.GetBlanketAgreement(this.customer.CardCode, true)
            
            this.UpdateTotals();
            
            this.RefreshInvoiceType();

            if ([DocumentType.CashInvoice, DocumentType.CreditInvoice, DocumentType.ReserveInvoice].includes(this.documentType)) {
                this.UpdateBatchedItems();
            }

            if (this.documentLines.some(x => x.LineStatus === PreLineStatus.bost_Close)) {
                this.commonService.Alert(AlertType.INFO, "Se copiara el documento parcialmente debido a que posee lineas cerradas", 'The document will be partially copied because it has closed lines');
            }
        } catch (error) {
            this.commonService.alert(AlertType.ERROR, error);
            this.logManagerService.Log(LogEvent.ERROR, error);
        }
    }

    /**
     * This method is for set data udfs
     * @constructor
     */
    GetValuesUDFs(): IUdf[] {
        let UDFList: IUdf[] = [];

        const valuesUDFs = this.udfPresentationComponent?.GetValuesUDFs() || [];

        if (Array.isArray(valuesUDFs)) {
            UDFList = valuesUDFs
                .map(([key, value]) => ({ Name: key, FieldType: '', Value: value } as IUdf));
        }
        
        let data = MappingUdfsDevelopment({
            uniqueId: this.documentKey,
            PriceList: this.selectedPriceList.ListNum
        } as IDevelopment, this.udfsDevelopment);
        UDFList.push(...data);
        data = MappingUdfsDevelopment(this.feForm.value, this.udfsDevelopment);
        UDFList.push(...data);

        return UDFList;
    }

    OnChangeFEIdType(): void {
        let min: number;
        let max: number;

        switch (this.feForm.get('IdType').value) {
            case FEIdentificationType[0].Id:
                min = 9;
                max = 9;
                break;
            case FEIdentificationType[1].Id:
            case FEIdentificationType[3].Id:
                min = 10;
                max = 10;
                break;
            case FEIdentificationType[2].Id:
                min = 11;
                max = 12;
                break;
        }

        this.feForm
            .get('Identification')
            .setValidators(
                Validators.compose([
                    Validators.required,
                    Validators.minLength(min),
                    Validators.maxLength(max),
                ])
            );
        this.feForm.get('Identification').updateValueAndValidity();
        this.RefreshInvoiceType();
    }

    /**
     * This methos is used for colsult data FE
     */
    async OnFEIdentificationChange(): Promise<void> {
        if (this.network.type === 'none') return;
        if (!this.feForm.get('Identification').value) return;
        this.GetPadronInfo(this.feForm.get('Identification').value);
    }

    /**
     * This methos is used consult data fe
     * @param identification
     */
    async GetPadronInfo(identification: string): Promise<void> {
        const loading = await this.commonService.loading(
            this.commonService.Translate('Obteniendo informacion del cliente...', 'Obtaining customer information...'));

        loading.present();

        this.padronService
            .Get(identification)
            .pipe(
                finalize(() => loading.dismiss())
            )
            .subscribe(
                (response: IFeData) => {
                    if (response && response.nombre) {
                        this.cardNameFormControl.setValue(response.nombre);
                        this.feForm.controls['IdType'].setValue(response.tipoIdentificacion)
                    } else {
                        this.commonService.alert(
                            AlertType.ERROR,
                            this.commonService.Translate(
                                "No se obtuvieron datos de este cliente",
                                "No data obtained of this customer"
                            )
                        );
                    }

                    this.RefreshInvoiceType();
                },
                (error) => {
                    this.commonService.Alert(AlertType.ERROR, error, error);

                    console.error(error);

                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        error,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );
                }
            );
    }

    async CalculateFreight(): Promise<void> {
        try {
            if (this.network.type === 'none') {
                let message: string = this.commonService.Translate(
                    `Necesitas conexión a Internet`,
                    `You need Internet connection`
                );

                this.commonService.alert(AlertType.WARNING, message);

                this.logManagerService.Log(
                    LogEvent.WARNING,
                    `${message}`,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );

                return;
            }

            if (!this.customer) {
                this.commonService.alert(
                    AlertType.WARNING,
                    this.commonService.Translate(
                        `Debe seleccionar un cliente para realizar el cálculo`,
                        `Must select customer to calculate freight`
                    )
                );
                return;
            }

            const ITEMS_TO_FREIGHT = this.documentLines
                .filter((x) => x.Freight)
                .map(
                    (x) =>
                    ({
                        ItemCode: x.ItemCode,
                        Price: x.Price,
                        Quantity: x.Quantity,
                        TaxCode: x.TaxCode,
                        TaxRate: x.TaxRate,
                        CardCode: this.customer.CardCode,
                    } as IItemToFreight)
                );

            this.documentLines = this.documentLines.filter((x) => !x.IsAServerLine);

            this.subTotal = 0;
            this.discount = 0;
            this.tax = 0;

            if (ITEMS_TO_FREIGHT.length == 0) {
                let message: string = this.commonService.Translate(
                    "Los items seleccionados no aplican para cálculo de flete",
                    "Selected items don't apply to freight"
                );
                this.commonService.alert(AlertType.WARNING, message);

                this.logManagerService.Log(
                    LogEvent.WARNING,
                    `${message}`,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );

                return;
            }

            let loader = await this.commonService.Loader();
            loader.present();

            this.productService
                .CalculateFreight(ITEMS_TO_FREIGHT, this.docCurrency)
                .pipe(finalize(()=> loader.dismiss()))
                .subscribe(
                    (next) => {
                        if (next.Data) {
                            this.documentLines.push(...
                                next.Data.map<IDocumentLine>((item) => ({
                                    WarehouseCode: item.WhsCode,
                                    DiscountPercent: 0,
                                    ItemDescription: item.ItemName,
                                    Currency: this.docCurrency,
                                    TaxCode: item.TaxCode,
                                    Freight: false,
                                    ItemCode: item.ItemCode,
                                    ItemName: item.ItemName,
                                    Quantity: item.Quantity,
                                    WhsCode: item.WhsCode,
                                    TaxOnly: 'tNO',
                                    UnitPrice: item.Price,
                                    IsAServerLine: true,
                                    PriceUnit: item.Price,
                                    TaxRate: item.TaxRate,
                                    LastPurchasePrice: 0,
                                    UoMEntry: item.SUoMEntry
                                }) as IDocumentLine)
                            )
        
                            this.documentLines.forEach((m) => {
                                this.CalculateProductDependentData(m);
                            });

                            this.UpdateTotals();
                            this.ResetAmountApplied();
                            this.UpdateBatchedItems();
                        } else {
                            this.commonService.alert(
                                AlertType.ERROR,
                                `Error: ${next.errorInfo?.Message}`
                            );

                            this.logManagerService.Log(
                                LogEvent.ERROR,
                                `Error: ${next.errorInfo.Message}`,
                                this.GetDocumentTypeName(),
                                this.documentKey
                            );
                        }
                    },
                    (error) => {

                        this.commonService.alert(
                            AlertType.ERROR,
                            `Error: ${error}`
                        );

                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            `Error: ${error}`,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );
                    }
                );
        } catch (error) {
            this.commonService.alert(AlertType.ERROR, `Error: ${error}`);

            this.logManagerService.Log(
                LogEvent.ERROR,
                `Error: ${error.message || error}`,
                this.GetDocumentTypeName(),
                this.documentKey
            );
        }
    }
    
    /**
     * Calculates and updates product-dependent financial data such as
     * total discount, price after discount, total tax, and total price.
     *
     * @param product - The product line containing quantity, price,
     * discount, and tax rate for calculations.
     */
    CalculateProductDependentData(product: IDocumentLine): void {
        product.TotalDesc = this.calculationService.RoundTo(
            this.calculationService.calculateTotalPercent(
                product.Quantity * product.Price,
                product.Discount
            )
        );
        product.PriceDiscount = this.calculationService.RoundTo(
            product.Quantity * product.Price - product.TotalDiscount
        );
        product.TotalTax = this.calculationService.calculateTotalPercent(
            product.PriceDiscount,
            product.TaxRate
        );
        product.Total = this.calculationService.RoundTo(
            product.PriceDiscount + product.TotalTax
        );
    }

    /**
     * This method is used to update totals in document
     * @constructor
     */
    UpdateTotals(): void {

        let isDownPayment = (this.documentType === DocumentType.CashDownInvoice || this.documentType === DocumentType.CreditDownInvoice);

        // Solo validar si el valor es un número válido
        if (isDownPayment) {
            const rawValue = this.downPaymentPercentage.value;
            
            if(rawValue === null || rawValue === '' || rawValue === undefined)
                return;
            
            if (rawValue <= 0) {
                this.commonService.Alert(
                    AlertType.INFO,
                    "Porcentaje anticipo debe ser superior a 0",
                    "Advance payment percentage must be greater than 0"
                );

                this.downPaymentPercentage.setValue(100);
                return;
            } else if (rawValue > 100) {
                this.downPaymentPercentage.setValue(100);
            }
        }

        this.total = 0;
        this.discount = 0;
        this.tax = 0;
        this.subTotal = 0;

        const DECS = (() => +`1${`0`.repeat(this.decimalCompany?.TotalDocument)}`)();
        const DECSLINE = (() => +`1${`0`.repeat(this.decimalCompany?.TotalLine)}`)();
        const DESCPRICE = (() => +`1${`0`.repeat(this.decimalCompany?.Price)}`)();

        this.documentLines.forEach((x) => {

            let FIRST_SUBTOTAL = Math.round((x.Quantity * x.UnitPrice) * DESCPRICE) / DESCPRICE;
            let LINE_DISCOUNT = (Math.round(((Math.round(FIRST_SUBTOTAL * DESCPRICE) / DESCPRICE) * (x.DiscountPercent / 100)) * DESCPRICE) / DESCPRICE);
            let SUBTOTAL_WITH_LINE_DISCOUNT = (Math.round(((FIRST_SUBTOTAL - LINE_DISCOUNT)) * DECSLINE) / DECSLINE);
            let CURRENT_TAX_RATE = x.TaxRate / 100;
            
            let TOTAL_TAX = x.VATLiable == false ? 0 : SUBTOTAL_WITH_LINE_DISCOUNT * CURRENT_TAX_RATE;
            
            this.subTotal += SUBTOTAL_WITH_LINE_DISCOUNT * +!BoYesNoEnum[x.TaxOnly];
            this.discount += LINE_DISCOUNT;
            this.tax += TOTAL_TAX;

            if (!x.Total) {
                x.Total = SUBTOTAL_WITH_LINE_DISCOUNT + TOTAL_TAX;
            }

            if (!x.PriceDiscount) {
                x.PriceDiscount = SUBTOTAL_WITH_LINE_DISCOUNT;
            }

            if (!x.TotalImp) {
                x.TotalImp = TOTAL_TAX;
            }

            if (!x.TotalDesc) {
                x.TotalDesc = LINE_DISCOUNT;
            }
        });
        
        if (isDownPayment) {
            this.tax = (Math.round(((Math.round(this.tax * DECS) / DECS) * (this.downPaymentPercentage.value / 100)) * DECS) / DECS);

            this.totalDiscountDownPayment = (Math.round(((Math.round(this.subTotal * DECS) / DECS) * (this.downPaymentPercentage.value / 100)) * DECS) / DECS);

            this.total = this.totalDiscountDownPayment + this.tax;
        }else{
            this.total = Math.round((Math.round(this.subTotal * DECS) / DECS + Math.round(this.tax * DECS) / DECS + Number.EPSILON) * DECS) / DECS;
        }

        this.RefreshBlanketAgreementStatus();
    }

    ToggleFeForm(): void {
        this.isFeFormToggled = !this.isFeFormToggled;
    }

    ToggleUdfForm(): void {
        this.isUdfFormToggled = !this.isUdfFormToggled;
    }

    /**
     * Get the currency information
     * @param key The code of the currency. Like (USD | COL)
     * @constructor
     */
    GetCurrency(key: string): ICurrency {
        return this.currencyList.find(element => element.Id === key) || {
            Id: '',
            Symbol: "",
            Name: "",
            IsLocal: false
        }

    }

    /**
     * Retrieves and filters blanket agreements associated with a specific customer (CardCode).
     *
     * @param _cardCode - The unique customer code to filter agreements for.
     * @param refreshBlanketAgreementStatus - If true, triggers a refresh of agreement statuses after filtering. Defaults to false.
     * @returns A Promise that resolves when the operation is complete.
     */
    async GetBlanketAgreement(_cardCode: string, refreshBlanketAgreementStatus: boolean = false): Promise<void> {
        this.blanketAgreement = [];
        this.customerService.GetBlanketAgreement()
            .subscribe(
            (next) => {
                try {
                    if (next && next.Data) {
                        const CURRENT_DATE =
                            new Date().toISOString().split("T")[0] + "T00:00:00";
                        this.blanketAgreement = next.Data.filter((x) => {
                            let result = this.commonService.BetweenDates(
                                x.StartDate,
                                x.EndDate,
                                CURRENT_DATE
                            );
                            return _cardCode == x.CardCode && result;
                        });

                        if (refreshBlanketAgreementStatus) {
                            this.RefreshBlanketAgreementStatus();
                         }
                    }
                } catch (exception) {
                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        `${exception.message || exception}`,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );
                }
            },
            (error) => {
                this.logManagerService.Log(
                    LogEvent.ERROR,
                    error,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );
            }
        );
    }

    RefreshBlanketAgreementStatus(): void {
        if (this.blanketAgreement && this.blanketAgreement.length > 0) {
            this.hasSomeBlanketAgreement = this.documentLines.some((p) =>
                this.blanketAgreement.some((b) => b.Lines.some((l) => l.ItemCode === p.ItemCode && !l.HasDiscountApplied))
            );

            this.blanketAgreementName = [];
            this.documentLines.forEach((y) => {
                this.blanketAgreement.forEach((x) => {
                    let item = x.Lines.find((l) => l.ItemCode === y.ItemCode && !l.HasDiscountApplied);
                    if (item && !this.blanketAgreementName.find((m) => m == `${item.ItemCode} - ${x.Description}`))
                        this.blanketAgreementName.push(`${item.ItemCode} - ${x.Description}`);
                });
            });

            if (this.blanketAgreementName && this.blanketAgreementName.length === 1)
                this.commonService.toast(
                    this.commonService.Translate(
                        `Se está usando un acuerdo global al menos`,
                        `Blanket agreement running`
                    ),
                    "dark",
                    "bottom"
                );
        }
    }

    // Muestra el detalle de los acuerdos globales que se estan aplicado al documento
    async DisplayGlobalAgreementText(): Promise<void> {
        if (this.hasSomeBlanketAgreement) {
            if (this.blanketAgreementName && this.blanketAgreementName.length > 0) {
                // Esta es la primera implementacion de muestra de items con action sheet por eso no lleva tipo de dato
                // hasta que ya se defina el controlador necesario para hacer la implementacion global del componente
                let blanketAgreementMapped = [];
                this.blanketAgreementName.forEach((x) => {
                    blanketAgreementMapped.push({
                        text: x,
                        icon: "ellipse-outline",
                    });
                });

                const actionSheet = await this.actionSheetController.create({
                    header: this.commonService.Translate(
                        `Acuerdo${this.blanketAgreementName.length == 1 ? "" : "s"} global${this.blanketAgreementName.length == 1 ? "" : "es"
                        } activo${this.blanketAgreementName.length == 1 ? "" : "s"}`,
                        `Blanket agreement${this.blanketAgreementName.length == 1 ? "" : "s"
                        } used`
                    ),
                    backdropDismiss: true,
                    buttons: blanketAgreementMapped,
                });

                await actionSheet.present();
            } else {
                let message = this.commonService.Translate(
                    `Acuerdo global aplicado`,
                    `Blanket agreement applied`
                );
                this.commonService.alert(AlertType.INFO, message);
                this.logManagerService.Log(
                    LogEvent.INFO,
                    message,
                    this.GetDocumentTypeName(),
                    this.documentKey
                );
            }
        }
    }

    VerifyPermission(permision: string): boolean {
        return !this.permisionList.some((perm) => perm.Name === permision);
    }

    /**
     * Obtiene el nombre del documento actual
     * @param noViewName Indica que se va a obtener el nombre del documento sin formato de URL. ejm: ( /sale-offer ) --> ( Oferta de venta || Sale offer )
     * @returns Nombre del documento
     */
    GetDocumentTypeName(noViewName: boolean = false): string {
        switch (this.documentType) {
            case DocumentType.SaleOffer:
                return !noViewName
                    ? "/sale-offer"
                    : this.commonService.Translate("Oferta de venta", "Sale offer");
            case DocumentType.SaleOrder:
                return !noViewName
                    ? "/sale-order"
                    : this.commonService.Translate("Orden de venta", "Sale order");
            case DocumentType.CreditInvoice:
                return !noViewName
                    ? "/AR-invoice"
                    : this.commonService.Translate("Factura de deudores", "AR invoice");
            case DocumentType.ReserveInvoice:
                return !noViewName
                    ? this.documentTypeReserve == 0 ? "/reserve-invoice":"/reserve-invoice+payment"
                    : this.commonService.Translate(
                        this.documentTypeReserve==0 ? "Factura de reserva" : "Factura reserva + Pago",
                        this.documentTypeReserve==0 ? "Reserve invoice" : "Reserve invoice + Payment"
                    );
            case DocumentType.CashInvoice:
                return !noViewName
                    ? "/AR-invoice+payment"
                    : this.commonService.Translate(
                        "Factura deudor + Pago",
                        "AR invoice + Payment"
                    );
            case DocumentType.Delivery:
                return !noViewName
                    ? "/Delivery"
                    : this.commonService.Translate("Entrega", "Delivery");
            case DocumentType.CreditNotes:
                return !noViewName
                    ? "/credit-notes"
                    : this.commonService.Translate("Notas de crédito", "Credit notes");
            case DocumentType.CreditDownInvoice:
                return !noViewName
                    ? "/credit-down-invoice"
                    : this.commonService.Translate("Factura de anticipo crédito", "Credit down invoice");
            case DocumentType.CashDownInvoice:
                return !noViewName
                    ? "/cash-down-invoice"
                    : this.commonService.Translate("Factura de anticipo contado", "Cash down invoice");
        }
    }

    /**
     * Auxiliar method to raise batching process
     */
    RaiseBatchingProcess(): void {
        this.RaiseBatchingComponent();
    }

    /**
     * Prepares the process to set up batches per items
     */
    async RaiseBatchingComponent(): Promise<void> {
        let itemsToBatch: IBatchedItem[] = [];

        this.batchedItems.forEach((x) => {
            const ITEM_TO_BATCH = this.documentLines.find(
                (y) => y.ItemCode === x.ItemCode && y.WhsCode === x.WhsCode
            );
            // Double check only in case that it has a bill of material batch 
            if (ITEM_TO_BATCH && ITEM_TO_BATCH.ManBtchNum === BatchSerial[BatchSerial.Y]) {
                itemsToBatch.push({
                    ItemCode: ITEM_TO_BATCH.ItemCode,
                    WhsCode: ITEM_TO_BATCH.WhsCode,
                });
            }
            // Add the bill of material that have a batch
            if (ITEM_TO_BATCH.BillOfMaterial && ITEM_TO_BATCH.BillOfMaterial.length > 0) {
                ITEM_TO_BATCH.BillOfMaterial.forEach(billOfMaterial => {
                    if (billOfMaterial.ManBtchNum === BoYesNoEnum[BoYesNoEnum.tYES]) {
                        itemsToBatch.push({
                            ItemCode: billOfMaterial.ItemCode,
                            WhsCode: billOfMaterial.WhsCode
                        });
                    }
                });
            }
        });

        let loader = await this.commonService.Loader();
        loader.present();

        this.productService
            .GetBatchesFromItems(itemsToBatch)
            .pipe(
                map(res => {
                    return {
                        Data: res.Data.map(x => {
                            return {
                                UoMEntry: -1,
                                ItemCode: x.ItemCode,
                                DiscountPercent: 0,
                                Quantity: 0,
                                TaxCode: '',
                                UnitPrice: 0,
                                U_sugPrice: 0,
                                WarehouseCode: x.WarehouseCode,
                                TaxOnly: '',
                                BaseType: 0,
                                BaseEntry: 0,
                                BaseLine: 0,
                                LineStatus: 'O',
                                LineNum: 0,
                                BatchNumbers: x.BatchNumbers,
                                DocumentLinesBinAllocations: [],
                                SerialNumbers: []
                            } as DocumentLinesBaseModel
                        })
                    } as ICLResponse<DocumentLinesBaseModel[]>
                }),
                finalize(() => {
                    loader.dismiss();
                })
            ).subscribe(
                async (next) => {
                    if (next.Data) {
                        if (next.Data?.length === 0) {
                            this.commonService.Alert(
                                AlertType.INFO,
                                `No se encontraron lotes`,
                                `Cant find batches`
                            );
                        } else {
                            let itemsWithBatches: IItemToBatch[] = [];

                            let items: DocumentLinesBaseModel[] = [...next.Data];

                            const FILTERED_ITEMS_WITH_BATCHES = this.documentLines.filter(
                                (x) => itemsToBatch.find((y) => y.ItemCode === x.ItemCode
                                    || itemsToBatch.find(y => x.BillOfMaterial.find(z => z.ItemCode = y.ItemCode)))
                            );

                            FILTERED_ITEMS_WITH_BATCHES.forEach((x, itemIndex) => {
                                let itemCheckedIndex: number = 0;

                                const BATCHES_PER_ITEM: SLBatch[] = items
                                    .find((item, index) => {
                                        itemCheckedIndex = index;

                                        let mainItemFlag = (item.ItemCode === x.ItemCode && item.WarehouseCode === x.WhsCode);

                                        if (mainItemFlag) {
                                            return mainItemFlag;
                                        } else {
                                            return x.BillOfMaterial.some(y => y.ItemCode === item.ItemCode);
                                        }
                                    })
                                    .BatchNumbers.map((batch) => batch);

                                if (x.ManBtchNum === BatchSerial[BatchSerial.Y]) {
                                    itemsWithBatches.push({
                                        Batches: BATCHES_PER_ITEM,
                                        ItemCode: x.ItemCode,
                                        Quantity: x.Quantity,
                                        WhsCode: x.WhsCode,
                                        ItemName: x.ItemName,
                                        Index: itemIndex,
                                        Hash: x["Hash"]
                                    });
                                } else {
                                    x.BillOfMaterial.forEach((y, billIndex) => {
                                        itemsWithBatches.push({
                                            Batches: BATCHES_PER_ITEM,
                                            ItemCode: y.ItemCode,
                                            Quantity: y.Quantity,
                                            WhsCode: y.WhsCode,
                                            ItemName: y.ItemName,
                                            Index: itemIndex + (billIndex / 10),
                                            Hash: y["Hash"]
                                        });
                                    })
                                }

                                items = next.Data.filter(
                                    (itm, index) => index !== itemCheckedIndex
                                );
                            });

                            let batches: IBasicBatch[] = itemsWithBatches.reduce<
                                IBasicBatch[]
                            >((acc, cur) => {
                                return acc.concat(
                                    cur.Batches.map((x) => {
                                        return {
                                            ItemCode: cur.ItemCode,
                                            WhsCode: cur.WhsCode,
                                            BatchNumber: x.BatchNumber,
                                        } as IBasicBatch;
                                    })
                                );
                            }, []);

                            let loader = await this.commonService.Loader();
                            loader.present();
                            this.allocationService
                                .GetItemBatchAllocations(this.documentType, batches)
                                .pipe(
                                    finalize(() => {
                                        loader.dismiss();
                                    })
                                )
                                .subscribe(async (callBack) => {
                                    if (callBack && callBack.Data) {
                                         await this.RaiseItemToBatchComponent(
                                            itemsWithBatches,
                                            callBack.Data
                                        );
                                    }
                                });
                        }
                    }
                    
                },
                (error) => {
                    console.log(error);
                }
            );
    }

    /**
     * Opens the modal to set up batches
     */
    async RaiseItemToBatchComponent(_itemsToBatch: IItemToBatch[], _allocations: IBinStock[]): Promise<void> {
        let batchAllocations = _allocations.map(
            (x) => ({ ...x, Quantity: 0 } as IBinRequest)
        );

        if (this.binBatchAllocations && this.binBatchAllocations.length) {
            batchAllocations.forEach((x) => {
                let bin = this.binBatchAllocations.find(
                    (c) => x.BatchNumber === c.BatchNumber && x.BinAbs === c.BinAbs
                );
                if (bin) {
                    x.Quantity = bin.Quantity;
                }
            });
        }

        let modal = await this.modalCtrl.create({
            component: ItemToBatchComponent,
            componentProps: {
                data: {
                    itemsToBatch: _itemsToBatch,
                    delayedItemsToBatch: this.commitedBatches,
                    warehouses: this.wareHouseList,
                    DocType: this.GetDocumentTypeName(),
                    binAllocations: batchAllocations,
                },
            },
        });

        await modal.present();

        modal.onDidDismiss().then(async (result) => {
            if (result.data && result.role === "success") {
                this.commitedBatches = result.data?.completedBatches;
                this.binBatchAllocations = result.data?.allocations;
            } else {
                let isIncorrect: boolean = false;

                let commitedBatchesL: IItemToBatch[] = [
                    ...result.data?.completedBatches,
                ];

                let commitedBatchesLength: number = commitedBatchesL.length;

                for (let cb = 0; cb < commitedBatchesLength; cb++) {
                    let batchesQuantitySum: number = commitedBatchesL[cb].Batches.reduce(
                        (a, b) => a + b.Quantity,
                        0
                    );

                    if (batchesQuantitySum !== commitedBatchesL[cb].Quantity) {
                        isIncorrect = true;

                        break;
                    }
                }

                if (isIncorrect || this.commitedBatches.length === 0) {
                    this.commitedBatches = [];

                    this.commonService.toast(
                        this.commonService.Translate(
                            `No se completó la configuración para lotes`,
                            `Batches configuration aborted`
                        ),
                        "dark",
                        "bottom"
                    );
                }
            }

            this.batchedItems = this.documentLines.filter(
                (x) => x["ManBtchNum"] === BatchSerial[BatchSerial.Y] || x?.BillOfMaterial?.some(y => y.ManBtchNum === BoYesNoEnum[BoYesNoEnum.tYES])
            );

            const HAS_INVALID_BATCHES =
                this.HasDeferredWareHouses() || this.HasDeferredQuantities();

            this.hasBatchedItemsWithoutProcess = this.batchedItems?.length > 0 && HAS_INVALID_BATCHES;

        });
    }

    /**
     * Returns all batches per item
     */
    GetCommiteBatches(_item: IDocumentLine): IBatchNumbers[] {
        try {
            if (
                !this.commitedBatches ||
                this.commitedBatches.length === 0 ||
                !this.GetDocumentTypeName().includes("invoice") ||
                (_item["ManBtchNum"] !== BatchSerial[BatchSerial.Y] && !_item.BillOfMaterial.some(x => x.ManBtchNum === BatchSerial[BatchSerial.Y]))
            ) {
                return [];
            }

            const BATCHES_TO_RELEASE = this.commitedBatches.filter(
                (itemToRelease, itemIndex, self) => {
                    itemToRelease.Index = itemIndex;

                    return self.findIndex(t => (t.Hash === _item['Hash'] && t.WhsCode === _item.WhsCode) || _item.BillOfMaterial.some(x => t.Hash === x['Hash'])) === itemIndex;
                });

            // Only for testing porspouse
            BATCHES_TO_RELEASE.forEach(x => x.Batches.forEach(y => y.ItemCode = x.ItemCode));

            //BATCHES_TO_RELEASE.forEach(_ => this.commitedBatches.splice(0, 1));

            return BATCHES_TO_RELEASE.filter((y) => (y.ItemCode === _item.ItemCode && y.WhsCode === _item.WhsCode) || _item.BillOfMaterial.some(x => x.ItemCode === y.ItemCode))
                .map(x => x.Batches)
                .reduce((acc, cur) => acc.concat(cur), [])
                .filter((x) => x.Quantity > 0)
                .map((element, index) => {
                    return {
                        BatchNumber: element.BatchNumber,
                        SystemSerialNumber: 0,
                        Quantity: element.Quantity
                    } as IBatchNumbers
                });
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    /**
     * Sets a flag who can be use to determinate if there are batcheable items
     */
    UpdateBatchedItems(): void {
        try {
            this.batchedItems = this.documentLines.filter(
                (x) => x.ManBtchNum === BatchSerial[BatchSerial.Y] || x?.BillOfMaterial?.some(y => y.ManBtchNum === BatchSerial[BatchSerial.Y])
            );

            const HAS_INVALID_BATCHES =
                this.HasDeferredWareHouses() || this.HasDeferredQuantities();

            this.hasBatchedItemsWithoutProcess =
                this.batchedItems?.length > 0 && HAS_INVALID_BATCHES;

            if (HAS_INVALID_BATCHES) this.commitedBatches = [];
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Esta funcion revisa si el usuario edito cantidades y no hizo el recalculo
     * de las cantidades seteadas en los lotes.
     * En caso de fallo alguna instruccion en el flujo se va a obligar al usuario
     * a que vuelva a setear los lotes
     */
    HasDeferredQuantities(): boolean {
        try {
            let hashesToDelete: string[] = [];

            this.commitedBatches.forEach((x) => {
                const ITEM = this.documentLines.find(
                    (y) => y["Hash"] && x["Hash"] && x["Hash"] === y["Hash"] || y.BillOfMaterial.some(z => z["Hash"] && x["Hash"] && x["Hash"] === z["Hash"])
                );

                if (!ITEM) hashesToDelete.push(x["Hash"]);
            });

            hashesToDelete.forEach(
                (y) =>
                (this.commitedBatches = this.commitedBatches.filter(
                    (z) => z.Hash !== y
                ))
            );

            return this.documentLines.some((p) => {
                return this.commitedBatches
                    .filter((y) => p["Hash"] === y.Hash || p.BillOfMaterial.some(z => z["Hash"] === y.Hash))
                    .some((y) => {
                        const SUM = y.Batches.map((batch) => batch.Quantity).reduce(
                            (prev, next) => prev + next,
                            0
                        );

                        return p.Quantity != SUM;
                    }) || (this.commitedBatches.length !== this.batchedItems.length);
            });
        } catch (error) {
            console.log(error);
            return true;
        }
    }

    /**
     * Revisa que los items con lotes no se les haya cambiado el almacen
     */
    HasDeferredWareHouses(): boolean {
        try {
            let hashesToDelete: string[] = [];

            //Se obtienen los items que fueron eliminados
            this.commitedBatches.forEach((x) => {
                const ITEM = this.batchedItems.some(
                    (y) => (y["Hash"] && x["Hash"] && x["Hash"] === y["Hash"]) || y.BillOfMaterial.some(z => z["Hash"] && x["Hash"] && x["Hash"] === z["Hash"])
                );

                if (!ITEM) hashesToDelete.push(x["Hash"]);
            });

            //Se remueven los items con lotes que fueron eliminados de las lineas
            this.commitedBatches = this.commitedBatches.filter(
                (cb) => !hashesToDelete.some((htd) => htd === cb.Hash)
            );

            //Revisa que los items no haya sufrido algun cambio en los almacenes
            return this.batchedItems.some((p) => {
                const WAREHOUSE_PER_BATCH = this.commitedBatches.find(
                    (y) => p["Hash"] === y.Hash || p.BillOfMaterial.some(z => z["Hash"] === y.Hash)
                )?.WhsCode;
                return p.WhsCode !== WAREHOUSE_PER_BATCH && !p.BillOfMaterial.length
            });
        } catch (error) {
            console.error(error);
            return true;
        }
    }


    /**
     * Valida la cantidad solicitada de un item contra la cantidad disponible
     * @param _item Item que se va a validar cantidad de solicitadad contra la cantidad disponible
     * @returns `True` si el item excede la cantidad disponible, en otro caso `false`
     */
    ItemExcededQuantityAvailable(_item: IDocumentLine): boolean {
        let exceded: boolean = false;

        if (_item.ValidateInventory && this.network.type !== 'none') {
            let totalQuantityRequested: number = 0;

            this.documentLines.forEach((p, index) => {
                if (
                    p.ItemCode === _item.ItemCode &&
                    p.WhsCode === _item.WhsCode &&
                    p.BinCode === _item.BinCode &&
                    p.SerialNumber === _item.SerialNumber &&
                    p.InvValidated
                ) {
                    let uoMQty = this.GetUoMLineTotalQuantity(p, index);

                    if (uoMQty) {
                        totalQuantityRequested += uoMQty;
                    } else {
                        totalQuantityRequested += p.Quantity;
                    }
                }
            });

            if (this.isEditionMode) {
                exceded = totalQuantityRequested > _item.InStock;
            } else {
                exceded = totalQuantityRequested > _item.QuantityAvailable;
            }
        }

        this.documentLines.forEach(p => {
            if (
                p.ItemCode === _item.ItemCode &&
                p.WhsCode === _item.WhsCode &&
                p.BinCode === _item.BinCode &&
                p.SerialNumber === _item.SerialNumber
            ) {
                p.ExcededQtyAvailable = exceded && p.InvValidated
            }
        });

        return exceded;
    }

    /**
     * Obtiene la cantidad en unidades del producto mediante la unidad de medida
     * @param _lineIndex Indice del producto a validar cantidad con unidad de medida
     * @returns Cantidad total en unidades, sino posee unidad de medida devuelve 0
     */
    GetUoMLineTotalQuantity(_line: IDocumentLine, _lineIndex: number): number {
        try {
            if (!_line.AllowUnits) return 0;

            if (!this.documentLines.length || (this.documentLines.length - 1) < _lineIndex || _lineIndex < 0) throw new Error(`Indice de linea invalido en Documents -> GetOuMLineTotalQuantity. Ref DocumentKey ${this.documentKey}`);

            if (!this.mUnits && !this.mUnits.length) throw new Structures.Clases.GuardValidation(`No hay unidades de medida. Ref DocumentKey ${this.documentKey}`);

            if (!_line.UgpEntry) throw new Structures.Clases.GuardValidation(`El item Nº${(_lineIndex + 1)} - ${_line.ItemCode} no posee grupo de unidad de medida definida. Ref DocumentKey: ${this.documentKey}`);

            if (!_line.PriceUnit) throw new Structures.Clases.GuardValidation(`El item Nº${(_lineIndex + 1)} - ${_line.ItemCode} no posee unidad de medida definida. Ref DocumentKey: ${this.documentKey}`);

            const PRODUCT_BASE_UOM = this.mUnits.find((x) =>
                x.UgpEntry === _line.UgpEntry &&
                x.UoMEntry === _line.PriceUnit
            );

            if (!PRODUCT_BASE_UOM) throw new Error(`No se encontró la unidad de medida de base del item Nº${(_lineIndex + 1)} - ${_line.ItemCode}. Ref DocumentKey ${this.documentKey}`);

            const PRODUCT_SALE_UOM = this.mUnits.find((x) =>
                x.UgpEntry === _line.UgpEntry &&
                x.UoMEntry === _line.UoMEntry
            );

            if (!PRODUCT_SALE_UOM) throw new Error(`No se encontró la unidad de medida de venta del item Nº${(_lineIndex + 1)} - ${_line.ItemCode}. Ref DocumentKey ${this.documentKey}`);

            return this.calculationService.RoundTo(_line.Quantity * (PRODUCT_SALE_UOM.BaseQty / PRODUCT_BASE_UOM.BaseQty));
        } catch (error) {
            this.commonService.CLPrint(error);
            return 0;
        }
    }


    /**
     * Muestra un action sheet con la lista de productos con errores
     * @param _listTitle Titulo del action sheet
     * @param _productsWithErrors Lista de productos con error
     */
    async ProductWithProblemsValidations(
        _listTitle: string,
        _productsWithErrors: IProductWithProblems[]
    ): Promise<void> {
        if (!_productsWithErrors || !_productsWithErrors.length) return;

        const PRODUCTS_WITH_PROBLEMS: ActionSheetButton[] = [];

        const CANCEL_BUTTON: ActionSheetButton = {
            text: this.commonService.Translate(`Cancelar`, `Cancel`),
            icon: "close-outline",
            role: "cancel",
            handler: () => {
            },
        };

        _productsWithErrors.forEach((p) => {
            const PRODUCT_OPTION: ActionSheetButton = {
                text: p.ActionSheetText,
                handler: () => {
                    this.ModifyDocumentLine(p.Index, this.documentLines[p.Index]);
                }
            }

            PRODUCTS_WITH_PROBLEMS.push(PRODUCT_OPTION);
        });

        PRODUCTS_WITH_PROBLEMS.push(CANCEL_BUTTON);

        const actionSheet = await this.actionSheetController.create({
            header: _listTitle,
            buttons: PRODUCTS_WITH_PROBLEMS,
        });

        await actionSheet.present();

        await actionSheet.onDidDismiss();
    }

    /**
     * Muestra las lineas con problemas de inventario en un action sheet
     */
    async ShowLinesNotAvailable(): Promise<void> {
        let itemsNotAvailable: IProductWithProblems[] = [];

        let auxIndex: number = 1;

        this.documentLines.forEach((product, productIndex) => {
            if (product.ValidateInventory) {
                let stockAvailable: number = 0;

                let isPreloadedLine: boolean = this.committedStockLines.some(
                    (c) =>
                        c.ItemCode === product.ItemCode &&
                        c.WhCode === product.WhsCode &&
                        c.BinCode === product.BinCode &&
                        c.SerialNumber === product.SerialNumber
                )

                if (this.isEditionMode && isPreloadedLine) {
                    stockAvailable = product.InStock;
                } else {
                    stockAvailable = product.QuantityAvailable;
                }

                let sumItemQuantity: number = this.GetUoMLineTotalQuantity(product, productIndex) || product.Quantity;

                //Recorro todos los productos para obtener el solicitado total
                this.documentLines.forEach((p, i) => {
                    if (
                        i !== productIndex &&
                        product.ItemCode === p.ItemCode &&
                        product.WhsCode === p.WhsCode &&
                        product.BinCode === p.BinCode &&
                        product.SerialNumber === p.SerialNumber
                    ) {
                        sumItemQuantity += this.GetUoMLineTotalQuantity(p, i) || p.Quantity;
                    }
                });

                if (sumItemQuantity > stockAvailable) {
                    let productWithoutStock: IProductWithProblems = {
                        ActionSheetText: this.commonService.Translate(
                            `Nº${(productIndex + 1)} | ${product.ItemCode} | Solicitados: ${sumItemQuantity} | En Stock: ${stockAvailable}`,
                            `Nº${(productIndex + 1)} | ${product.ItemCode} | Requested: ${sumItemQuantity} | In Stock: ${stockAvailable}`
                        ),
                        Index: productIndex
                    };

                    itemsNotAvailable.push(productWithoutStock);
                }
            }
            auxIndex++;
        });

        await this.ProductWithProblemsValidations(
            this.commonService.Translate(
                "No hay suficiente stock",
                "Not enough stock"
            ),
            itemsNotAvailable
        );
    }

    /**
     * Muestra las lineas con problemas de precio en un action sheet
     */
    async ShowLinesWithoutPrice(): Promise<void> {
        const linesWithoutPrice: IProductWithProblems[] = [];

        this.documentLines.forEach((p, index) => {
            if (!p.UnitPrice) {
                linesWithoutPrice.push({
                    ActionSheetText: `Nº${(index + 1)} | ${p.ItemCode} - ${p.ItemName}`,
                    Index: index
                });
            }
        });


        await this.ProductWithProblemsValidations(
            this.commonService.Translate(
                "Lineas sin precio",
                "Lines without price"
            ),
            linesWithoutPrice
        );

    }

    /**
     * Muestra las lineas con problemas de impuesto en un action sheet
     */
    async ShowLinesWithoutTaxes(): Promise<void> {
        let productsWithProblems: IProductWithProblems[] = [];

        this.documentLines.forEach((p, index) => {
            if (!p.TaxCode) {
                productsWithProblems.push({
                    ActionSheetText: `Nº${(index + 1)} | ${p.ItemName} - ${p.ItemCode}`,
                    Index: index
                });
            }
        });

        await this.ProductWithProblemsValidations(
            this.commonService.Translate(
                'Productos sin impuestos',
                'Products without taxes'
            ),
            productsWithProblems
        );

    }



    /**
     * Indica si la linea del documento esta cerrada
     * @param _line Linea del documento a verificar
     * @returns Retorna `true` si el documento esta en edición y la linea esta cerrada, en otro caso devuelve `false`
     */
    LineIsClose(_line: IDocumentLine): boolean {
        // return this.isEditionMode && _line.LineStatus === BoStatus.bost_Close;
        return false;
    }

    /**
     * Ordena las lineas del documento, solo si el documento esta en edición
     * @returns Retorna una lista `ProductoVendidoModel` ordenada por LineNum de los productos agregados
     */
    SortProductsArrayByLineNum(): IDocumentLine[] {
        if (this.isEditionMode) {
            let productWithLineNum: IDocumentLine[] = this.documentLines.filter(
                (p) => p.LineNum !== undefined
            );

            let productWithoutLineNum: IDocumentLine[] = this.documentLines.filter(
                (p) => p.LineNum === undefined
            );

            productWithLineNum.sort((a, b) => a.LineNum - b.LineNum);

            productWithoutLineNum.sort((a, b) => a.LineNum - b.LineNum);

            //Retorno el nuevo array con las lineas ordenadas y con LineNum
            return [...productWithLineNum, ...productWithoutLineNum];
        } else {
            return [...this.documentLines];
        }
    }


    TranslateIdTypes(_idType: IIdentificationType): string {
        return this.commonService.Translate(
            _idType.DescriptionES,
            _idType.DescriptionEN
        );
    }

    TranslateDocFETypes(_docFEType: IInvoiceType): string {
        return this.commonService.Translate(
            _docFEType.DescriptionES,
            _docFEType.DescriptionEN
        );
    }

    /**
     * Desactiva el botón de creación.
     *
     * Este método determina si el botón de creación debe estar desactivado o no,
     * basándose en una lógica específica definida en su implementación.
     *
     * @returns {boolean} - Devuelve `true` si el botón debe estar desactivado,
     *                      de lo contrario, devuelve `false`.
     */
    DisableCreationButton(): boolean {
        if (this.documentType === DocumentType.CashInvoice || this.documentTypeReserve === DocumentType.CashReserveInvoice) {
            if(this.appliedAmount <= 0 && this.totalDownpayment <= 0 ) {
                return true
            }
            if(this.appliedAmount > 0 && this.totalDownpayment > 0) {
                return false;
            }
            if(this.appliedAmount <= 0 && this.totalDownpayment > 0) {
                return false;
            }
            if(this.appliedAmount > 0 && this.totalDownpayment <= 0){
                return false;
            }
        }

        return (!this.documentLines || this.documentLines.length === 0) || this.disableCreateButton;
    }

    /**
     * Open or show the bill of materials
     * @param _event The event emitted by the click action
     * @param _item The item where the bill of materials are
     * @constructor
     */
    ToggleBillOfMaterial(_event: any, _item: IDocumentLine): void
    {
        _event.stopPropagation(); 
        _item.IsBillOfMaterialsOpen = !_item.IsBillOfMaterialsOpen;
    }

    /**
     * Based on document type variable will be return the document type acronym
     * @constructor
     */
    GetDocumentTypeAcronym(): string
    {
        switch (this.documentType) {
            case DocumentType.CashInvoice:
                return DocumentTypeAcronyms.InvoiceWithPayment;
            case DocumentType.ReserveInvoice:
            case DocumentType.CreditInvoice:
                return DocumentTypeAcronyms.Invoice;
            case DocumentType.SaleOrder:
                return DocumentTypeAcronyms.SaleOrder;
            case DocumentType.SaleOffer:
                return DocumentTypeAcronyms.SaleQuotation;
            default:
                return '-'
        }
    }

    ShouldApplyColor(_documentLine: IDocumentLine): boolean {
       if(_documentLine.UnitPrice>_documentLine.LastPurchasePrice){
            return false
       }else{
            return true;
       }
     }

    /**
     * Sets the vldLineMode based on the current document type and corresponding validation settings
     * @constructor
     */
    DefineSettingLine(): void {
        let documentType= +this.localStorageService.data.get(LocalStorageVariables.DocumentType);
      
        switch (documentType) {
            case DocumentType.SaleOffer:
                if (this.vldLineModeSetting && this.vldLineModeSetting.Validate.length > 0) {
                    this.vldLineMode = this.vldLineModeSetting.Validate.filter(x => x.Table === DocumentTypeName.SaleQuotation)[0];
                }
                break;
            case DocumentType.SaleOrder:
                if (this.vldLineModeSetting && this.vldLineModeSetting.Validate.length > 0) {
                    this.vldLineMode = this.vldLineModeSetting.Validate.filter(x => x.Table === DocumentTypeName.SaleOrder)[0];
                }
                break;
            case DocumentType.CreditInvoice:
                if (this.vldLineModeSetting && this.vldLineModeSetting.Validate.length > 0) {
                    this.vldLineMode = this.vldLineModeSetting.Validate.filter(x => x.Table === DocumentTypeName.Invoice)[0];
                }
                break;
            case DocumentType.ReserveInvoice:
                if (this.vldLineModeSetting && this.vldLineModeSetting.Validate.length > 0) {
                    this.vldLineMode = this.vldLineModeSetting.Validate.filter(x => x.Table === DocumentTypeName.Invoice)[0];
                }
                break;
            case DocumentType.CashInvoice:
                if (this.vldLineModeSetting && this.vldLineModeSetting.Validate.length > 0) {
                    this.vldLineMode = this.vldLineModeSetting.Validate.filter(x => x.Table === DocumentTypeName.Invoice)[0];
                }
                break;
            case DocumentType.Delivery:
                if (this.vldLineModeSetting && this.vldLineModeSetting.Validate.length > 0) {
                    this.vldLineMode = this.vldLineModeSetting.Validate.filter(x => x.Table === DocumentTypeName.DeliveryNote)[0];
                }
                break;
        }
    }

    /**
     * Creates or updates a sales order draft based on the provided document lines and customer information.
     *
     * @param _edit - A boolean flag indicating whether the draft is being edited. Defaults to `false`.
     *
     * @returns A promise that resolves when the draft creation or update process is complete.
     */
    private async CreateOrderDraft(_edit: boolean = false): Promise<void> {

        let loader = await this.commonService.Loader();

        loader.present();

        let lines: ISalesOrderRows[] = [];

        this.documentLines.forEach(element => {
            let line: ISalesOrderRows = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                BaseType: element.BaseType,
                BaseEntry: element.BaseEntry,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                CostingCode: '',
                LineTotal: element.Total,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                UoMEntry: element.UoMEntry,
                SerialNumbers: element.SerialNumbers,
                BatchNumbers: this.commitedBatches?.find(x => x.ItemCode === element.ItemCode)?.Batches?.filter(y => y.Quantity > 0).map(bacth => {
                    return {
                        BatchNumber: bacth.BatchNumber,
                        Quantity: bacth.Quantity
                    } as IBatchNumbers
                }) ?? [],
                DocumentLinesBinAllocations: [],
                Udfs: [],
                TaxOnly: element.TaxOnly
            };
            lines.push(line);
        });

        let docModel: ISalesOrder = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs()
        };
        


        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice"))
        {
            loader.dismiss();

            this.RaiseBatchingProcess();

            this.disableCreateButton = false;

            return;
        }
        
        if (this.network.type !== 'none')
        {
            let logMessage: string = this.commonService.Translate(`Se envió a crear el preliminar ${this.documentKey}`, `Sent to create the draft ${this.documentKey}`);

            this.logManagerService.Log(LogEvent.INFO, logMessage, this.GetDocumentTypeName(), this.documentKey);

            let createOrUpdate$: Observable<ICLResponse<ISalesOrder>>;

            if (!_edit)
            {
                createOrUpdate$ = this.documentService.CreateOrderDraft(docModel, this.documentAttachment, this.attachmentFiles);
            }
            else
            {
                createOrUpdate$ = this.documentService.UpdateOrderDraft(docModel, this.documentAttachment, this.attachmentFiles);
            }

            createOrUpdate$.pipe(
                switchMap(callback => {
                    
                    return of({
                                FormatDocument: null,
                                Document: callback.Data
                            });
                    }
                ),
                finalize(() => {
                    this.disableCreateButton = false;
                    loader.dismiss();
                })
            )
                .subscribe(
                    async (response) => {
                        if (!_edit)
                        {
                            if (response.Document)
                            {
                                this.printing = response.FormatDocument?.PrintFormat ?? '';

                                this.lastDocEntry =  response.Document.DocEntry;

                                let message: string = this.commonService.Translate(`Preliminar creado con éxito, DocNum: ${response.Document.DocNum}`, `Draft was successfully created, DocNum: ${response.Document.DocNum}`);

                                this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);

                                this.ShowDocumentInfo({
                                    FEKey: '0',
                                    ConsecutiveNumber: '0',
                                    DocNum: response.Document.DocNum.toString(),
                                    DocEntry: response.Document.DocEntry,
                                    DocType: this.documentType,
                                    AllowPrint: true,
                                    IsPreliminary:true,
                                    PrintInformation: this.printing
                                } as IDocumentCreateComponentInputData)
                            }
                        }
                        else
                        {
                            this.commonService.Alert(AlertType.INFO, 'Preliminar de orden editada con éxito', 'Successfully edited drafts sales order');

                            this.ResetData(true);
                        }
                    },
                    (error) => {

                        let logMessage: string = this.commonService.Translate(
                            `${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detalle: ${error}`,
                            `${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detail: ${error}`
                        );

                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            logMessage,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );

                        this.HandlerDocumentCreationError({
                            Document: docModel,
                            TransactionType: this.transactionType
                        }, error);
                    }
                );
        }
        else
        {
            this.disableCreateButton = false;

            loader.dismiss();

            this.HandlerDocumentCreationError(
                { Document: docModel, TransactionType: this.transactionType },
                this.translateService.currentLang === "en"
                    ? "No internet connection"
                    : "No hay conexión a internet"
            );
        }
    }

    /**
     * Creates or updates a sales quotation draft based on the provided document lines and customer information.
     *
     * @param _edit - A boolean flag indicating whether the draft is being edited. Defaults to `false`.
     *                If `true`, the function updates an existing draft; otherwise, it creates a new draft.
     *
     * @returns A promise that resolves when the draft creation or update process is complete.
     *          The function does not return any specific value upon completion.
     */
    private async CreateQuotationDraft(_edit: boolean = false): Promise<void>
    {
        let loader: HTMLIonLoadingElement = await this.commonService.Loader();

        loader.present();

        let lines: ISalesQuotationRows[] = [];

        this.documentLines.forEach(element => {
            let line: ISalesQuotationRows = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                BaseType: element.BaseType,
                BaseEntry: element.BaseEntry,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                CostingCode: '',
                LineTotal: element.Total,
                ItemDescription: element.ItemName,
                TaxRate: element.TaxRate,
                Udfs: [],
                UoMEntry: element.UoMEntry,
                TaxOnly: element.TaxOnly
            };
            lines.push(line);
        });

        let docModel: ISalesQuotation = {
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs()
        };
        

        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice"))
        {
            loader.dismiss();
            this.RaiseBatchingProcess();
            this.disableCreateButton = false;
            return;
        }

        if (this.network.type !== 'none')
        {
            let logMessage: string = this.commonService.Translate(`Se envió a crear el preliminar ${this.documentKey}`, `Sent to create the draft ${this.documentKey}`);

            this.logManagerService.Log(LogEvent.INFO, logMessage, this.GetDocumentTypeName(), this.documentKey);

            let createOrUpdate$: Observable<ICLResponse<ISalesQuotation>>;

            if (!_edit)
            {
                createOrUpdate$ = this.documentService.CreateQuotationDraft(docModel, this.documentAttachment, this.attachmentFiles);
            }
            else
            {
                createOrUpdate$ = this.documentService.UpdateQuotationDraft(docModel, this.documentAttachment, this.attachmentFiles);
            }

            createOrUpdate$.pipe(
                switchMap(callback => {
                        return of({
                            FormatDocument: null,
                            Document: callback.Data
                        })
                    }
                ),
                finalize(() => {
                    this.disableCreateButton = false;
                    loader.dismiss();
                })
            ).subscribe(
                async (next) => {
                    if (!_edit)
                    {
                        if (next.Document)
                        {
                            this.lastDocEntry = next.Document?.ConfirmationEntry > 0 ? next.Document.ConfirmationEntry : next.Document.DocEntry;

                            this.printing = next.FormatDocument?.PrintFormat ?? '';

                            let message: string = '';

                            if (next.Document?.ConfirmationEntry > 0)
                            {
                                message = this.commonService.Translate(`Documento requiere un proceso de autorización, DocNum: ${next.Document?.DocNum}`, `Document require a process authorization`);
                            }
                            else
                            {
                                message = this.commonService.Translate(`Preliminar creado con éxito, DocNum: ${next.Document?.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${next.Document.DocNum}`);
                            }

                            let isPreliminar = true;

                            this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);

                            this.ShowDocumentInfo({
                                FEKey: '0',
                                ConsecutiveNumber: '0',
                                DocNum: next.Document.DocNum.toString(),
                                DocEntry: next.Document.DocEntry,
                                DocType: this.documentType,
                                AllowPrint: true,
                                Edit: false,
                                IsPreliminary: isPreliminar,
                                PrintInformation: this.printing
                            } as IDocumentCreateComponentInputData)
                        }
                    }
                    else
                    {
                        this.commonService.Alert(AlertType.INFO, 'Preliminar de cotización editada con éxito', 'Successfully edited draft sales offer');

                        this.ResetData(true);
                    }
                },
                (error) => {

                    let logMessage: string = this.commonService.Translate(
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detalle: ${error}`,
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detail: ${error}`
                    );

                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        logMessage,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );

                    this.HandlerDocumentCreationError({
                        Document: docModel,
                        TransactionType: this.transactionType
                    }, error);
                }
            );
        }
        else
        {
            this.disableCreateButton = false;

            loader.dismiss();

            this.HandlerDocumentCreationError(
                { Document: docModel, TransactionType: this.transactionType },
                this.translateService.currentLang === "en"
                    ? "No internet connection"
                    : "No hay conexión a internet"
            );
        }
    }

    /**
     * Creates or updates an invoice draft based on the provided document lines and customer information.
     *
     * @param _edit - A boolean flag indicating whether the draft is being edited. Defaults to `false`.
     *                If `true`, the function updates an existing draft; otherwise, it creates a new draft.
     *
     * @returns A promise that resolves when the draft creation or update process is complete.
     *          The function does not return any specific value upon completion.
     */
    private async CreateInvoiceDraft(_edit: boolean = false): Promise<void>
    {
        let loader = await this.commonService.Loader();

        loader.present();

        let lines: IARInvoiceRows[] = [];

        this.documentLines.forEach((element, index) => {
            let line = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                UoMEntry: element.UoMEntry,
                TaxOnly: element.TaxOnly,
                BatchNumbers: this.GetCommiteBatches(element),
                BaseType: element.BaseType,
                BaseEntry: element.BaseEntry,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                DocumentLinesBinAllocations: element.DocumentLinesBinAllocations,
                SerialNumbers: element.SerialNumbers,
            } as IARInvoiceRows;
            lines.push(line);
        });

        let recerveInvoice: string =
            BoYesNoEnum[+(this.documentType === DocumentType.ReserveInvoice)];

        let docModel = {
            DocumentType: DocumentType.CreditInvoice,
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.customer.PayTermsGrpCode,
            Series: 0,
            ReserveInvoice: recerveInvoice,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs(),
        } as IARInvoice;
        

        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice"))
        {
            loader.dismiss();
            this.RaiseBatchingProcess();
            this.disableCreateButton = false;
            return;
        }

        if (this.network.type !== "none")
        {
            let logMessage: string = this.commonService.Translate(
                `Se envió a crear el preliminar ${this.documentKey
                }`,
                `Sent to create the draft${this.documentKey
                }`
            );

            this.logManagerService.Log(
                LogEvent.INFO,
                logMessage,
                this.GetDocumentTypeName(),
                this.documentKey
            );
            let createOrUpdate$: Observable<ICLResponse<ISalesQuotation>>;

            if (!_edit)
            {
                createOrUpdate$ = this.documentService.CreateInvoiceDraft(docModel, this.documentAttachment, this.attachmentFiles);
            }
            else
            {
                createOrUpdate$ = this.documentService.UpdateInvoiceDraft(docModel, this.documentAttachment, this.attachmentFiles);
            }

            createOrUpdate$.pipe(
                    switchMap(callback => {
                            return of({
                                FormatDocument: null,
                                Document: callback.Data
                            })
                        }
                    ),
                    finalize(() => {
                        this.disableCreateButton = false;
                        loader.dismiss();
                    }))
                .subscribe(
                    async (next) => {
                        if (next.Document) {
                            this.printing = next.FormatDocument?.PrintFormat ?? '';
                            this.lastDocEntry = next.Document?.ConfirmationEntry > 0 ? next.Document.ConfirmationEntry : next.Document.DocEntry;
                            let message: string = this.commonService.Translate(`Preliminar creado con éxito, DocNum: ${next.Document.DocNum}`, `Draft was successfully created, DocNum: ${next.Document.DocNum}`);
                            this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);
                            let isPreliminar = next.Document?.ConfirmationEntry > 0;
                            this.ShowDocumentInfo({
                                FEKey: next.Document['ClaveFE'],
                                ConsecutiveNumber: next.Document['NumFE'],
                                DocNum: next.Document.DocNum.toString(),
                                DocEntry: next.Document.DocEntry,
                                DocType: this.documentType,
                                AllowPrint: true,
                                Edit: false,
                                IsPreliminary: isPreliminar,
                                PrintInformation: this.printing
                            } as IDocumentCreateComponentInputData);
                        }
                    },
                    (error) => {

                        let logMessage: string = this.commonService.Translate(
                            `${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detalle: ${error}`,
                            `${this.GetDocumentTypeName(true)} ${this.documentKey
                            }. Detail: ${error}`
                        );

                        this.logManagerService.Log(
                            LogEvent.ERROR,
                            logMessage,
                            this.GetDocumentTypeName(),
                            this.documentKey
                        );

                        this.HandlerDocumentCreationError({
                            Document: docModel,
                            TransactionType: this.transactionType
                        }, error);
                    }
                );
        }
        else
        {
            this.disableCreateButton = false;

            loader.dismiss();

            this.HandlerDocumentCreationError(
                { Document: docModel, TransactionType: this.transactionType },
                this.translateService.currentLang === "en"
                    ? "No internet connection"
                    : "No hay conexión a internet"
            );
        }
    }

    /**
     * This method is used for create or update DownInvoice
     * @param _edit Indicate if is edition document
     * @returns 
     */
    private async CreateDownInvoice(_edit: boolean = false): Promise<void>
    {
        let loader = await this.commonService.Loader();

        loader.present();

        let lines: IARInvoiceRows[] = [];

        this.documentLines.forEach((element, index) => {
            let line = {
                ItemCode: element.ItemCode,
                Quantity: element.Quantity,
                UnitPrice: element.UnitPrice,
                DiscountPercent: element.DiscountPercent,
                TaxCode: element.TaxCode,
                WarehouseCode: element.WarehouseCode,
                UoMEntry: element.UoMEntry,
                TaxOnly: element.TaxOnly,
                BatchNumbers: this.GetCommiteBatches(element),
                BaseType: element.BaseType,
                BaseEntry: element.BaseEntry,
                BaseLine: element.BaseLine,
                LineNum: element.LineNum,
                LineStatus: element.LineStatus,
                DocumentLinesBinAllocations: element.DocumentLinesBinAllocations,
                SerialNumbers: element.SerialNumbers,
                ItemDescription: element.ItemName,
            } as IARInvoiceRows;
            lines.push(line);
        });

        let docModel = {
            DocumentType: DocumentType.CreditInvoice,
            CardCode: this.customer.CardCode,
            CardName: this.cardNameFormControl.value,
            DocCurrency: this.docCurrency,
            DocEntry: this.PreloadedDocument?.DocEntry ?? 0,
            DocNum: 0,
            DocumentLines: lines,
            SalesPersonCode: +this.userAssignment.SlpCode,
            Comments: this.comments,
            DocTotal: this.total,
            PaymentGroupCode: this.PreloadedDocument?.PaymentGroupCode ?? this.customer.PayTermsGrpCode,
            Series: 0,
            DocDueDate: FormatDate(this.dueDate),
            DocDate: FormatDate(this.docDate),
            TaxDate: FormatDate(this.taxDate),
            Udfs: this.GetValuesUDFs(),
            DownPaymentPercentage: this.downPaymentPercentage.value,
            DownPaymentType:'dptInvoice',
        } as IARInvoice;
        
        
        let downInvoiceWithPayment = {
            ARInvoice: docModel
        } as IDownInvoiceWithPayment
            


        if (this.hasBatchedItemsWithoutProcess && this.GetDocumentTypeName().includes("invoice"))
        {
            loader.dismiss();
            this.RaiseBatchingProcess();
            this.disableCreateButton = false;
            return;
        }

        
        let logMessage: string = this.commonService.Translate(
            `Se envió a crear la ${this.GetDocumentTypeName(true)} ${this.documentKey
            }`,
            `Sent to create the ${this.GetDocumentTypeName(true)} ${this.documentKey
            }`
        );

        this.logManagerService.Log(
            LogEvent.INFO,
            logMessage,
            this.GetDocumentTypeName(),
            this.documentKey
        );

        let createOrUpdate$: Observable<ICLResponse<IDownInvoiceWithPayment>>;

        if (!_edit)
        {
            createOrUpdate$ = this.documentService.CreateDownInvoice(downInvoiceWithPayment, this.documentAttachment, this.attachmentFiles);
        }
        else
        {
            createOrUpdate$ = this.documentService.UpdateDownInvoice(downInvoiceWithPayment, this.documentAttachment, this.attachmentFiles);
        }

        createOrUpdate$.pipe(
                switchMap(callback => {
                    if(!_edit){
                        return this.printService.GetDocumentPrintFormat(callback.Data.ARInvoice.DocEntry, callback.Data.ARInvoice.ConfirmationEntry, this.documentType == 15 ? DocumentType.ReserveInvoice : this.documentType, 0, '').pipe(
                            map(response => {
                                return {
                                    FormatDocument: response.Data,
                                    Document: callback.Data.ARInvoice
                                }
                            }),
                            catchError((error) => {
                                this.logManagerService.Log(LogEvent.ERROR, error, this.GetDocumentTypeName(), this.documentKey, 0);
                                return of({
                                    FormatDocument: null,
                                    Document: callback.Data.ARInvoice
                                })
                            })
                        )

                    } 
                    else 
                    {
                        return of({
                            FormatDocument: null,
                            Document: null
                        });
                    }
                }),
                finalize(() => {
                    this.disableCreateButton = false;
                    loader.dismiss();
                }))
            .subscribe(
                async (next) => {
                    if(!_edit){
                        if (next.Document) {
                            this.printing = next.FormatDocument?.PrintFormat ?? '';
                            this.lastDocEntry = next.Document?.ConfirmationEntry > 0 ? next.Document.ConfirmationEntry : next.Document.DocEntry;
                            let message: string = this.commonService.Translate(`${this.GetDocumentTypeName(true)} creada con éxito, DocNum: ${next.Document.DocNum}`, `${this.GetDocumentTypeName(true)} was successfully created, DocNum: ${next.Document.DocNum}`);
                            this.logManagerService.Log(LogEvent.SUCCESS, message, this.GetDocumentTypeName(), this.documentKey, 0);
                            this.ShowDocumentInfo({
                                FEKey: '',
                                ConsecutiveNumber: '',
                                DocNum: next.Document.DocNum.toString(),
                                DocEntry: next.Document.DocEntry,
                                DocType: this.documentType,
                                AllowPrint: true,
                                Edit: false,
                                IsPreliminary: false,
                                PrintInformation: this.printing
                            } as IDocumentCreateComponentInputData);
                        }
                    }
                    else{
                        this.commonService.Alert(AlertType.INFO, `${this.GetDocumentTypeName(true)} actualizada con éxito`,  `${this.GetDocumentTypeName(true)} successfully updated`);
                        
                        this.ResetData(true);
                    }
                    
                },
                (error) => {

                    let logMessage: string = this.commonService.Translate(
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detalle: ${error}`,
                        `${this.GetDocumentTypeName(true)} ${this.documentKey
                        }. Detail: ${error}`
                    );

                    this.logManagerService.Log(
                        LogEvent.ERROR,
                        logMessage,
                        this.GetDocumentTypeName(),
                        this.documentKey
                    );

                    this.HandlerDocumentCreationError({
                        Document: docModel,
                        TransactionType: this.transactionType
                    }, error);
                }
            );
    }

    /**
     * Validates the user's permission to create a draft based on the current document type.
     *
     * This function checks the user's permissions against the current document type
     * and sets the `canCreateDraft` flag accordingly. It ensures that the user has
     * the necessary permissions to create a draft for the specific type of document
     * being handled.
     *
     * @returns {void} This function does not return a value. It updates the `canCreateDraft` property.
     */
    private ValidatePermissionToAvailableDraft(): void {
        switch (this.documentType) {
            case DocumentType.SaleOffer:
                this.canCreateDraft =this.permisionList.some((p) => p.Name === "Sales_Documents_Quotations_CreateDraft");
                break;
            case DocumentType.SaleOrder:
                this.canCreateDraft =this.permisionList.some((p) => p.Name === "Sales_Documents_Order_CreateDraft");
                break;
            case DocumentType.CreditInvoice:
                this.canCreateDraft =this.permisionList.some((p) => p.Name === "Sales_Documents_Invoice_CreateDraft");
                break;
            case DocumentType.ReserveInvoice:
                this.canCreateDraft =this.permisionList.some((p) => p.Name === "Sales_Documents_ReserveInvoice_CreateDraft");
                break;
            default:
                this.canCreateDraft = false;
                break;
        }
    }

    /**
     * Determines the column size based on the document type and draft creation capability.
     *
     * @returns {number} - Returns 4 if the document type is not 10 or 12 and drafts can be created; otherwise, returns 6.
     */
    get colSize(): number {
        return ![10, 12, 17, 18].includes(this.documentType) && this.canCreateDraft ? 4 : 6;
    }
    
    /**
     * Toggles the visibility of the payment form.
     * This method changes the state of a boolean flag
     * to show or hide the payment form in the UI.
     *
     * @returns void
     */
    TogglePayForm(): void {
        this.isDownpaymentFormToggled = !this.isDownpaymentFormToggled;
    }
    

    /**
     * Assign the selected date to the corresponding field
     * @param _dateTypeField
     * @constructor
     */
    ShowDatePicker(_dateTypeField: string): void {
        this.datePicker
            .show({
                date: new Date(),
                mode: "date",
                androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
            })
            .then((date) => {
                switch (_dateTypeField) {
                    case 'DocDate':
                        this.docDate = date.toISOString()
                        break;
                    case 'DueDate':
                        this.dueDate = date.toISOString()
                        break;
                    case 'TaxDate':
                        this.taxDate = date.toISOString()
                        break;
                }
            });
    }

    /**
     * When focus is lost, the advance percentage is validated.
     * @constructor
     */
    AssignDownPaymentPercentage() {
        let rawValue = this.downPaymentPercentage.value;
        if(rawValue === null || rawValue === '' || rawValue === undefined) {
            this.downPaymentPercentage.setValue(0);
            this.UpdateTotals()
        }
    }


       /**
     * Toggles the visibility attachment seccion.
     * This method changes the state of a boolean flag
     * to show or hide the attachments in the UI.
     *
     * @returns void
     */
    ToggleAttachments(): void {
        this.isAttachmentToggled = !this.isAttachmentToggled;
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
            this.commonService.Alert(AlertType.WARNING, `Hay archivos que no contienen extensión. Por favor agrégueles una extensión.`,  `There are files that don't have an extension. Please add one.`);
            return;
        }

        let validExtensions: string[] = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xls', 'ppt', 'xlsx', 'pptx'];

        let invalidFile = attachmentFiles.find(file => !validExtensions.includes(file.name.split('.').pop()!));

        if(invalidFile)
        {
             this.commonService.Alert(AlertType.WARNING, `La extensión del archivo ${invalidFile.name} no es permitida.`,  `The file extension ${invalidFile.name} is not allowed.`);
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

        if(hasDuplicatesFiles)
        {
            this.commonService.Alert(AlertType.WARNING, 'No es posible cargar archivos con el mismo nombre.', 'It is not possible to upload files with the same name.');
        }
    }

    /**
     * Removes an attachment from the current document attachment list by its index.
     * 
     * - Updates the attachment list (`Attachments2_Lines`) by removing the specified line.
     * - Reindexes the remaining attachment lines by updating their `Id` field.
     * - Also removes the corresponding file from the in-memory list `attachmentFiles`.
     * 
     * @param index - Index of the attachment to remove from the list.
     */
    RemoveAttachment(index: number) {
        let removedAttachmentLine = this.documentAttachment.Attachments2_Lines.splice(index, 1)[0];

        this.documentAttachment.Attachments2_Lines = this.documentAttachment.Attachments2_Lines.map((attL, index) => {
        return {
            ...attL,
            Id: index + 1
        }
        });

        this.attachmentFiles = this.attachmentFiles?.filter(attF => attF.name != `${removedAttachmentLine.FileName}.${removedAttachmentLine.FileExtension}`);
    }

    /**
     * Downloads and opens a file attachment from the server if it has been previously saved in SAP.
     * 
     * - Verifies if the attachment has an `AbsoluteEntry`.
     * - Requests the file from the backend using the full path.
     * - Converts the base64 response to a file and opens it using the file opener service.
     * 
     * @param attachmentLine - The attachment line object to be downloaded and opened.
     */
    async DownloadAttachment  (attachmentLine: IAttachments2Line) : Promise<void>{

        if(!attachmentLine.AbsoluteEntry)
        {
            this.commonService.Alert(AlertType.WARNING, 'Este adjunto aún no ha sido guardado en SAP.', 'This attachment has not yet been saved in SAP.');

            return
        }

        let loader = await this.commonService.Loader();

        loader.present();

        this.attachmentService.GetFile(`${attachmentLine.SourcePath}\\${attachmentLine.FileName}.${attachmentLine.FileExtension}`)
          .pipe(
            finalize(() => loader.dismiss())
          ).subscribe({
            next: (callback) => {
              if(callback.Data){
                this.fileService
                    .WriteAttachmentFile(callback.Data, attachmentLine.FileName, 'data:application/octet-stream;base64', attachmentLine.FileExtension)
                    .then((result) => {
                        this.fileService.OpenAttachmentFiles(result.nativeURL, attachmentLine.FileExtension);
                    })
                    .catch(error=>
                        this.commonService.Alert(
                                AlertType.WARNING,
                                error, error,
                               'Se produjo un error al descargar el adjunto', 'An error occurred while downloading the attachment.'
                            )
                    );
              }
            },
            error: (error) => {
              this.commonService.Alert(
                                AlertType.WARNING,
                                error, error,
                               'Se produjo un error al descargar el adjunto', 'An error occurred while downloading the attachment.'
                            );
            }
          });
    }
    
    /**
     * Validates if the attachment section should be visible based on the current document type.
     */
    ValidateAttachSetting(): void {

        if(!this.validateAttachmentsTables){
            return
        }

        switch (this.documentType) {
            case DocumentType.SaleOffer:
                this.ValidateAttachmentsByDocType(DocumentSAPTypes.Quotations);
                break;
            case DocumentType.SaleOrder:
                this.ValidateAttachmentsByDocType(DocumentSAPTypes.Orders);
                break;
            case DocumentType.CreditInvoice:
            case DocumentType.CashInvoice:
            case DocumentType.ReserveInvoice:
            case DocumentType.CashReserveInvoice:
                this.ValidateAttachmentsByDocType(DocumentSAPTypes.Invoices);
                break;
            case DocumentType.Delivery:
                this.ValidateAttachmentsByDocType(DocumentSAPTypes.DeliveryNotes);
                break;
            case DocumentType.CreditNotes:
               this.ValidateAttachmentsByDocType(DocumentSAPTypes.CreditNotes);
                break;
            case DocumentType.CashDownInvoice:
            case DocumentType.CreditDownInvoice:
                this.ValidateAttachmentsByDocType(DocumentSAPTypes.ArDownPayments);
                break;
        }
    }

    /**
     * Checks if the given document type requires attachment validation.
     * @param _documentType - The SAP document type code
     */
    ValidateAttachmentsByDocType(_documentType: string){
        const setting = this.validateAttachmentsTables.Validate.find(value => value.Table === _documentType);
        this.isVisibleAttachSeccion = !!(setting?.Active);
    }

    /**
     * Inserts or updates a UDF entry in the given collection.
     * If a UDF with the specified name exists, its value is updated; otherwise a new UDF is added.
     * @param _udfs Collection of UDFs to modify.
     * @param _name UDF name (key).
     * @param _value UDF value to set.
     * @param _fieldType UDF field type (default: "String").
     */
    UpsertUdf(_udfs: IUdf[], _name: string, _value: string, _fieldType: string = "String") {
        const existing = _udfs.find((udf) => udf.Name === _name);

        if (existing) {
            existing.Value = _value;
        } else {
            _udfs.push({
            Name: _name,
            FieldType: _fieldType,
            Value: _value,
            } as IUdf);
        }
    }

    protected readonly App = App;
}

