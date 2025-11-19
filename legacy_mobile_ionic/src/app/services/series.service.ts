import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {map} from "rxjs/internal/operators/map";
import {ApiResponse, Serie, SeriesRespose} from "src/app/models";
import {LocalStorageService} from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";
import {LocalStorageVariables} from "../common/enum";
import {ISerialType, ISeries} from "../interfaces/i-serie";

@Injectable({
    providedIn: "root",
})
export class SeriesService {
    constructor(
        public http: HttpClient,
        private translateService: TranslateService,
        private localStorageService: LocalStorageService
    ) {
    }

    /**
     * This method is used to get series by current user
     * @constructor
     */
    GetSeriesByUser(): Observable<ICLResponse<ISeries[]>> 
    {
        let userAssigmentId = this.localStorageService.get(LocalStorageVariables.UserAssignment)?.Id ?? 0;
        
        let companyId = this.localStorageService.get(LocalStorageVariables.SelectedCompany)?.Id ?? 0;
        
        return this.http.get<ICLResponse<ISeries[]>>('api/Mobile/UserSeries', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetNumberingSeries'),
            params: {
                userId: userAssigmentId.toString(),
                companyId: companyId.toString()
            }
        });
    }

    /**
     * Get the series type for creating business partners
     * @param _userAssingId
     * @param _objectType
     * @param _companyId
     * @constructor
     */
    GetIsSerial(_userAssingId: number, _objectType: number, _companyId: number): Observable<ICLResponse<ISerialType>> {
        return this.http.get<ICLResponse<ISerialType>>(`api/Series`,
            {
               params:{
                   userAssingId: _userAssingId.toString(),
                   objectType: _objectType.toString(),
                   companyId: _companyId.toString()
               }
            });
    }
}
