import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {UserService} from "@app/services/user.service";
import {PermissionService} from "@app/services/permission.service";
import {StructuresService} from "@app/services/structures.service";
import {ICashFlowResolverData} from "@app/interfaces/i-resolvers";
import {catchError, concatMap, forkJoin, map, Observable, of} from "rxjs";
import {AlertsService, CLToastType} from "@clavisco/alerts";


@Injectable({
  providedIn: 'root'
})
export class CashFlowResolver implements Resolve<ICashFlowResolverData | null> {

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private structuresService: StructuresService,
    private alertsService: AlertsService
  ) {

  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICashFlowResolverData | null> {
    return forkJoin([
      this.structuresService.Get('TypeFlow'),
      this.structuresService.Get('Reasons')
    ]).pipe(
      map(res => {
        return {
          TypesFlow: res[0].Data,
          Reasons: res[1].Data,
        } as ICashFlowResolverData
      }),
      concatMap(result => {
        this.alertsService.Toast({
          type: CLToastType.SUCCESS,
          message: 'Componentes requeridos obtenidos'
        });
        return of(result);
      }),
      catchError(err => {
        this.alertsService.ShowAlert({HttpErrorResponse: err});
        return of(null)
      })
    )
  }

}
