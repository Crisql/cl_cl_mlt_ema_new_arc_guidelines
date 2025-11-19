import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {map} from "rxjs/internal/operators/map";
import {ApiResponse, ITaxCodeDetermination} from "src/app/models";
import {LocalStorageService} from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";
import {ITax} from "../models/i-tax";
import {IWarehouse} from "../models/i-warehouse";
import {MobileTaxCode} from "../models/db/itax-code-determination";
import {LocalStorageVariables} from "../common/enum";
import {DatePipe} from "@angular/common";
import {ISalesTaxes} from "../interfaces/i-sales-taxes";

@Injectable({
    providedIn: "root",
})
export class TaxService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private translateService: TranslateService,
        private datePipe: DatePipe
    ) {
    }

    /**
     * Send a request to retrieves all taxes
     * @constructor
     */
    GetTaxes(): Observable<ICLResponse<ISalesTaxes[]>> 
    {
        return this.http.get<ICLResponse<ISalesTaxes[]>>('api/SalesTaxCodes', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetTaxes'),
        });
    }

    public GetTaxCodesDetermination(): Observable<ICLResponse<ITaxCodeDetermination[]>> {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/Mobile/GetMobileTaxCodeDeterminations?LastUpdate=${this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
        return this.http.get<ICLResponse<ITaxCodeDetermination[]>>(URL,);
    }

    public GetTaxCodeDetermination(_itemCode: string): Observable<ICLResponse<MobileTaxCode>> {
        const CARD_CODE = this.localStorageService.get('cardCode');
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/Mobile/TaxCodeDetermination?ItemCode=${_itemCode}&CardCode=${CARD_CODE}`;
        return this.http.get<ICLResponse<MobileTaxCode>>(URL,);
    }
}


