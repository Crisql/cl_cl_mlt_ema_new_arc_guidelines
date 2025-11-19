import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IRouteAdministrator} from "@app/interfaces/i-route";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class RoutesAdministratorsService {
  private readonly CONTROLLER = 'api/RouteAdministrators';
  constructor(private http: HttpClient) { }

  Get<T>(_userId?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_userId)
    {
      path += `/${_userId}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Administradores de rutas obtenidos',
          OnError: 'No se pudo obtener los administradores de rutas'
        })});
  }
}
