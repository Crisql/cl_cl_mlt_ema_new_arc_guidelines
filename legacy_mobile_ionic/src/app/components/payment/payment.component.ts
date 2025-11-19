import {LogManagerService} from './../../services/log-manager.service';
import {formatDate} from "@angular/common";
import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IonItemSliding} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";
import {forkJoin} from "rxjs";
import {finalize} from "rxjs/operators";
import {AlertType, LogEvent} from "src/app/common";
// Models
import {CashPayment, CreditCardMobile, ICurrency, ITransferPayment, Months} from "src/app/models";
import {IPaymentComponentInputData} from "src/app/models/db/i-modals-data";
import {IInputOptions} from "src/app/models/i-input-options";
// Services
import {AccountService, CommonService, JsonService} from "../../services";
import {CustomModalController} from "src/app/services/custom-modal-controller.service";
import {IAccount} from "../../models/i-account";
import {MethodPayment} from "../../common/enum";
import {CLMathRound} from "../../common/function";

@Component({
    selector: "app-payment",
    templateUrl: "./payment.component.html",
    styleUrls: ["./payment.component.scss"],
})
export class PaymentComponent implements OnInit, OnDestroy {
    // varbox
    cardTypesInput: string = '';
    cashAccountInput: string = '';
    transferAccountInput: string = '';
    cashOptions: IInputOptions;
    transferOptions: IInputOptions;
    cardTypesOptions: IInputOptions;
    @Input('data') data: IPaymentComponentInputData;
    currentSegment = 'cash';
    received: number;
    difference: number;
    currencyInUse: string;
    currencyList: ICurrency[] = [];
    currentLang: string;
    currencyIcon: string;
    TO_FIXED_TOTALDOCUMENT: string = '';
    SelectCashAccount: boolean = false;
    SelectTranferAccount: boolean = false;
    SelectCardAccount: boolean = false;

    //#region Cash
    cashPaymForm: FormGroup;
    accounts: IAccount[];
    //#endregion

    //#region Card
    cardPaymForm: FormGroup;
    cards: CreditCardMobile[];

    //#region Transfer
    transferForm: FormGroup;
    currentYear: string;
    currentMonth: string;
    years: any[];
    months = Months;
    monthSelectOptions = {
        header: this.translateService.currentLang === "en" ? "Month" : "Mes",
    };
    yearSelectOptions = {
        header: this.translateService.currentLang === "en" ? "Year" : "Año",
    };

    //#endregion

    constructor(
        private modalController: CustomModalController,
        private translateService: TranslateService,
        private formBuilder: FormBuilder,
        private jsonService: JsonService,
        private commonService: CommonService,
        private accountService: AccountService,
        private logManagerService: LogManagerService
    ) {
    }

    ngOnDestroy(): void {
        this.modalController.DismissAll();
    }

    ngOnInit() {
        this.InitVariables();

        this.SendInitialRequests();
    }

    /**
     * This method is used to get initial data
     * @constructor
     */
    async SendInitialRequests() {
        let loader = await this.commonService.Loader();
        loader.present();

        forkJoin({
            CardYears: this.jsonService.getJSONYears(),
            Accounts: this.accountService.GetAccounts()
        })
            .pipe(finalize(() => loader.dismiss()))
            .subscribe({
                next: (callbacks) => {
                    this.OnGetCurrencies();
                    this.years = callbacks.CardYears.Years;
                    this.OnGetCardYears();
                    this.accounts = this.commonService.CLMapSubscriptionValue(callbacks.Accounts, []);
                    this.OnGetAccounts();

                },
                error: (error) => {
                    this.commonService.Alert(AlertType.ERROR, error, error);
                }
            })
    }

    /**
     * This method is used to initialize variables
     * @constructor
     */
    InitVariables() {
        this.accounts = [];

        this.currencyList = [];

        this.cashPaymForm = this.formBuilder.group({
            Currency: ['', Validators.required],
            account: ['', Validators.required],
            Amount: [0, Validators.required]
        });

        this.cardPaymForm = this.formBuilder.group({
            Currency: ['', Validators.required],
            cardName: ['', Validators.required],
            cardNumber: ['', Validators.required],
            validMonth: [this.months[0].Id, Validators.required],
            validYear: ['20', Validators.required],
            Amount: [0, Validators.required]
        });

        this.transferForm = this.formBuilder.group({
            Currency: ['', Validators.required],
            account: ['', Validators.required],
            Amount: [0, Validators.required],
            reference: ['']
        });

        this.currentLang = this.translateService.currentLang;

        if (this.data) {
            this.TO_FIXED_TOTALDOCUMENT = `1.${this.data.decimalCompany?.TotalDocument}-${this.data.decimalCompany?.TotalDocument}`;

            this.currencyList = this.data.currencies.filter(curr => curr.Id != '##');

            this.currencyInUse = this.data.currency;

            this.cashPaymForm.controls['Currency'].setValue(this.currencyInUse);

            this.cardPaymForm.controls['Currency'].setValue(this.currencyInUse);

            this.transferForm.controls['Currency'].setValue(this.currencyInUse);
        }


        if (this.data.transferPayment && this.data.transferPayment.Amount > 0) {
            this.transferForm.patchValue({
                Amount: this.data.transferPayment.Amount,
                reference: (this.data.transferPayment.Reference === null) ? '' : this.data.transferPayment.Reference
            });
        }
    }

    /**
     * This method is used to close modal payment
     * @constructor
     */
    async CloseModal(): Promise<void> {
        let loader = await this.commonService.Loader();
        loader.present();
        this.modalController.dismiss({...this.data}, 'success');
    }

    /**
     * This method is used to create payment
     * @constructor
     */
    async CreatePayment(): Promise<void> {
        //#region Informacin de pago en efectivo
        if (this.cashPaymForm.invalid && this.cashPaymForm.get('Amount').value) {
            this.commonService.Alert(AlertType.WARNING, 'Información de pago en efectivo faltante', 'Missing cash payment information');
            return;
        }

        if (this.transferForm.invalid && this.transferForm.get('Amount').value) {
            this.commonService.Alert(AlertType.WARNING, 'Información de pago en transferencia faltante', 'Missing transfer payment information');
            return;
        }
        //#endregion

        //#region Valdicion total de pago
        if (this.data.definedTotal) {
            let total = +this.cashPaymForm.get('Amount').value ?? 0;
            total += +this.transferForm.get('Amount').value ?? 0;
            total += this.cards?.reduce((acc, value) => acc + value.CreditSum, 0) ?? 0;
            let totalInv = this.GetCurrency(this.currencyInUse).IsLocal ? this.data.total : this.data.totalFC;

            if ((CLMathRound(this.data.decimalCompany.TotalDocument, total)) !== totalInv) {
                this.commonService.Alert(AlertType.WARNING, 'El total del pago no coincide con el total de la factura', 'The payment total does not match invoice total');
                return;
            }
        }
        //#endregion

        //#region Validacion moneda pago efectivo y tarjeta
        if (this.cards && this.cards.some((x) => x.Currency !== this.cashPaymForm.get('Currency').value)) {
            this.commonService.Alert(AlertType.INFO, 'Pagos con moneda mixta no estan permitidos', 'Mixed currency payments are not allowed');
            return;
        }
        //#endregion

        let cashPayment: CashPayment = {
            curr: this.currencyInUse,
            account: this.cashPaymForm.get('account').value,
            amount: Number(this.cashPaymForm.get('Amount').value),
        };

        let transferPayment: ITransferPayment = {
            Currency: this.currencyInUse,
            Account: this.transferForm.get('account').value,
            Amount: Number(this.transferForm.get('Amount').value),
            Reference: (this.transferForm.get('reference').value === '') ? null : this.transferForm.get('reference').value
        } as ITransferPayment;


        let loader = await this.commonService.Loader();
        loader.present();
        this.modalController.dismiss({cashPayment, transferPayment, cards: this.cards}, 'success');
    }

    /**
     * This method is used to disable select currencies
     * @constructor
     */
    DisabledCurrencyInputs() {
        this.cardPaymForm.get('Currency').disable();
        this.cashPaymForm.get('Currency').disable();
        this.transferForm.get('Currency').disable();
    }

    /**
     * This method is used to enable document currency
     * @constructor
     */
    CheckEnableCurrencyInputs() {
        if (!this.cashPaymForm.get('Amount').value && (!this.cards || this.cards.length === 0) && !this.transferForm.get('Amount').value) {
            this.cardPaymForm.get('Currency').enable();
            this.cashPaymForm.get('Currency').enable();
            this.transferForm.get('Currency').enable();
        }
    }

    /**
     * This method is used for set the amount difference
     * @param togglePaymentType
     */
    SetCurrentDifference(togglePaymentType: number): void {
        try {
            if (this.data.definedTotal) {
                if (this.difference > 0) {
                    switch (togglePaymentType) {
                        case 1: {
                            this.cashPaymForm.get('Amount').reset(+this.difference.toFixed(this.data.decimalCompany?.TotalDocument));
                            break;
                        }
                        case 2: {
                            this.cardPaymForm.get('Amount').reset(+this.difference.toFixed(this.data.decimalCompany?.TotalDocument));
                            break;
                        }
                        case 3: {
                            this.transferForm.get('Amount').reset(+this.difference.toFixed(this.data.decimalCompany?.TotalDocument));
                            break;
                        }
                        default:
                            break;
                    }

                    this.CalculateTotal();
                }
            }
        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error, `Modal pagos mehod: SetCurrentDifference`)
        }

    }

    /**
     * This method is used for calculate the amount received
     */
    CalculateTotal(): void {

        try {
            
                let totalCards = 0;

                let totalCash = 0;

                let totalTransfer = 0;

                this.received = 0;

                this.difference = 0;

                if (this.cards && this.cards.length > 0)
                    totalCards = this.cards.reduce((acc, value) => acc + value.CreditSum, 0);

                totalCash = +this.cashPaymForm.get('Amount').value ?? 0;

                totalTransfer = +this.transferForm.get('Amount').value ?? 0;

                if (this.data.currencies.find(element => element.Id === this.currencyInUse)?.IsLocal) {
                    this.received = CLMathRound(this.data.decimalCompany.TotalDocument, totalCash + totalCards + totalTransfer);

                    this.difference = CLMathRound(this.data.decimalCompany.TotalDocument, this.data.total - this.received);
                } else {
                    this.received = CLMathRound(this.data.decimalCompany.TotalDocument, totalCash + totalCards + totalTransfer);

                    this.difference = CLMathRound(this.data.decimalCompany.TotalDocument, this.data.totalFC - this.received);
                }

            if (!this.data.definedTotal) {
                this.difference = 0;
            }
                
        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error, 'Modal pagos method: CalculateTotal')
        }
    }

    /**
     * This method filters accounts by selected currency.
     * @param _value
     */
    CurrencyChanged(_value: string): void {

        try {

            this.currencyInUse = _value;

            if (!this.currencyInUse) return;

            this.cashAccountInput = '';

            this.transferAccountInput = '';

            this.cashPaymForm.get('account').reset();

            this.transferForm.get('account').reset();

            this.currencyIcon = this.currencyList.find(element => element.Id === this.currencyInUse)?.Symbol ?? '';

            if (this.cashOptions) {
                this.cashOptions.List = this.accounts.filter(acc => (acc.ActCurr === this.currencyInUse || acc.ActCurr === '##') && acc.Type === MethodPayment.Cash);
            }

            if (this.transferOptions) {
                this.transferOptions.List = this.accounts.filter(acc => (acc.ActCurr === this.currencyInUse || acc.ActCurr === '##') && acc.Type === MethodPayment.Transfer);
            }

            if (this.cardTypesOptions) {
                this.cardTypesOptions.List = this.accounts.filter(acc => (acc.ActCurr === this.currencyInUse || acc.ActCurr === '##') && acc.Type === MethodPayment.Card);
            }

            this.cardPaymForm.get('Currency').reset(this.currencyInUse);

            this.cashPaymForm.get('Currency').reset(this.currencyInUse);

            this.transferForm.get('Currency').reset(this.currencyInUse);

            if (this.currencyInUse !== this.data.customerCurrency && this.data.customerCurrency !== '##') {
                this.cardPaymForm.get('Currency').reset();

                this.cashPaymForm.get('Currency').reset();

                this.transferForm.get('Currency').reset();

                this.commonService.Translate('La moneda seleccionada y la moneda del cliente no coinciden', `The selected currency and the customer's currency do not match`);

                return;
            }


            if (this.cards && this.cards.some((x) => x.Currency !== this.currencyInUse)) {
                this.commonService.alert(
                    AlertType.INFO,
                    this.commonService.Translate('Pagos con moneda mixta no estan permitidos', 'Mixed currency payments are not allowed')
                );

                return;
            }

            this.CalculateTotal();

        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error, 'Modal pagos method: CurrencyChanged')
        }
    }

    //#region Cash
    OnGetAccounts(): void {
        this.cashOptions = {
            ActionSheetHeader: this.commonService.Translate('Cuentas', 'Accounts'),
            DataPropsNames: ['AcctCode'],
            DataPropsSepartor: '',
            DescriptionPropName: 'AcctName',
            List: this.accounts.filter(x => x.Type === MethodPayment.Cash && (x.ActCurr === this.currencyInUse || x.ActCurr === '##')) ?? []
        };

        this.transferOptions = {
            ActionSheetHeader: this.commonService.Translate('Cuentas', 'Accounts'),
            DataPropsNames: ['AcctCode'],
            DataPropsSepartor: '',
            DescriptionPropName: 'AcctName',
            List: this.accounts.filter(x => x.Type === MethodPayment.Transfer && (x.ActCurr === this.currencyInUse || x.ActCurr === '##')) ?? []
        };

        this.cardTypesOptions = {
            ActionSheetHeader: this.commonService.Translate('Tipos de tarjeta', 'Cards type'),
            DataPropsNames: ['Id'],
            DataPropsSepartor: '',
            DescriptionPropName: 'AcctName',
            List: this.accounts.filter(x => x.Type === MethodPayment.Card && (x.ActCurr === this.currencyInUse || x.ActCurr === '##')) ?? []
        };

        if (this.data) {
            if (this.data.cashPayment && this.data.cashPayment.account) {
                this.cashPaymForm.patchValue({account: this.data.cashPayment.account});
            }

            if (this.data.transferPayment && this.data.transferPayment.Account) {
                this.transferForm.patchValue({account: this.data.transferPayment.Account});
            }
        }
    }

    /**
     * his method is used to calculate total
     * @param _event model event
     * @param _type type method payment
     * @constructor
     */
    AmountChanged(_event: Event, _type: number) {
        try {
           if(this.data.definedTotal){

               let amountCash = +(this.cashPaymForm.get('Amount').value) || 0;

               let amountTransfer = +(this.transferForm.get('Amount').value) || 0;

               let amountCard = +(this.cardPaymForm.get('Amount').value) || 0;

               let amountCards = this.cards?.reduce((acc, value) => acc + value.CreditSum, 0) ?? 0;

               let total = CLMathRound(this.data.decimalCompany.TotalDocument, amountCash + amountTransfer + amountCard + amountCards);

               switch (_type) {
                   case MethodPayment.Cash:
                       this.cashPaymForm.get("Amount").patchValue(CLMathRound(this.data.decimalCompany.TotalDocument, amountCash), {emitEvent: false})
                       break;
                   case MethodPayment.Card:
                       this.cardPaymForm.get("Amount").patchValue(CLMathRound(this.data.decimalCompany.TotalDocument, amountCard), {emitEvent: false})
                       break;
                   case MethodPayment.Transfer:
                       this.transferForm.get("Amount").patchValue(CLMathRound(this.data.decimalCompany.TotalDocument, amountTransfer), {emitEvent: false})
                       break;
               }

               if (this.data.currencies.find(element => element.Id === this.currencyInUse)?.IsLocal) {
                   if (total > this.data.total) {
                       (_event.target as HTMLInputElement).value = '0';

                       if (_type === MethodPayment.Cash)
                           this.cashPaymForm.get('Amount').setValue(0);

                       if (_type === MethodPayment.Card)
                           this.cardPaymForm.get('Amount').setValue(0);

                       if (_type === MethodPayment.Transfer)
                           this.transferForm.get('Amount').setValue(0);

                   }
               } else {
                   if (total > this.data.totalFC) {
                       (_event.target as HTMLInputElement).value = '0';

                       if (_type === MethodPayment.Cash)
                           this.cashPaymForm.get('Amount').setValue(0);

                       if (_type === MethodPayment.Card)
                           this.cardPaymForm.get('Amount').setValue(0);

                       if (_type === MethodPayment.Transfer)
                           this.transferForm.get('Amount').setValue(0);

                   }
               }

               if (this.cashPaymForm.get('Amount').value || this.transferForm.get('Amount').value) {
                   this.DisabledCurrencyInputs();
               } else {
                   this.CheckEnableCurrencyInputs();
               }
           }
            this.CalculateTotal();
        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error, 'Mdal pagos method: AmountChanged')
        }
    }

    //#endregion

    //#region Cards
    OnGetCardYears(): void {
        try {

            this.currentMonth = formatDate(new Date(), "MM", "en");

            this.currentYear = formatDate(new Date(), "yy", "en");

            this.cardPaymForm.get("validYear").setValue(this.currentYear);

            this.cardPaymForm.get("validMonth").setValue(this.currentMonth);

            if (this.data && this.data.cards && this.data.cards.length > 0) {
                this.cards = [...this.data.cards];

                this.currencyInUse = this.cards[0].Currency;
            } else {
                this.cards = [];
            }

        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error, 'Mdal pagos method: OnGetCardYears')
        }
    }

    GetCardYears() {
        this.jsonService.getJSONYears().subscribe((data: any) => {
            this.years = data.Years;

            this.OnGetCardYears();
        });
    }

    /**
     * Tjs method is used to delete card
     * @param _card model card
     * @param _itemSliding event sliding
     * @param _index index
     * @constructor
     */
    async DeleteCard(_card: CreditCardMobile, _itemSliding: IonItemSliding, _index: number) {
        if (_itemSliding) {
            let slidingRatio: number = await _itemSliding.getSlidingRatio();

            if (slidingRatio >= 1) {
                _itemSliding.close();

                this.cards.splice(_index, 1);
                this.CalculateTotal();
                this.CheckEnableCurrencyInputs();
            }
        }
    }

    /**
     * This method is used to add card
     * @returns
     */
    AddCard(): void {

        try {
            let currentDate = new Date();
            let credtCardToAdd = this.GetFormCreditCard();
            let expireDate = credtCardToAdd.CardValidUntil.split('/');

            if (!this.cardPaymForm.get('Amount').value || Number(this.cardPaymForm.get('Amount').value) === 0) return;

            if (Number(expireDate[0]) < currentDate.getMonth() + 1 && Number(`20${expireDate[1]}`) <= currentDate.getFullYear()) {
                this.commonService.alert(AlertType.WARNING, this.translateService.currentLang === 'es' ? 'La fecha de la tarjeta es inválida' : 'Invalid cards expiration date');
                return;
            }

            let creditCardToAdd: CreditCardMobile = this.GetFormCreditCard();

            if (this.cards.length > 0 && this.cards[0].Currency !== creditCardToAdd.Currency) {
                this.commonService.Alert(AlertType.WARNING, 'La fecha de la tarjeta es inválida', `Invalid card's expiration date`);
                return;
            }

            this.cards.push(creditCardToAdd);

            this.CalculateTotal();
            this.DisabledCurrencyInputs();
            this.ClearCardForm();
            this.SelectCardAccount = false;
        } catch (error) {
            this.logManagerService.Log(LogEvent.ERROR, error, 'modal pagos metodo AddCard');
        }
    }

    /**
     * Thi method is used to get data of the form credit card
     * @constructor
     */
    GetFormCreditCard(): CreditCardMobile {
        let card = this.accounts.filter(x => x.Type === MethodPayment.Card)?.find(y => y.Id);
        if (!card) return {} as CreditCardMobile;

        return {
            Currency: this.cardPaymForm.get('Currency').value,
            CardValidUntil: `${this.cardPaymForm.get('validMonth').value}/${this.cardPaymForm.get('validYear').value}`,
            CreditCard: card.Id,
            CreditCardNumber: this.cardPaymForm.get('cardNumber').value,
            CreditSum: +this.cardPaymForm.get('Amount')?.value ?? 0,
            CreditAcct: card.AcctCode,
            VoucherNum: '0',
            OwnerIdNum: '0'
        } as CreditCardMobile;
    }

    /**
     * This method is used to clear th form credit card
     * @constructor
     */
    ClearCardForm() {
        this.cardPaymForm.reset({
            Currency: this.currencyInUse,
            cardName: '',
            cardNumber: '',
            validYear: this.currentYear,
            validMonth: this.currentMonth,
            Amount: '',
        });
        this.cardTypesInput = '';
    }

    //#endregion

    OnGetCurrencies(): void {

        if (this.data.customerCurrency === '##') {
            let localCurrency: ICurrency = this.currencyList.find(element => element.Id == this.data.currency);
            this.currencyIcon = localCurrency.Symbol;
        } else {
            this.currencyIcon = this.currencyList.find(element => element.Id === this.data.customerCurrency)?.Symbol;
        }

        if (this.data) {
            if (this.data.cashPayment) {
                if (this.data.cashPayment.amount > 0) {
                    this.cashPaymForm.patchValue({cashTotal: this.data.cashPayment.amount});
                }

                if (this.data.cashPayment.curr) {
                    this.cashPaymForm.patchValue({curr: this.data.cashPayment.curr});
                }
            }

            if (this.data.transferPayment && this.data.transferPayment.Currency) {
                this.transferForm.patchValue({curr: this.data.transferPayment.Currency});
            }

            if (this.data.cards && this.data.cards.length > 0) {
                this.cardPaymForm.patchValue({cardCurr: this.data.cards[0].Currency});
            }

            this.CalculateTotal();
        }
    }

    /**
     * This method is used to get current currency
     * @param key
     * @constructor
     */
    GetCurrency(key: string): ICurrency {
        return this.currencyList.find(element => element.Id === key) || {
            Id: '',
            Symbol: '',
            Name: '',
            IsLocal: false
        }
    }

    async ShowInputOptions(_formControll: AbstractControl, _variableName: string, _options: IInputOptions, _icon: string, _type: number): Promise<void> {
        let returnedValue = await this.commonService.ShowInputOptions(_formControll, _options, _icon);

        if (returnedValue) {
            this[_variableName] = returnedValue;
        }

        if (_type === MethodPayment.Cash) {
            this.SelectCashAccount = true;
        }

        if (_type === MethodPayment.Card) {
            this.SelectCardAccount = true;
        }

        if (_type === MethodPayment.Transfer) {
            this.SelectTranferAccount = true;
        }
    }
}
