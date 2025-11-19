import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {IBusinessPartner} from "@app/interfaces/i-business-partner";

@Injectable({
  providedIn: 'root'
})
export class ConsolidationBusinessPartnerService {
  private readonly CONTROLLER = 'api/ConsolidationBusinessPartners';
  constructor(private http: HttpClient) { }


  Get(_cardType: string, _currency: string[]): Observable<Structures.Interfaces.ICLResponse<IBusinessPartner[]>> {

    let path = this.CONTROLLER +`?CardType=${_cardType}&Currency=${encodeURIComponent(_currency.join(','))}`;
    return this.http.get<Structures.Interfaces.ICLResponse<IBusinessPartner[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Socios comerciales obtenidos',
          OnError: 'No se pudo obtener los socios comerciales'
        })});
  }
}
