import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class BlanketAgreementsService {
  private readonly CONTROLLER = 'api/BlanketAgreements';
  constructor(private http: HttpClient) { }

  Get<T>(_code?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_code) {
      path += `?CardCode=${_code}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Clientes obtenidos',
          OnError: 'No se pudo obtener los clientes'
        })});
  }
}
