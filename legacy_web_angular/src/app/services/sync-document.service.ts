import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {HttpClient} from "@angular/common/http";
import {ILogEvent} from "@app/interfaces/i-log-event";
import {IUserAssign} from "@app/interfaces/i-user";
import {ISyncDocument} from "@app/interfaces/i-sync-document";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class SyncDocumentService {
  private readonly CONTROLLER = "api/SyncDocuments";
  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `?id=${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos sincronizados obtenidos',
          OnError: 'No se pudo obtener los documentos sincronizados'
        })})
  }

  GetFiltered<T>(_filter: string, _state: string, _type: string, _from: Date, _to: Date, _skip: number, _take: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    path += `?filter=${_filter}&status=${_state}&type=${_type}&from=${_from.toISOString()}&to=${_to.toISOString()}&skip=${_skip}&take=${_take}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos sincronizados filtrados obtenidos',
          OnError: 'No se pudo obtener los documentos sincronizados filtrados'
        })})
  }

  Patch(_syncDocument: ISyncDocument): Observable<Structures.Interfaces.ICLResponse<ISyncDocument>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<ISyncDocument>>(this.CONTROLLER, _syncDocument);
  }

  Post(_syncDocument: ISyncDocument): Observable<Structures.Interfaces.ICLResponse<ISyncDocument>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<ISyncDocument>>(this.CONTROLLER, _syncDocument);
  }
}
