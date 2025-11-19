import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpStatusCode
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {SharedService} from '../shared/shared.service';
import {CLModalType, ModalService} from '@clavisco/alerts';
import {environment} from "@Environment/environment";
import {Repository} from "@clavisco/core";
import {StorageKey} from "@app/enums/e-storage-keys";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private sharedService: SharedService,
              private modalService: ModalService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((res: any) => {
        let isUnauthorized = Repository.Behavior.GetStorageObject<boolean>(StorageKey.IsUnauthorized);

        if (res['status'] === HttpStatusCode.Unauthorized && res['url'].includes(environment.apiUrl) && !isUnauthorized) {
          Repository.Behavior.SetStorage(true, StorageKey.IsUnauthorized);

          this.modalService.Continue({
            title: 'Token de autorización no válido',
            type: CLModalType.INFO
          }).subscribe();

          this.sharedService.Logout();
        }

        return throwError(() => res);
      }));
  }
}
