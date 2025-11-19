import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IDraft} from "@app/interfaces/i-draft";
import {IDocument} from "@app/interfaces/i-sale-document";
import {IDocumentAttachment} from "@app/interfaces/i-document-attachment";

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  private readonly Controller: string = 'api/Draft';
  constructor(private http: HttpClient) { }

  /**
   * Method to get draft
   * @param _docEntry docEntry of the draft to get
   * @constructor
   */
  public Get( _docEntry: number): Observable<ICLResponse<IDraft>> {
    return this.http.get<ICLResponse<IDraft>>(`${this.Controller}?DocEntry=${_docEntry}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Preliminar obtenido',
          OnError: 'No se pudo obtener el preliminar'
        })});
  }
  Post<T>(_controller: string, _document: T, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<T>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<Structures.Interfaces.ICLResponse<T>>(`api/${_controller}/PostDocumentsDrafts`, formData, {
      headers: new HttpHeaders({ "Request-With-Files": 'true' })
    });
  }

  Patch<T>(_controller: string, _document: T, _attachment?: IDocumentAttachment, _attachmentFiles?: File[]): Observable<Structures.Interfaces.ICLResponse<T>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_document));

    formData.append('Attachment', JSON.stringify(_attachment));

    _attachmentFiles?.forEach(attF => formData.append(attF.name, attF));
    return this.http.post<Structures.Interfaces.ICLResponse<T>>(`api/${_controller}/PatchDocumentsDrafts`, formData, {
      headers: new HttpHeaders({ "Request-With-Files": 'true' })
    });
  }
}
