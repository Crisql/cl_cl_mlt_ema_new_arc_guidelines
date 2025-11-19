import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { EMPTY, Observable, throwError } from "rxjs";
import { Structures } from "@clavisco/core";
import { IDocument } from "../interfaces/i-sale-document";
import { formatDate } from "@angular/common";
import ICLResponse = Structures.Interfaces.ICLResponse;
import { InvoiceOpen } from "../interfaces/i-invoice-payment";
import { InvoiceWithPayment } from "@app/interfaces/invoice-with-payment";
import { DefineDescriptionHeader } from "@app/shared/shared.service";
import { IApprovalRequest } from "@app/interfaces/i-approval-request";
import { IDocumentAttachment } from "@app/interfaces/i-document-attachment";
import { ControllerName, ViewType } from '@app/enums/enums';

@Injectable({
  providedIn: 'root'
})
export class SalesDocumentService {
  constructor(private http: HttpClient) {
  }

  Get<T>(_controller: string, _id?: number): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path: string = `api/${_controller}`;

    if (_id) {
      path += `/${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Documentos de venta obtenidos',
        OnError: 'No se pudo obtener los documentos de venta'
      })
    });
  }

  /**
   * Retrieves a document by it's unique identifier
   * @param _controller API Controller where the request should be send
   * @param _docEntry Unique identifier of the document
   * @constructor
   */
  GetDocument(_controller: string, _docEntry: number): Observable<Structures.Interfaces.ICLResponse<IDocument>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IDocument>>(`api/${_controller}`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Documento de venta obtenido',
          OnError: 'No se pudo obtener el documento de venta'
        }),
        params: {
          DocEntry: _docEntry
        }
      });
  }

  GetDocuments(
    _controller: string, 
    _cardName: string, 
    _slpCode: number, 
    _dateFrom: Date, 
    _dateTo: Date, 
    _cardCode: string, 
    _docNum: number, 
    _docStatus: string,
    _objType?: string
  ): Observable<Structures.Interfaces.ICLResponse<IDocument[]>> {
    let path: string = `api/${_controller}?SlpCode=${_slpCode || 0}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&DocNum=${_docNum || 0}&DocStatus=${_docStatus}&DocCurrency=ALL&CardCode=${_cardCode || ''}&CardName=${_cardName || ''}`;

    if(_controller === ControllerName.Draft){
      path = `api/${_controller}?SlpCode=${_slpCode || 0}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&DocNum=${_docNum || 0}&DocStatus=${_docStatus}&DocCurrency=ALL&CardCode=${_cardCode || ''}&CardName=${_cardName || ''}&ViewType=${ViewType.Sales}&ObjType=${_objType}`;
   }

    return this.http.get<Structures.Interfaces.ICLResponse<IDocument[]>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos de venta filtrados obtenidos',
          OnError: 'No se pudo obtener los documentos de venta filtrados'
        })
      });
  }

  GetApprovalRequests(_controller: string, _dateFrom: Date, _dateTo: Date, _draftEntry: number, _approvalStatus: string, _docType: string): Observable<Structures.Interfaces.ICLResponse<IApprovalRequest[]>> {
    let path: string = `api/${_controller}?DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&DraftEntry=${_draftEntry || 0}&ApprovalStatus=${_approvalStatus}&DocType=${_docType}`;

    return this.http.get<Structures.Interfaces.ICLResponse<IApprovalRequest[]>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos para autorización filtrados obtenidos',
          OnError: 'No se pudo obtener los documentos para autorización filtrados'
        })
      });
  }

  PatchApprovalRequests(_controller: string, _approvalRequest: IApprovalRequest): Observable<Structures.Interfaces.ICLResponse<IApprovalRequest>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IApprovalRequest>>(`api/${_controller}`, _approvalRequest);
  }

  Post(_controller: string, _document: IDocument, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<IDocument>> {
      let formData = new FormData();

      formData.append('Document', JSON.stringify(_document));

      formData.append('Attachment', JSON.stringify(_attachment));

      _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

      return this.http.post<Structures.Interfaces.ICLResponse<IDocument>>(`api/${_controller}`, formData, {
        headers: new HttpHeaders({ "Request-With-Files": 'true' })
      });
  }

  Patch(_controller: string, _document: IDocument, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<IDocument>> {
      let formData = new FormData();

      formData.append('Document', JSON.stringify(_document));

      formData.append('Attachment', JSON.stringify(_attachment));

      _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));

      return this.http.patch<Structures.Interfaces.ICLResponse<IDocument>>(`api/${_controller}`, formData, {
        headers: new HttpHeaders({ "Request-With-Files": 'true' })
      });
  }
  GetTypeDocE<T>(_controller: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(`api/${_controller}/GetTypeInvoices`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Tipos de facturas obtenidos',
          OnError: 'No se pudo obtener los tipos de facturas'
        })
      })
  }

  GetDocumentForPayment(_cardCode: string, _docCurrency: string, _dateFrom: Date, _dateTo: Date): Observable<ICLResponse<InvoiceOpen[]>> {
    return this.http.get<ICLResponse<InvoiceOpen[]>>(`api/Invoices?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos a pagar obtenidos',
          OnError: 'No se pudo obtener los documentos a pagar'
        })
      });
  }

  PostInvoiceWithPayment(_controller: string, _invoiceWithPayment: InvoiceWithPayment, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<InvoiceWithPayment>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_invoiceWithPayment));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<Structures.Interfaces.ICLResponse<InvoiceWithPayment>>(`api/${_controller}`, formData, {
      headers: new HttpHeaders({ "Request-With-Files": 'true' })
    });
  }

  GetInvoiceForInternalReconciliation(_cardCode: string, _docCurrency: string, _dateFrom: Date, _dateTo: Date): Observable<ICLResponse<InvoiceOpen[]>> {
    return this.http.get<ICLResponse<InvoiceOpen[]>>(`api/Invoices/GetInvoiceForInternalReconciliation?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Facturas para reconciliación obtenidas',
          OnError: 'No se pudo obtener las facturas para reconciliación'
        })
      });
  }

  /**
   * Sends a request to retrieve approval requests based on specific codes.
   *
   * @param _controller - The API controller to which the request should be sent.
   * @param _codes - An array of codes used to filter the approval requests.
   * @returns An observable containing the server's response, which includes an array of approval requests.
   */
  GetApprovalsCodesRequests(_controller: string, _codes:number[]): Observable<Structures.Interfaces.ICLResponse<IApprovalRequest[]>> {
    let path: string = `api/${_controller}`;

    return this.http.post<Structures.Interfaces.ICLResponse<IApprovalRequest[]>>(path,_codes,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos para autorización filtrados obtenidos',
          OnError: 'No se pudo obtener los documentos para autorización filtrados'
        })
      });
  }

  /**
   * Sends an HTTP DELETE request to cancel a sales document by its document entry.
   *
   * @param _controller - The API controller name handling the cancel operation.
   * @param _docEntry - The unique identifier of the document to be cancelled.
   * @returns An Observable of IError containing the result or error information of the cancellation attempt.
   */
  Cancel(_controller: string, _docEntry: number): Observable<Structures.Interfaces.IError> {
    let path: string = `api/${_controller}`;

    return this.http.delete<Structures.Interfaces.IError>(path, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Documento de ventas cancelado',
        OnError: 'No se pudo cancelar el documento de ventas'
      }),
      params: {
        DocEntry: _docEntry
      }
    });
  }
}
