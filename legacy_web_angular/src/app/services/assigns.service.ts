import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable} from 'rxjs';
import { IUserAssign } from '../interfaces/i-user';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class AssignsService {
  private readonly CONTROLLER = "api/Assigns";
  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `?assignId=${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener las asignaciones de usuarios',
        OnSuccess: 'Asignaciones de usuarios obtenidas'
      })})
  }

  GetUserByCompany<T>(_id: string, _idCompany: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `?UserId=${_id}&CompanyId=${_idCompany}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Usuarios por compañía obtenidos',
        OnError: 'No se puedieron obtener los usuarios por compañía'
      })})
  }

  Patch(_userAssign: IUserAssign): Observable<Structures.Interfaces.ICLResponse<IUserAssign>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IUserAssign>>(this.CONTROLLER, _userAssign);
  }
  Post(_userAssign: IUserAssign): Observable<Structures.Interfaces.ICLResponse<IUserAssign>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IUserAssign>>(this.CONTROLLER, _userAssign);
  }
}
