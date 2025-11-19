import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DatePicker } from "@ionic-native/date-picker/ngx";
import { Network } from "@ionic-native/network/ngx";
import {
  IonItemSliding,
  LoadingController,
  PopoverController,
} from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, of } from "rxjs";
import {catchError, concatMap, finalize, first, map, switchMap} from "rxjs/operators";
import {AlertType, AppConstants, DocumentType, LogEvent} from "src/app/common";
import {LocalStorageVariables, SettingCodes, TransactionType, TypeInvoiceToPayment} from "src/app/common/enum";
import {
  CustomerSearchComponent,
  DocumentCreatedComponent,
  DocumentsApplyPayment,
  PaymentComponent,
} from "src/app/components";
import {
  BusinessPartnersModel,
  CashPayment,
  ICompanyInformation,
  CompanyUDF,
  CompanyUDFsResponse,
  CreditCardMobile,
  DocumentFilterMobileModel,
  DocumentSearchMobileModel,
  IExchangeRate,
  ICurrency,
  ITransferPayment,
  MobilePayment,
  ToPay,
  UDFModel2,
} from "src/app/models";
import { IDocumentInPayment, SLPaymentInvoice } from "src/app/models/db/Doc-model";
import {IDocumentCreateComponentInputData, IPaymentComponentInputData} from "src/app/models/db/i-modals-data";
import {
  CompanyService,
  DocumentService,
  ExRateService,
  CommonService,
  LocalStorageService,
  PrintingService,
  CardService,
  LogManagerService,
  Repository,
  PaymentsService
} from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { formatDate } from "@angular/common";
import {CLMathRound, FormatDate} from "../../common/function";
import { IIncomingPayment, IPaymentCreditCards, IPaymentInvoices } from "../../interfaces/i-documents";
import { IUserAssign } from "../../models/db/user-model";
import { PrintFormatService } from "../../services/print-format.service";
import { element } from "protractor";
import { ISearchDocToPayment } from "../../interfaces/i-searcDocToPayment";
import {IDecimalSetting} from "../../interfaces/i-settings";
import {SettingsService} from "../../services/settings.service";
import {ICompany} from "../../models/db/companys";
import {CalculationService} from "../../services/calculation.service";

@Component({
  selector: "app-received-payment",
  templateUrl: "./received-payment.page.html",
  styleUrls: ["./received-payment.page.scss"],
})
export class ReceivedPaymentPage implements OnInit, OnDestroy {
  // VARBOX
  UDFsInDocument: UDFModel2[];
  isUdfFormToggled: boolean;
  UDFsForm: FormGroup;
  billingUDFs: CompanyUDF[];
  documentKey: string;
  lastDocEntry: number;
  transferPayment: ITransferPayment;
  startDate: string;
  endDate: string;
  customer: BusinessPartnersModel;
  cardsPayment: CreditCardMobile[];
  DocumentFilterMobileList: DocumentFilterMobileModel[];
  cashPayment: CashPayment;
  docSearch: DocumentSearchMobileModel;
  toPay: ToPay;
  decimalCompany: IDecimalSetting;
  companyInfo: ICompanyInformation;
  exRate: IExchangeRate;
  cardsTypesList: any;
  docType = 1;
  totalCards: number;
  comments: string;
  searchCustomerButton = true;
  currentSegment = "search";
  Currency: string = '';
  printReport: string;
  paymentCurrency: string;
  documentCurrency: string;
  customerCurrency: string;
  TO_FIXED_TOTALDOCUMENT: string = '';
  currencyList: ICurrency[] = [];
  customerCurrencyList: ICurrency[] = [];
  currentLang: string;
  totalUSD: any;
  totalCOL: number;
  speedTestMbps: number;

  constructor(
    private translateService: TranslateService,
    private modalController: CustomModalController,
    private popoverController: PopoverController,
    private datePicker: DatePicker,
    private loadingCtrl: LoadingController,
    private network: Network,
    private documentService: DocumentService,
    private repositoryCompany: Repository.Company,
    private commonService: CommonService,
    private calculationService: CalculationService,
    private localStorageService: LocalStorageService,
    private printingService: PrintingService,
    private exchangeRateService: ExRateService,
    private cardService: CardService,
    private companyService: CompanyService,
    private logManagerService: LogManagerService,
    private printFormatService: PrintFormatService,
    private settingsService: SettingsService
  ) { }
  ngOnDestroy(): void {
    this.modalController.DismissAll();
  }

  ngOnInit() {
    this.commonService.speedTestMbps.subscribe({
      next: (speedMbps) => {
        this.speedTestMbps = speedMbps;
      }
    });
    this.currentLang = this.translateService.currentLang;
    this.currencyList = [];
    this.customer = null;
    this.ResetData();
  }

  ionViewWillEnter() {
    this.SendInitialRequests();
  }

  async SendInitialRequests() {
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

  async SearchCustomer(slidingCustomer: IonItemSliding) {
    if (slidingCustomer) slidingCustomer.close();

    let modal = await this.modalController.create({
      component: CustomerSearchComponent,
    });
    modal.present();
    modal.onDidDismiss().then(async (result) => {
      let loader = await this.commonService.GetTopLoader();
      if (result.data) {
        this.ResetData();
        this.customer = result.data;
        this.searchCustomerButton = false;
        this.SetCustomerCurTypes();
      }
      loader.dismiss();
    });
  }

  /**
   * This method is used to open modal list document
   * @param docList represents model filter
   */
  async OpenDocListModal(docList: ISearchDocToPayment[]) {
    let chooseModal = await this.modalController.create({
      component: DocumentsApplyPayment,
      componentProps: {
        data: {
          Lines: docList.reduce((acc, element) => {
            const currency = this.customerCurrencyList.find(curr => curr.Id === this.Currency);
            const total = currency.IsLocal ? element.Total : element.TotalUSD;
            const saldo = currency.IsLocal ? element.Saldo : element.SaldoUSD;
            return acc.concat({ ...element, Symbol: currency.Symbol, DocTotal: total, DocSaldo: saldo });
          }, []),
          Filter: this.docSearch,
          Currency: this.customerCurrencyList.find(curr => curr.Id === this.Currency),
          decimal: this.decimalCompany
        }
      },
    });

    chooseModal.present();
    chooseModal.onDidDismiss().then((result) => {
      if (result.data && result.data.docList && result.data.docList.length > 0) {
        this.toPay = result.data;

        this.paymentCurrency = this.toPay.docList[0].DocCurrency;

        this.documentCurrency = this.toPay.docList[0].DocCurrency;

        this.currentSegment = 'create';

        // ELORIA: Queda pendiente validar los UDFs de factuas o pagos
        // this.GetBillingUDFs();
      }
    });
  }

  async OpenPaymentModal(): Promise<void> {
    if (!this.customer || !this.toPay || this.toPay.total === 0) {
      this.commonService.alert(AlertType.WARNING, this.commonService.Translate('Debe seleccionar al menos una factura para pagar', 'You must select at least one A/R Inovoice to pay'));
    }

    let paymentModal = await this.modalController.create({
      component: PaymentComponent,
      componentProps: {
        data: {
          total: this.GetAmount(this.Currency, true, this.toPay.total),
          totalFC: this.GetAmount(this.Currency, false, this.toPay.total),
          decimalCompany: this.decimalCompany,
          currency: this.documentCurrency,
          cashPayment: this.cashPayment,
          transferPayment: this.transferPayment,
          cards: this.cardsPayment,
          exRate: this.exRate.value,
          cardsTypesList: this.cardsTypesList,
          definedTotal: true,
          customerCurrency: this.customer.Currency,
          currencies: this.customerCurrencyList
        } as IPaymentComponentInputData,
      },
    });
    paymentModal.present();

    paymentModal.onDidDismiss().then(async (result) => {
      let loader = await this.commonService.GetTopLoader();

      if (result.role === 'success') {
        this.cardsPayment = result.data.cards;
        this.totalCards = CLMathRound(this.decimalCompany.TotalDocument, this.cardsPayment?.reduce((acc, value) => acc + value.CreditSum, 0) || 0);
        this.cashPayment = result.data.cashPayment;
        this.transferPayment = result.data.transferPayment as ITransferPayment;
        this.paymentCurrency = this.cashPayment.curr;
      }

      loader.dismiss();
    });
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

  async ShowDocumentInfo(DocNum: number) {
    let popover = await this.popoverController.create({
      component: DocumentCreatedComponent,
      componentProps: {
        data: {
          IsInvoice: false,
          DocNum: DocNum.toString(),
          DocType: DocumentType.IncommingPayment,
          PrintInformation: this.printReport,
          DocEntry: this.lastDocEntry,
          AllowPrint: true,
        }as IDocumentCreateComponentInputData,
      },
      backdropDismiss: false,
    });
    popover.present();
    popover.onDidDismiss().then(() => this.ResetData());
  }
  //#endregion

  ResetData(): void {
    this.lastDocEntry = 0;
    this.cardsPayment = [];
    this.billingUDFs = [];
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
    this.toPay = {
      docList: [],
      total: 0,
    };
    this.currentSegment = "search";
    this.comments = "";
    this.totalCards = 0;
    this.searchCustomerButton = true;
    this.endDate = new Date().toISOString();
    let startDate = new Date();
    startDate.setDate(new Date().getDate() - 10);
    this.startDate = startDate.toISOString();
    this.UDFsForm = new FormGroup({});
    this.UDFsInDocument = [];
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

  async SearchDoc(): Promise<void> {
    this.DocumentFilterMobileList = [];
    this.toPay = {
      docList: [],
      total: 0,
    };

    this.totalCards = 0;
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
      Reference: ""
    };

    if (!this.customer) {
      this.commonService.alert(AlertType.WARNING, this.commonService.Translate('Debe de selecionar un cliente', 'You must select a customer'));
      return;
    }
    if (!this.docType) {
      this.commonService.alert(AlertType.WARNING, this.commonService.Translate('Debe de selecionar un tipo de documento', 'You must select a document type'));
      return;
    }

    this.docSearch = {
      CardCode: this.customer.CardCode,
      DocType: Number(this.docType),
      EndDate: FormatDate(this.endDate),
      StartDate: FormatDate(this.startDate),
      UsrMapId: 0,
      DocStatus: "O",
      DocCur: this.Currency,
      DocNum: 0
    };


    let loader = await this.loadingCtrl.create();
    loader.present();

    if (this.network.type === "none") {
      loader.dismiss();
      this.commonService.Alert(
        AlertType.INFO,
        `Necesitas conexión a Internet`,
        `You need Internet connection`
      );
      return;
    }


    this.documentService
      .GetDocumentsToPay(this.docSearch)
      .pipe(finalize(() => loader.dismiss()))
      .subscribe(
        (next) => {
          if (next.Data && next.Data.length > 0) {
            let data = next.Data.filter(i => i.Saldo > 0 || i.SaldoUSD > 0);
            this.OpenDocListModal(data);
          } else {
            this.commonService.alert(
              AlertType.INFO,
              this.commonService.Translate('No se obtuvieron documentos', 'No documents obtained'));
          }
        },
        (error: any) => {
          this.commonService.alert(AlertType.ERROR, error);
        }
      );
  }

  async DeleteCardsInfo(itemSliding: IonItemSliding): Promise<void> {
    if (itemSliding) {
      let slidingRatio: number = await itemSliding.getSlidingRatio();
      if (slidingRatio >= 1) {
        itemSliding.close();
        this.cardsPayment = [];
        this.totalCards = 0;
      }
    }
  }

  async DeleteCashInfo(itemSliding: IonItemSliding): Promise<void> {
    if (itemSliding) {
      let slidingRatio: number = await itemSliding.getSlidingRatio();
      if (slidingRatio >= 1) {
        itemSliding.close();
        this.cashPayment.amount = 0;
        this.cashPayment.account = "";
      }
    }
  }

  async DeleteTransferInfo(slidingTransfer: IonItemSliding): Promise<void> {
    if (slidingTransfer) {
      let slidingRatio: number = await slidingTransfer.getSlidingRatio();

      if (slidingRatio >= 1) {
        slidingTransfer.close();
        this.transferPayment.Amount = 0;
        this.transferPayment.Account = "";
        this.transferPayment.Reference = "";
      }
    }
  }

  /**
   * This method is used to create payment
   * @returns 
   */
  async CreatePayment(): Promise<void> {

    if (!this.customer) {
      this.commonService.Alert(AlertType.INFO, 'No hay un cliente seleccionado', 'There is no selected customer');
      return;
    }

    if (this.network.type === "none") {
      this.commonService.Alert(
        AlertType.INFO,
        `Necesitas conexión a Internet`,
        `You need Internet connection`
      );

      return;
    }

    this.documentKey = this.documentKey || this.commonService.GenerateDocumentUniqueID();

    if (!this.documentKey) {
      this.commonService.Alert(
        AlertType.INFO,
        `No se pudo generar el identificador de la aplicación, por favor recargue la página`,
        `Cant generate app identificator, please reload page`
      );

      this.logManagerService.Log(
        LogEvent.ERROR,
        `Socio corrupto: ${JSON.stringify(this.customer)}`,
        'IncomingPaymennt'
      );

      return;
    }

    if (!this.cardsPayment && this.cashPayment.amount === 0 && this.transferPayment.Amount === 0) {
      this.commonService.Alert(
        AlertType.ERROR,
        'Información de pago faltante',
        'Missing payment information'
      );

      return;
    }

    let totalCards = 0;

    if (this.cardsPayment) this.cardsPayment.forEach((x) => (totalCards += x.CreditSum));

    if (+(totalCards + this.cashPayment.amount + this.transferPayment.Amount) !== this.GetTotalInOtherCurrency(this.paymentCurrency)) {
      this.commonService.Alert(
        AlertType.ERROR,
        'El total del pago no coincide con el monto de las facturas',
        'Payment total is different from invoices total'
      );

      return;
    }

    let loading = await this.loadingCtrl.create({
      message: this.commonService.Translate('Procesando...', 'Processing...')
    });

    loading.present();

    let paymentInvoices: SLPaymentInvoice[] = this.toPay.docList.map((d, index) => {
      return {
        LineNum: index,
        DocNum: d.DocNum,
        DocCurrency: d.DocCurrency,
        DocEntry: d.DocEntry,
        InvoiceType: d.DocumentType === TypeInvoiceToPayment.Anticipo ? TypeInvoiceToPayment.DownPayment : TypeInvoiceToPayment.Invoice,
        SumApplied: this.GetAmount(d.DocCurrency, true, d.AmountPay),
        AppliedFC: this.GetAmount(d.DocCurrency, false, d.AmountPay)
      }
    });

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
      PaymentInvoices: paymentInvoices.map(x => {
        return {
          SumApplied: x.SumApplied,
          AppliedFC: x.AppliedFC,
          DocEntry: x.DocEntry,
          InvoiceType: x.InvoiceType,
        } as IPaymentInvoices
      }),
    } as IIncomingPayment;
   
    let logMessage: string = this.commonService.Translate(`Se envió a crear el pago recibido ${this.documentKey}`, `Received payment ${this.documentKey} was sent to create`);

    this.logManagerService.Log(LogEvent.INFO, logMessage, '', this.documentKey);

    this.documentService.CreateIncommingPayment(incomingPayment)
      .pipe(
        switchMap(callback => this.printFormatService.GetPrintFormatPayment(callback.Data?.DocEntry ?? 0).pipe(
          map(response => {
            return {
              Payment: callback.Data,
              Report: response.Data.PrintFormat
            }
          })
        )),
        finalize(() => loading.dismiss())
      )
      .subscribe(async callback => {
        this.printReport = callback.Report;
        this.lastDocEntry = callback.Payment.DocEntry;
        logMessage = this.commonService.Translate(`Pago recibido creado correctamente. DocNum: ${callback.Payment.DocNum}`, `Received payment was successfully created. DocNum: ${callback.Payment.DocNum}`);
        let userAssing: IUserAssign = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        this.logManagerService.Log(LogEvent.SUCCESS, logMessage, '', this.documentKey, userAssing?.Id);
        this.ShowDocumentInfo(callback.Payment.DocNum);
        this.documentKey = '';
        this.customer = null;
        this.searchCustomerButton = true;
      }, error => {
        logMessage = `${this.commonService.Translate("Error al crear el Pago recibido: ", "Error when creating the Received payment: ")} ${AppConstants.GetError(error)}`;

        this.commonService.Alert(
          AlertType.ERROR,
          logMessage,
          logMessage,
          '',
          '',
          [],
          true
        );

        this.logManagerService.Log(LogEvent.ERROR, logMessage, '', this.documentKey);
      });
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

  GetTotalInOtherCurrency(_currency: string): number {
    let newTotal: number = this.toPay.total;

    if (_currency !== this.documentCurrency) {
      if (this.documentCurrency === "USD") {
        this.totalUSD = this.toPay.total;

        newTotal = this.calculationService.RoundTo(
          this.totalUSD * this.exRate.value
        );
      }
      else {
        this.totalCOL = this.toPay.total;
        newTotal = this.calculationService.RoundTo(
          this.totalCOL / this.exRate.value
        );
      }
    }

    return newTotal;
  }
  

  GetOptionsForSelectTypeUDF(UDF: CompanyUDF): any {
    if (UDF.ValidValues) return JSON.parse(UDF.ValidValues);
    return [];
  }

  ToggleUdfForm(): void {
    this.isUdfFormToggled = !this.isUdfFormToggled;
  }

}
