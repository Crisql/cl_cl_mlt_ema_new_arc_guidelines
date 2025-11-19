import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IPrintFormatSetting} from "../interfaces/i-settings";
import {IDownloadBase64} from "../interfaces/i-files";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class PrintFormatsService {
  private readonly CONTROLLER = 'api/PrintFormats';
  constructor(private http: HttpClient) { }
  Post(_formData: FormData, _companyId: number, _active: boolean, _remoteServer: string, _path: string): Observable<Structures.Interfaces.ICLResponse<IPrintFormatSetting>>
  {
    let headers = new HttpHeaders({"Request-With-Files": 'true'});

    let params = {
      'active': _active,
      'remoteServer': _remoteServer,
      'path': _path
    }

    return this.http.post<Structures.Interfaces.ICLResponse<IPrintFormatSetting>>(`${this.CONTROLLER}/${_companyId}`, _formData, {params, headers});
  }

  Download<T extends keyof IPrintFormatSetting>(_companyId: number, _printFormatName: T): Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>>
  {
    let path = `${this.CONTROLLER}/${_companyId}/Download/${_printFormatName}`;

    return this.http.get<Structures.Interfaces.ICLResponse<IDownloadBase64>>(path, {headers: DefineDescriptionHeader({
        OnSuccess: 'Formato de impresión decargado',
        OnError: 'No se pudo descargar el formato de impresión'
      })});
  }
}
