import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IDownloadBase64, IPrintReport} from "../interfaces/i-files";
import {IPrintFormatSetting} from "../interfaces/i-settings";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly CONTROLLER = 'api/Reports';
  constructor(private http: HttpClient) { }

  PrintReport<T extends keyof IPrintFormatSetting>(_docEntry: number, _printFormatName: T): Observable<Structures.Interfaces.ICLResponse<IDownloadBase64>>
  {
    let path =  `${this.CONTROLLER}/${_printFormatName}/${_docEntry}/Print`;

    return this.http.get<Structures.Interfaces.ICLResponse<IDownloadBase64>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Reporte obtenido',
          OnError: 'No se pudo obtener el reporte'
        })});
  }

  PrintVoucher(_documentKey: number, _rawData: string): Observable<Structures.Interfaces.ICLResponse<string>>
  {
    let path =  `${this.CONTROLLER}/PrintVoucher`;

    return this.http.post<Structures.Interfaces.ICLResponse<string>>(path,
      {
      "DocumentKey": _documentKey,
      "RawData": _rawData,
    });
  }

  PrintReportPinpad(_docEntry: number, _rawData: string,_printFormatName: string, _isACopy = false): Observable<Structures.Interfaces.ICLResponse<string>>
  {
    let path =  `${this.CONTROLLER}/${_printFormatName}/PrintReportPinpad`;

    return this.http.post<Structures.Interfaces.ICLResponse<string>>(path,
      {
        "DocumentKey": _docEntry,
        "RawData": _rawData,
        "IsACopy":_isACopy
      });
  }
}
