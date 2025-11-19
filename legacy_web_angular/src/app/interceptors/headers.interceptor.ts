import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICompany } from '../interfaces/i-company';
import { Repository } from '@clavisco/core';
import { StorageKey } from '../enums/e-storage-keys';
import { IUserToken } from '../interfaces/i-token';
import { formatDate } from '@angular/common';

@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.includes('api.hacienda.go.cr/fe/ae?identificacion='))
      {
        return next.handle(request);
      }

    if(request.url.includes('token'))
    {
      return next.handle(request);
    }

    let userToken: IUserToken | null = Repository.Behavior.GetStorageObject<IUserToken>(StorageKey.Session);

    let selectedCompany: ICompany | null = Repository.Behavior.GetStorageObject(StorageKey.CurrentCompany) || {Id: -1} as ICompany;

    let clonedRequest: HttpRequest<unknown> = request.clone();

    if(userToken)
    {
      let headers = clonedRequest.headers.set('Authorization', `Bearer ${userToken.access_token}`);

      clonedRequest = clonedRequest.clone({headers});
    }

    let headers = clonedRequest.headers
    .set('cl-company-id', selectedCompany.Id.toString())
    .set('cl-ui-request-timestamp', formatDate(new Date(), 'dd-MM-yyyy hh:mm:ss.SSS a', 'en'));

    clonedRequest = clonedRequest.clone({headers});

    // Valido que no tenga el header que indica si tiene archivos para no enviar el content type
    if(!clonedRequest.headers.has('Request-With-Files'))
    {
      let headers = clonedRequest.headers.set('Content-Type', 'application/json');
      clonedRequest = clonedRequest.clone({headers});
    }

    return next.handle(clonedRequest);
  }
}
