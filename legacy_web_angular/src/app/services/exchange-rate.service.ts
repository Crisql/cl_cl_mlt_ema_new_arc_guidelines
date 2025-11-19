import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Structures} from '@clavisco/core';
import {concatMap, Observable, of} from 'rxjs';
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {CLModalType, ModalService} from "@clavisco/alerts";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly CONTROLLER = 'api/ExchangeRates';

  constructor(private http: HttpClient,
              private modalService: ModalService) { }

  Get<T>(): Observable<Structures.Interfaces.ICLResponse<T>> {
    return this.http.get<Structures.Interfaces.ICLResponse<T>>(this.CONTROLLER,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Consulta de tipo de cambio',
          OnError: 'No se pudo obtener el tipo de cambio'
        })}).pipe(
          concatMap(callback => {
            if(!callback.Data['Rate' as keyof object])
            {
              this.modalService.Continue({
                type: CLModalType.INFO,
                subtitle: 'No se ha definido el tipo de cambio'
              }).subscribe();

            }
            return of(callback);
          })
        )
  }

}
