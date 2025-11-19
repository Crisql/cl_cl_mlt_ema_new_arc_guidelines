import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ApiResponse, ExchangeRateResponse, IExchangeRate } from 'src/app/models';
import { CommonService } from './common.service';
import { LocalStorageService } from './local-storage.service';
import {ICLResponse} from "../models/responses/response";
import {UpcomingExchangeRate} from "../models/db/i-exchange.rate";

@Injectable({
  providedIn: 'root'
})
export class ExRateService {

  constructor(private localStorageService: LocalStorageService,
    private http: HttpClient,
    private translateService: TranslateService,
    private commonService: CommonService) { }

  /**
   * Send a request to retrieves the exchange rate
   * @constructor
   */
  GetExchangeRate():  Observable<ICLResponse<IExchangeRate>>  
  {
    const url = `${this.localStorageService.data.get('ApiURL')}api/ExchangeRates`
    
    return this.http.get<ICLResponse<IExchangeRate>>(url, { 
      headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetExchangeRate')
    });
  }

  /**
   * Send a request to rates for the next 30 days
   * @constructor
   */
  GetUpcomingExchangeRate():  Observable<ICLResponse<UpcomingExchangeRate[]>>
  {
    const url = `${this.localStorageService.data.get('ApiURL')}api/ExchangeRates/UpcomingExchangeRate`

    return this.http.get<ICLResponse<UpcomingExchangeRate[]>>(url);
  }
}
