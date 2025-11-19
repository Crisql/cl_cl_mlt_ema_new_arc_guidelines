import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable } from 'rxjs';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {

  private readonly CONTROLLER = 'api/Warehouses';
  constructor(private http: HttpClient) { }

  Get<T>(_whsCode?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_whsCode) {
      path += `?WhsCode=${_whsCode}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Almacenes obtenidos',
          OnError: 'No se pudo obtener los almacenes'
        })})
  }

  /**
   * Method to obtain warehouses according to filter
   * @param _value - Value to find warehouses matches
   * @constructor
   */
  GetbyFilter<T>(_value:string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = `${this.CONTROLLER}/GetbyFilter?&FilterWarehouse=${_value.toUpperCase() ?? ""}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Almacenes obtenidos',
        OnError: 'No se pudo obtener los almacenes'
      })});
  }


}
