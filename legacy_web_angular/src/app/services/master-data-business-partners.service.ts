import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IActivateBusinessPartner, IBusinessPartner} from "../interfaces/i-business-partner";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IDocument} from "@app/interfaces/i-sale-document";
import {formatDate} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class MasterDataBusinessPartnersService {
  private readonly CONTROLLER = 'api/MasterDataBusinessPartners';

  constructor(private http: HttpClient) {
  }

  /**
   * Method to obtain business partners according to filter
   * @param _value - Value to find business partner matches
   * @constructor
   */
  GetbyFilter<T>(_value?: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = `${this.CONTROLLER}/GetbyFilter?FilterBusinessPartner=${_value?.toUpperCase()}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener datos maestros de clientes',
        OnSuccess: 'Datos maestros de clientes obtenidos'
      })});
  }
  Get<T>(_code: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_code) {
      path += `?CardCode=${_code}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener datos maestros de clientes',
        OnSuccess: 'Datos maestros de clientes obtenidos'
      })});
  }

  /**
   * Method to search business partnet to activate
   * @param _customer -Coincidence customer
   * @param _dateFrom - Date init to search
   * @param _dateTo - Date end to search
   * @constructor
   */
  GetBusinessPartnerToActivate(_customer: string, _dateFrom: Date, _dateTo: Date): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner[]>> {
    let path: string = `${this.CONTROLLER}/GetToActivate?DateFrom=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&DateTo=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}&Customer=${_customer || ''}`;

    return this.http.get<Structures.Interfaces.ICLResponse<IBusinessPartner[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Socios de negocios filtrados obtenidos',
          OnError: 'No se pudo obtener socios de negocios filtrados'
        })});
  }

  Post(_businessPartner: IActivateBusinessPartner): Observable<Structures.Interfaces.ICLResponse<IActivateBusinessPartner>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IActivateBusinessPartner>>(this.CONTROLLER, _businessPartner);
  }

}
