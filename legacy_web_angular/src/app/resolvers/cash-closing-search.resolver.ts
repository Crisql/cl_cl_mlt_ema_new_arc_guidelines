import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {PermissionService} from "../services/permission.service";
import {IPermissionbyUser} from "../interfaces/i-roles";
import {catchError, forkJoin, map, Observable, of} from "rxjs";
import {ICashClosingSearchResolverData} from "../interfaces/i-resolvers";
import {AlertsService, CLNotificationType, NotificationPanelService} from "@clavisco/alerts";
import {formatDate} from "@angular/common";
import {GetError, Repository} from "@clavisco/core";
import {IUserToken} from "../interfaces/i-token";
import {StorageKey} from "../enums/e-storage-keys";
import {CashClosingsService} from "../services/cashClosings.service";
import {UserService} from "../services/user.service";
import {PermissionUserService} from "@app/services/permission-user.service";


@Injectable({
  providedIn: 'root'
})
export class CashClosingSearchResolver implements Resolve<ICashClosingSearchResolverData | null> {

  constructor(
    private permissionUserService: PermissionUserService,
    private cashClosingService: CashClosingsService,
    private userService: UserService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICashClosingSearchResolverData | null> {

    let from: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    let to: string = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    let currentUser: string = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session)?.UserEmail || '';

    return forkJoin([
      this.permissionUserService.Get<IPermissionbyUser[]>(),
      this.cashClosingService.GetAll(currentUser, from, to),
      this.userService.GetUserByCompany()
    ]).pipe(
      map(res => {
        return {
          Permission: res[0].Data,
          Balances: res[1].Data,
          Users: res[2].Data
        } as ICashClosingSearchResolverData;
      }),
      catchError(err => {
        return of(null);
      })
    );
  }

}
