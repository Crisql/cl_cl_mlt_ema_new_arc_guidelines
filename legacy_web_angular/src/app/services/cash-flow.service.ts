import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {ICashFlow} from "@app/interfaces/i-cash-flow";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {

  private readonly CONTROLLER = `api/CashFlow`;
  constructor(private http: HttpClient) {
  }

  Post(_data: ICashFlow): Observable<ICLResponse<ICashFlow>> {
    return this.http.post<ICLResponse<ICashFlow>>(this.CONTROLLER, _data);
  }
}
