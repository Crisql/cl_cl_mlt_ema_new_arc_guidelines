import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Structures} from "@clavisco/core";
import {IProcessedRoute, IRoute, IRouteAdministrator, IRouteAssignment, IRouteLine, IRouteWithLines} from "@app/interfaces/i-route";
import {IUser} from "@app/interfaces/i-user";
import {DefineDescriptionHeader} from "@app/shared/shared.service";
import ICLResponse = Structures.Interfaces.ICLResponse;

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private readonly CONTROLLER = 'api/Routes';
  constructor(private http: HttpClient) { }

  Get<T>(_routeId?: number): Observable<Structures.Interfaces.ICLResponse<T>>
  {
    let path = this.CONTROLLER;

    if(_routeId)
    {
      path += `/${_routeId}`;
    }

    return this.http.get<Structures.Interfaces.ICLResponse<T>>(path,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Rutas obtenidas',
          OnError: 'No se pudo obtener las rutas'
        })});
  }

  /**
   * This method is used get routes
   * @param _startDate represent a date initial filter
   * @param _endDate represent a date end filter
   * @param _state represent a state filter
   * @param _userAssing represent a user assing filter
   * @param _routeName represent a route name filter
   * @constructor
   */
  GetRoutes(_startDate: string, _endDate: string, _state: number, _userAssing: number = 0, _routeName: string = ""): Observable<ICLResponse<IRoute[]>> {

    let path: string = `${this.CONTROLLER}?startDate=${_startDate}&endDate=${_endDate}&state=${_state}&userAssing=${_userAssing}&routeName=${_routeName}`

    return this.http.get<ICLResponse<IRoute[]>>(path,
      {
        headers: DefineDescriptionHeader({
          OnSuccess: 'Rutas obtenidas',
          OnError: 'No se pudo obtener las rutas'
        })
      });
  }

  /**
   * Method to close route
   * @param _route
   * @constructor
   */
  CloseRoute(_route: IRoute): Observable<Structures.Interfaces.ICLResponse<IRoute>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IRoute>>(`${this.CONTROLLER}/${_route.Id}/Close`, _route);
  }
  GetRouteLines(_routeId: number): Observable<Structures.Interfaces.ICLResponse<IRouteLine[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IRouteLine[]>>(`${this.CONTROLLER}/${_routeId}/Lines`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Lineas de ruta obtenidas',
          OnError: 'No se pudo obtener las lineas de ruta'
        })});
  }

  GetRouteAdministrators(_routeId: number): Observable<Structures.Interfaces.ICLResponse<IRouteAdministrator[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IRouteAdministrator[]>>(`${this.CONTROLLER}/${_routeId}/Administrators`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Administradores de ruta obtenidos',
          OnError: 'No se pudo obtener los administradores de la ruta'
        })});
  }

  PostRouteAdministrators(_administrators: IRouteAdministrator[], _routeId: number): Observable<Structures.Interfaces.ICLResponse<boolean>>
  {
    let path = `${this.CONTROLLER}/${_routeId}/Administrators`;
    return this.http.post<Structures.Interfaces.ICLResponse<boolean>>(path, _administrators);
  }

  PostRouteAssignments(_assignments: IRouteAssignment[], _routeId: number): Observable<Structures.Interfaces.ICLResponse<boolean>>
  {
    let path = `${this.CONTROLLER}/${_routeId}/Assignments`;
    return this.http.post<Structures.Interfaces.ICLResponse<boolean>>(path, _assignments);
  }

  Post(_routeWithLines: IRouteWithLines): Observable<Structures.Interfaces.ICLResponse<IRouteWithLines>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IRouteWithLines>>(this.CONTROLLER, _routeWithLines);
  }

  Patch(_routeWithLines: IRouteWithLines): Observable<Structures.Interfaces.ICLResponse<IRouteWithLines>>
  {
    return this.http.patch<Structures.Interfaces.ICLResponse<IRouteWithLines>>(this.CONTROLLER, _routeWithLines);
  }

  CreateProcessedRoutes(_processedRoutes: IProcessedRoute[]): Observable<Structures.Interfaces.ICLResponse<IProcessedRoute[]>>
  {
    return this.http.post<Structures.Interfaces.ICLResponse<IProcessedRoute[]>>(`${this.CONTROLLER}/ProcessedRoutes`, _processedRoutes);
  }

  GetRouteAssignedUsers(_routeId: number): Observable<Structures.Interfaces.ICLResponse<IUser[]>>
  {
    return this.http.get<Structures.Interfaces.ICLResponse<IUser[]>>(`${this.CONTROLLER}/${_routeId}/AssignedUsers`,
      {headers: DefineDescriptionHeader({
          OnSuccess: 'Usuarios asignados a ruta obtenidos',
          OnError: 'No se pudo obtener los usuarios asignados a la ruta'
        })});
  }
}
