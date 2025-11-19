import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {ICountry, IStates} from "@app/interfaces/i-country";
import {DefineDescriptionHeader} from "@app/shared/shared.service";


@Injectable({
  providedIn: 'root'
})
export class CountrysService {

  private readonly CONTROLLER = 'api/Countrys';

  constructor(private http: HttpClient) {
  }

  GetCountrys(): Observable<Structures.Interfaces.ICLResponse<ICountry[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<ICountry[]>>(this.CONTROLLER, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Paises obtenidos',
        OnError: 'No se pudo obtener los paises'
      })
    });
  }

  GetStates(_code: string): Observable<Structures.Interfaces.ICLResponse<IStates[]>> {
    return this.http.get<Structures.Interfaces.ICLResponse<IStates[]>>(`${this.CONTROLLER}?Country=${_code}`, {
      headers: DefineDescriptionHeader({
        OnSuccess: 'Estados obtenidos',
        OnError: 'No se pudo obtener los estados'
      })
    });
  }
}
