import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {
  IFilterKeyUdf,
  IUdf,
  IUdfDevelopment,
  IUdfGroup,
  IUdfTransfer,
  UdfSource,
  UdfSourceLine
} from "../interfaces/i-udf";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class UdfsService {

  private readonly CONTROLLER: string = 'api/Udfs'

  constructor(
    private http: HttpClient
  ) {
  }

  public Get<T>(_category?: string, _isUdfLine: boolean = false, _configured: boolean = true): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path: string = this.CONTROLLER;

    if (_category) {
      path += `?Category=${_category}&IsUdfLine=${_isUdfLine}&Configured=${_configured}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'UDFs obtenidos',
          OnError: 'No se pudo obtener los UDFs'
        })});
  }
  GetUdfsDevelopment(tables: string): Observable<ICLResponse<IUdfDevelopment[]>> {
    return this.http.get<ICLResponse<IUdfDevelopment[]>>(`${this.CONTROLLER}/UdfsDevelopment?Table=${tables}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'UDFs de desarrollo obtenidos',
          OnError: 'No se pudo obtener los UDFs de desarrollo'
        })});
  }

  public GetUdfsLinesData<T>(_udfSource?:UdfSourceLine[]): Observable<Structures.Interfaces.ICLResponse<T>> {

    let path: string = `${this.CONTROLLER}/GetUdfsLinesData`;

    return this.http.post<Structures.Interfaces.ICLResponse<T>>(path,_udfSource,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Datos de UDFs de linea obtenidos',
          OnError: 'No se pudo obtener los datos de UDFs de linea'
        })});
  }

  GetUdfsData(_filter:IFilterKeyUdf): Observable<ICLResponse<IUdf[]>> {
    return this.http.post<ICLResponse<IUdf[]>>(`${this.CONTROLLER}/GetUdfsData`,_filter,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Datos de UDFs obtenidos',
          OnError: 'No se pudo obtener los datos de UDFs'
        })});
  }

  public GetUdfsGroups(_category?: string, _isActive: boolean = true): Observable<Structures.Interfaces.ICLResponse<IUdfGroup[]>> {

    let path: string = this.CONTROLLER;

    path += `/Groups?Category=${_category}&isActive=${_isActive}`;

    return this.http.get<Structures.Interfaces.ICLResponse<IUdfGroup[]>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Grupos de UDFs obtenidos',
          OnError: 'No se pudo obtener los grupos de UDFs'
        })});
  }

}
