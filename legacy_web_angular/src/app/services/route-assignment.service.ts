import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IRouteAssignment, IRouteWithLines} from "@app/interfaces/i-route";
import {DefineDescriptionHeader} from "@app/shared/shared.service";

@Injectable({
  providedIn: 'root'
})
export class RouteAssignmentService {

  private readonly CONTROLLER = 'api/RouteAssignments';
  constructor(private http: HttpClient) { }

  Get<T>(_routeAssignmentId?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_routeAssignmentId)
    {
      path += `/${_routeAssignmentId}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Asignaciones de rol obtenidas',
          OnError: 'No se pudo obtener las asignaciones del rol'
        })});
  }

  Post(_routeAssignment: IRouteAssignment[]): Observable<Structures.Interfaces.ICLResponse<IRouteAssignment>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IRouteAssignment>>(this.CONTROLLER, _routeAssignment);
  }

  Patch(_routeAssignment: IRouteAssignment[]): Observable<Structures.Interfaces.ICLResponse<IRouteAssignment>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IRouteAssignment>>(this.CONTROLLER, _routeAssignment);
  }
}
