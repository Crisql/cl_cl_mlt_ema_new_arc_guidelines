import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import {ILocalPrinter} from "@app/interfaces/i-local-printer";

@Injectable({
  providedIn: 'root'
})
export class LocalPrinterService {
  private readonly CONTROLLER = "api/LocalPrinters";
  constructor(private http: HttpClient) { }

  Get<T>(_id?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_id)
    {
      path += `?userAssingId=${_id}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path, {headers: DefineDescriptionHeader({
        OnError: 'No se pudo obtener impresora del usuario',
        OnSuccess: 'Impresora de usuario obtenida'
      })})
  }

  PatchPrinterName(_localPrinter: ILocalPrinter): Observable<Structures.Interfaces.ICLResponse<ILocalPrinter>>
  {
    let path = this.CONTROLLER;
        path += `/PrinterName`;

    return this.http.patch<Structures.Interfaces.ICLResponse<ILocalPrinter>>(path, _localPrinter);
  }

  Patch(_localPrinter: ILocalPrinter): Observable<Structures.Interfaces.ICLResponse<ILocalPrinter>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<ILocalPrinter>>(this.CONTROLLER, _localPrinter);
  }
  Post(_localPrinter: ILocalPrinter): Observable<Structures.Interfaces.ICLResponse<ILocalPrinter>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<ILocalPrinter>>(this.CONTROLLER, _localPrinter);
  }
}
