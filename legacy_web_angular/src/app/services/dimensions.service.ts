import {HttpClient} from "@angular/common/http";
import {IDimensions} from "@app/interfaces/i-dimensions";
import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {Structures} from "@clavisco/core";

@Injectable({
  providedIn: 'root'
})
export class DimensionsService {
  private readonly CONTROLLER = 'api/Dimension';
  constructor(private http: HttpClient) { }

  public Get(): Observable<Structures.Interfaces.ICLResponse<IDimensions[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IDimensions[]>>(`${this.CONTROLLER}`,
        {
          headers: DefineDescriptionHeader({
            OnSuccess: 'Dimensiones obtenidas',
            OnError: 'No se pudo obtener las dimensiones'
          })
        });
  }
}
