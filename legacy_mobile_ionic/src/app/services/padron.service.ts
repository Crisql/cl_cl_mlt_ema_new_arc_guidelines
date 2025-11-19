import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConstants } from "src/app/common";
import { LocalStorageService } from "./local-storage.service";
import {LocalStorageVariables} from "../common/enum";
import {Observable} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {IFeData} from "../interfaces/i-feData";

@Injectable({
  providedIn: "root",
})
export class PadronService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  /**
   * This methos is used for obtained fe data
   * @param _identification
   */
  GetPadronInfo(_identification: string): Observable<ICLResponse<string>> {
    let baseUrl = this.localStorageService.get(LocalStorageVariables.ApiURL)
    return this.http.get<ICLResponse<string>>(`${baseUrl}api/Padron?Identification=${_identification}`,
    );
  }

  /**
   * Retrieves data from the Hacienda API based on the provided identification number.
   * @param _identification The identification number to query.
   * @returns An Observable containing the API response.
   */
  Get(_identification: string): Observable<IFeData>
  {

    return this.http.get<IFeData>(`https://api.hacienda.go.cr/fe/ae`,
        {
          params:{
            identificacion: _identification
          }
        });
  }
}
