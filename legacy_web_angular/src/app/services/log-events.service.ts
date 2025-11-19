import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IUserAssign} from "@app/interfaces/i-user";
import {ILogEvent} from "@app/interfaces/i-log-event";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class LogEventsService {
  private readonly CONTROLLER = "api/LogEvents";
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
          OnSuccess: 'Eventos de logs obtenidos',
          OnError: 'No se pudo obtener los eventos de logs'
        })})
  }

  GetFiltered<T>(_filter: string, _event: string, _from: Date, _to: Date, _skip: number, _take: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    path += `?filter=${_filter}&event=${_event}&from=${_from.toISOString()}&to=${_to.toISOString()}&skip=${_skip}&take=${_take}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Eventos logs filtrados obtenidos',
          OnError: 'No se pudo obtener los eventos de logs filtrados'
        })})
  }

  Patch(_logEvent: ILogEvent): Observable<Structures.Interfaces.ICLResponse<ILogEvent>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<ILogEvent>>(this.CONTROLLER, _logEvent);
  }

  Post(_logEvent: ILogEvent): Observable<Structures.Interfaces.ICLResponse<ILogEvent>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<ILogEvent>>(this.CONTROLLER, _logEvent);
  }
}
