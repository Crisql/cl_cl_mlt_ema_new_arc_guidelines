import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { concatMap, Observable, throwError } from 'rxjs';
import { ILicense } from '../interfaces/i-license';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class LicensesService {
  private readonly CONTROLLER = 'api/Licenses';
  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `/${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Licencias obtenidas',
          OnError: 'No se pudo obtener las licencias'
        })});
  }

  Post(_license: ILicense): Observable<Structures.Interfaces.ICLResponse<ILicense>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<ILicense>>(this.CONTROLLER, _license);
  }

  Patch(_license: ILicense): Observable<Structures.Interfaces.ICLResponse<ILicense>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<ILicense>>(this.CONTROLLER, _license);
  }
}
