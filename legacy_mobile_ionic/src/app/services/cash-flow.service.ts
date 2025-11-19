import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IStructures} from "../interfaces/i-structures";
import {Observable} from "rxjs";
import {LocalStorageService} from "./local-storage.service";
import {LocalStorageVariables} from "../common/enum";
import {ICLResponse} from "../models/responses/response";
import {ITaxCodeDetermination} from "../models";
import {TranslateService} from "@ngx-translate/core";
import {DatePipe} from "@angular/common";
import {ICashFlow} from "../interfaces/i-cash-flow";

@Injectable({
    providedIn: 'root'
})
export class CashFlowService {
    private readonly URL = 'api/CashFlow';
    constructor(private http: HttpClient,
                private localStorageService: LocalStorageService,
                private translateService: TranslateService,
                private datePipe: DatePipe) { }

    /**
     * Posts the provided cash flow data to the API endpoint.
     * @param _data The cash flow data to be posted.
     * @returns An Observable of type ICLResponse<ICashFlow> representing the response from the API.
     */
    Post(_data: ICashFlow): Observable<ICLResponse<ICashFlow>>
    {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/CashFlow`;
        return this.http.post<ICLResponse<ICashFlow>>(URL,_data);
    }
}
