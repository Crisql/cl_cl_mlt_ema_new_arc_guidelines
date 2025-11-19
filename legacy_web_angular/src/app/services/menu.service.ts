import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Structures } from '@clavisco/core';
import { IMenuNode } from '@clavisco/menu';
import { Observable } from 'rxjs';
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly CONTROLLER = 'api/Menu';
  constructor(private http: HttpClient) { }

  Get(): Observable<Structures.Interfaces.ICLResponse<IMenuNode[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IMenuNode[]>>(this.CONTROLLER,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Opciones de menú obtenidas',
          OnError: 'No se pudo obtener las opciones del menú'
        })});
  }
}
