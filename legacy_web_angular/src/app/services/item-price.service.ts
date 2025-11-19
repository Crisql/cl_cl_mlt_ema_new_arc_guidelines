import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class ItemPriceService {
  private readonly CONTROLLER = 'api/Prices';

  constructor(private http: HttpClient) { }

  Get<T>(_itemCode: string, _priceList: number): Observable<Structures.Interfaces.ICLResponse<T>> {

    let  encodingItemCode = encodeURIComponent(_itemCode || '');
    let path = `${this.CONTROLLER}?ItemCode=${encodingItemCode}&PriceList=${_priceList}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Precios de item obtenidos',
          OnError: 'No se pudo obtener los precios del item'
        })})
  }
}
