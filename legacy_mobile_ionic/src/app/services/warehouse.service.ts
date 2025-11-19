import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import {ICLResponse} from "../models/responses/response";
import {IWarehouse} from "../models/i-warehouse";
import {IPriceListInfo} from "../models/i-price-list-info";
import { IWarehouses } from '../interfaces/i-warehouse';
import { LocalStorageVariables } from '../common/enum';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  constructor(
      private http: HttpClient, 
      private localStorageService: LocalStorageService
  ) { }


  /**
   * Send a request to retrieves all warehouses
   * @returns 
   */
  GetWarehouses(): Observable<ICLResponse<IWarehouses[]>> 
  {
    return this.http.get<ICLResponse<IWarehouses[]>>('api/Warehouses', {
      headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetWarehouses')
    });
  }
}
