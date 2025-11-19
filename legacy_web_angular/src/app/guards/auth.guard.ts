import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from "@app/services/auth.service";
import {AlertsService, CLToastType} from "@clavisco/alerts";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router,
              private alertsService: AlertsService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const ROUTE = state.url;
    const menu = this.authService.RouteValid(ROUTE.substring(1));

    if (menu) {
      if (this.authService.HasPermission(menu.NamePermission)) {
        return true;
      } else {
        this.alertsService.Toast({
          type: CLToastType.INFO,
          message: `No se tienen permisos para acceder a esta página`
        });
        this.router.navigate(['home']);
        return false;
      }
    } else {
      this.alertsService.Toast({
        type: CLToastType.INFO,
        message: `No se tienen permisos para acceder a esta página`
      });
      this.router.navigate(['home']);
      return false;

    }
  }
}
