import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IBusinessPartnerGroup} from "@app/interfaces/i-business-partner";
import {DefineDescriptionHeader} from "@app/shared/shared.service";


@Injectable({
  providedIn: 'root'
})

export class BusinessPartnerGroupService {

  private readonly CONTROLLER = 'api/BusinessPartnerGroups';

  constructor(private http: HttpClient) {
  }

  Get(_groupType: string): Observable<ICLResponse<IBusinessPartnerGroup[]>> {
    return this.http.get<ICLResponse<IBusinessPartnerGroup[]>>(`${this.CONTROLLER}/BpGroupsByGroupType?GroupType=${_groupType}`, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Grupos de clientes obtenidos',
        OnError: 'No se pudo obtener los grupos de clientes'
      })
    })
  }
}
