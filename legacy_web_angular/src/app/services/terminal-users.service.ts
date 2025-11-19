import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IPPTerminalUser, ITerminals, ITerminalsByUser} from "../interfaces/i-terminals";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class TerminalUsersService {

  private readonly CONTROLLER: string = 'api/TerminalUsers';
  constructor(
    private http: HttpClient
  ) {
  }

  public Get<T>(id: number = 0,companyId: number = 0): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path: string = this.CONTROLLER;

    if (id > 0) {
      path = `${path}?id=${id}&companyId=${companyId}`
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Terminales de usuario obtenidas',
          OnError: 'No se pudo obtener las terminales de usuario'
        })});
  }

  public Post(terminals: IPPTerminalUser): Observable<Structures.Interfaces.ICLResponse<ITerminalsByUser>> {
    return this.http.post<Structures.Interfaces.ICLResponse<ITerminalsByUser>>(this.CONTROLLER, terminals);
  }

  public GetTerminals<T>(): Observable<Structures.Interfaces.ICLResponse<T>> {

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(`${this.CONTROLLER}/TerminalByUserCompany`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Terminales de usuario por compañía obtenidas',
          OnError: 'No se pudo obtener las temerminales de usuario por compañía'
        })});
  }
  public TerminalsByPermissionByUser<T>(): Observable<Structures.Interfaces.ICLResponse<T>> {

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(`${this.CONTROLLER}/TerminalsByPermissionByUser`, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Terminales de usuario por compañía obtenidas',
        OnError: 'No se pudo obtener las terminales de usuario por compañía'
      })
    });
  }
}
