import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable } from 'rxjs';
import { IConection } from '../interfaces/i-conection';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class ConnectionsService {

  private readonly CONTROLLER = 'api/Connections';
  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path: string = this.CONTROLLER;

    if(_id)
    {
      path += `/${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Conexiones obtenidas',
          OnError: 'No se pudo obtener las conexiones'
        })});
  }

  Post(_conection: IConection): Observable<Structures.Interfaces.ICLResponse<IConection>> {

    return this.http.post<Structures.Interfaces.ICLResponse<IConection>>(this.CONTROLLER, _conection);
  }

  Patch(_id: number,_conection: IConection): Observable<Structures.Interfaces.ICLResponse<IConection>> {
    let path =  `${this.CONTROLLER}/${_id}`;

    return this.http.patch<Structures.Interfaces.ICLResponse<IConection>>(path, _conection);
  }
}
