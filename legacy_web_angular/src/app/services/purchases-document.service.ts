import { Injectable } from '@angular/core';
import {IDocument} from "../interfaces/i-sale-document";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {InvoiceOpen} from "@app/interfaces/i-invoice-payment";
import {formatDate} from "@angular/common";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IApInvoiceWithPayment} from "@app/interfaces/invoice-with-payment";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";

@Injectable({
  providedIn: 'root'
})
export class PurchasesDocumentService {

  constructor(private http: HttpClient) { }
  Post(_controller: string, _document: IDocument,  _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<Structures.Interfaces.ICLResponse<IDocument>>
  {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<Structures.Interfaces.ICLResponse<IDocument>>(`api/${_controller}`, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

  Patch(_controller: string, _document: IDocument,  _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<Structures.Interfaces.ICLResponse<IDocument>>
  {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));
    return this.http.patch<Structures.Interfaces.ICLResponse<IDocument>>(`api/${_controller}`, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

  PurchaseDeliveryNotesXml(_formData: FormData): Observable<Structures.Interfaces.ICLResponse<IDocument>>
  {
    let headers = new HttpHeaders({"Request-With-Files": 'true'});
    return this.http.post<Structures.Interfaces.ICLResponse<IDocument>>(`api/PurchaseDeliveryNotes/PurchaseDeliveryNotesXml`, _formData, {headers});
  }

  GetDocumentForPayment(_cardCode: string, _docCurrency: string, _dateFrom: Date, _dateTo: Date): Observable<Structures.Interfaces.ICLResponse<InvoiceOpen[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<InvoiceOpen[]>>(`api/PurchaseInvoices?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Facturas de compra obtenidas',
          OnError: 'No se pudo obtener las facturas de compra'
        })});
  }

  /**
   * Method to create invoice purchase with payment
   * @param _controller The controller endpoint where the should send the request
   * @param _document The document information that will be created
   * @param _attachment The document attachment
   * @param _attachmentFiles Attachment files
   * @constructor
   */
  PostDocumentWithPayment(_controller: string, _document: IApInvoiceWithPayment, _attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<Structures.Interfaces.ICLResponse<IApInvoiceWithPayment>>
  {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));

    return this.http.post<Structures.Interfaces.ICLResponse<IApInvoiceWithPayment>>(`api/${_controller}`, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }
}
