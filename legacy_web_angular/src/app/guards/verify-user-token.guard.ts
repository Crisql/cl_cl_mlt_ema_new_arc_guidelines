import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {CLModalType, ModalService} from '@clavisco/alerts';
import {concatMap, map, Observable, of} from 'rxjs';
import {StorageKey} from '../enums/e-storage-keys';
import {IUserToken} from '../interfaces/i-token';
import {SharedService} from '../shared/shared.service';
import {Repository} from '@clavisco/core'

@Injectable({
  providedIn: 'root'
})
export class VerifyUserTokenGuard implements CanActivate {
  constructor(
    private sharedService: SharedService,
    private modalService: ModalService
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    let userToken: IUserToken | null = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session);

    let existToken: boolean = !!userToken;

    let isValidToken: boolean = !!userToken && new Date(userToken['.expires']) > new Date() && !!userToken.access_token;

    let observable$: Observable<boolean> = of(isValidToken)
      .pipe(
        concatMap(_validToken => {
          //If "existToken" is true then the reason of why the token is invalid is because it has expired
          if (!_validToken && existToken) {
            return this.modalService.Continue({
              type: CLModalType.INFO,
              subtitle: 'Su sesión ha caducado. Vuelva a iniciar sesión por favor.',
              disableClose: true
            })
              .pipe(
                map(y => {
                  this.sharedService.Logout();
                  return false;
                })
              );
          } else {
            return of(_validToken)
              .pipe(
                map(y => {
                  if (!y) {
                    this.sharedService.Logout();
                  }
                  return y;
                }));
          }
        })
      );

    return observable$;
  }
}

