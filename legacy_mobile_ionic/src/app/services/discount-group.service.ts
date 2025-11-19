import {DatePipe} from "@angular/common";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";
import {ChangeElement, LocalStorageVariables} from "../common/enum";
import {IDiscountGroup} from "../models/db/discount-group";
import {Observable, of} from "rxjs";
import {IChangedInformation} from "../models/i-changed-information";

@Injectable({
    providedIn: "root",
})
export class DiscountGroupService {
    constructor(
        private http: HttpClient,
        private translateService: TranslateService,
        private localStorageService: LocalStorageService,
        private datePipe: DatePipe
    ) {
    }

    /**
     * Retrieves all discount groups from SAP
     * @param _syncDate Last sync date of discount groups
     * @constructor
     */
    GetDiscountGroups(_syncDate: string | Date = new Date(0)): Observable<ICLResponse<IDiscountGroup[]>> {
        return this.http.get<ICLResponse<IDiscountGroup[]>>('api/Mobile/DiscountGroups', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Retrieves tha count of all discount groups that was modified
     * @param _syncDate Last sync date of discount groups
     * @constructor
     */
    GetDiscountGroupsCount(_syncDate: string): Observable<ICLResponse<IChangedInformation>> {

        if(!_syncDate)
        {
            return of({
                Data: {
                    Type: ChangeElement.Discounts,
                    Count: 1
                }
            } as ICLResponse<IChangedInformation>);
        }
        
        return this.http.get<ICLResponse<IChangedInformation>>('api/Mobile/DiscountGroups/Count', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

}
