import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {Repository, Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {HttpClient} from "@angular/common/http";
import {IPrinter} from "@app/interfaces/i-printer-worker";
import {StorageKey} from "@app/enums/e-storage-keys";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";

@Injectable({
  providedIn: 'root'
})
export class PrinterWorkerService {
  constructor(private http : HttpClient) { }

  Get(_url:string):Observable<ICLResponse<IPrinter[]>>{
      return this.http.get<ICLResponse<IPrinter[]>>(`${_url}api/printers`,
        {headers: DefineDescriptionHeader({
            OnSuccess: 'Impresoras locales obtenidas',
            OnError: 'No se pudo obtener impresoras locales'
          })});
  }
  Post(_base64:string):Observable<void>{
    let printerWorker = Repository.Behavior.GetStorageObject<ILocalPrinter>(StorageKey.LocalPrinter);

    let printerName = encodeURIComponent(printerWorker?.PrinterName || '');

    let  url=  `${printerWorker?.PortServicePrintMethod}api/printers/${printerName}/print`;

    return this.http.post<void>(url,{
        Base64: _base64
      });
  }

}
