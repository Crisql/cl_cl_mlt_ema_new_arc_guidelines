import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {IBinLocation} from "../interfaces/i-BinLocation";
import {IBatch} from "../models";
import {IBatches} from "../models/db/product-model";

@Injectable({
  providedIn: 'root'
})
export class BatchesService {

  constructor(private http: HttpClient,) { }

  /**
   * Gets the batches of an item
   * @param _whsCode
   * @param _itemCode
   * @constructor
   */
  public GetBatchesForTransfer(_itemCode: string, _whsCode: string, _binAbs: number): Observable<ICLResponse<IBatches[]>> {
    return this.http.get<ICLResponse<IBatches[]>>(`api/Batches`,
        {
          params:{
              ItemCode: encodeURIComponent(_itemCode),
              WhsCode: _whsCode,
              BinAbs: _binAbs.toString()
          }
        });
  }
}
