import { Injectable } from '@angular/core';
import { LocalStorageService } from './../services/local-storage.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HeadersData, LocalStorageVariables } from '../common/enum';


@Injectable({
    providedIn: 'root'
})
export class PaginateInterceptor implements HttpInterceptor {

    constructor(private localStorageService: LocalStorageService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            map((response: HttpEvent<any>) => {
                if (response instanceof HttpResponse) {
                    const headers = response.headers;
                    if (headers.has(HeadersData.RecordsCount)) {
                        const recordsCount = headers.get(HeadersData.RecordsCount);
                        this.localStorageService.set(HeadersData.RecordsCount, recordsCount);
                    }
                }
                return response;
            })
        )
    }

}