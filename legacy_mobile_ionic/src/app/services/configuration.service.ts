import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { AppConstants } from "src/app/common";
import {ApiResponse, CheckInTimeResponse, ISetting} from "src/app/models";
import { environment } from "src/environments/environment";
import { IChangedInformation } from "../models/i-changed-information";
import { LocalStorageService } from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";
import {IMobileAppConfiguration} from "../interfaces/i-settings";
import {LocalStorageVariables} from "../common/enum";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  constructor(
    public http: HttpClient,
    private localStorageService: LocalStorageService,
    private translateService: TranslateService
  ) {}

  GetURL(requestedWorkspace: string, source: string) {
    return new Promise((resolve) => {
      this.http
        .get(
          `${environment.accountManagerURL}api/Workspace/GetAccountURL?requestedWorkspace=${requestedWorkspace}&source=${source}`
        )
        .subscribe(
          (data: any) => {
            resolve(data);
          },
          (err) => {
            console.log(err);
            resolve(false);
          }
        );
    });
  }

  GetCheckInTime() {
    const url = `${this.localStorageService.data.get(
      "ApiURL"
    )}api/Company/GetCheckInTime?userId=${this.localStorageService.data.get(
      "UserId"
    )}&lang=${this.translateService.currentLang}`;
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        this.localStorageService.data.get("Session").access_token
      }`,
    });
    return this.http.get<CheckInTimeResponse>(url, { headers });
  }
  
  GetAppConfiguration(): Observable<ICLResponse<IMobileAppConfiguration[]>> {
    const url = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/Settings?Code=MobileAppConfiguration`

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${
          this.localStorageService.get(LocalStorageVariables.Session).access_token
      }`,
    });
    
    return this.http.get<ICLResponse<ISetting>>(url, { headers }).pipe(
        map(next => { 
          return { 
            Data: JSON.parse(next.Data.Json) as IMobileAppConfiguration[],
            Message: next.Message
          } as ICLResponse<IMobileAppConfiguration[]>;
        })
    );
  }

  GetChangesData(_changesData: IChangedInformation[]): Observable<ApiResponse<IChangedInformation[]>> {
    return this.http.post<ApiResponse<IChangedInformation[]>>(`${this.localStorageService.data.get("ApiURL")}api/Company/GetChangesCount`, _changesData);
  }
}
