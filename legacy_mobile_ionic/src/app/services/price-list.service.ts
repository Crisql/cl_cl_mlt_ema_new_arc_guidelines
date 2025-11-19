import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {ApiResponse} from 'src/app/models';
import {LocalStorageService} from './local-storage.service';
import {DatePipe} from '@angular/common';
import {ICLResponse} from "../models/responses/response";
import {IItem} from "../models/i-item";
import {IPriceList} from "../models/i-price-list";
import {IPriceListInfo} from "../models/i-price-list-info";
import {ChangeElement, LocalStorageVariables} from "../common/enum";
import {IChangedInformation} from "../models/i-changed-information";

@Injectable({
    providedIn: 'root'
})
export class PriceListService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private datePipe: DatePipe
    ) {
    }

    /**
     * Retrieves all price lists to synchronize
     * @param _syncDate
     * @constructor
     */
    GetPriceList(_syncDate: string | Date = new Date(0)): Observable<ICLResponse<IPriceList[]>> 
    {
        return this.http.get<ICLResponse<IPriceList[]>>('api/Mobile/PriceLists', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Retrieves the count of all price lists that was modified
     * @param _syncDate Date of last synchronization
     * @constructor
     */
    GetPriceListCount(_syncDate: string): Observable<ICLResponse<IChangedInformation>>
    {
        if(!_syncDate)
        {
            return of({
                Data: {
                    Type: ChangeElement.Prices,
                    Count: 1
                }
            } as ICLResponse<IChangedInformation>);
        }
        
        return this.http.get<ICLResponse<IChangedInformation>>('api/Mobile/PriceLists/Count', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Retrieves a single price lists information
     * @constructor
     */
    GetPriceListInfo(_priceListNum: number): Observable<ICLResponse<IPriceListInfo>>
    {
        return this.http.get<ICLResponse<IPriceListInfo>>('api/Mobile/PriceListsInfo', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetPriceListInfo'),
            params: {
                PriceListNum: _priceListNum.toString()
            }
        });
    }
    

    /**
     * Retrieves all price lists information
     * @constructor
     */
    GetPriceListsInfo(_lastSyncDate: string | Date = new Date(0)): Observable<ICLResponse<IPriceListInfo[]>> 
    {
        return this.http.get<ICLResponse<IPriceListInfo[]>>('api/Mobile/PriceListsInfo', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetPriceListsInfo'),
            params: {
                LastUpdate: this.datePipe.transform(_lastSyncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Retrieves the count of all price lists information modified
     * @constructor
     */
    GetPriceListsInfoCount(_lastSyncDate: string): Observable<ICLResponse<IChangedInformation>>
    {
        if(!_lastSyncDate)
        {
            return of({
                Data: {
                    Type: ChangeElement.PriceLists,
                    Count: 1
                }
            } as ICLResponse<IChangedInformation>);
        }
        
        return this.http.get<ICLResponse<IChangedInformation>>('api/Mobile/PriceListsInfo/Count', {
            params: {
                LastUpdate: this.datePipe.transform(_lastSyncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }
}
