import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {LocalStorageService} from './local-storage.service';
import {ICLResponse} from "../models/responses/response";
import {ICard} from "../models/i-card";
import {DatePipe} from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class CardService {

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private datePipe: DatePipe
    ) {
    }

    /**
     * Send a request to retrieves all cards
     * @constructor
     */
    GetCards(): Observable<ICLResponse<ICard[]>> {
        return this.http.get<ICLResponse<ICard[]>>('api/Mobile/Cards', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetCards'),
            params: { LastUpdate: this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss') }
        });
    }
}
