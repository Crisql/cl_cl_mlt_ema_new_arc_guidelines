import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {PinPad, Structures} from "@clavisco/core";
import {formatDate} from "@angular/common";
import {IPPStoredTransactions} from "@app/interfaces/i-pp-transactions";
import {IUser} from "@app/interfaces/i-user";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class PPStoredTransactionService {

  private readonly CONTROLLER = 'api/PPStoredTransaction';

  private readonly PPURL = 'http://localhost:8083/';

  constructor(private http: HttpClient) { }

  Get<T>(_user: string, _companyId: number, _terminalId:string, _dateFrom: Date, _dateTo: Date): Observable<Structures.Interfaces.ICLResponse<IPPStoredTransactions[]>>
  {
    let path: string = this.CONTROLLER;

    path += `?user=${_user}&companyId=${_companyId}&terminalId=${_terminalId}&dateInit=${formatDate(_dateFrom, 'yyyy-MM-dd', 'en')}&dateEnd=${formatDate(_dateTo, 'yyyy-MM-dd', 'en')}`;

    return this.http.get<Structures.Interfaces.ICLResponse<IPPStoredTransactions[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Transacciones almacenadas obtenidas',
          OnError: 'No se pudo obtener las transacciones almacenadas'
        })});
  }

  Patch(_ppTransaction: IPPStoredTransactions): Observable<Structures.Interfaces.ICLResponse<IPPStoredTransactions>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IPPStoredTransactions>>(this.CONTROLLER, _ppTransaction);
  }

}
