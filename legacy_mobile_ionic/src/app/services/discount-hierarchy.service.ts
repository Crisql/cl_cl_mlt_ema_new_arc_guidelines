import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {map} from "rxjs/internal/operators/map";
import {ApiResponse, DiscountHierarchiesResponse, DiscountHierarchy} from "src/app/models";
import {LocalStorageService} from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";

@Injectable({
    providedIn: "root",
})
export class DiscountHierarchyService {
    constructor(
        private http: HttpClient,
        private localStoraService: LocalStorageService,
        private translateService: TranslateService
    ) {
    }

    /**
     * Send a request to retrieves all discount hierarchies
     * @constructor
     */
    GetDiscountHierarchies(): Observable<ICLResponse<DiscountHierarchy[]>> 
    {
        return this.http.get<ICLResponse<DiscountHierarchy[]>>('api/DiscountHierarchies', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetDiscountHierarchies'),
        });
    }
}
