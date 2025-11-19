import { Component, OnDestroy, OnInit } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { IonItemSliding, LoadingController, PopoverController } from "@ionic/angular";
import { EMPTY, forkJoin, of } from "rxjs";
import {catchError, finalize} from "rxjs/operators";
import { AlertType, DocumentType, LogEvent } from "src/app/common";
import {LocalStorageVariables, SettingCodes, TransactionType} from "src/app/common/enum";
import {
  CustomerSearchComponent,
  DocumentCreatedComponent,
  PaymentComponent,
} from "src/app/components";
import {
  CashPayment,
  ICompanyInformation,
  CreditCardMobile,
  IExchangeRate,
  ICurrency,
  ITransferPayment,
} from "src/app/models";
import { IDocumentToSync } from "src/app/models/db/Doc-model";
import {IDocumentCreateComponentInputData, IPaymentComponentInputData} from "src/app/models/db/i-modals-data";
import {
  CompanyService,
  CommonService,
  LocalStorageService,
  PrintingService,
  ExRateService,
  CardService,
  LogManagerService,
  DocumentService,
  Repository,
} from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { FormatDate } from "../../common/function";
import { IIncomingPayment, IPaymentCreditCards } from "../../interfaces/i-documents";
import { IDecimalSetting } from "../../interfaces/i-settings";
import { ICompany } from "../../models/db/companys";
import { SettingsService } from "../../services/settings.service";
import { IBusinessPartners } from "src/app/interfaces/i-business-partners";

@Component({
  selector: "app-account-payment",
  templateUrl: "./account-payment.page.html",
  styleUrls: ["./account-payment.page.scss"],
})
export class AccountPaymentPage implements OnInit, OnDestroy {
  // VARBOX
  documentKey: string;
  lastDocEntry: number;
  transferPayment: ITransferPayment;
  //currencyList = CurTypes;
  cashPayment: CashPayment;
  cardsPayment: CreditCardMobile[];
  customer: IBusinessPartners;
  cardsTypesList: any[];
  companyInfo: ICompanyInformation;
  exRate: IExchangeRate;
  SearchCustomerBtn = true;
  Currency: string;
  totalCards: number;
  comments: string;
  print: string;
  TO_FIXED_TOTALDOCUMENT: string = '';
  currencyList: ICurrency[] = [];
  customerCurrencyList: ICurrency[] = [];
  paymentCurrency: string;
  speedTestMbps: any;
  decimalCompany: IDecimalSetting;

  constructor(
    private popoverController: PopoverController,
    private modalController: CustomModalController,
    private loadingController: LoadingController,
    private network: Network,
    private documentService: DocumentService,
    private repositoryCompany: Repository.Company,
    private companyService: CompanyService,
    private commonService: CommonService,
    private localStorageService: LocalStorageService,
    private printingService: PrintingService,
    private cardService: CardService, 
    private exchangeRateService: ExRateService,
    private logManagerService: LogManagerService,
    private settingsService: SettingsService
  ) {}
  ngOnDestroy(): void {
    this.modalController.DismissAll();
  }

  ngOnInit():void {
    this.commonService.speedTestMbps.subscribe({
      next: (speedMbps) => {
        this.speedTestMbps = speedMbps;
      }
    });
  }

  ionViewWillEnter(): void {
    this.cashPayment = {
      account: "",
      amount: 0,
      curr: "",
    };
    this.transferPayment = {
      Account: '',
      Amount: 0,
      Currency: '',
      Reference: ''
    } as ITransferPayment;
    this.totalCards = 0;
    this.cardsPayment = [];
    this.SendInitialRequests();
  }

  /**
   * Method is an asynchronous function responsible for sending initial requests. It returns a promise that resolves when all initial requests are successfully sent
   * @constructor
   */
  async SendInitialRequests(): Promise<void> {

    let loader = await this.commonService.Loader();
    loader.present();

    forkJoin({
      Settings: this.settingsService.GetSettingByCode(SettingCodes.Decimal).pipe(catchError(error => of(null))),
      Currencies: this.companyService.GetCurrencies(),
      Cards: this.cardService.GetCards(),
      ExRate: this.exchangeRateService.GetExchangeRate(),
      Company: this.companyService.GetCompanyInformation()
    })
        .pipe(finalize(() => loader.dismiss()))
        .subscribe({
          next: (callbacks) => {
            this.commonService.CLMapSubscriptionValue(callbacks.Currencies, []).forEach(curr => this.currencyList[curr.Id] = curr);

            //#region CANTIDAD DE DECIMALES DE LA COMPANY
            if (callbacks && callbacks.Settings && callbacks.Settings.Data) {
              let companyDecimal: IDecimalSetting[] = JSON.parse(callbacks.Settings.Data.Json || '');

              if (companyDecimal && companyDecimal.length > 0) {
                let company = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany
                let decimalCompany = companyDecimal.find(x => x.CompanyId === company?.Id) as IDecimalSetting;
                if (decimalCompany) {
                  this.decimalCompany = decimalCompany;
                  this.TO_FIXED_TOTALDOCUMENT = `1.${this.decimalCompany?.TotalDocument}-${this.decimalCompany?.TotalDocument}`;
                }
              }

            }
            //#endregion

            //#region CURRENCIES
            this.currencyList = callbacks.Currencies?.Data || [];
            //#endregion

            this.cardsTypesList = callbacks.Cards.Data ?? []
            this.exRate = callbacks.ExRate.Data;
            if (this.exRate) {
              if (!this.exRate.value) this.exRate.value = 0;
            }

            this.companyInfo = this.commonService.CLMapSubscriptionValue(callbacks.Company, {} as ICompanyInformation);
          },
          error: (error) => {
            this.commonService.Alert(AlertType.ERROR, error, error);
          }
        });
  }

  //#region Modals
  async SearchCustomer(slidingCustomer: IonItemSliding) :Promise<void> {
    if (slidingCustomer) slidingCustomer.close();

    let modal = await this.modalController.create({
      component: CustomerSearchComponent,
    });
    modal.present();
    modal.onDidDismiss().then(async (result) => {
      let loader = await this.commonService.GetTopLoader();
      if (result.data) {
        this.resetData();
        this.customer = result.data;
        this.SearchCustomerBtn = false;
        this.SetCustomerCurTypes();
      }
      loader.dismiss();
    });
  }

  async OpenPaymentModal(): Promise<void> {
    if (!this.customer) {
      this.commonService.alert(AlertType.INFO, this.commonService.Translate('Debe seleccionar un cliente', 'You must select a customer'));
      return;
    }
    let paymentModal = await this.modalController.create({
      component: PaymentComponent,
      componentProps: {
        data: {
          total: 0,
          totalFC: 0,
          decimalCompany: this.decimalCompany,
          currency: this.Currency,
          cashPayment: this.cashPayment,
          transferPayment: this.transferPayment,
          cards: this.cardsPayment,
          exRate: this.exRate.value,
          cardsTypesList: this.cardsTypesList,
          definedTotal: false,
          customerCurrency: this.customer.Currency,
          currencies: this.customerCurrencyList
        } as IPaymentComponentInputData,
      }
    });

    
    paymentModal.present();

    paymentModal.onDidDismiss().then(async (result) => {
      let loader = await this.commonService.GetTopLoader();

      if (result.data) {
        this.cashPayment = result.data.cashPayment;

        this.cardsPayment = result.data.cards;

        this.transferPayment = result.data.transferPayment as ITransferPayment;

        this.totalCards = 0;

        if (this.cardsPayment.length > 0) {
          this.cardsPayment.forEach((c) => {
            this.totalCards += c.CreditSum;
          });
        }

        this.paymentCurrency = this.cashPayment.curr;//Le puse la currency de Efectivo ya que todas son iguales
      }

      loader.dismiss();
    });
  }

  async ShowDocumentInfo(DocNum: number) {
    let popover = await this.popoverController.create({
      component: DocumentCreatedComponent,
      componentProps: {
        data: {
          IsInvoice: false,
          DocNum: DocNum.toString(),
          DocType: DocumentType.IncommingPayment,
          PrintInformation: this.print,
          DocEntry: this.lastDocEntry,
          AllowPrint: true,
        } as IDocumentCreateComponentInputData,
      },
      backdropDismiss: false,
    });
    popover.present();
    popover.onDidDismiss().then(() => this.resetData());
  }
  //#endregion
  
  resetData():void {
    this.lastDocEntry = 0;
    this.SearchCustomerBtn = true;
    this.customer = null;
    this.cardsPayment = [];
    this.cashPayment = {
      account: "",
      amount: 0,
      curr: "",
    };
    this.transferPayment = {
      Account: '',
      Amount: 0,
      Currency: '',
      Reference: ''
    } as ITransferPayment;
    this.totalCards = 0;
    this.comments = "";
  }

  async DeleteCardsInfo(itemSliding: IonItemSliding) {
    if (itemSliding) 
    {
      let slidingRatio: number = await itemSliding.getSlidingRatio();
      if(slidingRatio >= 1)
      {
        itemSliding.close();
        this.cardsPayment = [];
        this.totalCards = 0;
      }
    }
  }

  async DeleteCashInfo(itemSliding: IonItemSliding) {
    if (itemSliding) 
    {
      let slidingRatio: number = await itemSliding.getSlidingRatio();
      if(slidingRatio >= 1)
      {
        itemSliding.close();
        this.cashPayment.amount = 0;
        this.cashPayment.account = "";
      }
    }
  }

  async DeleteTransferInfo(slidingTransfer: IonItemSliding): Promise<void> {
    if (slidingTransfer) 
    {
      let slidingRatio: number = await slidingTransfer.getSlidingRatio();

      if(slidingRatio >= 1)
      {
        slidingTransfer.close();
        this.transferPayment.Amount = 0;
        this.transferPayment.Account = "";
        this.transferPayment.Reference = "";
      }
    }
  }

  async Create(): Promise<void> {
    if ((!this.cashPayment || this.cashPayment.amount === 0) && (!this.cardsPayment || this.cardsPayment.length === 0) && (!this.transferPayment || this.transferPayment.Amount === 0)) {
      this.commonService.alert(AlertType.ERROR, this.commonService.Translate('Monto de pago inválido', 'Invalid payment amount'));
      return;
    }

    this.documentKey = this.commonService.GenerateDocumentUniqueID();

    if (!this.documentKey) {
      this.commonService.alert(AlertType.INFO, this.commonService.Translate('No se pudo generar el identificador de la aplicación, por favor recargue la página', 'Cant generate app identificator, please reload page'));
      this.logManagerService.Log(LogEvent.ERROR, `Socio corrupto: ${JSON.stringify(this.customer)}`, 'IncomingPaymennt');
      return;
    }

    let loading = await this.loadingController.create({message: this.commonService.Translate('Procesando...', 'Processing...')});
    loading.present();
    
    let incomingPayment = {
      CardCode: this.customer?.CardCode,
      CardName: this.customer?.CardName,
      DocDate: FormatDate(),
      DocCurrency: this.cashPayment.curr,
      DocRate: this.exRate.value,
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
      PaymentInvoices: [],
    } as IIncomingPayment;

    if (this.network.type === "none") {
      loading.dismiss();
      this.commonService.Alert(AlertType.INFO, `Necesitas conexión a Internet`, `You need Internet connection`);
    } else {

      let logMessage: string = this.commonService.Translate(`Se envió a crear el Pago a cuenta ${this.documentKey}`, `Account payment ${this.documentKey} was sent to create`);

      this.logManagerService.Log(LogEvent.INFO, logMessage);

      this.documentService.CreateIncommingPayment(incomingPayment)
          .pipe(
              finalize(() => loading.dismiss())
          )
          .subscribe(async callback => {
            if (callback.Data) {
              this.print = await this.printingService.CreatePaymentPrintFormat(
                  this.companyInfo,
                  this.customer,
                  this.cashPayment.amount,
                  this.totalCards,
                  this.localStorageService.data.get('Session').UserEmail || '',
                  this.cashPayment.curr,
                  this.transferPayment?.Amount,
                  new Date(),
                  callback.Data.DocNum,
                  this.GetCurrency(incomingPayment.DocCurrency).Symbol,
                  []
              );

              this.lastDocEntry = callback.Data.DocEntry;

              logMessage = this.commonService.Translate(`Se creó el Pago a cuenta. DocNum: ${callback.Data.DocNum}`, `Account payment ${callback.Data.DocNum} was sucessfully created`);

              this.logManagerService.Log(LogEvent.SUCCESS, logMessage);

              this.ShowDocumentInfo(callback.Data.DocNum);
            } else {
              this.HandlerDocumentCreationError(
                  {Payment: incomingPayment, TransactionType: TransactionType.AccountPayment},
                  this.commonService.getErrorDescription(callback)
              );
              return EMPTY;
            }
          }, error => {
            console.error(error);
            this.commonService.Alert(AlertType.ERROR, error, error, '', '', [], true);
          });
    }
  }

  /**
   * This method set default currency to search documents
   * @constructor
   */
  SetCustomerCurTypes(): void {
    if (this.customer.Currency !== "##") {
      this.Currency = this.currencyList.find(element => element.Id === this.customer.Currency)?.Id ?? '';
      this.customerCurrencyList = this.currencyList.filter(element => element.Id === this.customer.Currency);
    }
    else {
      this.Currency = this.currencyList.find(element => element.IsLocal)?.Id ?? '';
      this.customerCurrencyList = this.currencyList;
    }

  }
  

  async HandlerDocumentCreationError(document: IDocumentToSync, message: string): Promise<void> {

    let buttons = [
      {
        text: this.commonService.Translate('Descartar documento', 'Discard document'),
        handler: () => {
          this.resetData();
          return true;
        },
      },
      {
        text: this.commonService.Translate('Reintentar creación', 'Retry creation'),
        role: 'cancel',
        handler: () => true,
      }
    ];

    this.commonService.Alert(AlertType.QUESTION, message, message, 'Confirmación', 'Confirmation', buttons, true);
  }

  /**
   * This method is used to get current currency
   * @param _key The code of the currency
   * @constructor
   */
  GetCurrency(_key: string): ICurrency {
    return this.currencyList?.find(element => element.Id === _key) || {
      Id: '',
      Symbol: '',
      Name: '',
      IsLocal: false
    }
  }
  
}
