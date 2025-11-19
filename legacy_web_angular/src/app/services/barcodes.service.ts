import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class BarcodesService {
  private readonly CONTROLLER = 'api/Barcodes';

  constructor(private http: HttpClient) { }

  Get<T>(_code?: string): Observable<ICLResponse<T[]>>
  {
    let  encodingItemCode = encodeURIComponent(_code || '');

    let path = this.CONTROLLER;

    if(_code)
    {
      path += `?ItemCode=${encodingItemCode}`;
    }
    return this.http.get<ICLResponse<T[]>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Códigos de barras obtenidos',
        OnError: 'No se pudo obtener los códigos de barras'
      })});

  }
}
