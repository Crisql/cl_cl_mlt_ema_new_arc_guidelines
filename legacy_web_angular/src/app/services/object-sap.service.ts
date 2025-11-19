import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";
@Injectable({
  providedIn: 'root'
})
export class ObjectSapService {
  private readonly CONTROLLER = 'api/ObjectSAP';

  constructor(private http: HttpClient) { }

  Get<T>(): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(this.CONTROLLER,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Objetos de SAP obtenidos',
          OnError: 'No se pudo obtener los objetos de SAP'
        })});
  }
}
