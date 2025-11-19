import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Structures} from '@clavisco/core';
import {Observable} from 'rxjs';
import {ISerialType, ISerie, ISerieAssing, ISerieAssingWithFESerie} from '../interfaces/i-serie';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class SeriesService {

  private readonly CONTROLLER = 'api/Series';

  constructor(private http: HttpClient) {
  }

  Get<T>(_id?: string, _companyId?: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path: string = this.CONTROLLER;

    if (_id && _companyId) {
      path += `?ObjectCode=${_id}&CompanyId=${_companyId}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {
        headers: DefineDescriptionHeader({
          OnError: 'No se pudo obtener las series de numeración',
          OnSuccess: 'Series de numeración obtenidas'
        })
      });
  }

  GetSeriesByUser<T>(_userAssingId?: number, _companyId?: number): Observable<Structures.Interfaces.ICLResponse<T>> {
    let path: string = this.CONTROLLER;

    if (_userAssingId && _companyId) {
      path += `?userId=${_userAssingId}&companyId=${_companyId}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Series de numeración por usuario obtenidas',
          OnError: 'No se pudo obtener las series de numeración'
        })
      });
  }

  Post(_serieAssing: ISerieAssingWithFESerie): Observable<Structures.Interfaces.ICLResponse<ISerieAssingWithFESerie>> {

    return this.http.post<Structures.Interfaces.ICLResponse<ISerieAssingWithFESerie>>(this.CONTROLLER, _serieAssing);
  }

  Patch(_idSerie: number): Observable<Structures.Interfaces.ICLResponse<ISerieAssing>> {
    let path = this.CONTROLLER + `?serieId=${_idSerie}`;

    return this.http.delete<Structures.Interfaces.ICLResponse<ISerieAssing>>(path);
  }

  GetIsSerial(_userAssingId: number, _objectType: number, _companyId: number): Observable<Structures.Interfaces.ICLResponse<ISerialType>> {
    return this.http.get<Structures.Interfaces.ICLResponse<ISerialType>>(`${this.CONTROLLER}?userAssingId=${_userAssingId}&objectType=${_objectType}&companyId=${_companyId}`,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Configuración de tipo de serie obtenida',
          OnError: 'No se pudo obtener el tipo de serie'
        })
      });
  }
}
