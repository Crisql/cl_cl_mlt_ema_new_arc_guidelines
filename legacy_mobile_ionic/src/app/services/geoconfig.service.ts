import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {IGeoConfig, GeoConfigsResponse} from 'src/app/models';
import { LocalStorageService } from './local-storage.service';
import {ICLResponse} from "../models/responses/response";
import {IPermission} from "../models/db/permissions";
import {Geoconfigs, LocalStorageVariables} from "../common/enum";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GeoconfigService {

  constructor(private http: HttpClient,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService) { }

  /**
   * This method is used to get geo configs by users
   * @constructor
   */
  GetGeoConfigurations():Observable<ICLResponse<IGeoConfig[]>> {
    const userId: number = this.localStorageService.get(LocalStorageVariables.Session)?.UserId ?? 0;
    
    const companyId: number = this.localStorageService.get(LocalStorageVariables.SelectedCompany)?.Id ?? 0
    
    return this.http.get<ICLResponse<IGeoConfig[]>>(`api/Users/${userId}/Company/${companyId}/GeoConfigs`, {
      headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetGeoConfigurations')
    });
  }
}
