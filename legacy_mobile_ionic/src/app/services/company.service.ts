import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs/internal/Observable";
import {map} from "rxjs/operators";
import {
    ApiResponse,
    ICompanyInformation,
    CompanyResponse, CompanyUDF,
    CompanyUDFsResponse,
    ICurrency,
    ISetting,
} from "src/app/models";
import {LocalStorageService} from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";
import {ICompany} from "../models/db/companys";
import {LocalStorageVariables} from "../common/enum";
import {IUserToken} from "../models/db/user-token";
import {IUdfCategory, IUdfContext} from "../interfaces/i-udfs";

@Injectable({
    providedIn: "root",
})
export class CompanyService {
    constructor(
        private localStorageService: LocalStorageService,
        private translateService: TranslateService,
        private http: HttpClient
    ) {
    }

    /**
     * Send a request to retrieves the company information
     * @constructor
     */
    GetCompanyInformation(): Observable<ICLResponse<ICompanyInformation>> 
    {
        return this.http.get<any>('api/Mobile/CompanyInformation', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetCompanyInformation'),
        });
    }

    GetCompany() {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${
                this.localStorageService.data.get("Session").access_token
            }`,
        });

        return this.http.get<CompanyResponse>(
            `${this.localStorageService.data.get(
                "ApiURL"
            )}api/Company/GetCompanybyUserMapId?userMapId=${
                this.localStorageService.data.get("Session").userMappId
            }&lang=${this.translateService.currentLang}`,
            {headers}
        );
    }

    GetCompanyUDFs(): Observable<CompanyUDFsResponse> {
        return this.http.get<CompanyUDFsResponse>(
            `${this.localStorageService.data.get("ApiURL")}api/Udfs`,
        );
    }
    
    GetKeyReportManager() {
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${
                this.localStorageService.data.get("Session").access_token
            }`,
        });

        return this.http.get<ApiResponse<number>>(
            `${this.localStorageService.data.get(
                "ApiURL"
            )}api/Company/GetKeyReportManager`,
            {headers}
        );
    }

    /**
     * Send a request to retrieve a collection of currencies
     * @param _includeAllCurrencies Indicates is all currencies should be retrieve
     * @constructor
     */
    GetCurrencies(_includeAllCurrencies: boolean = false): Observable<ICLResponse<ICurrency[]>> {
        return this.http.get<ICLResponse<ICurrency[]>>('api/Currencies', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetCurrencies'),
            params: {
                IncludeAllCurrencies: _includeAllCurrencies.toString()
            }
        });
    }

    GetSettings(): Observable<ApiResponse<ISetting[]>> {
        const URL = `${this.localStorageService.data.get("ApiURL")}api/Settings/GetSettings`;
        return this.http.get<ApiResponse<ISetting[]>>(URL);
    }
}
