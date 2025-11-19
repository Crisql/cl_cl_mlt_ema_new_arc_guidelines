import {Injectable} from "@angular/core";
import {Observable} from "rxjs/internal/Observable";
import {LocalStorageService} from "./local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ICLResponse} from "../models/responses/response";
import {ISetting} from "../models";
import {SettingCodes} from "../common/enum";


@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    constructor(private http: HttpClient) {
    }

    /**
     * Retrieve a setting by his code
     * @param _code The code of the setting to retrieve
     * @constructor
     */
    GetSettingByCode(_code: SettingCodes): Observable<ICLResponse<ISetting>> {
        return this.http.get<ICLResponse<ISetting>>('api/Settings', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", `GetConfiguration`),
            params: {
                Code: _code
            }
        });
    }

    /**
     * Retrieve list of settings configurations
     * @constructor
     */
    GetSettings(): Observable<ICLResponse<ISetting[]>> {
        return this.http.get<ICLResponse<ISetting[]>>('api/Settings',{
            headers: new HttpHeaders().set("cl-offline-function-to-run", `GetAllConfigurations`),
        });
    }
}