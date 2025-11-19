import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpParams,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {EMPTY, from, Observable, of, throwError} from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { AlertType, AppConstants, PATHS_TO_INTERCEPT } from '../common';
import { Router } from '@angular/router';
import {CommonService, LocalStorageService, LoginService, Repository} from "../services";
import {CustomModalController} from "../services/custom-modal-controller.service";
import {LocalStorageVariables} from "../common/enum";
import {IMobileAppConfiguration} from "../interfaces/i-settings";
import {ICLResponse} from "../models/responses/response";

@Injectable({
    providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {

    isModalRaised: boolean = false;
    
    ModalRaisedTime: Date = new Date();

    constructor(
        private localStorageService: LocalStorageService,
        private repositoryService: Repository.RepositoryService,
        private commonService: CommonService,
        private loginService: LoginService,
        private modalController: CustomModalController,
        private router: Router) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
    {
        let offlineModeAllowed: boolean = !((this.localStorageService.get(LocalStorageVariables.MobileAppConfiguration) as IMobileAppConfiguration)?.OnlineOnly ?? true);
        
        let timeOut: number = offlineModeAllowed ? 20 : 40;

        if (this.localStorageService.GetIsOnSyncMode()) 
        {
            return next.handle(request).pipe(
                catchError(error => {
                    if(error.status === 0)
                    {
                        return throwError(this.commonService.Translate(`No se pudo conectar con el servidor. Verifique su conexión a internet`, 'Could not connect to the server. Check your internet connection'));
                    }

                    return throwError(AppConstants.GetError(error));
                })
            );
        }

        return next.handle(request)
            .pipe(
                timeout(timeOut * 1000),
                catchError((error:HttpErrorResponse) => {
                    
                    if(!error.ok && error.status !== 401 && error.status !== 0){
                        return throwError(error);
                    }
                    
                    let isUnauthorized = this.localStorageService.get(LocalStorageVariables.IsUnauthorized);
                    
                    if(error.status === 401 && !isUnauthorized) // If is an unauthorized error
                    {
                        this.localStorageService.set(LocalStorageVariables.IsUnauthorized, true, true);
                        
                        this.isModalRaised = true;
                        
                        this.commonService.Alert(
                            AlertType.INFO,
                            "Token de autenticación invalido",
                            "Invalid authentication token",
                            "Información",
                            "Information",
                            [
                                {
                                    text: this.commonService.Translate("Continuar", "Continue"),
                                    handler: async _ => {
                                        this.isModalRaised = false;
                                        this.loginService.Logout();
                                        this.modalController.DismissAll();
                                    },
                                },
                            ]
                        );
                        
                        return throwError(error.error?.error_description);
                    }
                    
                    if(error.status === 0) // If is a timeout error
                    {
                        if(!this.isModalRaised)
                        {
                            this.isModalRaised = true;
                            
                            this.commonService.Alert(
                                AlertType.WARNING,
                                "La conexión es inestable",
                                "Unstable connection",
                                "Información",
                                "Information",
                                [
                                    {
                                        text: this.commonService.Translate("Continuar", "Continue"),
                                        handler: async _ => {
                                            this.isModalRaised = false;
                                        },
                                    },
                                ]
                            );
                        }
                        
                        return throwError(error.message);
                    }
                    
                    if(!offlineModeAllowed) // If the offline mode is not allowed
                    {
                        if(error.status === 0)
                        {
                            return throwError(this.commonService.Translate(`No se pudo conectar con el servidor. Verifique su conexión a internet`, 'Could not connect to the server. Check your internet connection'));
                        }

                        return throwError(error);
                    }
                    
                    
                    if (request.headers.has("cl-offline-function-to-run") && !request.headers.has('cl-ignore-alerts')) // If offline mode is allowed and the request has a offline function
                    {
                        if(!this.isModalRaised && this.ModalRaisedTime && this.ModalRaisedTime <= new Date())
                        {
                            this.isModalRaised = true;

                            this.ModalRaisedTime = new Date(new Date().getTime() + 5*60*1000);

                            this.commonService.Alert(
                                AlertType.INFO,
                                "Está trabajando en modo offline",
                                "Running on offline mode",
                                "Información",
                                "Information",
                                [
                                    {
                                        text: this.commonService.Translate("Continuar", "Continue"),
                                        handler: async _ => {
                                            this.isModalRaised = false;
                                        },
                                    },
                                ]
                            );
                        }

                        let offlineFunctionToExecute: string = request.headers.get("cl-offline-function-to-run");

                        return from(this.RepositoryInvoker(offlineFunctionToExecute, request.params));
                    }
                    else // If is in offline mode and don't have a offline method to execute, we should ignored it 
                    {
                        return throwError("CL_IN_OFFLINE_MODE");
                    }
                }),
                catchError(error => throwError(AppConstants.GetError(error)))
            );
    }

    /**
     * Runs the specified function of the repository service to get information from SQL Lite database
     * @param _functionToRaise Name of the repository service mapped function
     * @param _params Request parameters
     * @constructor
     */
    async RepositoryInvoker(_functionToRaise: string, _params: HttpParams): Promise<HttpResponse<ICLResponse<any>>> 
    {
        const offlineData = await this.repositoryService.FunctionInvoker(_functionToRaise, _params);
        
        const responseBody: ICLResponse<any> = {
            Message: !offlineData ? this.commonService.Translate("No se encontraron registros", "No records found") : '',
            Data: offlineData
        };
        
        return of(new HttpResponse({ status: 500, body: responseBody })).toPromise();
    }
}
