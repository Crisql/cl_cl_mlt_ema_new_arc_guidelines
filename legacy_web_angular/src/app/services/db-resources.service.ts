import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { Observable } from 'rxjs';
import { IDBResource, IDBResourceType, IDBResourceWithCompany } from '../interfaces/i-db-resource';
import { DefineDescriptionHeader } from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class DbResourcesService {
  private readonly CONTROLLER = 'api/DBResources';
  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Recursos de base de datos obtenidos',
          OnError: 'No se pudo obtener los recursos de base de datos'
        })
      });
  }
  GetResourceByCompany(_recordId: number, _companyId: number): Observable<Structures.Interfaces.ICLResponse<IDBResource>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IDBResource>>(`${this.CONTROLLER}/${_recordId}/Company/${_companyId}`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Recurso de base de datos por compañía obtenido',
          OnError: 'No se pudo obtener el recurso de base de datos'
        })
      });
  }

  GetResourcesByCompany(_companyId: number): Observable<Structures.Interfaces.ICLResponse<IDBResource[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IDBResource[]>>(`${this.CONTROLLER}/Company/${_companyId}`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Recursos de base de datos por compañía obtenidos',
          OnError: 'No se pudo obtener los recursos de base de datos por compañía'
        })
      });
  }

  Post(_dbResource: IDBResourceWithCompany): Observable<Structures.Interfaces.ICLResponse<IDBResourceWithCompany>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IDBResourceWithCompany>>(this.CONTROLLER, _dbResource);
  }

  Patch(_dbResource: IDBResource): Observable<Structures.Interfaces.ICLResponse<IDBResource>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IDBResource>>(this.CONTROLLER, _dbResource);
  }

  PatchDBResource(_dbResource: IDBResource): Observable<Structures.Interfaces.ICLResponse<IDBResource>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IDBResource>>(`${this.CONTROLLER}/PatchDBResource`, _dbResource);
  }
  
  PostDBResource(_dbResource: IDBResource): Observable<Structures.Interfaces.ICLResponse<IDBResource>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IDBResource>>(`${this.CONTROLLER}/PostDBResource`, _dbResource);
  }

  GetTypes(): Observable<Structures.Interfaces.ICLResponse<IDBResourceType[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IDBResourceType[]>>(`${this.CONTROLLER}/Types`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Tipos de recursos de base de datos obtenidos',
          OnError: 'No se pudo obtener los tipos de recursos de base de datos'
        })
      });
  }
}
