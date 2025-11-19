import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {ICurrencies} from "@app/interfaces/i-currencies";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class CurrenciesService {
  private readonly CONTROLLER = 'api/Currencies'
  constructor(private http: HttpClient) { }

  Get(_includeAllCurrencies: boolean): Observable<Structures.Interfaces.ICLResponse<ICurrencies[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<ICurrencies[]>>(`${this.CONTROLLER}`,
      {
        params: {
          IncludeAllCurrencies: _includeAllCurrencies
        },
        headers: DefineDescriptionHeader({
          OnSuccess: 'Monedas de documento obtenidas',
          OnError: 'No se pudo obtener las monedas de documento'
        })})
  }
}
