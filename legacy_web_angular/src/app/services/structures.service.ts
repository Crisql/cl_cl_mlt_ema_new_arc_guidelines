import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Structures} from "@clavisco/core";
import {IStructures} from "../interfaces/i-structures";
import {Observable} from "rxjs";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class StructuresService {
  private readonly URL = 'api/Structures';
  constructor(private http: HttpClient) { }

  Get(_structType: string): Observable<Structures.Interfaces.ICLResponse<IStructures[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IStructures[]>>(`${this.URL}/${_structType}`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Estructuras obtenidas',
          OnError: 'No se pudo obtener las estructuras'
        })});
  }
}
