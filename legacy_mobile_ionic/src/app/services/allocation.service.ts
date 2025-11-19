import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/models';
import { IBin, IBinStock } from 'src/app/models/db/i-bin';
import { IBasicBatch } from 'src/app/models/db/product-model';
import { LocalStorageService } from './local-storage.service';
import {ICLResponse} from "../models/responses/response";
import {LocalStorageVariables} from "../common/enum";
import {IBinLocation} from "../interfaces/i-BinLocation";

@Injectable({
  providedIn: 'root'
})
export class AllocationService {

  constructor(
    private http: HttpClient, 
    private localStorageService: LocalStorageService
  ) { }

  /**
   * This method obtained el stock de un item and for bin location
   * @param _itemCode
   * @param _whsCode
   * @constructor
   */
  GetAllocations(_itemCode: string, _whsCode: string): Observable<ICLResponse<IBinLocation[]>> {
    const url = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/BinLocations?itemCode=${encodeURIComponent(_itemCode)}&WhsCode=${_whsCode}`;
    return this.http.get<ICLResponse<IBinLocation[]>>(url,);
  }

  GetItemBatchAllocations(_docType: number, _batches: IBasicBatch[]): Observable<ICLResponse<IBinStock[]>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.localStorageService.data.get('Session').access_token}`
    });

    const url = `${this.localStorageService.data.get('ApiURL')}api/Mobile/Allocations`;

    return this.http.post<ICLResponse<IBinStock[]>>(url, _batches, { headers });
  }

  /**
   * This method obtained the location for warehouse code
   * @param _whsCode
   * @constructor
   */
  GetLocationForTransfer(_whsCode: string): Observable<ICLResponse<IBinLocation[]>> {
    const url = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/BinLocations`;
    return this.http.get<ICLResponse<IBinLocation[]>>(url, {
      params:{
        WhsCode: _whsCode
      }
    });
  }

}
