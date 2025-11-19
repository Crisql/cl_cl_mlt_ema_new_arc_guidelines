import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IInfoAccumulatedPointsDataUI, IInvoicePointsBase, IInvoiceRedeemPoint} from "@app/interfaces/i-loyalty-plan";

@Injectable({
  providedIn: 'root'
})
export class LealtoService {

  private readonly CONTROLLER = 'api/Lealto';

  constructor(private http: HttpClient) {
  }

  AccumulatePoints(_data: IInvoicePointsBase): Observable<ICLResponse<IInfoAccumulatedPointsDataUI>> {
    return this.http.post<ICLResponse<IInfoAccumulatedPointsDataUI>>(`${this.CONTROLLER}`, _data)
  }

  RedeemPoints(_data: IInvoiceRedeemPoint): Observable<ICLResponse<IInfoAccumulatedPointsDataUI>> {
    return this.http.post<ICLResponse<IInfoAccumulatedPointsDataUI>>(`${this.CONTROLLER}/Redimir`, _data)
  }
}
