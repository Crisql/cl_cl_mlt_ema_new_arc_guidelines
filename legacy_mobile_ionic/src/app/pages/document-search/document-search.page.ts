import {
    Bonification,
    CopyFrom, 
    DocumentTypeSubFilter,
    LineStatus,
    LogEvent,
    PreBonification,
    PreLineStatus,
    SupportedPrintingType
} from './../../common/enum';
import { FormatDate } from 'src/app/common/function';
import { PrintFormatService } from './../../services/print-format.service';
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial/ngx";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { Network } from "@ionic-native/network/ngx";
import { ActionSheetButton, LoadingController, ActionSheetController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import {
    DocumentDraftSearchMobileModel,
    DocumentSearchMobileModel,
    IDocumentTypeLabel,
    PreloadedDocument
} from "src/app/models/db/Doc-model";
import { EMPTY, forkJoin, Observable, of, Subscription } from "rxjs";
import { catchError, concatMap, filter, finalize, first, map } from "rxjs/operators";
import { AlertType, DocumentType } from "src/app/common";
import {
    Controller,
    HeadersData,
    LocalStorageVariables,
    PublisherVariables,
    ReferencedObjectTypeEnum
} from "src/app/common/enum";
import { CustomerSearchComponent } from "src/app/components";
import {
    DocStateEN,
    DocStateES,
    ICurrency,
    PermissionsSelectedModel
} from "src/app/models";
import {
    CompanyService,
    DocumentService,
    PermissionService,
    CommonService,
    FileService,
    LocalStorageService,
    PrintingService,
    PublisherService,
    CustomerService,
    LogManagerService,
} from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { ICLResponse } from "../../models/responses/response";
import { IUserAssign } from "../../models/db/user-model";
import { IDocument} from "../../interfaces/i-documents";
import { UdfsService } from "../../services/udfs.service";
import { IFilterKeyUdf } from "../../interfaces/i-udfs";
import { ISalesDocumentSearch } from "../../interfaces/i-sales-documentSearch";
import { ISalesTaxes } from "../../interfaces/i-sales-taxes";
import { IDocumentLine } from 'src/app/interfaces/i-item';
import { IBusinessPartners } from "../../interfaces/i-business-partners";
import { htmlToText } from "html-to-text";
import { AttachmentsService } from 'src/app/services/attachments.service';
import { IAttachments2Line } from 'src/app/interfaces/i-document-attachment';

@Component({
    selector: "app-document-search",
    templateUrl: "./document-search.page.html",
    styleUrls: ["./document-search.page.scss"],
})
export class DocumentSearchPage {
    //varbox
    docTypesLabels: IDocumentTypeLabel[];
    permissionList: PermissionsSelectedModel[];
    docTypeSelected: string;
    subscriptions=  new Subscription();
    linesAmount: number;
    editedDocument: IDocument;
    products: IDocumentLine[];
    attachmentLines: IAttachments2Line[];

    clickCounter: number;
    taxList: ISalesTaxes[];
    SearchCustomerBtn = true;
    customer: IBusinessPartners;
    startDate: string;
    endDate: string;
    docCur: string = '';
    navigatePage:string = '';
    currTypes: any[];
    docStates: any[];
    docStatesToShow: any[];
    docState: string;
    docList: ISalesDocumentSearch[] = [];
    currentSegment = 'search';
    currencyList: ICurrency[] = [];
    currentLang: string;
    showCopyOptionList: boolean;
    documentTypeToCopy: number;
    isActionCopyTo: boolean = false;
    isActionDuplicate: boolean;
    slpName: string;
    headerDiscount: number;
    hasHeaderDiscount: boolean;
    page: number = 0;
    itemsPerPage = 10
    recordsCount: number = 0;
    /**
     * Determines the visibility of the second filter based on the selected document type.
     *
     * @type {boolean}
     * @default false
     */
    secondFilterVisible: boolean = false;

    /**
     * Represents the selected document object type.
     *
     * @type {number}
     */
    docObjTypeSelected: string;

    constructor(
        private documentService: DocumentService,
        private router: Router,
        private modalController: CustomModalController,
        private translateService: TranslateService,
        private datePicker: DatePicker,
        private loadingCtrl: LoadingController,
        private localStorageService: LocalStorageService,
        private commonService: CommonService,
        private bluetoothSerial: BluetoothSerial,
        private network: Network,
        private companyService: CompanyService,
        private actionSheetController: ActionSheetController,
        private fileService: FileService,
        private permissionService: PermissionService,
        private publisherService: PublisherService,
        private udfService: UdfsService,
        private printFormatService: PrintFormatService,
        private PrintingService: PrintingService,
        private attachmentService: AttachmentsService,
        private customerService: CustomerService,
        private logManagerService: LogManagerService
    ) {
    }

    ionViewWillEnter() {
        this.permissionList = [...this.permissionService.Permissions];
        this.docTypeSelected = DocumentType.SaleOffer.toString();
        this.docObjTypeSelected = DocumentTypeSubFilter.SaleOffer.toString();
        this.showCopyOptionList = false;
        this.linesAmount = -1;
        this.currentLang = this.translateService.currentLang;
        this.docCur = '';
        this.docStates =
            this.translateService.currentLang === 'es' ? DocStateES : DocStateEN;
        this.endDate = new Date().toISOString();
        let startDate = new Date();
        startDate.setDate(new Date().getDate() - 10);
        this.startDate = startDate.toISOString();
        this.docState = this.docStates[0].Id;
        this.SearchCustomerBtn = true;
        this.customer = null;
        this.docList = [];
        this.clickCounter = 0;
        this.currentSegment = 'search';
        this.isActionDuplicate = false;
        this.hasHeaderDiscount = this.localStorageService.GetHasHeaderDiscount();
        this.SendInitialRequests();
        this.GetDocStateByDocType();
        this.GetBusinessPartnerPreselected();
    }

    /**
     * Methos is for load initial data
     * @constructor
     */
    async SendInitialRequests(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();

        forkJoin({
            Currencies: this.companyService.GetCurrencies(),
        }).pipe(finalize(() => loader.dismiss()))
            .subscribe({
                next: (callbacks) => {
                    this.currencyList = callbacks.Currencies?.Data ?? [];
                },
                error: (error) => {
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            })
    }

    ionViewDidEnter(): void {
        this.subscriptions = new Subscription();

        //Subscripcion para observar el cambio de permisos
        this.subscriptions.add(this.publisherService.getObservable()
            .pipe(
                filter(p => p.Target === PublisherVariables.Permissions)
            )
            .subscribe({
                next: (callback) => {
                    if (callback) {
                        this.permissionList = [...this.permissionService.Permissions];
                    }
                }
            }));

        //Subscripcion escuchar acciones (CopyTo, Duplicate...)
        this.subscriptions.add(this.commonService.eventManager.subscribe(next => {
            if (next === this.linesAmount) {
                this.SetDocumentToEditData();
            }
        }));
    }

    /**
     * Updates the document states based on the selected document type.
     */
    GetDocStateByDocType(){
        if(this.docTypeSelected == DocumentType.ReserveInvoice.toString()){
            this.docStatesToShow = this.docStates;
        }else{
            this.docStatesToShow = this.docStates?.filter(state => state.Id != 'P');
        }
        
        if(!this.docStatesToShow.some(state => state.Id == this.docState)){
            this.docState = this.docStates[0].Id;
        }
        
        this.secondFilterVisible = this.docTypeSelected == DocumentType.Draft.toString();
    }

    /**
     * Muestra las opciones que se le pueden aplicar al documento
     * @param Document model filter
     * @constructor
     */
    async ShowDocsOptions(Document: ISalesDocumentSearch): Promise<void> {

        if ([this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type)) {
            this.commonService.Alert(AlertType.INFO, 'Debes tener conexión a internet para realizar estas acciones', 'You must have an Internet connection to perform these actions');
            return;
        }

        const EDIT_BUTTON: ActionSheetButton = {
            text: this.commonService.Translate(
                `Editar`,
                `Edit`
            ),
            icon: 'create',
            handler: async () => {
                if (!this.VerifyPermissionByDocType('edit', +this.docTypeSelected)) {
                    let message = this.commonService.Translate('No tienes permisos para realizar esta acción', 'You do not have permissions to performs this action');
                    this.commonService.toast(message, 'dark', 'bottom');
                    return;
                }

                this.localStorageService.data.set(LocalStorageVariables.DocumentType, this.docTypeSelected);
                this.localStorageService.data.set(LocalStorageVariables.IsEditionMode, true);
                this.navigatePage = this.GetPage();
                await this.SearchDocLines(Document);
            }
        }

        const COPY_TO: ActionSheetButton = {
            text: this.commonService.Translate('Copiar a', 'Copy to'),
            icon: 'documents',
            handler: async () => {
                this.isActionCopyTo = true;
                this.localStorageService.data.set(LocalStorageVariables.IsActionCopyTo, true);
                this.ShowCopyOptions(Document);
            }
        }

        const BUTTONS_DUPLICATE: ActionSheetButton =
            {
                text: this.commonService.Translate(
                    `Duplicar`,
                    `Duplicate`
                ),
                icon: 'duplicate-outline',
                handler: async () => {
                    if (!this.VerifyPermissionByDocType('duplicate', +this.docTypeSelected)) {
                        let message = this.commonService.Translate('No tienes permisos para realizar esta acción', 'You do not have permissions to performs this action');
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }

                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, this.docTypeSelected);
                    this.localStorageService.data.set(LocalStorageVariables.IsActionDuplicate, true);
                    this.navigatePage = this.GetPage();
                    await this.SearchDocLines(Document);
                }
            };

        const BUTTONS: ActionSheetButton[] = [
            {
                text: this.commonService.Translate(
                    `Pre-visualizar`,
                    `Pre-view`
                ),
                role: 'destructive',
                icon: 'information-circle',
                handler: async () => {
                    if (!this.permissionList.some(p => p.Name === 'M_Sales_Documents_PreviewDocument')) {
                        let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }
                    await this.OnClickPreview({ DocEntry: Document.DocEntry });
                }
            }, 
            {
                text: this.commonService.Translate(
                    `Imprimir`,
                    `Print`
                ),
                icon: 'print',
                handler: async () => {
                    await this.RequestDocumentToPrint(Document);
                }
            },
            {
                text: this.commonService.Translate(
                    `Cancelar`,
                    `Cancel`
                ),
                icon: 'close',
                role: 'cancel',
                handler: () => {
                   
                }
            }
        ]

        if ([DocumentType.SaleOffer, DocumentType.SaleOrder, DocumentType.CreditInvoice, DocumentType.ReserveInvoice, DocumentType.CreditDownInvoice].includes(+this.docTypeSelected)) {
            BUTTONS.push(EDIT_BUTTON);
        }

        if (!([DocumentType.Delivery, DocumentType.Draft, DocumentType.CreditDownInvoice].includes(+this.docTypeSelected))) {
            BUTTONS.push(BUTTONS_DUPLICATE);
        }

        if ( !([DocumentType.CreditInvoice, DocumentType.CreditNotes, DocumentType.CreditDownInvoice].includes(+this.docTypeSelected))) {
            BUTTONS.push(COPY_TO);
        }
        
        const actionSheet = await this.actionSheetController.create({
            header: this.commonService.Translate('Opciones', 'Options'),
            cssClass: '',
            buttons: BUTTONS
        });
        await actionSheet.present();

        const { role } = await actionSheet.onDidDismiss();
    }
    
    /**
     * This is used preview document
     * @param data 
     * @returns 
     */
    async OnClickPreview(data: any): Promise<void> {
        if (this.network.type === "none") return;

        let controller: string = '';

        switch (+this.docTypeSelected) {
            case DocumentType.SaleOffer:
                controller = 'ReprintSaleOffers';
                break;
            case DocumentType.SaleOrder:
                controller = 'ReprintSaleOrders';
                break;
            case DocumentType.ReserveInvoice:
                controller = 'ReprintReserveInvoice';
                break;
            case DocumentType.Delivery:
                controller = 'ReprintDeliveryNotes';
                break;
            case DocumentType.CashInvoice:
            case DocumentType.CreditInvoice:
                controller = 'ReprintInvoices';
                break;
            case DocumentType.CreditNotes:
                controller = 'ReprintCreditNotes';
                break;
            case DocumentType.Draft:
                controller = 'ReprintPreliminary';
                break;
            case DocumentType.CreditDownInvoice:
                controller = 'ReprintArDownPayment';
                break;
            default:
                return;
        }

        let loader = await this.commonService.Loader();
        loader.present();

        this.subscriptions.add(this.documentService
            .DocumentPreview(data.DocEntry, controller)
            .pipe(
                first(),
                finalize(() => loader.dismiss())
            ).subscribe({
                next: (callback) => {
                    if (callback.Data) {
                        this.fileService
                            .writeFile(callback.Data.Base64, `Doc-${data.DocEntry}`)
                            .then((result) => {
                                this.fileService.openPDF(result.nativeURL);
                            });
                    }
                },
                error: (error) => {
                    this.commonService.toast(error, 'dark', 'bottom');
                }
            }));
    }

    //#region Modals
    async SearchCustomer(slidingCustomer: any): Promise<void> {
        try {
            if (slidingCustomer) slidingCustomer.close();

            let chooseModal = await this.modalController.create({
                component: CustomerSearchComponent,
            });
            chooseModal.present();
            chooseModal.onDidDismiss().then(async (result) => {
                let loader = await this.commonService.GetTopLoader();
                if (result.data) {
                    this.customer = null;
                    this.customer = result.data;
                    this.SearchCustomerBtn = false;
                    this.GetDafaultCurrency();
                }
                loader.dismiss();
            });
        } catch (e) {
            console.error(e);
        }

    }

    /**
     * This method defined the currency filter
     * @constructor
     * @private
     */
    private GetDafaultCurrency(): void {

        if (this.customer.Currency === '##') {
            this.docCur = this.currencyList.find(element => element.IsLocal)?.Id ?? 'ALL';
        }else{
            this.docCur = this.currencyList.find(element => element.Id === this.customer.Currency)?.Id ?? 'ALL';
        }
        
    }

    //#endregion

    ShowEndDatePicker(): void {
        this.datePicker
            .show({
                date: new Date(),
                mode: "date",
                androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
            })
            .then((date) => (this.endDate = date.toISOString()));
    }

    ShowStartDatePicker(): void {
        let startDate = new Date();
        startDate.setDate(new Date().getDate() - 10);
        this.datePicker
            .show({
                date: startDate,
                mode: "date",
                androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
            })
            .then((date) => (this.startDate = date.toISOString()));
    }

    /**
     * Method to configure the data of the document being consulted
     * @param document model document
     * @constructor
     */
    async DocLineToProductModel(document: IDocument): Promise<void> {
        this.products = [];
        this.localStorageService.set('cardCode', this.customer.CardCode, true);
        this.products = document.DocumentLines.map(element => {
            return {
                ...element,
                LineStatus: element.LineStatus === PreLineStatus.bost_Close ? LineStatus.bost_Close : LineStatus.bost_Open,
                TaxOnly: element.TaxOnly === PreBonification.NO ? Bonification.NO : Bonification.YES,
                BaseEntry: this.isActionCopyTo ? document.DocEntry : element.DocEntry,
                BaseType : this.isActionCopyTo ? this.GetBaseType() : element.BaseType,
                BaseLine : this.isActionCopyTo ? element.LineNum : element.BaseLine,
                UnitPrice: element.UnitPrice,
                ItemName: element.ItemDescription,
                UoMEntry: +element.UoMEntry
            }
        });
        this.linesAmount = document.DocumentLines.length;
        // Actualizamos el observable para matener la cuenta de los items
        this.commonService.eventManager.next(this.products.length);
    }
    
    /**
     * 
     * @constructor
     * @private
     */
    private GetBaseType(): number{
        if(+this.docTypeSelected === DocumentType.SaleOffer){
            return CopyFrom.OQUT;
        }else if(+this.docTypeSelected === DocumentType.SaleOrder){
            return CopyFrom.ORDR;
        }else if(+this.docTypeSelected === DocumentType.ReserveInvoice){
            return CopyFrom.OINV;
        }else if(+this.docTypeSelected === DocumentType.Delivery){
            return CopyFrom.ODLN;
        }
        
        return -1;
    }

    /**
   * This method idenficate element to update change list
   * @param index property index
   * @returns 
   */
    TrackByFunction(index) {
        return index;
    }

    /**
     * This method is used to serach documents
     * @constructor
     */
    async SearchDoc(): Promise<void> {
        
        if (!this.customer) {
            this.commonService.Alert(AlertType.WARNING, 'Debe de selecionar un cliente', 'You must select a customer');
            return;
        }


        if (!this.docTypeSelected) {
            this.commonService.Alert(AlertType.WARNING, 'Debe de selecionar un tipo de documento', 'You must select a type of document');
            return;
        }

        let userAssignment: IUserAssign = this.localStorageService.get(LocalStorageVariables.UserAssignment);

        let docSearch = {
            CardCode: this.customer.CardCode,
            SlpCode: userAssignment.SlpCode,
            DocStatus: this.docState,
            DocType: +this.docTypeSelected,
            UsrMapId: userAssignment.Id,
            DocCur: this.docCur,
            StartDate: FormatDate(this.startDate),
            EndDate: FormatDate(this.endDate),
            DocNum: 0,
            Status: "2",
            Delivery: ""
        } as DocumentSearchMobileModel;

        this.page = 0;
        this.docList = [];

        let searchObservable: Observable<ICLResponse<ISalesDocumentSearch[]>> = EMPTY;

        switch (docSearch.DocType) {
            case DocumentType.SaleOffer:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.Quotations, this.page, this.itemsPerPage);
                break;
            case DocumentType.SaleOrder:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.Orders, this.page, this.itemsPerPage);
                break;
            case DocumentType.CreditInvoice:
            case DocumentType.CashInvoice:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.Invoices, this.page, this.itemsPerPage);
                break;
            case DocumentType.ReserveInvoice:
                searchObservable = this.documentService.GetDocuments(docSearch, `Invoices/${Controller.ReserveInvoices}`, this.page, this.itemsPerPage);
                break;
            case DocumentType.Delivery:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.DeliveryNotes, this.page, this.itemsPerPage);
                break;
            case DocumentType.CreditNotes:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.CreditNotes, this.page, this.itemsPerPage);
                break;
            case DocumentType.Draft:

                let docSearchDraft:DocumentDraftSearchMobileModel = {
                    CardCode: this.customer.CardCode,
                    SlpCode: userAssignment.SlpCode,
                    DocStatus: this.docState,
                    DocType: +this.docTypeSelected,
                    UsrMapId: userAssignment.Id,
                    DocCur: this.docCur,
                    StartDate: FormatDate(this.startDate),
                    EndDate: FormatDate(this.endDate),
                    DocNum: 0,
                    ObjType: +this.docObjTypeSelected < 0 ? -(+this.docObjTypeSelected) : +this.docObjTypeSelected,
                    ViewType: 'Sales'
                } ;
                searchObservable = this.documentService.GetDocumentsDrafts(docSearchDraft, Controller.Draft, this.page, this.itemsPerPage);
                break;
            case DocumentType.CreditDownInvoice:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.DownPayment, this.page, this.itemsPerPage);
                break;
            default:
                searchObservable = EMPTY;
        }

        let loader = await this.loadingCtrl.create({
            message: this.commonService.Translate('Procesando...', 'Processing...')
        });

        await loader.present();

        this.subscriptions.add(searchObservable.pipe(
            finalize(() => loader?.dismiss()))
            .subscribe({
                next: (callback) => {
                    if (callback.Data) {
                        if (callback.Data.length > 0) {
                            this.currentSegment = 'docList';
                            this.docList.push(...callback.Data);
                            this.clickCounter = 1;
                            this.recordsCount = +this.localStorageService.data.get(HeadersData.RecordsCount);
                            this.localStorageService.data.delete(HeadersData.RecordsCount)
                        } else {
                            this.commonService.Alert(AlertType.INFO, 'No hay documentos para mostrar', `There's no documents to show`);
                        }
                    } else {
                        this.commonService.alert(AlertType.ERROR, callback.Message);
                    }
                },
                error: (error: any) => {
                    this.commonService.alert(AlertType.ERROR, error);
                }
            }));
    }

    /**
     * 
     * @param _event
     * @constructor
     */
    async SearchMoreDocuments(_event: CustomEvent<void>){
        
        //Si ya cargo todo que no haga mas peticiones
        if (this.docList.length === this.recordsCount) {
            const scroll = _event.target as HTMLIonInfiniteScrollElement;
            scroll.disabled = true;
            return;
        }

        let userAssignment: IUserAssign = this.localStorageService.get(LocalStorageVariables.UserAssignment);

        let docSearch = {
            CardCode: this.customer.CardCode,
            SlpCode: userAssignment.SlpCode,
            DocStatus: this.docState,
            DocType: +this.docTypeSelected,
            UsrMapId: userAssignment.Id,
            DocCur: this.docCur,
            StartDate: FormatDate(this.startDate),
            EndDate: FormatDate(this.endDate),
            DocNum: 0
        } as DocumentSearchMobileModel;

        this.page++;

        let searchObservable: Observable<ICLResponse<ISalesDocumentSearch[]>> = EMPTY;

        switch (docSearch.DocType) {
            case DocumentType.SaleOffer:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.Quotations, this.page, this.itemsPerPage);
                break;
            case DocumentType.SaleOrder:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.Orders, this.page, this.itemsPerPage);
                break;
            case DocumentType.CreditInvoice:
            case DocumentType.CashInvoice:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.Invoices, this.page, this.itemsPerPage);
                break;
            case DocumentType.ReserveInvoice:
                searchObservable = this.documentService.GetDocuments(docSearch, `Invoices/${Controller.ReserveInvoices}`, this.page, this.itemsPerPage);
                break;
            case DocumentType.Delivery:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.DeliveryNotes, this.page, this.itemsPerPage);
                break;
            case DocumentType.CreditNotes:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.CreditNotes, this.page, this.itemsPerPage);
                break;
            case DocumentType.Draft:

                let docSearchDraft:DocumentDraftSearchMobileModel = {
                    CardCode: this.customer.CardCode,
                    SlpCode: userAssignment.SlpCode,
                    DocStatus: this.docState,
                    DocType: +this.docTypeSelected,
                    UsrMapId: userAssignment.Id,
                    DocCur: this.docCur,
                    StartDate: FormatDate(this.startDate),
                    EndDate: FormatDate(this.endDate),
                    DocNum: 0,
                    ObjType: +this.docObjTypeSelected < 0 ? -(+this.docObjTypeSelected) : (+this.docObjTypeSelected),
                    ViewType: 'Sales'
                } ;
                searchObservable = this.documentService.GetDocumentsDrafts(docSearchDraft, Controller.Draft, this.page, this.itemsPerPage);
                break;
            case DocumentType.CreditDownInvoice:
                searchObservable = this.documentService.GetDocuments(docSearch, Controller.DownPayment, this.page, this.itemsPerPage);
                break;
            default:
                searchObservable = EMPTY;
        }

        this.subscriptions.add(searchObservable.pipe(
            finalize(() => {
                    const scroll = _event.target as HTMLIonInfiniteScrollElement;
                    scroll.complete();
                }
            ))
            .subscribe({
                next: (callback) => {
                    if (callback.Data && callback.Data.length > 0)
                        this.docList.push(...callback.Data);
                },
                error: (error: any) => {
                    this.commonService.alert(AlertType.ERROR, error);
                }
            }));
    }

    /**
     * This method is for obtained detail data
     * @param doc
     * @constructor
     */
    async SearchDocLines(doc: ISalesDocumentSearch): Promise<void> {
       
        let loader = await this.loadingCtrl.create({ message: this.commonService.Translate('Procesando...', 'Processing...') });

        loader.present();

        let linesObservable: Observable<ICLResponse<IDocument>>;

        let table: string = '';
        switch (+this.docTypeSelected) {
            case DocumentType.Delivery:
                table = 'ODLN';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.DeliveryNotes);
                break;
            case DocumentType.SaleOffer:
                table = 'OQUT';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.Quotations);
                break;
            case DocumentType.SaleOrder:
                table = 'ORDR';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.Orders);
                break;
            case DocumentType.CreditInvoice:
            case DocumentType.CashInvoice:
            case DocumentType.ReserveInvoice:
                table = 'OINV';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.Invoices);
                break;
            case DocumentType.CreditNotes:
                table = 'ORIN';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.CreditNotes);
                break;
            case DocumentType.Draft:
                table = 'ODRF';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.Draft);
                break;
            case DocumentType.CreditDownInvoice:
                table = 'ODPI';
                linesObservable = this.documentService.Get<IDocument>(doc.DocEntry, Controller.DownPayment);
                break;
            default:
                linesObservable = EMPTY;
        }

        this.subscriptions.add(forkJoin({
            Document: linesObservable,
            UdfsValues: this.udfService.GetUdfsData({
                DocEntry: doc.DocEntry,
                TypeDocument: table
            } as IFilterKeyUdf).pipe(catchError(error => of(null)))
        }).pipe(finalize(() => loader.dismiss()))
        .pipe(
            concatMap(response => {

                if(!response.Document.Data?.AttachmentEntry) return of({...response, AttachmentLines: null});

                let shouldResetAttachmentEntry = this.localStorageService.data.get(LocalStorageVariables.IsEditionMode) ?? false;

                return this.attachmentService.Get(response.Document.Data.AttachmentEntry)
                    .pipe(
                        map(attachmentResponse => {
                            if(!shouldResetAttachmentEntry)
                            {
                                response.Document.Data.AttachmentEntry = response.Document.Data.AttachmentEntry??0;

                                attachmentResponse.Data = attachmentResponse.Data.map(attL => {
                                    attL.AbsoluteEntry = attL.AbsoluteEntry??0;
                                    attL.LineNum = attL.LineNum??0;
                                    return attL;
                                });
                            }

                            return attachmentResponse;
                        }),
                        map(attachmentResponse => ({
                            ...response,
                            AttachmentLines: attachmentResponse
                        }))
                    )
                }),
            catchError(res => of(null))
        )
        .subscribe({
            next: async (data) => {

                if (data.Document && data.Document.Data.DocumentLines.length > 0) {
                    this.editedDocument = { ...data.Document.Data };
                    if (data.UdfsValues) {
                        this.editedDocument.Udfs = data.UdfsValues.Data;
                    }

                    this.attachmentLines = data.AttachmentLines?.Data ?? []

                    await this.DocLineToProductModel(data.Document.Data);
                } else {
                    this.commonService.alert(AlertType.INFO, 'No se obtuvieron registros.');
                }

            },
            error: (error: any) => {
                this.commonService.alert(AlertType.ERROR, error);
                this.isActionCopyTo = false;
                this.localStorageService.data.delete("isActionCopyTo");

                this.isActionDuplicate = false;
                this.localStorageService.data.delete("isActionDuplicate");
            }
        }));
    }


    /**
     * This method is used to print zpl
     * @param _salesDocumentSearch represent model filter
     */
    async RequestDocumentToPrint(_salesDocumentSearch: ISalesDocumentSearch): Promise<void> {
        let loader = await this.loadingCtrl.create();
        loader.present();
        this.subscriptions.add(
            this.printFormatService.GetDocumentPrintFormat(_salesDocumentSearch.DocEntry, 0, +this.docTypeSelected, 0, '')
                .pipe(finalize(() => loader.dismiss()))
                .subscribe({
                    next: async (callback) => {

                        this.bluetoothSerial.isConnected().then(bnext => {
                            if (bnext === 'OK') {
                                this.Print(callback.Data.PrintFormat);
                            } else {
                                const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
                                this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {
                                    this.Print(callback.Data.PrintFormat);
                                },
                                    (error) => {
                                        this.commonService.alert(AlertType.ERROR, error);
                                    });
                            }
                        }).catch(error => {
                            const PRINTER_ADDRESS = this.localStorageService.get('bluetoothPrinter');
                            this.bluetoothSerial.connect(PRINTER_ADDRESS).subscribe(() => {
                                this.Print(callback.Data.PrintFormat);
                            },
                                (error) => {
                                    this.commonService.alert(AlertType.WARNING, `Por favor seleccione la impresora. ${error}`);
                                });
                        });
                    },
                    error: (error) => {
                        console.error(error);
                        this.commonService.Alert(AlertType.ERROR, error, error);
                    }
                }));
    }

    Print(_data: string): void {
        this.PrintingService.getPrintingType().then(printingType => {
            let print = '';

            switch (printingType) {
                case SupportedPrintingType.PDF.toString():
                    print = htmlToText(_data, {
                        tags: {
                            hr: {
                                options: {
                                    length: 80,
                                },
                            },
                        },
                    });
                    break;
                case SupportedPrintingType.ZPL.toString():
                    print = _data;
                    break;
            }

            try {
                this.bluetoothSerial.write(print);
            } catch (error) {
                console.log(error);
            }
        }).catch(error => {
            console.log(error);
        });
    }

    ionViewWillLeave(): void {
        if (this.subscriptions) this.subscriptions.unsubscribe();
        this.modalController.DismissAll();
    }

    /**
     * Load options actions for an dcument
     * @param _document
     * @constructor
     */
    async ShowCopyOptions(_document: ISalesDocumentSearch): Promise<void> {
        
        const COPY_OPTIONS: ActionSheetButton[] = [
            {
                text: this.commonService.Translate(`Orden de venta`, `Sale order`),
                icon: "receipt",
                role: "Offer",
                handler: async () => {
                    if (!this.VerifyPermissionByDocType('copyTo', DocumentType.SaleOrder)) {
                        let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }

                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, DocumentType.SaleOrder);
                    this.navigatePage = 'order';
                    await this.SearchDocLines(_document);
                }
            },
            {
                text: this.commonService.Translate(
                    `Factura deudores`,
                    `A/R Invoice`
                ),
                icon: "reader",
                role: "Offer,order,delivery",
                handler: async () => {
                    this.documentTypeToCopy = DocumentType.CreditInvoice;

                    if (!this.VerifyPermissionByDocType('copyTo', DocumentType.CreditInvoice)) {
                        let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }

                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, DocumentType.CreditInvoice);
                    this.navigatePage = 'documents';
                    await this.SearchDocLines(_document);
                }
            },
            {
                text: this.commonService.Translate(
                    `Factura deudor + Pago`,
                    `A/R Invoice + Payment`
                ),
                icon: "reader",
                role: "Offer,order,delivery",
                handler: async () => {
                    this.documentTypeToCopy = DocumentType.CashInvoice;

                    if (!this.VerifyPermissionByDocType('copyTo', DocumentType.CashInvoice)) {
                        let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }

                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, DocumentType.CashInvoice);
                    this.navigatePage = 'invoice';
                    await this.SearchDocLines(_document);
                }
            },
            {
                text: this.commonService.Translate(
                    `Factura reserva`,
                    `Reserve invoice`
                ),
                icon: "reader",
                role: "Offer,order",
                handler: async () => {
                    this.documentTypeToCopy = DocumentType.ReserveInvoice;

                    if (!this.VerifyPermissionByDocType('copyTo', DocumentType.ReserveInvoice)) {
                        let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }

                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, DocumentType.ReserveInvoice);
                    this.navigatePage = 'reserveInvoice';
                    await this.SearchDocLines(_document);
                }
            }, 
            {
                text: this.commonService.Translate(
                    `Documento base`,
                    `Base document`
                ),
                icon: "reader",
                role: "draft",
                handler: async () => {
                    const { page, type } = this.GetPageForDrafts();
                    this.documentTypeToCopy = type;
                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, type);
                    this.localStorageService.data.set(LocalStorageVariables.IsActionDuplicate, true);
                    this.localStorageService.data.set(LocalStorageVariables.IsActionDraft, true);
                    this.navigatePage =page;
                    await this.SearchDocLines(_document);
                }
            },
            {
                text: this.commonService.Translate(
                    `Entrega`,
                    `Delivery`
                ),
                icon: "cube-outline",
                role: "Offer,order,reserve",
                handler: async () => {
                    this.documentTypeToCopy = DocumentType.Delivery;

                    if (!this.VerifyPermissionByDocType('copyTo', DocumentType.Delivery)) {
                        let message = this.commonService.Translate("No tienes permisos para realizar esta acción", "You do not have permissions to performs this action");
                        this.commonService.toast(message, 'dark', 'bottom');
                        return;
                    }

                    this.localStorageService.data.set(LocalStorageVariables.DocumentType, DocumentType.Delivery);
                    this.navigatePage = 'delivery';
                    await this.SearchDocLines(_document);
                }
            },
            {
                text: this.commonService.Translate(
                    `Cancelar`,
                    `Cancel`
                ),
                icon: 'close-outline',
                role: "Offer,order,invoice,delivery,reserve,cancel,draft",
                handler: () => {
                    this.isActionCopyTo = false;
                    this.localStorageService.data.delete(LocalStorageVariables.DocumentType);
                    this.localStorageService.data.delete(LocalStorageVariables.IsActionCopyTo);
                    this.navigatePage = '';
                    this.ShowDocsOptions(_document);
                }
            }
        ];

        let BUTTONS: ActionSheetButton[] = [];

        switch (+this.docTypeSelected) {
            case DocumentType.SaleOffer:
                BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("offer"));
                break;
            case DocumentType.SaleOrder:
                BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("order"));
                break;
            case DocumentType.ReserveInvoice:
                BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("reserve"));
                break;
            case DocumentType.Delivery:
                BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("delivery"));
                break;
            case DocumentType.Draft:
                if(!this.permissionList.find(p => p.Name === 'M_Sales_SearchDocs_CopyDraft')){
                    BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("draft") && (op.text !== "Documento base" && op.text !== "Base document"));
                }else {
                    BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("draft"));
                }
                break;
            default:
                BUTTONS = COPY_OPTIONS.filter(op => op.role.toLocaleLowerCase().includes("cancel"));
                break;
        }

        const actionSheet = await this.actionSheetController.create({
            buttons: [...BUTTONS],
            header: this.commonService.Translate("Copiar a", "Copy to"),
            backdropDismiss: false
        });

        await actionSheet.present();

        await actionSheet.onDidDismiss();
    }

    /**
     * Set data details of the document
     * @constructor
     * @private
     */
    private SetDocumentToEditData(): void {
        let DocumentToEdit = {
            Customer: { ...this.customer },
            Lines: [...this.products].sort((a, b) => a.LineNum - b.LineNum),
            DocumentInfo: {
                DocEntry: this.editedDocument.DocEntry,
                DocNum: this.editedDocument.DocNum,
                DocDate: this.editedDocument.DocDate,
                TaxDate: this.editedDocument.TaxDate,
                DocDueDate: this.editedDocument.DocDueDate,
                Comments: this.editedDocument.Comments,
                CardName: this.editedDocument.CardName,
                NumAtCard: this.editedDocument.NumAtCard,
                DocumentKey: this.editedDocument.DocumentKey,
                PriceList: this.editedDocument.PriceList,
                DocCurrency:this.editedDocument.DocCurrency,
                PaymentGroupCode:this.editedDocument.PaymentGroupCode,
                DownPaymentPercentage:this.editedDocument.DownPaymentPercentage,
                AttachmentEntry:this.editedDocument.AttachmentEntry,
                ObjType: this.GetDocumentToEditObjType()
            },
            UdfsValues: this.editedDocument.Udfs ?? [],
            AttachmentLines: this.attachmentLines
        } as PreloadedDocument;
        this.localStorageService.data.set(LocalStorageVariables.DocumentToEdit, DocumentToEdit);
        this.router.navigateByUrl(`/${this.navigatePage}`, {replaceUrl: true});
        this.isActionCopyTo = false;
        this.isActionDuplicate = false;
    }

    /**
     * This method is used to get navigation page
     * @constructor
     * @private
     */
    private GetPage():string{
        
        switch (+this.docTypeSelected) {
        case DocumentType.SaleOffer:
            return 'quotations';
        case DocumentType.SaleOrder:
            return 'order';
        case DocumentType.ReserveInvoice:
            return 'reserveInvoice';
        case DocumentType.CreditInvoice:
            return 'documents';
        case DocumentType.CreditNotes:
            return 'credit-notes';
        case DocumentType.CreditDownInvoice:
            return 'credit-down-invoice'
        default:
            return '';
    }
    }

    /**
     * Obtiene el tipo de objeto del documento base
     * @returns `ReferenceObjectTypeEnum` valor del documento base
     */
    private GetDocumentToEditObjType(): number {
        switch (+this.docTypeSelected) {
            case DocumentType.CashInvoice:
            case DocumentType.CreditInvoice:
            case DocumentType.ReserveInvoice:
                return ReferencedObjectTypeEnum.rot_SalesInvoice;
            case DocumentType.SaleOffer:
                return ReferencedObjectTypeEnum.rot_SalesQuotation;
            case DocumentType.SaleOrder:
                return ReferencedObjectTypeEnum.rot_SalesOrder
            case DocumentType.Delivery:
                return ReferencedObjectTypeEnum.rot_DeliveryNotes;
            default:
                return -1;
        }
    }
    
    VerifyPermissionByDocType(_action: 'edit' | 'duplicate' | 'copyTo', _docType?: number) {
        switch (_docType) {
            case DocumentType.SaleOffer:
                if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_EditQuotation');
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateQuotation');
                return false;
            case DocumentType.Delivery:
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateDelivery');
                if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_CopyToDelivery')
                return false;
            case DocumentType.CashInvoice:
                if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_EditCashOrCreditInvoice');
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateCashInvoice');
                if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_CopyToCashInvoice');
                return false;
            case DocumentType.CreditInvoice:
                if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_EditCashOrCreditInvoice');
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateCreditInvoice');
                if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_CopyToCreditInvoice')
                return false;
            case DocumentType.ReserveInvoice:
                if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_EditCashOrCreditReserveInvoice');
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateReserveInvoice');
                if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_CopyToReserveInvoice');
                return false;
            case DocumentType.SaleOrder:
                if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_EditSaleOrder');
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateSaleOrder');
                if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_CopyToSaleOrder');
                return false;
            case DocumentType.CreditNotes:
                if (_action === 'duplicate') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_DuplicateCreditNote');
                return false;
            case DocumentType.CreditDownInvoice:
                if (_action === 'edit') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_EditCashOrCreditDownInvoice');
                if (_action === 'copyTo') return this.permissionList.some(p => p.Name === 'M_Sales_SearchDocs_CopyDownPayments');
                return false;
            default:
                return false;
        }
    }

    async GetDocumentTypesLabels(): Promise<void> {
        this.subscriptions.add(this.documentService.GetDocumentTypesLabels().subscribe({
            next: (callBack) => {
                this.docTypesLabels = callBack.Data;

                // if(callBack.errorInfo)
                // {
                //   this.commonService.Alert(AlertType.INFO, callBack.errorInfo.Message, callBack.errorInfo.Message);
                // }
            },
            error: (error) => {
                this.commonService.Alert(AlertType.ERROR, error, error);
            }
        }));
    }

    /**
     * This method get symbol currency
     * @param _currency
     * @constructor
     */
    public GetSymbolCurrency(_currency: string): string {
        return this.currencyList.find(element => element.Id === _currency)?.Symbol ?? '';
    }

    /**
     * Determines the navigation page and document type based on the selected document object type.
     *
     * @returns An object containing:
     * - `page`: A string representing the navigation page corresponding to the document type.
     * - `type`: A number representing the document type identifier.
     */
    private GetPageForDrafts():{ page: string, type: number } {

        if(+this.docObjTypeSelected === DocumentTypeSubFilter.SaleOffer){
            return { page: 'quotations', type: 8 };
        }

        if(+this.docObjTypeSelected === DocumentTypeSubFilter.SaleOrder){
            return  { page: 'order', type: 4 };
        }

        if(+this.docObjTypeSelected === DocumentTypeSubFilter.ReserveInvoice){
            return {page:'reserveInvoice', type: 3 };
        }

        if(+this.docObjTypeSelected === DocumentTypeSubFilter.CashInvoice){
            return {page:'documents',type: 1 };
        }

        if(+this.docObjTypeSelected === DocumentTypeSubFilter.CreditNotes){
            return {page:'credit-notes', type: 12 };
        }
        if(+this.docObjTypeSelected === DocumentTypeSubFilter.Delivery){
            return {page:'delivery', type: 10 };
        }

        return {page:'', type:0};
    }

    /**
     * This method is used to get the business partner preselected 
     * and load on current search customer
     * @constructor
     */
    private async GetBusinessPartnerPreselected(): Promise<void> {
        let cardCode = this.localStorageService.data.get(LocalStorageVariables.PreselectedCustomerCardCode);

        if(cardCode){
            this.localStorageService.data.delete(LocalStorageVariables.PreselectedCustomerCardCode);

            let loader = await this.commonService.Loader();
            loader.present();
            this.customerService.GetBp(cardCode).pipe(
                finalize(()=> loader.dismiss())
            ).subscribe({
                next: (callback) => {
                    if (callback.Data) {
                        this.customer = callback.Data;
                        this.SearchCustomerBtn = false;
                        this.GetDafaultCurrency();
                    } else {
                        this.commonService.Alert(AlertType.ERROR, callback.Message, callback.Message);
                    }
                },
                error: (error) => {
                    this.logManagerService.Log(LogEvent.ERROR, error);
                }
            });
        }
    }
}



