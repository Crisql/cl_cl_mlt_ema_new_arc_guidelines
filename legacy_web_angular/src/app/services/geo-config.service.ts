import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IGeoConfig} from "@app/interfaces/i-geo-config";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class GeoConfigService {

  private readonly CONTROLLER = 'api/GeoConfigs';

  constructor(private http: HttpClient) { }

  Get<T>(_id?: number):  Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `/${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Configuraciones geo obtenidas',
          OnError: 'No se pudo obtener las configuraciones geo'
        })})
  }

  Post(_geoConfig: IGeoConfig): Observable<Structures.Interfaces.ICLResponse<IGeoConfig>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IGeoConfig>>(this.CONTROLLER, _geoConfig);
  }

  Patch(_geoConfig: IGeoConfig): Observable<Structures.Interfaces.ICLResponse<IGeoConfig>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IGeoConfig>>(this.CONTROLLER, _geoConfig);
  }
}
