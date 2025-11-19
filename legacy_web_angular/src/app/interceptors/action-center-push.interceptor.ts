import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {catchError, concatMap, filter, map, Observable, of, throwError} from 'rxjs';
import {CLNotificationType} from "@clavisco/alerts";
import {GetError, Structures} from "@clavisco/core";
import ICLResponse = Structures.Interfaces.ICLResponse;
import {NotificationCenterService} from "@clavisco/notification-center";

@Injectable()
export class ActionCenterPushInterceptor implements HttpInterceptor {

  constructor(private notificationCenterService: NotificationCenterService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(request.url.includes('api.hacienda.go.cr/fe/ae?identificacion='))
    {
      return next.handle(request);
    }
    if(request.url.includes('token'))
    {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      filter(response => response instanceof HttpResponse),
      concatMap(response => {
        // Only GET request should be pushed
        if(request.method === 'GET')
        {
          this.notificationCenterService.Push({
            type: CLNotificationType.SUCCESS,
            priority: 'low',
            title: request.headers.get('Cl-Request-Success-Description') || this.MapUDFsRequests(request, false) || this.MapOthersRequests(request, false) || this.CutURL(request.url),
            message: (response['headers' as keyof object] as HttpHeaders)?.get('cl-message') || (response["body" as keyof object] as ICLResponse<any>)?.Message || ''
          });
        }
        return of(response);
      }),
      catchError(err => {
        // Only GET request should be pushed
        if(request.method === 'GET')
        {
          this.notificationCenterService.Push({
            type: CLNotificationType.ERROR,
            priority: 'high',
            title:  request.headers.get('Cl-Request-Error-Description') || this.MapUDFsRequests(request, true) || this.MapOthersRequests(request, true) || this.CutURL(request.url),
            message: (err['headers' as keyof object] as HttpHeaders)?.get('cl-message') || GetError(err)
          });
        }
        return throwError(() => err);
      })
    )
  }

  private CutURL(_url:string): string
  {
    let startIndex = _url.indexOf('api');
    let endIndex = _url.indexOf("?");

    return _url.substring(startIndex, endIndex === -1 ? _url.length : endIndex);
  }

  private MapUDFsRequests(_request: HttpRequest<any>, _isError: boolean): string
  {
    if(_request.url.includes('api/Udfs/Categories'))
    {
      return  _isError ? 'No se pudo obtener las categorias de UDFs' : 'Categorias de UDFs obtenidas';
    }
    else if(_request.url.includes('api/Udfs/Values'))
    {
      return _isError ? 'No se pudo obtener los valores de UDF' : 'Valores de UDF obtenidos';
    }
    else if(_request.url.includes('api/Udfs'))
    {
      let hasParams = _request.url.split('?').length > 1;
      let description= _isError ? 'No se pudo obtener los UDFs' : 'UDFs obtenidos';

      if(hasParams)
      {
        let requestParams = new URLSearchParams(_request.urlWithParams.split('?')[1]);
        let configured = requestParams.get('Configured');
        let isUDFLine = requestParams.get('IsUdfLine');

        description = configured == 'true' ?
          isUDFLine == 'true' ?
            (_isError ? 'No se pudo obtener los UDFs de líneas configurados' : 'UDFs de líneas configurados obtenidos') :
            (_isError ? 'No se pudo obtener los UDFs configurados' : 'UDFs configurados obtenidos') :
          (_isError ? 'No se pudo obtener los UDFs' : 'UDFs obtenidos');
      }
      return description;
    }

    return '';
  }

  private MapOthersRequests(_request: HttpRequest<any>, _isError: boolean): string
  {
    if(_request.url.includes('https://rptmngapiv2.clavisco.com'))
    {
      return  _isError ? 'No se pudo obtener los reportes' : 'Reportes obtenidos';
    }
    else if(_request.url.includes('api/Lealto')){
      return  _isError ? 'No se pudo obtener los datos de Puntos Lealto del usuario' : 'Información de Puntos Lealto obtenida';
    }
    else if(_request.url.includes('api/Tapp')){
      return  _isError ? 'No se pudo obtener los datos de Puntos Tapp del usuario' : 'Información de Puntos Tapp obtenida';
    }
    return  '';
  }
}
