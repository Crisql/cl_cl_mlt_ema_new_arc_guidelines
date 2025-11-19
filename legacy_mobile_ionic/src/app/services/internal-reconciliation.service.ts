import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IInternalReconciliations, InternalReconciliationsResponse} from "../interfaces/i-pay-in-account";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";

@Injectable({
  providedIn: 'root'
})
export class InternalReconciliationService {

  constructor(private http: HttpClient) {
  }

  /**
   * Creation of reconciliation
   * @param _outgoingPayment
   * @constructor
   */
  Post(_outgoingPayment: IInternalReconciliations): Observable<ICLResponse<InternalReconciliationsResponse>>{
    return this.http.post<ICLResponse<InternalReconciliationsResponse>>('api/InternalReconciliations', _outgoingPayment);
  }
}
