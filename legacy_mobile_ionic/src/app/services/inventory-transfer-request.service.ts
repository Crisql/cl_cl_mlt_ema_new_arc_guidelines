import { Injectable } from '@angular/core';
import {ISalesOrder} from "../interfaces/i-documents";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {LocalStorageVariables} from "../common/enum";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {IStockTransferRequest} from "../interfaces/i-stock-transfer-request";

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferRequestService {

  constructor(private localStorageService: LocalStorageService,
              private http: HttpClient,) { }

  /**
   * Create a transfer request
   * @param _document
   * @constructor
   */
  Post(_document: IStockTransferRequest): Observable<ICLResponse<IStockTransferRequest>> {
    let formData = new FormData();
    formData.append('Document', JSON.stringify(_document));
    let endPoint: string = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/InventoryTransferRequests`;
    return this.http.post<ICLResponse<IStockTransferRequest>>(endPoint, formData);
  }

  /**
   * Update a transfer request
   * @param _data
   * @constructor
   */
  Patch(_data: IStockTransferRequest): Observable<ICLResponse<IStockTransferRequest>> {
    let formData = new FormData();

    formData.append('Document', JSON.stringify(_data));
    return this.http.patch<ICLResponse<IStockTransferRequest>>('api/InventoryTransferRequests', formData);
  }

  /**
   * Obtains inventory records according to the type of document
   * @param _controller
   * @param _docNum
   * @param _slpCode
   * @param _dateInit
   * @param _dateEnd
   * @param _docStatus
   * @param _page
   * @param _pageSize
   * @constructor
   */
  GetDocuments<T>(_controller: string, _docNum: number, _slpCode: number, _dateInit: string, _dateEnd: string, _docStatus: string, _page: number, _pageSize: number): Observable<ICLResponse<T[]>> {
    const headers = new HttpHeaders({
      'Cl-Sl-Pagination-Page': `${_page}`,
      'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
    });
    return this.http.get<ICLResponse<T[]>>( `api/${_controller}`,{
      params:{
        DocNum: _docNum.toString(),
        DateInit: _dateInit,
        DateEnd: _dateEnd,
        SlpCode: _slpCode.toString(),
        DocStatus: _docStatus
      },
      headers: headers
    });
  }

  /**
   * Obtain the data of a transfer request
   * @param _docEntry
   * @param _accion
   * @constructor
   */
  Get(_docEntry: number, _accion: string): Observable<ICLResponse<IStockTransferRequest>> {
    return this.http.get<ICLResponse<IStockTransferRequest>>(`api/InventoryTransferRequests`,
        {
          params:{
            DocEntry: _docEntry.toString(),
            Accion: _accion
          }
        });
  }
  
}
