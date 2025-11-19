import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class WithholdingTaxService {

  private readonly CONTROLLER = 'api/WithholdingTax';
  constructor(private http: HttpClient) { }

  /**
   * Method that obtains the tax withholdings configured in SAP
   * */
  Get<T>(): Observable<Structures.Interfaces.ICLResponse<T>> {
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(this.CONTROLLER,
      { headers: DefineDescriptionHeader({
          OnSuccess: 'Retenciones de impuestos obtenidas',
          OnError: 'No se pudo obtener las retenciones de impuestos'
      })});
  };

  /**
   * Method that obtains the tax withholdings configured in SAP by business partner
   * @param {string} _cardCode - The unique identifier of the Business Partner.
   * */
  GetByBusinessPartner<T>(_cardCode: string): Observable<Structures.Interfaces.ICLResponse<T>> {
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(`${this.CONTROLLER}/ByBusinessPartner?CardCode=${_cardCode}`,
      { headers: DefineDescriptionHeader({
          OnSuccess: 'Retenciones de impuestos por socio de negocio obtenidas',
          OnError: 'No se pudo obtener las retenciones de impuestos por socio de negocio'
        })});
  };
}
