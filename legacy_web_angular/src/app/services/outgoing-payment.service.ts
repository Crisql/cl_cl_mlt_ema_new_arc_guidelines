import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IPaymentForCancel} from "@app/interfaces/i-payment-for-cancel";
import {formatDate} from "@angular/common";
import {IIncomingPaymentDetail} from "@app/interfaces/i-payment-detail";
import {IIncomingPayment} from "@app/interfaces/i-incoming-payment";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class OutgoingPaymentService {
  private readonly CONTROLLER: string = 'api/VendorPayments';

  constructor(private http: HttpClient) {

  }
  Post(_outgoingPayment: IIncomingPayment): Observable<ICLResponse<IIncomingPayment>>{
    return this.http.post<ICLResponse<IIncomingPayment>>(`${this.CONTROLLER}`, _outgoingPayment);
  }
}
