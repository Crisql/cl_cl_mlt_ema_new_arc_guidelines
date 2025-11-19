import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { finalize } from "rxjs/operators";
import { AlertType } from "src/app/common";
import { DocumentSelectedToCreatePay, ICurrency, ToPay } from "src/app/models";
import { CompanyService, CommonService, LogManagerService, DocumentService, LocalStorageService } from "src/app/services";
import { CustomModalController } from "src/app/services/custom-modal-controller.service";
import { HeadersData, LocalStorageVariables, LogEvent } from '../../common/enum';
import { ISearchDocToPayment } from "../../interfaces/i-searcDocToPayment";
import { Subscription } from "rxjs";
import {CLMathRound} from "../../common/function";
import {IDecimalSetting} from "../../interfaces/i-settings";

@Component({
  selector: "app-documents-apply-payment",
  templateUrl: "./documents-apply-payment.component.html",
  styleUrls: ["./documents-apply-payment.component.scss"],
})
export class DocumentsApplyPayment implements OnInit, OnDestroy {
  // varbox
  @Input("data") data: any;
  total: number;
  documents: ISearchDocToPayment[] = [];
  suscription$ = new Subscription();
  page: number = 0;
  recordsCount: number = 0;
  decimalCompany!: IDecimalSetting;
  TO_FIXED_TOTALDOCUMENT: string = '';

  constructor(
    private modalController: CustomModalController,
    private commonService: CommonService
    , private localStoraService: LocalStorageService,
    private logManagerService: LogManagerService,
    private documentService: DocumentService
  ) { }
  ngOnDestroy(): void {
    this.suscription$.unsubscribe();
    this.modalController.DismissAll();
  }

  ngOnInit() {
    this.documents = this.data.Lines;
    this.decimalCompany = this.data.decimal;
    this.TO_FIXED_TOTALDOCUMENT = `1.${this.decimalCompany?.TotalDocument}-${this.decimalCompany?.TotalDocument}`;
    this.recordsCount = +this.localStoraService.data.get(HeadersData.RecordsCount);
    this.localStoraService.data.delete(HeadersData.RecordsCount);
  }

  /**
   * This methos is used to select document payment
   * @param doc
   * @constructor
   */
  OnClickSelectDocument(doc: ISearchDocToPayment) {
    doc.Selected = !doc.Selected;

    if (doc.Selected) {
      if (this.CheckDocsSelectedCurrency(doc.DocCurrency)) {
        doc.Selected = false;

        return;
      }

      doc.AmountPay = doc.Saldo || doc.SaldoUSD;
    } else {
      doc.AmountPay = 0
    }
    this.CalculateTotalToPay();
  }

  /**
   * This method calculate total payment
   * @constructor
   */
  CalculateTotalToPay() {
    this.total = CLMathRound(this.decimalCompany.TotalDocument, this.documents?.filter(element => element.Selected)
        .reduce((acc, value) => acc + value.AmountPay, 0));
  }

  OnBalnceChange(doc: ISearchDocToPayment) {
    if (!doc.AmountPay || doc.AmountPay > (doc.Saldo || doc.SaldoUSD))
      doc.AmountPay = doc.Saldo || doc.SaldoUSD;
    this.CalculateTotalToPay();
  }

  /**
   * This method is document selected to payment
   * @constructor
   */
  async SelectedDocs() {
    let data: ToPay = {
      docList: this.documents.filter((doc) => doc.Selected),
      total: CLMathRound(this.decimalCompany.TotalDocument, this.total),
    };
    this.dismiss(data);
  }

  dismiss(data: any = null) {
    this.modalController.dismiss(data);
  }

  CheckDocsSelectedCurrency(docCurr: string): boolean {

    let hasDifferentCurr: boolean = false;

    for (let i = 0; i < this.documents.length; i++) {

      if (!this.documents[i].Selected) continue;

      if (this.documents[i].DocCurrency !== docCurr) {
        hasDifferentCurr = true;

        this.commonService.alert(
          AlertType.ERROR,
          this.commonService.Translate("No se pueden seleccionar documentos con diferente tipo de moneda", "Documents with different types of currency cannot be selected")
        );
        this.logManagerService.Log(
          LogEvent.ERROR,
          this.commonService.Translate("No se pueden seleccionar documentos con diferente tipo de moneda", "Documents with different types of currency cannot be selected")
        );

        break;
      }
    }

    return hasDifferentCurr;
  }

  /**
   * This method is used to paginate data
   * @param _event 
   */
  SearchDoc(_event: CustomEvent<void>): void {


    if (this.recordsCount === this.documents.length) {
      (_event.target as HTMLIonInfiniteScrollElement).disabled = true;
      return;
    }

    this.page++;
    this.suscription$.add(this.documentService.GetDocumentsToPay(this.data.Filter, this.page)
      .pipe(
        finalize(() => {
          (_event.target as HTMLIonInfiniteScrollElement).complete();
        }))
      .subscribe({
        next: (callback) => {
          let data = callback.Data.reduce((acc, element) => {
            const currency = this.data.Currency;
            const total = currency.IsLocal ? element.Total : element.TotalUSD;
            const saldo = currency.IsLocal ? element.Saldo : element.SaldoUSD;
            return acc.concat({ ...element, Symbol: currency.Symbol, DocTotal: total, DocSaldo: saldo });
          }, [])
          this.documents.push(...data);
        },
        error: (error) => {
          this.commonService.alert(AlertType.ERROR, error);
        }
      }));
  }

  /**
   * This method idenficate element to update change list
   * @param _index property index
   * @returns 
   */
  TrackByFunction(_index) {
    return _index;
  }
}
