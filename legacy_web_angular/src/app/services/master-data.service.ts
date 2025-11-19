import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {InventoryDetails} from "@app/interfaces/i-inventory-details";

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly CONTROLLER = 'api/MasterDataItems';
  constructor(private http: HttpClient) { }


  Get<T>(_code?: string): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let  encodingItemCode = encodeURIComponent(_code || '');

    let path = this.CONTROLLER;

    if(_code)
    {
      path += `?ItemCode=${encodingItemCode}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Datos maestros de item obtenidos',
        OnError: 'No se pudo obtener los datos maestros de item'
      })});
  }

  /**
   * Method to obtain items according to filter
   * @param _value - Value to find business partner matches
   * @constructor
   */
  GetbyFilter<T>(_value?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = `${this.CONTROLLER}/GetbyFilter?FilterItem=${_value?.toUpperCase()}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener datos maestros de item',
        OnSuccess: 'Datos maestros de item obtenidos'
      })});
  }

  GetItemInventoryDetails(_itemCode: string): Observable<Structures.Interfaces.ICLResponse<InventoryDetails[]>> {
    let path: string = `api/MasterDataItems/GetInventoryDetails?ItemCode=${encodeURIComponent(_itemCode)}`;
    return this.http.get<Structures.Interfaces.ICLResponse<InventoryDetails[]>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Documentos de venta filtrados obtenidos',
          OnError: 'No se pudo obtener los documentos de venta filtrados'
        })
      });
  }

}
