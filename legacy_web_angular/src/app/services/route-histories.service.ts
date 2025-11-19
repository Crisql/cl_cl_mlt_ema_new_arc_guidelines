import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class RouteHistoriesService {
  private readonly CONTROLLER = 'api/RouteHistories';
  constructor(private http: HttpClient) { }

  Get<T>(_routeId: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_routeId)
    {
      path += `/${_routeId}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Historial de ruta obtenido',
          OnError: 'No se pudo obtener el historial de la ruta'
        })});
  }
}
