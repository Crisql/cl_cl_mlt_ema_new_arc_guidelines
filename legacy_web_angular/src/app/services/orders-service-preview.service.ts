import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ISalesServicePreview, ITotalsPreviewSLDocument} from "@app/interfaces/i-orders-preview";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IDocument} from "@app/interfaces/i-sale-document";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class OrdersServicePreviewService {
  private readonly CONTROLLER: string = 'api/OrdersServicePreview';

  constructor(private http: HttpClient) { }
  Post(_sales: ISalesServicePreview): Observable<ICLResponse<ITotalsPreviewSLDocument>>{
    return this.http.post<ICLResponse<ITotalsPreviewSLDocument>>(`${this.CONTROLLER}`, _sales);
  }

}
