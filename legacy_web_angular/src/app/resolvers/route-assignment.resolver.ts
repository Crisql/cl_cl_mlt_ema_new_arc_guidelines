import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {catchError, forkJoin, map, Observable, of} from 'rxjs';
import {RouteService} from "@app/services/route.service";
import {UserService} from "@app/services/user.service";
import {StructuresService} from "@app/services/structures.service";
import {RoutesFrequeciesService} from "@app/services/routes-frequecies.service";
import {IRouteAssignmentResolveData, IRouteListResolveData} from "@app/interfaces/i-resolvers";
import {IRoute, IRouteFrequency} from "@app/interfaces/i-route";
import {IUser, IUserAssign} from "@app/interfaces/i-user";
import {AssignsService} from "@app/services/assigns.service";

@Injectable({
  providedIn: 'root'
})
export class RouteAssignmentResolver implements Resolve<IRouteAssignmentResolveData | null> {
  constructor(
    private assignsService: AssignsService,
    private routeService: RouteService,
    private usersService: UserService
  ) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRouteAssignmentResolveData | null> {
    return forkJoin({
      UserAssigns: this.assignsService.Get<IUserAssign[]>(),
      Users: this.usersService.Get<IUser[]>()
    }).pipe(map(responses => {
        return {
          UserAssigns: responses.UserAssigns.Data,
          Users: responses.Users.Data
        }
      }),
      catchError((err) => {
        return of(null);
      }));
  }
}
