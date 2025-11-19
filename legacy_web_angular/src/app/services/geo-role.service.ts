import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IPermission, IRole} from "@app/interfaces/i-roles";
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {IGeoConfig} from "@app/interfaces/i-geo-config";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class GeoRoleService {

  private readonly CONTROLLER = 'api/GeoRoles';

  constructor(private http: HttpClient) { }

  Get<T>(_isActive = false, _id?: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    } else {
      path += `?active=${_isActive}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Roles geo obtenidos',
          OnError: 'No se pudo obtener los roles geo'
        })})
  }

  Post(_geoRole: IGeoRole): Observable<Structures.Interfaces.ICLResponse<IGeoRole>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IGeoRole>>(this.CONTROLLER, _geoRole);
  }

  Patch(_geoRole: IGeoRole): Observable<Structures.Interfaces.ICLResponse<IGeoRole>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IGeoRole>>(this.CONTROLLER, _geoRole);
  }

  GetGeoConfigsByGeoRole<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}/GeoConfigs`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Configuraciones geo de rol geo obtenidas',
          OnError: 'No se pudo obtener las configuraciones geo del rol geo'
        })})
  }

  PatchGeoConfigsByGeoRole(_id?: number, _geoConfigs?: IGeoConfig[]): Observable<Structures.Interfaces.ICLResponse<IGeoConfig[]>> {

    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}/GeoConfigs`;
    }
    return this.http.patch<Structures.Interfaces.ICLResponse<IGeoConfig[]>>(path, _geoConfigs);
  }
}
