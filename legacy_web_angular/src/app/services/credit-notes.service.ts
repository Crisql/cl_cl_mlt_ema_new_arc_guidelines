import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {IDocument} from "../interfaces/i-sale-document";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {InvoiceOpen} from "@app/interfaces/i-invoice-payment";
import {formatDate} from "@angular/common";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";


@Injectable({
  providedIn: 'root'
})
export class CreditNotesService {

  private readonly Controller: string = 'api/CreditNotes';

  constructor(private http: HttpClient) {
  }

  public Post(_document: IDocument,_attachment: IDocumentAttachment, _attachmentFiles: File[]): Observable<ICLResponse<IDocument>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<ICLResponse<IDocument>>(this.Controller, formData, {
      headers: new HttpHeaders({"Request-With-Files": 'true'})
    });
  }

  public Patch(_document: IDocument): Observable<ICLResponse<IDocument>> {
    return this.http.patch<ICLResponse<IDocument>>(this.Controller, _document);
  }

  /**
   * Method to get open credit notes
   * @param _cardCode Code business document to search
   * @param _docCurrencyCode CurrencyS document to search
   * @param _dateFrom Date end document to search
   * @param _dateTo Date init document to search
   * @constructor
   */
  public GetCreditNotesOpen(_cardCode: string, _docCurrency: string, _dateFrom: Date, _dateTo: Date): Observable<ICLResponse<InvoiceOpen[]>> {
    return this.http.get<ICLResponse<InvoiceOpen[]>>(`${this.Controller}/GetCreditNotesOpen?CardCode=${_cardCode}&DocCurrency=${_docCurrency}&DateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Notas de crédito obtenidas',
          OnError: 'No se pudo obtener las notas de crédito'
        })});
  }
}
