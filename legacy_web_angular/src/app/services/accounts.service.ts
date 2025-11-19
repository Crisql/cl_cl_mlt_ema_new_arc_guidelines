import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private readonly CONTROLLER = 'api/Accounts';

  constructor(private http: HttpClient) { }

  Get<T>(_store: string): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER + `?Store=${_store}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Cuentas obtenidas',
        OnError: 'No se pudo obtener las cuentas'
      })});
  }

  GetAccount<T>(_account: string): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER + `?Account=${_account}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Cuenta obtenida',
        OnError: 'No se pudo obtener la cuenta'
      })});
  }



}
