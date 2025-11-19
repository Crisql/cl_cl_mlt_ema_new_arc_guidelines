import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {IDocumentsActivities} from "@app/interfaces/i-activities";
import {ISAPUsers} from "@app/interfaces/i-SAP-Users";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class SAPUsersService {

  private readonly CONTROLLER: string = 'api/SAPUsers';

  constructor(private http: HttpClient) {
  }

  /**
   *
   * @constructor
   */
  GetSAPUsers(): Observable<ICLResponse<ISAPUsers[]>> {
    return this.http.get<ICLResponse<ISAPUsers[]>>(`${this.CONTROLLER}`,
      {
        headers:
          DefineDescriptionHeader({
              OnSuccess: 'Usuarios de SAP obtenidos',
              OnError: 'No se puedieron obtener los usuarios de SAP'
            }
          )
      });
  }

}
