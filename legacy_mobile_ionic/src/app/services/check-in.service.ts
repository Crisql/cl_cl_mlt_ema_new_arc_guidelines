import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {LocalStorageService} from "./local-storage.service";
import {ICLResponse} from '../models/responses/response';
import {LocalStorageVariables} from "../common/enum";
import {Observable} from "rxjs";
import {IRouteHistory} from "../interfaces/i-route-history";

@Injectable({
    providedIn: "root",
})
export class CheckInService {
    constructor(private http: HttpClient,
                private localStorageService: LocalStorageService) {
    }

    CreateCheckList(_checkinList: IRouteHistory[], _shouldIgnoreAlerts: boolean = false): Observable<ICLResponse<IRouteHistory[]>> 
    {
        return this.http.post<ICLResponse<IRouteHistory[]>>("api/RouteHistories", _checkinList, {
            headers: _shouldIgnoreAlerts ? new HttpHeaders({'cl-ignore-alerts': 'true'}) : undefined
        });
    }

    GetCheckListForCalculation(routeId: number): Observable<ICLResponse<IRouteHistory[]>> {
        return this.http.get<ICLResponse<IRouteHistory[]>>(`${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/RouteHistories/${routeId}`);
    }
}
