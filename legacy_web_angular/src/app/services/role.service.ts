import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Structures} from '@clavisco/core';
import {Observable} from 'rxjs';
import {IRole, IPermission} from '../interfaces/i-roles';
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly CONTROLLER = 'api/Roles';

  constructor(private http: HttpClient) {
  }

  Get<T>(_isActive = false,_id?: number,): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path = this.CONTROLLER;

    if (_id) {
      path += `/${_id}`;
    } else {
      path += `?active=${_isActive}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Roles obtenidos',
          OnError: 'No se pudo obtener los roles'
        })})
  }

  Post(_role: IRole): Observable<Structures.Interfaces.ICLResponse<IRole>> {
    return this.http.post<Structures.Interfaces.ICLResponse<IRole>>(this.CONTROLLER, _role);
  }

  Patch(_role: IRole): Observable<Structures.Interfaces.ICLResponse<IRole>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<IRole>>(this.CONTROLLER, _role);
  }

  GetPermissionsByRole(_id: number): Observable<Structures.Interfaces.ICLResponse<IPermission[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IPermission[]>>(`${this.CONTROLLER}/${_id}/Permissions`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Permisos de rol obtenidos',
          OnError: 'No se pudo obtener los permisos del rol'
        })});
  }

  UpdateRolePermissions(_id: number, _permission: IPermission[]): Observable<Structures.Interfaces.ICLResponse<IPermission[]>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IPermission[]>>(`${this.CONTROLLER}/${_id}/Permissions`, _permission);
  }
}
