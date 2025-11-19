import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IBinLocation} from "@app/interfaces/i-serial-batch";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class BinLocationsService {
  private readonly CONTROLLER = 'api/BinLocations';

  constructor(private http: HttpClient) { }

  Get<T>(_itemCode: string, _WhsCode: string): Observable<Structures.Interfaces.ICLResponse<T>>{

    let path = `${this.CONTROLLER}?itemCode=${encodeURIComponent(_itemCode)}&WhsCode=${_WhsCode}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener las ubicaciones del item',
        OnSuccess: 'Ubicaciones de item obtenidas'
      })});
  }

  GetLocationForTransfer(_WhsCode: string): Observable<ICLResponse<IBinLocation[]>>{

    let path = `${this.CONTROLLER}?WhsCode=${_WhsCode}`;

    return this.http.get<ICLResponse<IBinLocation[]>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Ubicaciones para transferencia de stock obtenidas',
        OnError: 'No se pudo obtener las ubicaciones para transferencia de stock'
      })});
  }

  GetLocationForTransferPagination(_WhsCode: string, _Location: string): Observable<ICLResponse<IBinLocation[]>>{

    let path = `${this.CONTROLLER}?WhsCode=${_WhsCode}&Location=${_Location.toUpperCase()}`;

    return this.http.get<ICLResponse<IBinLocation[]>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Ubicaciones para transferencia de stock obtenidas',
        OnError: 'No se pudo obtener las ubicaciones para transferencia de stock'
      })});
  }

}
