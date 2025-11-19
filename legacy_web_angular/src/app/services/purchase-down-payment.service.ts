import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {IDownPaymentClosed} from "@app/interfaces/i-down-payment";
import {formatDate} from "@angular/common";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IApInvoiceWithPayment} from "@app/interfaces/invoice-with-payment";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";

@Injectable({
  providedIn: 'root'
})
export class PurchaseDownPaymentService {

  private readonly Controller: string = 'api/PurchaseDownPayments';
  constructor(private http: HttpClient) { }

  /**
   * Method to create purchase down payment
   * @param _purchaseInvoice The document information that will be created
   * @param _attachment The document attachment
   * @param _attachmentFiles Attachment files
   * @constructor
   */
  Post(_purchaseInvoice: IApInvoiceWithPayment,  _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<Structures.Interfaces.ICLResponse<IApInvoiceWithPayment>>
  {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_purchaseInvoice));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));

    return this.http.post<Structures.Interfaces.ICLResponse<IApInvoiceWithPayment>>(`${this.Controller}`, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

}
