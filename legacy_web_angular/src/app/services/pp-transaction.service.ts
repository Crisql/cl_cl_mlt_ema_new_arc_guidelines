import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {PinPad, Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import IVoidedTransaction = PinPad.Interfaces.IVoidedTransaction;
import {
  ICLTerminal,
  ICommitedVoidedTransaction, IFilterPPVoidTransaction,
  IVoidedTransactions
} from "../interfaces/i-pp-transactions";
import ICommitedTransaction = PinPad.Interfaces.ICommitedTransaction;
import {ITotalTransaction} from "@app/interfaces/i-PaydeskBalance";
import IResponse = Structures.Interfaces.IResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";


@Injectable({
  providedIn: 'root'
})
export class PPTransactionService {

  private readonly apiController: string = 'api/PPTransactions';
  private readonly servicePinpadController: string = 'PinpadService';

  constructor(private http: HttpClient) {

  }

  GetPPTransactionDetails(_documentKey: string): Observable<ICLResponse<IVoidedTransaction[]>> {
    return this.http.get<ICLResponse<IVoidedTransaction[]>>(`${this.apiController}/GetPPTransactionDetails?DocumentKey=${_documentKey}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Detalles de transacciones de PinPad obtenidas',
          OnError: 'No se pudo obtener los detalles de transacciones de PinPad'
        })});
  }

  Balance(_clTerminal: ICLTerminal):Observable<Structures.Interfaces.IResponse<string>>{
    return this.http.post<IResponse<string>>(`${this.servicePinpadController}/Banks/Balance`, _clTerminal);
  }

  PreBalance(_clTerminal: ICLTerminal): Observable<Structures.Interfaces.IResponse<string>> {
    return this.http.post<IResponse<string>>(`${this.servicePinpadController}/Banks/PreBalance`, _clTerminal);
  }

  GetCanceledTransactions(_data: IFilterPPVoidTransaction): Observable<ICLResponse<ICommitedVoidedTransaction[]>> {
    return this.http.post<ICLResponse<ICommitedVoidedTransaction[]>>(`${this.apiController}/GetCanceledTransactions`, _data,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Transacciones canceladas obtenidas',
          OnError: 'No se pudo obtener las transacciones canceladas'
        })});
  }

  GetPPTransactionByDocumentKey(_documentKey: string): Observable<ICLResponse<ICommitedTransaction[]>> {
    return this.http.get<ICLResponse<ICommitedTransaction[]>>(`${this.apiController}/GetPPTransactionByDocumentKey?DocumentKey=${_documentKey}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Transacciones de PinPad por documento obtenidas',
          OnError: 'No se pudo obtener las transacciones de PinPad por documento'
        })});
  }

  CommitCanceledCard(_voidedTransaction: IVoidedTransaction): Observable<ICLResponse<IVoidedTransactions>> {
    return this.http.post<ICLResponse<IVoidedTransactions>>(`${this.apiController}`, _voidedTransaction);
  }


  GetPPTransactionTotal(_terminalCode: string, _rate: number): Observable<ICLResponse<ITotalTransaction>> {
    return this.http.get<ICLResponse<ITotalTransaction>>(`${this.apiController}?TerminalCode=${_terminalCode}&ExchangeRate=${_rate}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Monto total de transaciones de PinPad obtenido',
          OnError: 'No se pudo obtener el monto total de las transacciones de PinPad'
        })});
  }
}
