import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {ItemsFilterType} from "@app/enums/enums";

@Injectable({
  providedIn: 'root'
})
export class PriceListService {

  private readonly CONTROLLER = 'api/PriceLists';

  constructor(private http: HttpClient) { }

  Get<T>(_id?: number,_viewType?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    }
    path += `?&ViewType=${_viewType}`;
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Listas de precios obtenidas',
          OnError: 'No se pudo obtener las listas de precios'
        })})
  }
}
