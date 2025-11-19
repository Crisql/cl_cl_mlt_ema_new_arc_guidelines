import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IBusinessPartner} from "../interfaces/i-business-partner";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  private readonly CONTROLLER = 'api/Suppliers';

  constructor(private http: HttpClient) {
  }

  Get<T>(_code?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_code) {
      path += `?CardCode=${_code}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Proveedores obtenidos',
          OnError: 'No se pudo obtener los proveedores'
        })});
  }

  /**
   * Method to obtain business partners according to filter
   * @param _value - Value to find business partner matches
   * @constructor
   */
  GetbyFilter<T>(_value?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = `${this.CONTROLLER}/GetbyFilter?FilterBusinessPartner=${_value?.toUpperCase()}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener los proveedores',
        OnSuccess: 'proveedores obtenidos'
      })});
  }

  Post(_businessPartner: IBusinessPartner): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IBusinessPartner>>(this.CONTROLLER, _businessPartner);
  }

  Patch(_businessPartner: IBusinessPartner): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IBusinessPartner>>(this.CONTROLLER, _businessPartner);
  }
}
