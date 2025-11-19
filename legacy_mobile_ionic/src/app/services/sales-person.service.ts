import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {HttpClient} from "@angular/common/http";
import {ISalesPerson} from "../interfaces/i-sales-person";

@Injectable({
  providedIn: 'root'
})
export class SalesPersonService {

  constructor(private http: HttpClient,) { }

  /**
   * Send a request to retrieves all sales person information
   * @constructor
   */
  GetCustomers(): Observable<ICLResponse<ISalesPerson[]>>
  {
    return this.http.get<ICLResponse<ISalesPerson[]>>('api/SalesMen');
  }
}
