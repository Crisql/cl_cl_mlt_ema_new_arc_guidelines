import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map } from "rxjs/internal/operators/map";
import { ApiResponse, IMeasurementUnit, MeasurementUnitsResponse } from "src/app/models";
import { LocalStorageService } from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";

@Injectable({
  providedIn: "root",
})
export class MeasurementUnitService {
  constructor(
    private http: HttpClient
  ) {}

  /**
   * Retrieves all measurement units
   * @constructor
   */
  GetMeasurementUnits(): Observable<ICLResponse<IMeasurementUnit[]>> 
  {
    return this.http.get<ICLResponse<IMeasurementUnit[]>>("api/Mobile/MeasurementUnits");
  }
}
