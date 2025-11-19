import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable } from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import { IRole } from '../interfaces/i-roles';
import { IUser } from '../interfaces/i-user';
import {IGeoRole} from "@app/interfaces/i-geo-role";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly CONTROLLER = 'api/Users';

  constructor(private http: HttpClient) { }

  Get<T>( _isActive= false,_id?: number,):  Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    } else {
      path += `?active=${_isActive}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Usuarios obtenidos',
          OnError: 'No se pudo obtener los usuarios'
        })})
  }

  GetUserCompanies(_userId: number, _active?: boolean): Observable<Structures.Interfaces.ICLResponse<ICompany[]>>
  {
    let path = `${this.CONTROLLER}/${_userId}/Companies`;

    if(_active !== undefined)
    {
      path += `?active=${_active}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<ICompany[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Compañías de usuario obtenidas',
          OnError: 'No se pudo obtener las compañias de usuario'
        })});
  }

  Post(_user: IUser): Observable<Structures.Interfaces.ICLResponse<IUser>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IUser>>(this.CONTROLLER, _user);
  }

  Patch(_user: IUser): Observable<Structures.Interfaces.ICLResponse<IUser>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IUser>>(this.CONTROLLER, _user);
  }

  GetRoleByUser(_user: number, _company: number): Observable<Structures.Interfaces.ICLResponse<IRole[]>> {

    let path =  `${this.CONTROLLER}/${_user}/Company/${_company}/Roles`;

    return this.http.get<Structures.Interfaces.ICLResponse<IRole[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Roles de usuario obtenidos',
          OnError: 'No se pudo obtener los roles de usuario'
        })})
  }

  PatchRoleByUser(_user: number, _company:number, _roles: IRole[]): Observable<Structures.Interfaces.ICLResponse<IRole[]>>
  {
    let path =  `${this.CONTROLLER}/${_user}/Company/${_company}/Roles`;
    return this.http.patch<Structures.Interfaces.ICLResponse<IRole[]>>(path, _roles);
  }

  GetUserByCompany(_id?: number):  Observable<Structures.Interfaces.ICLResponse<IUser[]>>{
    return this.http.get<Structures.Interfaces.ICLResponse<IUser[]>>(`${this.CONTROLLER}/UsersByCompany`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Usuarios por compañía obtenidos',
          OnError: 'No se pudo obtener los usuarios por compañía'
        })})
  }

  GetGeoRoleByUser(_user: number, _company: number): Observable<Structures.Interfaces.ICLResponse<IRole[]>> {

    let path =  `${this.CONTROLLER}/${_user}/Company/${_company}/GeoRoles`;

    return this.http.get<Structures.Interfaces.ICLResponse<IRole[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Geo roles de usuario obtenidos',
          OnError: 'No se pudo obtener los geo roles de usuario'
        })})
  }

  PatchGeoRoleByUser(_user: number, _company:number, _geoRoles: IGeoRole[]): Observable<Structures.Interfaces.ICLResponse<IGeoRole[]>>
  {
    let path =  `${this.CONTROLLER}/${_user}/Company/${_company}/GeoRoles`;
    return this.http.patch<Structures.Interfaces.ICLResponse<IRole[]>>(path, _geoRoles);
  }

}

