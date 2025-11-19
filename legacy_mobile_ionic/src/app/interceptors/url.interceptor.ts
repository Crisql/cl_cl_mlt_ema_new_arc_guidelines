import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {LocalStorageService} from "../services";
import {Observable} from "rxjs";
import {LocalStorageVariables} from "../common/enum";

@Injectable({
    providedIn: 'root'
})
export class UrlInterceptor implements HttpInterceptor
{
    constructor(private localStorageService: LocalStorageService) {
    }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // If contains HTTP that means that has a URL, and if not contains api/ that means is a local request
        if(req.url.includes("http") || !req.url.includes('api/'))
        {
            return next.handle(req);
        }
        
        let apiUrl = this.localStorageService.get(LocalStorageVariables.ApiURL);
        
        let clonedRequest = req.clone({
            url: `${apiUrl}${req.url}`
        });
        
        return next.handle(clonedRequest);
    }
}    