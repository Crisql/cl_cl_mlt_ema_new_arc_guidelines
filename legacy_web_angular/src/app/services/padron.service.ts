import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {ILicense} from "../interfaces/i-license";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class PadronService {
  private readonly CONTROLLER = 'api/Padron';
  constructor(private http: HttpClient) { }

  // Get<T>(Identification: number): Observable<Structures.Interfaces.ICLResponse<T>>
  // {

  //   return this.http.get<Structures.Interfaces.ICLResponse<T>>(`${this.CONTROLLER}?Identification=${Identification}`,
  //     {headers: DefineDescriptionHeader({
  //         OnSuccess: 'Datos de padron obtenidos',
  //         OnError: 'No se pudo obtener los datos de padron'
  //       })});
  // }

  Get<T>(Identification: number): Observable<any>
  {

    return this.http.get<any>(`https://api.hacienda.go.cr/fe/ae?identificacion=${Identification}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Datos de padron obtenidos',
          OnError: 'No se pudo obtener los datos de padron'
        })});
  }

}
