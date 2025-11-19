import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {Observable} from "rxjs";
import {ITappCloseInvoice, ITappResponse} from "@app/interfaces/i-loyalty-plan";

@Injectable({
  providedIn: 'root'
})
export class TappService {

  private readonly CONTROLLER = 'api/Tapp';

  constructor(private http: HttpClient) {
  }

  CloseTappInvoice(_body: ITappCloseInvoice): Observable<ICLResponse<ITappResponse>> {
    return this.http.post<ICLResponse<ITappResponse>>(`${this.CONTROLLER}`, _body);
  }
}
