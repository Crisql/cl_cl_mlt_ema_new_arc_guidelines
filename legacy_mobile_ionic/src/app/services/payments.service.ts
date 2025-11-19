import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse, MobilePayment } from "src/app/models";
import { LocalStorageService } from "./local-storage.service";
import { IDocumentInPayment } from "src/app/models/db/Doc-model";
import {formatDate} from "@angular/common";
import {ICLResponse} from "../models/responses/response";
import {IPaymentToCancel} from "../interfaces/i-payments-to-cancel";
import {LocalStorageVariables} from "../common/enum";
import {IIncomingPaymentDetail} from "../interfaces/i-payment-detail";

@Injectable({
  providedIn: "root",
})
export class PaymentsService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  /**
   * This methos is used to obtained payment received
   * @param _dateFrom property from date filter
   * @param _dateTo property to date filter
   * @param _cardCode property card code filter
   * @param _page property page filter
   * @param pageSize property page size filter
   * @constructor
   */
  GetPayments(_dateFrom: Date, _dateTo: Date, _cardCode: string, _page: number = 0, pageSize: number = 5): Observable<ICLResponse<IPaymentToCancel[]>> {
    const headers = new HttpHeaders({
      'Cl-Sl-Pagination-Page': `${_page}`,
      'Cl-Sl-Pagination-Page-Size': `${pageSize}`
    });
    let from = formatDate(_dateFrom, 'yyyy-MM-dd', 'en');
    let to = formatDate(_dateTo, 'yyyy-MM-dd', 'en');
    let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL) as string;
    return this.http.get<ICLResponse<IPaymentToCancel[]>>(`${baseUrl}api/IncomingPayments?DateFrom=${from}&DateTo=${to}&CardCode=${_cardCode}`, {headers});
  }
  
  GetDocumentsInPayment(_paymentDocEntry: number): Observable<ICLResponse<IIncomingPaymentDetail>> {
    let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL) as string;
    return this.http.get<ICLResponse<IIncomingPaymentDetail>>(`${baseUrl}api/IncomingPayments?DocEntry=${_paymentDocEntry}`);
  }

  /**
   * Retrieves a list of payments that can be canceled based on the provided filters.
   *
   * @param _dateFrom - The start date for filtering payments.
   * @param _dateTo - The end date for filtering payments.
   * @param _cardCode - The card code used to filter payments.
   * @param _currency - (Optional) The currency type to filter payments. Defaults to an empty string.
   * @param _docType - (Optional) The document type to filter payments. Defaults to an empty string.
   * @param _page - (Optional) The page number for pagination. Defaults to 0.
   * @param pageSize - (Optional) The number of items per page for pagination. Defaults to 5.
   * @returns An Observable of ICLResponse containing an array of IPaymentToCancel objects.
   */
  GetPaymentsCancel(_dateFrom: Date, _dateTo: Date, _cardCode: string, _currency:string="", _docType:string="", _page: number = 0, pageSize: number = 5 ): Observable<ICLResponse<IPaymentToCancel[]>> {
    const headers = new HttpHeaders({
      'Cl-Sl-Pagination-Page': `${_page}`,
      'Cl-Sl-Pagination-Page-Size': `${pageSize}`
    });
    let from = formatDate(_dateFrom, 'yyyy-MM-dd', 'en');
    let to = formatDate(_dateTo, 'yyyy-MM-dd', 'en');
    let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL) as string;
    return this.http.get<ICLResponse<IPaymentToCancel[]>>(`${baseUrl}api/IncomingPayments?DateFrom=${from}&DateTo=${to}&currency=${encodeURIComponent(_currency)}&type=${encodeURIComponent(_docType)}&CardCode=${encodeURIComponent(_cardCode)}`, {headers});
  }

  /**
   * Cancels a payment based on the provided document entry identifier.
   *
   * @param _docEntry - The document entry identifier for the payment to be canceled.
   * @returns An Observable of ICLResponse containing the result of the cancellation operation.
   */
  Cancel(_docEntry: number): Observable<ICLResponse<any>> {
    let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL) as string;
    return this.http.post<ICLResponse<any>>(`${baseUrl}api/IncomingPayments?DocEntry=${_docEntry}`, null);
  }
}
