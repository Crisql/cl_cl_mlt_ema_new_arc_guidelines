import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Structures} from '@clavisco/core';
import {Observable} from 'rxjs';
import {IPermission} from '../interfaces/i-roles';
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly CONTROLLER = 'api/Permissions';

  constructor(private http: HttpClient) {
  }

  Get<T>(_id?: number, _isActive = false): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    }else {
      path += `?active=${_isActive}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Permisos obtenidos',
          OnError: 'No se pudo obtener los permisos'
        })})
  }

  Post(_perm: IPermission): Observable<Structures.Interfaces.ICLResponse<IPermission>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IPermission>>(this.CONTROLLER, _perm);
  }

  Patch(_perm: IPermission): Observable<Structures.Interfaces.ICLResponse<IPermission>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IPermission>>(this.CONTROLLER, _perm);
  }

  GetFilteredPermissions(_searchCriteria: string, _shouldBeActive: boolean = false): Observable<ICLResponse<IPermission[]>> {
    return this.http.get<ICLResponse<IPermission[]>>(`${this.CONTROLLER}/Permissions?searchCriteria=${_searchCriteria}&shouldBeActive=${_shouldBeActive}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Permisos filtrados obtenidos',
          OnError: 'No se pudo obtener los permsos filtrados'
        })});
  }
}
