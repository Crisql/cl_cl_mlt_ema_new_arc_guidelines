import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IChart} from "@app/interfaces/i-chart";

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  private readonly CONTROLLER = 'api/Charts';

  constructor(private http: HttpClient) {
  }

  /**
   * Retrieves charts
   * @returns {Observable<Structures.Interfaces.ICLResponse<IChart[]>>} An observable containing the API response with chart data.
   */
  GetCharts(): Observable<Structures.Interfaces.ICLResponse<IChart[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IChart[]>>(this.CONTROLLER)
  }

}
