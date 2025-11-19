import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {formatDate} from "@angular/common";
import {HttpClient} from "@angular/common/http";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IDownPaymentClosed} from "@app/interfaces/i-down-payment";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class DownPaymentService {
  private readonly Controller: string = 'api/DownPayments';
  constructor(private http: HttpClient) { }

  /**
   * Method to get closed downs payments
   * @param _cardCode -Code business partners
   * @param _docCurrency -Currency to search document
   * @param _dateFrom -Date init to search document
   * @param _dateTo -Date end to search document
   * @param _docNum -Num to search document 
   * @constructor
   */
  public Get(_cardCode: string, _docCurrency: string, _dateFrom: Date, _dateTo: Date, _docNum: number): Observable<ICLResponse<IDownPaymentClosed[]>> {
    return this.http.get<ICLResponse<IDownPaymentClosed[]>>(`${this.Controller}/GetARDownPaymentsClosed?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&DocNum=${_docNum}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Anticipos obtenidos',
          OnError: 'No se pudo obtener los anticipos'
        })});
  }
}
