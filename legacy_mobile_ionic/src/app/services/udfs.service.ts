import { Injectable } from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";
import { ICLResponse } from "../models/responses/response";
import { LocalStorageService } from "./local-storage.service";
import {IFilterKeyUdf, IUdf, IUdfCategory, IUdfContext, IUdfDevelopment} from "../interfaces/i-udfs";
import { LocalStorageVariables } from "../common/enum";


@Injectable({
    providedIn: 'root'
})
export class UdfsService {

    private readonly CONTROLLER: string = 'api/Udfs/';

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) {
    }

    /**
     * Send a request to retrieve all udfs (configured | not configured)
     * @param _category The SAP table name where the UDFs exist
     * @param _isUdfLine Indicates if should request the lines of the Category table
     * @param _configured Indicates if the UDFs should have configured
     * @constructor
     */
    public Get(_category: string, _isUdfLine: boolean = false, _configured: boolean = true, _ignoreAlerts: boolean = false): Observable<ICLResponse<IUdfContext[]>> {
        
        let headers = new HttpHeaders().set("cl-offline-function-to-run", 'GetUdfs');
        
        if(_ignoreAlerts)
        {
            headers.set("cl-ignore-alerts", _ignoreAlerts.toString())
        }
        
        return this.http.get<ICLResponse<IUdfContext[]>>(this.CONTROLLER, {
            headers: headers,
            params: {
                Category: _category,
                IsUdfLine: _isUdfLine.toString(),
                Configured: _configured.toString()
            }
        });
    }

    GetCategoriesUdfs(): Observable<ICLResponse<IUdfCategory[]>> {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}`;
        return this.http.get<ICLResponse<IUdfCategory[]>>(`${URL}api/Udfs/Categories`);
    }

    /**
     * This method is used for obtained data udfs
     * @param _filter
     */
    public GetUdfsData(_filter: IFilterKeyUdf): Observable<ICLResponse<IUdf[]>> {
        let baseUrl: string = this.localStorageService.get(LocalStorageVariables.ApiURL);
        return this.http.post<ICLResponse<IUdf[]>>(`${baseUrl}${this.CONTROLLER}GetUdfsData`, _filter);
    }

    /**
     * This method is for obtained of the data udfsdevelopement
     * @param _table SAP Table where udfs are
     */
    public GetUdfsDevelopment(_table: string, _ignoreAlerts: boolean = false): Observable<ICLResponse<IUdfDevelopment[]>> {

        let headers = new HttpHeaders().set("cl-offline-function-to-run", 'GetDevelopmentUdfs');

        if(_ignoreAlerts)
        {
            headers.set("cl-ignore-alerts", _ignoreAlerts.toString())
        }
        
        return this.http.get<ICLResponse<IUdfDevelopment[]>>(`${this.CONTROLLER}/UdfsDevelopment`, {
            headers: headers,
            params: {
                Table: _table
            }
        });
    }
}