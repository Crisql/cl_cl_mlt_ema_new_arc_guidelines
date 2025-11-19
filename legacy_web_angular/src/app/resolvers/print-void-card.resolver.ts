import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {catchError, concatMap, forkJoin, Observable, of} from 'rxjs';
import {IPrintVoidCardComponentsResoveData} from "@app/interfaces/i-resolvers";
import {AlertsService, CLToastType} from "@clavisco/alerts";
import {map} from "rxjs/operators";
import {IUser} from "@app/interfaces/i-user";
import {UserService} from "@app/services/user.service";
import {IPinpadTerminal} from "@app/interfaces/i-terminals";
import {TerminalUsersService} from "@app/services/terminal-users.service";
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {PermissionUserService} from "@app/services/permission-user.service";

@Injectable({
  providedIn: 'root'
})
export class PrintVoidCardResolver implements Resolve<IPrintVoidCardComponentsResoveData | null> {

  constructor(
    private usersService: UserService,
    private terminalUsersService: TerminalUsersService,
    private permissionUserService: PermissionUserService,
    private alertsService: AlertsService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IPrintVoidCardComponentsResoveData | null> {

    return forkJoin({
      Users: this.usersService.Get<IUser[]>(),
      TerminalsUser: this.terminalUsersService.TerminalsByPermissionByUser<IPinpadTerminal[]>(),
      Permissions: this.permissionUserService.Get<IPermissionbyUser[]>().pipe(catchError(res => of(null))),
    }).pipe(
      map(callback => {
        return {
          Users: callback.Users.Data,
          TerminalsUser: callback.TerminalsUser.Data,
          Permissions: callback.Permissions?.Data,
        } as IPrintVoidCardComponentsResoveData;
      }),
      concatMap(result => {
        this.alertsService.Toast({type: CLToastType.SUCCESS, message: 'Componentes requeridos obtenidos'});
        return of(result);
      }),
      catchError(err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
        return of(null);
      })
    );
  }

}
