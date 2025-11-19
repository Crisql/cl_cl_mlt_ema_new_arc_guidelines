import { Injectable } from '@angular/core';
import {Structures} from "@clavisco/core";
import {IRouteFrequency} from "@app/interfaces/i-route";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IStructures} from "@app/interfaces/i-structures";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class RoutesFrequeciesService {

  private readonly CONTROLLER = "api/RouteFrequencies";
  constructor(private http: HttpClient) { }

  Get<T>(_onlyActive: boolean = false,_id?: number,): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `/${_id}`;
    }
    else
    {
      path += `?onlyActive=${_onlyActive}`
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Frecuencias de ruta obtenidas',
          OnError: 'No se pudo obtener las frecuencias de ruta'
        })});
  }

  GetRouteFrequenciesWeeks(): Observable<Structures.Interfaces.ICLResponse<IStructures[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IStructures[]>>(`${this.CONTROLLER}/Weeks`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Semanas de frecuencias de ruta obtenidas',
          OnError: 'No se pudo obtener las semanas de frecuencias de ruta'
        })});
  }

  Post(_frequency: IRouteFrequency): Observable<Structures.Interfaces.ICLResponse<IRouteFrequency>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IRouteFrequency>>(this.CONTROLLER, _frequency);
  }

  Patch(_frequency: IRouteFrequency): Observable<Structures.Interfaces.ICLResponse<IRouteFrequency>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IRouteFrequency>>(this.CONTROLLER, _frequency);
  }
}
