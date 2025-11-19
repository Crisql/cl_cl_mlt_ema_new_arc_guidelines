import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {ICLResponse} from "../models/responses/response";
import {IBillOfMaterial, IBillOfMaterialToSync} from "../interfaces/i-item";
import {DatePipe} from "@angular/common";
import {ChangeElement} from "../common/enum";
import {IChangedInformation} from "../models/i-changed-information";

@Injectable({
  providedIn: 'root'
})
export class BillOfMaterialsService {
  private readonly CONTROLLER: string = 'api/BillOfMaterials'; 

  constructor(private http: HttpClient,
              private datePipe: DatePipe) { }

  /**
   * Retrieves the required information of bill of materials to sync
   * @constructor
   */
  GetBillOfMaterialsToSync(_lastSyncDate: string | Date = new Date(0)): Observable<ICLResponse<IBillOfMaterialToSync[]>>
  {
    return this.http.get<ICLResponse<IBillOfMaterialToSync[]>>(`${this.CONTROLLER}/MobileSyncInfo`, {
      params: {
        LastUpdate: this.datePipe.transform(_lastSyncDate, 'yyyy-MM-dd HH:mm:ss')
      }
    })
  }

  /**
   * Retrieves the count of all bill of materials that was modified
   * @param _lastSyncDate Date of the last synchronization
   * @constructor
   */
  GetBillOfMaterialsToSyncCount(_lastSyncDate: string): Observable<ICLResponse<IChangedInformation>>
  {
    if(!_lastSyncDate)
    {
      return of({
        Data: {
          Type: ChangeElement.BillOfMaterials,
          Count: 1
        }
      } as ICLResponse<IChangedInformation>);
    }
    
    return this.http.get<ICLResponse<IChangedInformation>>(`${this.CONTROLLER}/MobileSyncInfo/Count`, {
      params: {
        LastUpdate: this.datePipe.transform(_lastSyncDate, 'yyyy-MM-dd HH:mm:ss')
      }
    })
  }
}
