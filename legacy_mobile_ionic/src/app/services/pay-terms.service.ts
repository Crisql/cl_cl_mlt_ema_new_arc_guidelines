import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import { IPayTerms } from '../interfaces/i-pay-terms';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PayTermsService {
    
      private readonly CONTROLLER = 'api/PayTerms';
    
      constructor(private http: HttpClient,
      ) { }
    

    /**
     * Retrieves payment terms data from the API.
     *
     * @template T - The expected type of the response data.
     * @returns An Observable emitting the response wrapped in an ICLResponse object.
     */
      Get<T>(): Observable<ICLResponse<T>> {
        let path = this.CONTROLLER;
    
        return this.http.get<ICLResponse<T>>(path,{
          headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetPayTerms'),
        })
      }

      /**
       * Retrieves all payTerms for synchronization
       * @param _syncDate Represent the last synchronization date
       * @constructor
       */
      GetMobilePayTerms(): Observable<ICLResponse<IPayTerms[]>> 
      {
          return this.http.get<ICLResponse<IPayTerms[]>>('api/Mobile/PayTerms');
      }
}
