import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IProcessedRoute} from "@app/interfaces/i-route";
import {IDownloadBase64} from "@app/interfaces/i-files";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private readonly CONTROLLER = "api/Files";
  constructor(private http: HttpClient) { }

  ProcessRouteTemplate(_formData: FormData): Observable<Structures.Interfaces.ICLResponse<IProcessedRoute[]>>
  {
    let headers = new HttpHeaders({"Request-With-Files": 'true'});
    return this.http.post<Structures.Interfaces.ICLResponse<IProcessedRoute[]>>(`${this.CONTROLLER}/RoutesTemplate`, _formData, {headers});
  }

  DownloadRouteTemplate(): Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IDownloadBase64>>(`${this.CONTROLLER}/RoutesTemplate/Download`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Plantilla de rutas descargada',
          OnError: 'No se pudo descargar la plantilla de rutas'
        })});
  }
}
