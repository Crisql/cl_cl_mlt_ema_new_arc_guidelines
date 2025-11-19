import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class PayTermsService {
  private readonly CONTROLLER = 'api/PayTerms';

  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Terminos de pago obtenidos',
          OnError: 'No se pudo obtener los terminos de pago'
        })});
  }
}
