import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {IBatches} from "@app/interfaces/i-serial-batch";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})

export class BatchesService {
  private readonly CONTROLLER = 'api/Batches';

  constructor(private http: HttpClient) {
  }

  Get<T>(_itemCode: string, _WhsCode: string): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path = `${this.CONTROLLER}?itemCode=${encodeURIComponent(_itemCode)}&WhsCode=${_WhsCode}`;

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Lotes obtenidos',
          OnError: 'No se pudo obtener los lotes'
        })});
  }

  GetBatchesForTransfer(_itemCode: string, _WhsCode: string, _binAbs: number): Observable<ICLResponse<IBatches[]>> {
    return this.http.get<ICLResponse<IBatches[]>>(`${this.CONTROLLER}?ItemCode=${encodeURIComponent(_itemCode)}&WhsCode=${_WhsCode}&BinAbs=${_binAbs}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Lotes para transferencia obtenidos',
          OnError: 'No se pudo obtener los lotes para transferencia'
        })});
  }

}
