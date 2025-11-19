import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BusinessPartnersModel, ICompanyInformation, ICurrency} from "../../models";
import {IPaymentToCancel} from "../../interfaces/i-payments-to-cancel";
import {forkJoin, Subscription} from "rxjs";
import {CustomModalController} from "../../services/custom-modal-controller.service";
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {BluetoothSerial} from "@ionic-native/bluetooth-serial/ngx";
import {CommonService, CompanyService, LocalStorageService, PaymentsService, PrintingService} from "../../services";
import {Network} from "@ionic-native/network/ngx";
import {finalize, first} from "rxjs/operators";
import {AlertType, LogEvent} from "../../common";
import {IonItemSliding} from "@ionic/angular";
import {CustomerSearchComponent} from "../../components";
import {HeadersData} from "../../common/enum";
import {IDocumentInPayment} from "../../models/db/Doc-model";
import {IDocumentCreateComponentInputData} from "../../models/db/i-modals-data";

@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.page.html',
  styleUrls: ['./payment-cancel.page.scss'],
})
export class PaymentCancelPage {
  /**
   * Represents the current segment of the page.
   */
  currentSegment: string;

  /**
   * Form group for the search form, containing controls for business partner, date range, currency, and document type.
   */
  searchForm: FormGroup;

  /**
   * Information about the company.
   */
  companyInfo: ICompanyInformation;

  /**
   * The selected business partner.
   */
  businessPartner: BusinessPartnersModel;

  /**
   * List of payments to be canceled.
   */
  payments: IPaymentToCancel[] = [];

  /**
   * List of available currencies.
   */
  currencyList: ICurrency[] = [];

  /**
   * Current page number for pagination.
   */
  page: number = 0;

  /**
   * Total number of records available.
   */
  recordsCount: number = 0;

  /**
   * List of currencies specific to the customer.
   */
  customerCurrencyList: ICurrency[] = [];

  /**
   * Document type identifier, default is 'COL'.
   */
  DocType: string = "##";

  /**
   * Currency identifier, default is '##'.
   */
  Currency: string = "##";

  suscription$ = new Subscription();
  constructor( private formBuilder: FormBuilder,
               private modalController: CustomModalController,
               private datePicker: DatePicker,
               private bluetoothService: BluetoothSerial,
               private paymentService: PaymentsService,
               private storageService: LocalStorageService,
               private commonService: CommonService,
               private printingService: PrintingService,
               private companyService: CompanyService,
               private network: Network) 
  {
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(new Date().getDate() - 10);
    this.currentSegment = 'search';
    this.searchForm = this.formBuilder.group({
      BusinessPartner: [''],
      DateFrom: [dateFrom, Validators.required],
      DateTo: [dateTo, Validators.required],
      Currency: [this.Currency, Validators.required],
      DocType: [this.DocType, Validators.required],
    });
  }

 
  ionViewWillLeave(): void {
    if (this.suscription$) this.suscription$.unsubscribe();
    this.modalController.DismissAll();
  }

  ionViewWillEnter() {
    this.currencyList = [];
    this.SendInitialRequests();
    this.recordsCount = 0;
    this.payments = [];
  }

  /**
   * This method is used to get initial data
   * @constructor
   */
  async SendInitialRequests(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    forkJoin({
      Currencies: this.companyService.GetCurrencies(true)
    }).pipe(finalize(() => loader.dismiss()))
        .subscribe({
          next: (callbacks) => {
            this.currencyList = callbacks.Currencies.Data ?? [];
          },
          error: (error) => {
            this.commonService.Alert(AlertType.ERROR, error, error);
          }
        })
  }

  OnSegmentChange($event: any): void {}

  /**
   * Handles the action of searching for a business partner.
   * Opens a modal to search and select a business partner, and updates the form with the selected partner's information.
   *
   * @param slidingCustomer - The sliding item component that triggered the event. It will be closed if provided.
   * @returns A promise that resolves when the modal is dismissed and the form is updated.
   */
  async OnClickSearchBusinessPartner(slidingCustomer: IonItemSliding) {
    if (slidingCustomer) slidingCustomer.close();

    let modal = await this.modalController.create({
      component: CustomerSearchComponent,
    });
    modal.present();
    modal.onDidDismiss().then( async (result) => {
      let laoder = await this.commonService.GetTopLoader();
      if (result.data) {
        this.businessPartner = result.data;
        this.searchForm
            .get('BusinessPartner')
            .setValue(
                `${this.businessPartner.CardCode} ${this.businessPartner.CardName}`
            );
      }
      laoder.dismiss();
    });
  }

  /**
   * Opens a date picker to select a new "Date To" value and updates the form control with the selected date.
   *
   * This function triggers the date picker interface, allowing the user to choose a date. Once a date is selected,
   * it updates the "DateTo" form control with the new date.
   *
   * @returns {void} This function does not return a value.
   */
  OnClickDateTo(): void {
    this.datePicker
        .show({
          date: this.formControls.DateTo.value,
          mode: "date",
          androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
        })
        .then((date) => {
          this.searchForm.get("DateTo").setValue(date);
        });
  }

  /**
   * Opens a date picker to select a new "Date From" value and updates the form control with the selected date.
   *
   * This function triggers the date picker interface, allowing the user to choose a date. Once a date is selected,
   * it updates the "DateFrom" form control with the new date.
   *
   * @returns {void} This function does not return a value.
   */
  OnClickDateFrom(): void {
    let dateFrom = new Date();
    dateFrom.setDate(new Date().getDate() - 10);

    this.datePicker
        .show({
          date: this.formControls.DateFrom.value,
          mode: "date",
          androidTheme: this.datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
        })
        .then((date) => {
          this.searchForm.get("DateFrom").setValue(date);
        });
  }

  /**
   * This method obtained payments
   * @constructor
   */
  async OnClickSearchPayments(): Promise<void> {

    if (!this.businessPartner) {
      this.commonService.toast(
          this.commonService.Translate('Primero busca el socio de negocios', 'First search the business parter'),
          'warning'
      );
      return;
    }

    if (this.network.type === 'none') {
      this.commonService.Alert(
          AlertType.INFO,
          `Necesitas conexión a Internet`,
          `You need Internet connection`
      );
      return;
    }

    this.recordsCount = 0;
    this.page = 0;
    this.payments = [];

    await this.GetMorePayments();
  }

  /**
   * This method isused to get payment
   * @param _event model event
   * @constructor
   */
  async GetMorePayments(_event: CustomEvent = null): Promise<void> {

    const loading = await this.commonService.loading(this.commonService.Translate('Procesando', 'Processing'),);

    if(_event){

      if(this.recordsCount === this.payments.length){
        (_event.target as HTMLIonInfiniteScrollElement).disabled = true;
        return;
      }


      this.page++;

    }

    if(!_event){
      loading.present();
    }
    
    this.suscription$.add(this.paymentService.GetPaymentsCancel(
        this.searchForm.get('DateFrom').value,
        this.searchForm.get('DateTo').value,
        this.businessPartner.CardCode,
        this.searchForm.get('Currency').value,
        this.searchForm.get('DocType').value,
        this.page
    ).pipe(
        first(),
        finalize(() => {
          if(!_event){
            loading.dismiss();
          }else{
            (_event.target as HTMLIonInfiniteScrollElement).complete();
          }

        })
    )
        .subscribe(
            (response) => {
              if (response.Data) {
                if (response.Data?.length > 0) {
                  this.payments.push(...response.Data);
                  if(this.page === 0){
                    this.currentSegment = 'docList';
                    this.recordsCount = +this.storageService.data.get(HeadersData.RecordsCount);
                    this.storageService.data.delete(HeadersData.RecordsCount);
                  }
                } else {
                  if(this.page === 0){
                    this.commonService.Alert(AlertType.INFO, 'No se encontraron pagos', 'No payments found');
                  }
                }
              }
            },
            (err) => {
              this.commonService.alert(AlertType.ERROR, err);
            }
        ));
  }

  
  get formControls() {
    return this.searchForm.controls;
  }


  /**
   * This method is used to get symbol
   * @param _currency
   * @constructor
   */
  GetSymbol(_currency: string): string {
    if (_currency !== '##') {
      return this.currencyList.find(element=>element.Id === _currency)?.Symbol ?? '';
    }
    return this.currencyList?.find(element => element.IsLocal)?.Symbol ?? '';
  }

  /**
   * This method is used to get total
   * @param _currency  property currency
   * @param _total property total
   * @param _totalFC property total fc
   * @constructor
   */
  GetTotal(_currency: string, _total: number, _totalFC: number): number {

    if (_currency === '##') {
      return _total;
    }

    if (this.currencyList.find(element => element.Id === _currency)?.IsLocal) {
      return _total
    }

    return _totalFC;
  }

  /**
   * Cancels a specified payment and updates the payment list.
   *
   * This function initiates the cancellation process for a given payment, displays a loading indicator during the process,
   * and updates the payment list upon successful cancellation. It also handles any errors that occur during the cancellation.
   *
   * @param payment - The payment object to be canceled, containing details such as DocEntryPay and DocNumPay.
   * @returns {Promise<void>} A promise that resolves when the payment cancellation process is complete.
   */
  async CancelPayment(payment: IPaymentToCancel) {
    
     const loading = await this.commonService.loading(this.commonService.Translate('Procesando', 'Processing'),);
     loading.present();
    this.suscription$.add(this.paymentService.Cancel(payment.DocEntryPay)
        .pipe(finalize(() => loading.dismiss()))
        .subscribe({
          next: async (callback) => {
            
              let message = `
                <table class="line-details-table">
                    <tr>
                        <td><b>DocNum</b>:</td><td>${payment.DocNumPay|| 0}</td>
                    </tr>
                    <tr>
                        <td><b>DocEntry</b>:</td><td>${payment.DocEntryPay || 0}</td>
                    </tr>
                </table>`;
                this.commonService.Alert(AlertType.SUCCESS,
                    message,
                    message,
                    `Pago cancelado correctamente`,
                    `Payment canceled successfully`
                );
            this.recordsCount = 0;
            this.page = 0;
            this.payments = [];

            await this.GetMorePayments();
            
          },
          error: (error) => {
            this.commonService.alert(AlertType.ERROR, error);
          }
        }));
    }

}
