import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {ITaxe} from "@app/interfaces/i-taxe";

@Injectable({
  providedIn: 'root'
})
export class TaxesService {
  private readonly CONTROLLER = 'api/SalesTaxCodes';

  constructor(private http: HttpClient) {
  }

  Get<T>(): Observable<Structures.Interfaces.ICLResponse<T>> {
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(this.CONTROLLER,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Códigos de impuesto obtenidos',
          OnError: 'No se pudo obtener los códigos de impuesto'
        })
      });
  }

  GetTaxesAP(): Observable<Structures.Interfaces.ICLResponse<ITaxe[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<ITaxe[]>>(`${this.CONTROLLER}/GetTaxesAP`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Códigos de impuesto obtenidos',
          OnError: 'No se pudo obtener los códigos de impuesto'
        })
      });
  }
}
