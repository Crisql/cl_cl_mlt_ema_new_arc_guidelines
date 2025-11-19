import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IIncomingPayment} from "@app/interfaces/i-incoming-payment";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {
  IInternalReconciliations,
  InternalReconciliationsResponse,
  IPayInAccount
} from "@app/interfaces/i-pay-in-account";
import {formatDate} from "@angular/common";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class InternalReconciliationService {

  private readonly CONTROLLER = 'api/InternalReconciliations';
  constructor(private http: HttpClient) {
  }
  Post(_outgoingPayment: IInternalReconciliations): Observable<ICLResponse<InternalReconciliationsResponse>>{
    return this.http.post<ICLResponse<InternalReconciliationsResponse>>(`${this.CONTROLLER}`, _outgoingPayment);
  }

  Get(_cardCode: string, _docCurrency: string, _dateFrom: Date, _dateTo: Date): Observable<Structures.Interfaces.ICLResponse<IPayInAccount[]>> {
    let path = `${this.CONTROLLER}?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}`;
    return this.http.get<Structures.Interfaces.ICLResponse<IPayInAccount[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Reconciliaciones internas obtenidas',
          OnError: 'No se pudo obtener las reconciliaciones internas'
        })});
  }
}
