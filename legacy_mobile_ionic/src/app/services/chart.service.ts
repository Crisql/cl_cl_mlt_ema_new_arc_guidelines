import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiResponse} from 'src/app/models';
import {IChart} from 'src/app/models/db/i-chart';
import {LocalStorageService} from './local-storage.service';
import {LocalStorageVariables} from "../common/enum";
import {ICLResponse} from "../models/responses/response";

@Injectable({
    providedIn: 'root'
})
export class ChartService {

    private readonly CONTROLLER = 'api/Mobile';

    constructor(private http: HttpClient) {
    }

    /**
     * Retrieves a list of available charts from the backend API.
     *
     * @returns An `Observable` containing an `ICLResponse` with an array of `IChart` objects.
     */
    GetCharts(): Observable<ICLResponse<IChart[]>> {
        return this.http.get<ICLResponse<IChart[]>>(`${this.CONTROLLER}/Charts`,{
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetCharts'),
        });
    }
}
