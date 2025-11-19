import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {HttpClient} from "@angular/common/http";
import {IPaydeskBalance, ISendClashClosingReport} from "../interfaces/i-PaydeskBalance";
import {formatDate} from "@angular/common";
import {DefineDescriptionHeader} from "@app/shared/shared.service";


@Injectable({
  providedIn: 'root'
})
export class CashClosingsService {

  private readonly CONTROLLER: string = 'api/CashClosings';

  constructor(private http: HttpClient) {
  }

  public Post<T>(_data: IPaydeskBalance): Observable<ICLResponse<T>> {
    return this.http.post<ICLResponse<T>>(this.CONTROLLER, _data);
  }

  public GetReport<T>(_url: string): Observable<ICLResponse<T>> {
    return this.http.get<ICLResponse<T>>(`${this.CONTROLLER}?url=${_url}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Reporte de cierre de caja obtenido',
          OnError: 'No se pudo obtener el reporte de cierre de caja'
        })});
  }

  public GetAll<T>(_user: string, _dateFrom: string, _dateTo: string): Observable<ICLResponse<T>> {
    let from = formatDate(_dateFrom,'yyyy-MM-dd','en');
    let to = formatDate(_dateTo,'yyyy-MM-dd','en');
    return this.http.get<ICLResponse<T>>(`${this.CONTROLLER}?user=${_user}&dateFrom=${from}&dateTo=${to}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Cierres de caja obtenidos',
          OnError: 'No se pudo obtener los cierres de caja'
        })});
  }

  public Send<T>(_data: ISendClashClosingReport): Observable<ICLResponse<T>> {
    return this.http.post<ICLResponse<T>>(`${this.CONTROLLER}/SendEmail`, _data);
  }
}
