import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Repository} from "@clavisco/core";
import {StorageKey} from "@app/enums/e-storage-keys";
import {IPorts} from "@app/interfaces/i-company";

@Injectable()
export class UrlInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.includes('b1s/v1'))
    {
      return next.handle(request);
    }

    if(request.url.includes('api.hacienda.go.cr/fe/ae?identificacion='))
    {
      return next.handle(request);
    }

    if(request.url.includes('api/printers') || request.url.includes('api/print'))
    {
      return next.handle(request);
    }

    if(request.url.includes('PinpadServicePP'))
    {
      let UrlPinpad = Repository.Behavior.GetStorageObject<IPorts>(StorageKey.Ports);

      let  url: string;
      url = request.url.replace('PinpadServicePP',`${UrlPinpad?.PortServicePinpad}`).toString();
      request = request.clone({url: `${url}`});

      return next.handle(request);
    }

    if(request.url.includes('PinpadService'))
    {
      let UrlPinpad = Repository.Behavior.GetStorageObject<IPorts>(StorageKey.Ports);

      let  url: string;
      url = request.url.replace('PinpadService','api').toString();
      request = request.clone({url: `${UrlPinpad?.PortServicePinpad}${url}`});

      return next.handle(request);
    }

    if(request.url.includes(environment.apiUrl) || request.url.includes('https://rptmngapiv2.clavisco.com'))
    {
      return next.handle(request);
    }

    if(request.url.includes('assets'))
    {
      return next.handle(request);
    }

    request = request.clone({url: `${environment.apiUrl}${request.url}`});

    return next.handle(request);
  }
}
