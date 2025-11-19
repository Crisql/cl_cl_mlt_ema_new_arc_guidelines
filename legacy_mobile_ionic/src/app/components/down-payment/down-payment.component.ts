import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {FormBuilder} from "@angular/forms";
import {CommonService, DocumentService, JsonService, LocalStorageService} from "../../services";
import {CustomModalController} from "../../services/custom-modal-controller.service";
import {AlertType} from "../../common";
import {CLMathRound, FormatDate} from "../../common/function";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import { IDocumentForDownPaymentInputData} from "../../models/db/i-modals-data";
import {ICurrency} from "../../models";
import {catchError, finalize, map, switchMap} from "rxjs/operators";
import {HeadersData} from "../../common/enum";
import {of} from "rxjs";
import {IDownPaymentClosed} from "../../interfaces/i-invoice-payment";
import { IDownPaymentsToDraw } from 'src/app/interfaces/i-documents';

@Component({
  selector: 'app-down-payment',
  templateUrl: './down-payment.component.html',
  styleUrls: ['./down-payment.component.scss'],
})
export class DownPaymentComponent implements OnInit {
  // Indicates the current segment or view (e.g., 'search').
  currentSegment: string = 'search';

// Start date of the relevant period for filtering or processing.
  startDate: string;

// End date of the relevant period for filtering or processing.
  endDate: string;

// Fixed value for total document string representation.
  TO_FIXED_TOTALDOCUMENT: string = '';

// Currently selected document type (e.g., 'invoices').
  currentDoc: string = 'invoices';

// Input data for processing down payments, received as a prop.
  @Input('data') data: IDocumentForDownPaymentInputData;

// Subtotal amount for invoices.
  subTotalInvoice: number = 0;

// Total amount for invoices.
  totalInvoice: number = 0;

// Total tax amount for invoices.
  totalTaxInvoice: number = 0;

// Total amount for down payments.
  totalDownPayment: number = 0;

// Currency identifier (e.g., USD, EUR).
  currency: string = '';

// Customer card code associated with the transaction.
  cardCode: string = '';

// List of available currencies.
  currencyList: ICurrency[] = [];

// User-provided comments or notes.
  comments: string;

// Document number identifier.
  docNumber: number;

// List of invoices related to down payments.
  invoiceList: IDownPaymentClosed[] = [];

// Number of records to display per page in a paginated view.
  pageSize: number = 10;

// Current page index for the paginated invoice list.
  pageInvoice: number = 0;

// Total number of invoice records available.
  recordsCountInvoice: number = 0;

  constructor(private translateService: TranslateService,
              private formBuilder: FormBuilder,
              private jsonService: JsonService,
              private commonService: CommonService,
              private modalController: CustomModalController,
              private datePicker: DatePicker,
              private localStorageService: LocalStorageService,
              private documentService: DocumentService,
  ) {}

  ngOnInit() {
    this.subTotalInvoice=this.data.Subtotal;
    this.totalInvoice=this.data.DocTotal;
    this.totalTaxInvoice=this.data.Impuesto;
    this.currency=this.data.Currency;
    this.cardCode= this.data.CardCode || '';
    this.currencyList=this.data.Currencies;
  }

  /**
   * Closes the modal asynchronously.
   * Can include additional logic such as cleanup or state reset.
   */
  async CloseModal(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();
    this.modalController.dismiss({downPayment:[], amountPayment:0}, 'success');
  }

  /**
   * Asynchronously creates a payment.
   * Handles validation, API interaction, and error reporting.
   */
  async CreatePayment(): Promise<void> {
    if (!this.invoiceList.some(x => x.Assigned)) {
      this.commonService.Alert(AlertType.WARNING, 'No ha seleccionado anticipos', 'You have not selected any Downpayment');
      return;
    }

    if (this.totalDownPayment <= 0) {
      this.commonService.Alert(AlertType.WARNING, 'El monto de anticipos debe ser mayor a 0', 'The DownPayment amount must be greater than 0');
     
      return;
    }
    if (this.totalDownPayment > this.totalInvoice) {
      this.commonService.Alert(AlertType.WARNING, 'El monto de anticipos supera total factura', 'The amount of DownPayment exceeds the total invoice');
      return;
    }

    let downPayment: IDownPaymentsToDraw[] = [];

    this.invoiceList.filter(x => x.Assigned).forEach((element, index) => {
      downPayment.push({
        DocEntry: element.DocEntry,
        DownPaymentType: 'dptInvoice',
        GrossAmountToDraw  : this.currencyList.find(value => value.IsLocal==true).Id === element.DocCurrency ? element.Pago : 0,
        GrossAmountToDrawFC: this.currencyList.find(value => value.IsLocal==true).Id !== element.DocCurrency ? element.Pago : 0,
      } as IDownPaymentsToDraw)
    });
    

    let loader = await this.commonService.Loader();
    loader.present();
    this.modalController.dismiss({downPayment:downPayment, amountPayment:this.totalDownPayment}, 'success');
  }
  /**
   * Shows a date picker for the specified date type field.
   * @param {string} _dateTypeField - The type of date field for which the date picker is being shown.
   * @returns {void}
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
   * Retrieves the conversion symbol.
   * @returns {string} The conversion symbol.
   */
  public GetConversionSymbol(): string {
    return this.currencyList.find(c => c.Id === this.currency).Symbol || '';
  }

  /**
   * Lifecycle hook that runs when the view is about to enter and become active.
   * This method is typically used for tasks such as updating data,
   * refreshing UI elements, or setting up event listeners.
   */
  ionViewWillEnter() {
    this.RefreshData();
  }
  /**
   * Resets the transfer request data to its initial state, clearing selected items, warehouses, and dates.
   * It also generates a new unique document ID and initializes the UDF form.
   */
  RefreshData() {
    this.currentSegment = 'search';
    this.currentDoc = 'invoices';
    this.startDate =  new Date().toISOString();
    this.endDate = new Date().toISOString();
  }

  /**
   * This method is used to serach documents
   * @constructor
   */
  async SearchDoc(): Promise<void> {
    this.totalDownPayment = 0;
    this.pageInvoice = 0;
    
    let loader = await this.commonService.Loader();
    loader.present();


    //No se realiza en un ForkJoin debido a la obtencion de datos de paginacion
    this.documentService.GetDownPayemts(this.cardCode , this.currency, FormatDate(this.startDate), FormatDate(this.endDate), this.docNumber ? this.docNumber : 0, this.pageInvoice, this.pageSize)
        .pipe(
            map((creditNotes)=> ({ Invoices: creditNotes})),
            finalize(()=> loader.dismiss())
        )
        .subscribe({
          next: (callback)=>{
            this.currentSegment = 'docList';
            if(callback.Invoices?.Data?.length == 0){
              this.commonService.toast(this.commonService.Translate('No se obtuvieron facturas', 'No invoices were obtained'), 'dark', 'bottom');
              this.currentSegment = 'search';
            }
            this.invoiceList = this.MapResponse(callback.Invoices?.Data || []);
          },
          error:(error) =>{
            this.commonService.alert(AlertType.ERROR, error)
          }
        })
  }

  /**
   * Maps the provided array of down payment documents and applies a transformation or filter.
   * This method can be used to process, validate, or enhance the input documents before returning them.
   *
   * @param _documents - An array of down payment objects to be processed.
   * @returns A transformed or filtered array of down payment objects.
   */
  MapResponse(_documents: IDownPaymentClosed[]) : IDownPaymentClosed[]{
    return _documents.map(doc => ({
      ...doc,
      Pago: 0,
      Assigned : false,
      SaldoShow: CLMathRound(this.data.Decimal,  doc.Saldo),
      TotalShow: CLMathRound(this.data.Decimal, doc.DocTotal )
    }))
  }

  /**
   * Handles the selection of a document and processes it based on the provided type.
   * This method is typically invoked when a user interacts with a document in the UI.
   *
   * @param event - The event object triggered by the user's interaction.
   * @param doc - The specific down payment document being selected.
   * @param index - The position of the document in the array or list.
   * @param type - The type of document, in this case, restricted to 'invoice'.
   * @returns void
   */
  OnSelectDoc(event: any,doc: IDownPaymentClosed, index: number, type: 'invoice'): void {
    if (!this.invoiceList[index].Assigned) {
      this.invoiceList[index].Assigned = false;
      this.invoiceList[index].Pago = 0;
      event.target.checked = false;
    } else {
      if (this.invoiceList[index].Pago <= this.invoiceList[index].DocTotal) {
        const currentTotal: number = this.invoiceList
            .filter((x: IDownPaymentClosed, indexs: number) => x.Assigned && indexs !== index)
            .reduce((acc: number, x: IDownPaymentClosed) => acc + x.Pago, 0);

        const remainingAmount: number = this.totalInvoice - currentTotal;

        if (remainingAmount <= 0) {
          this.invoiceList[index].Assigned = false;
          this.invoiceList[index].Pago = 0;
          event.target.checked = false;
          let message: string = this.commonService.Translate(`El total asignado ya alcanza el límite del documento.`, `The total allocated has already reached the document limit.`);
          this.commonService.toast(
              message,
              "dark",
              "bottom"
          );
        } else {
          this.invoiceList[index].Assigned = true;
          this.invoiceList[index].Pago =  this.totalInvoice == remainingAmount ? (this.totalInvoice>= this.invoiceList[index].Saldo ? this.invoiceList[index].Saldo : (this.totalInvoice) ): (this.invoiceList[index].Saldo >= remainingAmount ?  remainingAmount : this.invoiceList[index].Saldo);
        }
      } else {
        this.invoiceList[index].Assigned = false;
        this.invoiceList[index].Pago = 0;
        event.target.checked = false;
        let message: string = this.commonService.Translate(`El total asignado ya alcanza el límite del documento.`, `The total allocated has already reached the document limit.`);
        this.commonService.toast(
            message,
            "dark",
            "bottom"
        );
      }
    }
    this.GetTotals();
  }

  /**
   * Get paginated documents on scroll
   * @param _event
   * @constructor
   */
  async SearchMoreDocuments(_event: CustomEvent<void>) {
    try {
      let page : number = 0;
      if (this.invoiceList.length === this.recordsCountInvoice) {
        const scroll = _event.target as HTMLIonInfiniteScrollElement;
        scroll.disabled = true;
        return;
      }
      page = this.pageInvoice += 1;
      
      this.documentService.GetDownPayemts(
          this.cardCode, this.currency, FormatDate(this.startDate), FormatDate(this.endDate), this.docNumber ? this.docNumber : 0, page, this.pageSize)
          .pipe(
              finalize(()=> {
                const scroll = _event.target as HTMLIonInfiniteScrollElement;
                scroll.complete();
              })
          )
          .subscribe({
            next: (callback)=>{
              if(callback.Data){
                if(callback.Data){
                  this.invoiceList.push(...this.MapResponse(callback.Data || []));
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
   * calculate the totals
   * @constructor
   */
  GetTotals(): void {

    this.totalDownPayment = this.invoiceList.filter(_x => _x.Assigned)
        .reduce((acc, value) => acc + this.GetTotalByCurrency(value.Pago, value.DocCurrency), 0);
    
  }

  /**
   * calculate the amount according to the currency
   * @param _pay
   * @param _currency
   * @constructor
   * @private
   */
  private GetTotalByCurrency(_pay: number, _currency: string): number {
      return +_pay;
  }
}
