import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {PinPad, Structures} from "@clavisco/core";
import {formatDate} from "@angular/common";
import {
  IACQTransaction,
  ICommittedTransaction,
  IPPBalance,
  IPPCashDeskClosing
} from "@app/interfaces/i-pp-transactions";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class BalancesService {
  private readonly CONTROLLER: string = 'api/Balances';

  constructor(private http: HttpClient) {
  }

  Get(_terminalId: string,_transactionType: string, _dateFrom: Date, _dateTo: Date): Observable<Structures.Interfaces.ICLResponse<ICommittedTransaction[]>> {
    let path: string = `${this.CONTROLLER}?From=${formatDate(_dateFrom, 'yyyy/MM/dd', 'en')}&To=${formatDate(_dateTo, 'yyyy/MM/dd', 'en')}&TerminalId=${_terminalId}&DocumentType=${_transactionType}`;

    return this.http.get<Structures.Interfaces.ICLResponse<ICommittedTransaction[]>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener las transacciones',
        OnSuccess: 'Transacciones obtenidas'
      })});
  }
  Balances(_data: IPPCashDeskClosing): Observable<ICLResponse<ICommittedTransaction[]>> {
    return this.http.post<ICLResponse<ICommittedTransaction[]>>(`${this.CONTROLLER}`, _data);
  }

}

