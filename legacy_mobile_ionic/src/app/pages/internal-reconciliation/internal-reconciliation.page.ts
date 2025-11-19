import {Component} from '@angular/core';
import {IonItemSliding} from "@ionic/angular";
import {IBusinessPartner} from "../../models/i-business-partner";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {
  CommonService,
  CompanyService,
  DocumentService,
  ExRateService,
  LocalStorageService,
  PermissionService
} from "../../services";
import {ICurrency, IExchangeRate, PermissionsSelectedModel} from "../../models";
import {forkJoin, of} from "rxjs";
import {catchError, finalize, map, switchMap} from "rxjs/operators";
import {SettingsService} from "../../services/settings.service";
import {AlertType, HeadersData, LocalStorageVariables, SettingCodes} from "../../common/enum";
import {ICLResponse} from "../../models/responses/response";
import {IDecimalSetting} from "../../interfaces/i-settings";
import {ICompany} from "../../models/db/companys";
import {CustomerSearchComponent} from "../../components";
import {CustomModalController} from "../../services/custom-modal-controller.service";
import {IInvoiceOpen} from "../../interfaces/i-invoice-payment";
import {CLMathRound, FormatDate} from "../../common/function";
import {
  EditReconciliationLineComponent
} from "../../components/edit-reconciliation-line/edit-reconciliation-line.component";
import {IInternalReconciliationRows, IInternalReconciliations} from 'src/app/interfaces/i-pay-in-account';
import {InternalReconciliationService} from "../../services/internal-reconciliation.service";

@Component({
  selector: 'app-internal-reconciliation',
  templateUrl: './internal-reconciliation.page.html',
  styleUrls: ['./internal-reconciliation.page.scss'],
})
export class InternalReconciliationPage{

  currentSegment = 'search';
  currentDoc = 'invoices';
  currencySelected: string = '';
  startDate: string;
  endDate: string;
  TO_FIXED_TOTALDOCUMENT: string = '';
  controllerInvoices: string = 'Invoices/GetInvoiceForInternalReconciliation';
  controllerCreditNotes: string = 'CreditNotes/GetCreditNotesOpen';
  
  totalCreditNote: number= 0;
  totalInvoice: number= 0;
  totalReconciliation: number= 0;
  decimalCompany: number = 0;
  pageInvoice : number = 0;
  pageCreditNote: number = 0;
  pageSize: number = 10;
  recordsCountInvoice: number = 0;
  recordsCountCreditNote: number = 0;
  
  invoiceList: IInvoiceOpen[] = []
  creditNotesList: IInvoiceOpen[] = []
  permisionList: PermissionsSelectedModel[] = []
  companyDecimal: IDecimalSetting[] = []
  currencyList: ICurrency[] = [];

  businessPartnerSelected: IBusinessPartner | null = null;
  localCurrency: ICurrency;
  exRate: IExchangeRate;
  
  constructor(private datePicker: DatePicker,
              private commonService: CommonService,
              private permissionService: PermissionService,
              private settingsService: SettingsService,
              private companyService: CompanyService,
              private localStorageService: LocalStorageService,
              private modalCtrl: CustomModalController,
              private documentService: DocumentService,
              private exchangeRateService: ExRateService,
              private internalReconciliationService: InternalReconciliationService) { }

  ionViewWillEnter() {
    this.permisionList = [...this.permissionService.Permissions];
    this.RefreshData();
    this.SendInitalRequests();
  }

  /**
   * Mthod is for get initial data
   * @constructor
   */
  async SendInitalRequests(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();
    
    forkJoin({
      Setting : this.settingsService.GetSettingByCode(SettingCodes.Decimal).pipe(catchError(error => of(null))),
      Currencies: this.companyService.GetCurrencies().pipe(catchError(x => of({
        Data: [],
        Message: x
      } as ICLResponse<ICurrency[]>))),
      ExRate: this.exchangeRateService.GetExchangeRate().pipe(catchError(x => of(null)))
    }).pipe(finalize(()=> loader.dismiss()))
        .subscribe({
          next: (callback)=> {
            this.currencyList = callback.Currencies?.Data || [];
            this.localCurrency = callback.Currencies?.Data?.find(currency => currency.IsLocal);
            this.exRate = callback.ExRate?.Data;
            this.currencySelected =  this.localCurrency?.Id || '';
            
            if (callback.Setting && callback.Setting?.Data) {
              let companyDecimal: IDecimalSetting[] = JSON.parse(callback.Setting.Data.Json || '');

              if (companyDecimal && companyDecimal.length > 0) {
                let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany
                
                let decimalCompany = companyDecimal.find(x => x.CompanyId === company?.Id) as IDecimalSetting;

                if(decimalCompany) {
                  this.TO_FIXED_TOTALDOCUMENT = `1.${decimalCompany.TotalDocument}-${decimalCompany.TotalDocument}`;
                  this.decimalCompany = decimalCompany.TotalDocument;
                }
              }
              
            }
          },
          error: (error) => {
            this.commonService.alert(AlertType.ERROR, error);
          }
        })
  }

  /**
   * Searches business Partner, potentially associated with an ion-item-sliding element.
   * @param _slidingBusinessPartner The ion-item-sliding element associated with the Business Partner search (if applicable).
   * @constructor
   */
  async SearchBusinessPartner(_slidingBusinessPartner: IonItemSliding) {
    let loader = await this.commonService.Loader();

    try {
      let modal = await this.modalCtrl.create({
        component: CustomerSearchComponent,
      });
      modal.present();
      modal.onDidDismiss<IBusinessPartner>().then(async (result) => {
        loader?.present();
        if(result.data){
          this.businessPartnerSelected = result.data
        }
      }).finally(()=> loader?.dismiss())
    }catch (e) {
      this.commonService.alert(AlertType.ERROR, e);
    }finally {
      _slidingBusinessPartner?.close();
    }
  }

  /**
   * This method is used to serach documents
   * @constructor
   */
  async SearchDoc(): Promise<void> {
    this.totalCreditNote = 0;
    this.totalInvoice = 0;
    this.totalReconciliation = 0;
    this.pageInvoice = 0;
    this.pageCreditNote = 0;
    
    let loader = await this.commonService.Loader();
    loader.present();


    //No se realiza en un ForkJoin debido a la obtencion de datos de paginacion
    this.documentService.GetDocumentsForInternalReconciliation(
        this.businessPartnerSelected.CardCode, this.currencySelected, FormatDate(this.startDate), FormatDate(this.endDate), this.controllerInvoices, this.pageInvoice, this.pageSize)
        .pipe(
            switchMap((invoices)=>{
              this.recordsCountInvoice = +this.localStorageService.data.get(HeadersData.RecordsCount);
              this.localStorageService.data.delete(HeadersData.RecordsCount);
              
              return this.documentService.GetDocumentsForInternalReconciliation(
                  this.businessPartnerSelected.CardCode, this.currencySelected, FormatDate(this.startDate), FormatDate(this.endDate), this.controllerCreditNotes, this.pageCreditNote, this.pageSize)
                  .pipe(
                      map((creditNotes)=> ({ Invoices: invoices, CreditNotes: creditNotes})),
                      catchError(()=> of({ Invoices: invoices, CreditNotes: null}))
                  )
            }),
            finalize(()=> loader.dismiss())
        )
        .subscribe({
          next: (callback)=>{
            
            if(callback.Invoices?.Data?.length == 0 && callback.CreditNotes?.Data?.length == 0){
              this.commonService.toast(this.commonService.Translate('No se obtuvieron documentos', 'No documents were obtained'), 'dark', 'bottom');
              return
            }
            
            this.currentSegment = 'docList';
            
            if(callback.Invoices?.Data?.length == 0){
              this.commonService.toast(this.commonService.Translate('No se obtuvieron facturas', 'No invoices were obtained'), 'dark', 'bottom');
              this.currentSegment = 'search';
            }
            
            if(callback.CreditNotes?.Data?.length == 0){
              this.commonService.toast(this.commonService.Translate('No se obtuvieron notas de crédito', 'No credit notes were obtained'), 'dark', 'bottom');
              this.currentSegment = 'search';
            }
            
            this.invoiceList = this.MapResponse(callback.Invoices?.Data || []);
            this.creditNotesList = this.MapResponse(callback.CreditNotes?.Data || []);

            this.recordsCountCreditNote = +this.localStorageService.data.get(HeadersData.RecordsCount);
            this.localStorageService.data.delete(HeadersData.RecordsCount);
          },
          error:(error) =>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        })
  }

  /**
   * The response to the document query is mapped
   * @param _documents
   * @constructor
   */
  MapResponse(_documents: IInvoiceOpen[]) : IInvoiceOpen[]{
    return _documents.map(doc => ({
      ...doc,
      Pago: 0,
      Assigned : false,
      SaldoShow: CLMathRound(this.decimalCompany, this.localCurrency.Id === doc.DocCurrency? doc.Saldo :  doc.SaldoUSD),
      TotalShow: CLMathRound(this.decimalCompany, this.localCurrency.Id === doc.DocCurrency ? doc.Total: doc.TotalUSD )
    }))
  }


  /**
   * Get paginated documents on scroll
   * @param _event
   * @param _controller
   * @constructor
   */
  async SearchMoreDocuments(_event: CustomEvent<void>, _controller: string) {
    try {
      //Validate if all records have already been obtained so as not to consult further
      
      let page : number = 0;
      switch (_controller) {
        case this.controllerInvoices:
          if (this.invoiceList.length === this.recordsCountInvoice) {
            const scroll = _event.target as HTMLIonInfiniteScrollElement;
            scroll.disabled = true;
            return;
          }
          page = this.pageInvoice += 1;
          break;
        case this.controllerCreditNotes:
          if (this.creditNotesList.length === this.recordsCountCreditNote) {
            const scroll = _event.target as HTMLIonInfiniteScrollElement;
            scroll.disabled = true;
            return;
          }
          page = this.pageCreditNote += 1;
          break;
      }

      this.documentService.GetDocumentsForInternalReconciliation(
          this.businessPartnerSelected.CardCode, this.currencySelected, FormatDate(this.startDate), FormatDate(this.endDate), _controller, page, this.pageSize)
          .pipe(
              finalize(()=> {
                const scroll = _event.target as HTMLIonInfiniteScrollElement;
                scroll.complete();
              })
          )
          .subscribe({
            next: (callback)=>{
              if(callback.Data){
                if(_controller === this.controllerInvoices){
                  this.invoiceList.push(...this.MapResponse(callback.Data || []));
                }else {
                  this.creditNotesList.push(...this.MapResponse(callback.Data || []));
                }
              }
            },
            error:(error) =>{
              this.commonService.alert(AlertType.ERROR, error)
            }
          })
    }catch (error){
      this.commonService.alert(AlertType.ERROR, error);
    }
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
            case 'StartDate':
              this.startDate = date.toISOString()
              break;
            case 'EndDate':
              this.endDate = date.toISOString()
              break;
          }
        });
  }

  /**
   * calculate the totals
   * @constructor
   */
  GetTotals(): void {

    this.totalInvoice = this.invoiceList.filter(_x => _x.Assigned)
        .reduce((acc, value) => acc + this.GetTotalByCurrency(value.Pago, value.DocCurrency), 0);

    this.totalCreditNote = this.creditNotesList.filter(_x => _x.Assigned)
        .reduce((acc, value) => acc + this.GetTotalByCurrency(value.Pago, value.DocCurrency), 0);

    this.totalReconciliation = this.totalInvoice - this.totalCreditNote;
  }

  /**
   * Opens a modal to modify an item in the transfer document, then updates the item if changes are confirmed.
   * @param _docType - The document type to be modified.
   * @param _index - The index of the item in the transfer list to be modified.
   * @param _document - The document data to be edited.
   * @param _docSliding - (Optional) The sliding item component for the document line, closed after modification.
   */
  async ModifyDocumentLine(_docType: 'invoice'| 'creditNote', _index: number, _document: IInvoiceOpen, _docSliding?: IonItemSliding): Promise<void> {
    try {
      
      let permission = _docType === 'invoice' ? 'M_Banks_InternalReconciliation_EditInvoicesPaymentAmount': 'M_Banks_InternalReconciliation_EditCreditMemoPaymentAmount';
      
      let chooseModal = await this.modalCtrl.create({
        component: EditReconciliationLineComponent,
        componentProps: {
          lineEdit: JSON.parse(JSON.stringify(_document)),
          editPay: this.VerifyPermission(permission)
        },
      });
      chooseModal.present();

      chooseModal.onDidDismiss<IInvoiceOpen>().then(async (result) => {
        if(result.data){
          if(_docType === 'invoice'){
            this.invoiceList[_index] = result.data;
          }else{
            this.creditNotesList[_index] = result.data;
          }
        }
        this.GetTotals();
      });

    }catch (error) {
      this.commonService.alert(AlertType.ERROR, error);
    }finally {
      _docSliding?.close();
    }
  }

  /**
   * Validates if the current user has the assigned permission
   * @param permision
   * @constructor
   */
  VerifyPermission(permision: string): boolean {
    return !this.permisionList.some((perm) => perm.Name === permision);
  }

  /**
   * Document selection method
   * @param doc
   * @constructor
   */
  OnSelectDoc(doc: IInvoiceOpen, index: number, type: 'invoice' | 'creditNote'): void {
    
    if(type === 'invoice' ){
      this.invoiceList[index].Assigned = !this.invoiceList[index].Assigned;

      this.invoiceList[index].Pago = this.invoiceList[index].Assigned ? doc.SaldoShow : 0
    }else{
      this.creditNotesList[index].Assigned = !this.creditNotesList[index].Assigned;
      
      this.creditNotesList[index].Pago = this.creditNotesList[index].Assigned ? doc.SaldoShow : 0;
    }
    
    this.GetTotals();
  }

  /**
   * calculate the amount according to the currency
   * @param _pay
   * @param _currency
   * @constructor
   * @private
   */
  private GetTotalByCurrency(_pay: number, _currency: string): number {

    if (_currency === this.localCurrency?.Id) {
      return +_pay;
    } else {
      return +_pay * this.exRate.Rate;
    }
  }

  /**
   * 
   * @constructor
   */
  public GetConversionSymbol(): string {
    return this.currencyList.filter(c => c.Id !== '##').find(c => c.Id == this.currencySelected)?.Symbol || '';
  }

  /**
   * Create reconciliation
   * @constructor
   */
  async Reconciliation() {

    if (!this.invoiceList.some(x => x.Assigned)) {
      this.commonService.Alert(AlertType.INFO, 'No ha seleccionado facturas', 'You have not selected any invoices');
      return;
    }

    if (!this.creditNotesList.some(x => x.Assigned)) {
      this.commonService.Alert(AlertType.INFO, 'No ha seleccionado notas de crédito', 'You have not selected credit notes');
      return;
    }


    if (this.totalReconciliation !== 0) {
      this.commonService.Alert(AlertType.INFO, 'El monto de conciliación debe ser 0', 'The reconciliation amount must be 0');
      return;
    }

    let isBusinessPartnerAllCurrency = this.businessPartnerSelected.Currency === '##' && this.currencySelected !== this.localCurrency?.Id;

    let reconciliation = {
      CardOrAccount: 'coaCard',
      InternalReconciliationOpenTransRows: this.creditNotesList.filter(x => x.Assigned).map((element, index) => {
        return {
          CreditOrDebit: 'codCredit',
          ReconcileAmount: isBusinessPartnerAllCurrency ? CLMathRound(this.decimalCompany, +element.Pago * this.exRate.Rate) : +element.Pago,
          ShortName: this.businessPartnerSelected.CardCode,
          SrcObjAbs: element.DocEntry,
          SrcObjTyp: element.ObjType,
          TransId: +element.TransId,
          TransRowId: 0
        } as IInternalReconciliationRows
      })
    } as IInternalReconciliations;

    this.invoiceList.filter(x => x.Assigned).forEach((element, index) => {
      reconciliation.InternalReconciliationOpenTransRows.push({
        CreditOrDebit: 'codDebit',
        ReconcileAmount: isBusinessPartnerAllCurrency ? CLMathRound(this.decimalCompany, +element.Pago * this.exRate.Rate): +element.Pago,
        ShortName: this.businessPartnerSelected.CardCode,
        SrcObjAbs: element.DocEntry,
        SrcObjTyp: element.ObjType,
        TransId: +element.TransId,
        TransRowId: 0
      } as IInternalReconciliationRows)
    });
    
    let loader = await this.commonService.Loader();
    
    loader.present();
    if (isBusinessPartnerAllCurrency) {
      this.commonService.Alert(
          AlertType.QUESTION,
          'Reconciliación se creará en moneda local',
          'Reconciliation will be created in local currency',
          'Cliente es monedas todas y moneda del documento es diferente a moneda local',
          'Client is all currencies and document currency is different from local currency',
          [
            {
              text: this.commonService.Translate('Cancelar', 'Cancel'),
              role: 'cancel',
            },
            {
              text: this.commonService.Translate('Continuar', 'Continue'),
              handler: () => {
                this.internalReconciliationService.Post(reconciliation)
                    .pipe(finalize(() => loader.dismiss()))
                    .subscribe({
                      next: (callback)=>{
                        this.commonService.Alert(AlertType.SUCCESS,
                            `La reconciliación se creó correctamente con el número de documento ${callback.Data.ReconNum}`,
                            `Reconciliation was created successfully with document number  ${callback.Data.ReconNum}`);

                        this.invoiceList = this.invoiceList.filter(x => !x.Assigned);
                        this.creditNotesList = this.creditNotesList.filter(x => !x.Assigned);
                        this.GetTotals();
                      },
                      error: (error)=>{
                        this.commonService.alert(AlertType.ERROR, error);
                      }
                    })
              }
            },
          ]
      );

    } else {

      this.internalReconciliationService.Post(reconciliation)
          .pipe(finalize(() => loader.dismiss()))
          .subscribe({
            next: (callback)=>{
              this.commonService.Alert(AlertType.SUCCESS,
                  `La reconciliación se creó correctamente con el número de documento ${callback.Data.ReconNum}`,
                  `Reconciliation was created successfully with document number  ${callback.Data.ReconNum}`);

              this.invoiceList = this.invoiceList.filter(x => !x.Assigned);
              this.creditNotesList = this.creditNotesList.filter(x => !x.Assigned);
              this.GetTotals();
            },
            error: (error)=>{
              this.commonService.alert(AlertType.ERROR, error);
            }
          })
    }
  }


  /**
   * Resets the transfer request data to its initial state, clearing selected items, warehouses, and dates.
   * It also generates a new unique document ID and initializes the UDF form.
   */
  RefreshData() {
    this.currentSegment = 'search';
    this.currentDoc = 'invoices';
    this.currencySelected = this.currencyList?.find(x => x.IsLocal)?.Id || '';
    this.startDate =  new Date().toISOString();
    this.endDate = new Date().toISOString();

    this.totalCreditNote = 0;
    this.totalInvoice = 0;
    this.totalReconciliation = 0;
    this.pageInvoice = 0;
    this.pageCreditNote = 0;
    this.recordsCountInvoice = 0;
    this.recordsCountCreditNote = 0;

    this.invoiceList = []
    this.creditNotesList= []

    this.businessPartnerSelected= null;
    this.GetTotals();
  }
}
