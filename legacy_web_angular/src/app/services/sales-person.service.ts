import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable } from 'rxjs';
import { ISalesPerson } from '../interfaces/i-sales-person';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class SalesPersonService {

  private readonly CONTROLLER = 'api/SalesMen';
  constructor(private http: HttpClient) { }

  Get<T>(_code?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_code)
    {
      path += `/${_code}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Vendedores obtenidos',
          OnError: 'No se pudo obtener los vendedores'
        })});
  }
}
