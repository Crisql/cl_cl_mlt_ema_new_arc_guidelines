import {HttpParams, HttpHeaders, HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LocalStorageVariables} from 'src/app/common/enum';
import {CheckRouteService} from './check-route.service';
import {PermissionService} from './permission.service';
// Models
import {LocalStorageService} from './local-storage.service';
import {IUserToken} from "../models/db/user-token";
import {Observable} from "rxjs";
import {ReCaptchaV3Service} from "ng-recaptcha";
import {SyncService} from "./sync.service";
import {Router} from "@angular/router";


@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private checkRouteService: CheckRouteService,
        private permissionService: PermissionService,
        private syncService: SyncService,
        private router: Router
    ) {
    }

    login(userName: string, password: string, _recaptchaToken: string): Observable<IUserToken> {

        const body = new HttpParams()
            .set('grant_type', 'password')
            .set('username', userName)
            .set('password', password);

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cl-Recaptcha-Token': _recaptchaToken
        });

        return this.http.post<any>(`${this.localStorageService.data.get('ApiURL')}token`, body.toString(), {headers});
    }

    /**
     * Reset all variables that don't need be without a session
     * @constructor
     */
    Logout() {
        this.syncService.automaticVerificationOfClosedRoutes$?.unsubscribe();
        this.syncService.automaticVerificationOfClosedRoutes$ = null;
        this.syncService.automaticCheckSynchronization$?.unsubscribe();
        this.syncService.automaticCheckSynchronization$ = null;
        this.permissionService.Permissions = [];
        this.localStorageService.Remove(LocalStorageVariables.PermList);
        this.localStorageService.Remove(LocalStorageVariables.SelectedCompany);
        this.localStorageService.Remove(LocalStorageVariables.Session);
        this.router.navigateByUrl("login", { replaceUrl: true });
    }
}
