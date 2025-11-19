import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ITerminals} from '../interfaces/i-terminals';
import {Observable} from 'rxjs';
import {Structures} from '@clavisco/core';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class TerminalsService {

  private readonly CONTROLLER: string = 'api/Terminals'

  constructor(
    private http: HttpClient
  ) {
  }

  public Get<T>(id: number = 0): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path: string = this.CONTROLLER;

    if (id > 0) {
      path = `${path}/${id}`
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Terminales obtenidas',
          OnError: 'No se pudo obtener las terminales'
        })});
  }

  public GetTerminalByCompany<T>(companyId: number = 0): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path: string = this.CONTROLLER;

    if (companyId > 0) {
      path = `${path}?companyId=${companyId}`
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Terminales por compañía obtenidas',
        OnError: 'No se pudo obtener las terminales por compañía'
      })
    });
  }

  public Post(terminals: ITerminals): Observable<Structures.Interfaces.ICLResponse<ITerminals>> {
    return this.http.post<Structures.Interfaces.ICLResponse<ITerminals>>(this.CONTROLLER, terminals);
  }

  public Patch(terminals: ITerminals): Observable<Structures.Interfaces.ICLResponse<ITerminals>> {
    return this.http.patch<Structures.Interfaces.ICLResponse<ITerminals>>(this.CONTROLLER, terminals);
  }


}
