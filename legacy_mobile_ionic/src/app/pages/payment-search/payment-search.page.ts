import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial/ngx";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { Network } from "@ionic-native/network/ngx";
import { IonItemSliding } from "@ionic/angular";
import {forkJoin, Subscription} from "rxjs";
import { finalize, first } from "rxjs/operators";
import { AlertType } from "src/app/common";
import { CustomerSearchComponent } from "src/app/components";
import { ICompanyInformation, ICurrency } from "src/app/models";
import {
  CompanyService,
  CommonService,
  LocalStorageService,
  PaymentsService,
  PrintingService,
  CustomerService,
  LogManagerService,
} from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { IPaymentToCancel } from "../../interfaces/i-payments-to-cancel";
import { IDocumentInPayment } from "../../models/db/Doc-model";
import { HeadersData, LocalStorageVariables, LogEvent } from "../../common/enum";
import { IBusinessPartners } from "../../interfaces/i-business-partners";

@Component({
  selector: "app-payment-search",
  templateUrl: "./payment-search.page.html",
  styleUrls: ["./payment-search.page.scss"],
})
export class PaymentSearchPage {
  currentSegment: string;
  searchForm: FormGroup;
  companyInfo: ICompanyInformation;
  businessPartner: IBusinessPartners;
  payments: IPaymentToCancel[] = [];
  currencyList:  ICurrency[] = [];
  page: number = 0;
  recordsCount: number = 0;
  
  suscription$ = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private modalController: CustomModalController,
    private datePicker: DatePicker,
    private bluetoothService: BluetoothSerial,
    private paymentService: PaymentsService,
    private storageService: LocalStorageService,
    private commonService: CommonService,
    private printingService: PrintingService,
    private companyService: CompanyService,
    private network: Network,
    private localStorageService: LocalStorageService,
    private customerService: CustomerService,
    private logManagerService: LogManagerService
  ) {
      }
  ionViewWillLeave(): void {
    if (this.suscription$) this.suscription$.unsubscribe();
    this.modalController.DismissAll();
  }

  ionViewWillEnter() {
    this.InitVariables();
    this.currencyList = [];
    this.SendInitialRequests();
    this.recordsCount = 0;
    this.payments = [];
    this.GetBusinessPartnerPreselected();
  }

  /**
   * Load initial values of variables
   * @constructor
   */
  InitVariables(){
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(new Date().getDate() - 10);
    this.currentSegment = 'search';
    this.searchForm = this.formBuilder.group({
      BusinessPartner: [''],
      DateFrom: [dateFrom, Validators.required],
      DateTo: [dateTo, Validators.required],
    });
    
    this.businessPartner = {} as IBusinessPartners
  }

  /**
   * This method is used to get initial data
   * @constructor
   */
  async SendInitialRequests(): Promise<void> {
    let loader = await this.commonService.Loader();
    loader.present();

    forkJoin({
      Currencies: this.companyService.GetCurrencies(),
      Company: this.companyService.GetCompanyInformation()
    }).pipe(finalize(() => loader.dismiss()))
        .subscribe({
          next: (callbacks) => {
            this.currencyList = callbacks.Currencies.Data ?? [];
            this.companyInfo = callbacks.Company.Data ?? {} as ICompanyInformation;
          },
          error: (error) => {
            this.commonService.Alert(AlertType.ERROR, error, error);
          }
        })
  }

  OnSegmentChange($event: any): void {}

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
    
    
    this.paymentService.GetPayments(
        this.searchForm.get('DateFrom').value,
        this.searchForm.get('DateTo').value,
        this.businessPartner.CardCode,
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
        );
  }

  /**
   * This method is used to pint payment
   * @param payment model payment
   * @constructor
   */
  async OnClickPrintPayment(payment: IPaymentToCancel): Promise<void> {

    let laoder = await this.commonService.Loader();
    laoder.present();

    this.paymentService.GetDocumentsInPayment(payment.DocEntryPay)
    .pipe(finalize(() => laoder.dismiss()))
    .subscribe({
      next: async (callback) => {
        if(callback.Data){
          const printFormat = await this.printingService.CreatePaymentPrintFormat(
              this.companyInfo,
              this.businessPartner,
              callback.Data.CashSum,
              callback.Data.CreditCards?.reduce((acc, value) => value.CreditSum, 0),
              this.storageService.data.get('Session').UserEmail || '',
              payment.DocCurrency,
              callback.Data.TrsfrSum,
              new Date(payment.DocDate),
              payment.DocNumPay,
              this.GetSymbol(payment.DocCurrency),
              [{
                DocNum: payment.DocNumOinv,
                AmountApplied: 0,
                SumApplied: callback.Data.CashSum ||  callback.Data.TrsfrSum,
                AppliedFC: callback.Data.CashSumFC ||  callback.Data.TrsfrSumFC,
                Currency: payment.DocCurrency
              } as IDocumentInPayment]
          );
          this.bluetoothService.write(printFormat);
        }
        
      },
      error: (error) => {
        this.commonService.alert(AlertType.ERROR, error);
      }
    });

    
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
                    this.businessPartner = callback.Data;
                    this.searchForm.get('BusinessPartner').setValue(
                      `${this.businessPartner.CardCode} ${this.businessPartner.CardName}`
                    );
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
