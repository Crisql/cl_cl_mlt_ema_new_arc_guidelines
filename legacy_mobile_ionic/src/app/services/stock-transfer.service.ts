import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {IBinLocation} from "../interfaces/i-BinLocation";
import {IStockTransfer} from "../interfaces/i-stock-transfer";
import {Structures} from "../common/constants";
import {IWarehouseBinLocation} from "../interfaces/i-stock-transfer-request";
import {IDocument} from "../interfaces/i-documents";

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {

  constructor(private http: HttpClient,) { }

  /**
   * Gets the locations of an item
   * @param _whsCode
   * @param _itemCode
   * @constructor
   */
  public GetWarehousesBinLocation(_whsCode: string, _itemCode: string): Observable<ICLResponse<IWarehouseBinLocation[]>> {
    return this.http.get<ICLResponse<IWarehouseBinLocation[]>>(`api/StockTransfers`,
        {
          params:{
              WhsCode: _whsCode,
            ItemCode:_itemCode
          }
        });
  }
    /**
     * Send a request to the API to create an stock transfer
     * @param _data The information about stock transfer
     * @constructor
     */
    public Post(_data: IStockTransfer): Observable<ICLResponse<IStockTransfer>> {
        let formData = new FormData();
        formData.append('Document', JSON.stringify(_data));
        return this.http.post<ICLResponse<IStockTransfer>>(`api/StockTransfers`, formData);
    }

    /**
     * Send a request to the API to update an stock transfer
     * @param _document The information about stock transfer
     * @constructor
     */
    Patch(_document: IStockTransfer): Observable<ICLResponse<IStockTransfer>> {

        let formData = new FormData();

        formData.append('Document', JSON.stringify(_document));

        return this.http.patch<ICLResponse<IStockTransfer>>(`api/StockTransfers`, formData);
    }

    /**
     * Obtain the data of a stock transfer
     * @param _docEntry
     * @param _accion
     * @constructor
     */
    public Get(_docEntry: number, _accion: string): Observable<ICLResponse<IStockTransfer>> {
        return this.http.get<ICLResponse<IStockTransfer>>(`api/StockTransfers`,
            {
                params:{
                    DocEntry: _docEntry.toString(),
                    Accion: _accion
                }
            });
    }
    

}
