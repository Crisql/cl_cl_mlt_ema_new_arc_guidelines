import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { from, Observable, of } from 'rxjs';
import { PATHS_TO_INTERCEPT } from '../common';
import { Repository,CommonService,LocalStorageService } from '../services';
import {LocalStorageVariables} from "../common/enum";
import {ICLResponse} from "../models/responses/response";
import {IMobileAppConfiguration} from "../interfaces/i-settings";
import {ICompany, ICompanyInformation} from "../models/db/companys";

@Injectable({
    providedIn: 'root'
})
export class RequestInterceptor implements HttpInterceptor {
    constructor(
        private localStorageService: LocalStorageService,
        private repositoryService: Repository.RepositoryService,
        private network: Network,
        private commonService: CommonService,
        private repositoryCompany: Repository.Company
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // If the request contains some of this strings we don't need modify the request
        if (request.url.includes(`maps.googleapis.com`) || 
            request.url.includes(`token`) || 
            request.url.includes("appsaccountsmanager") ||
            !request.url.includes("api/") // Local request, like retrieve a json file
        )
        {
            return next.handle(request);   
        }

        let clonedRequest = request.clone();
        
        // If there are internet connection
        if(![this.network.Connection.NONE, this.network.Connection.UNKNOWN].includes(this.network.type) ||
            this.localStorageService.GetIsOnSyncMode())
        {
            let headers = request.headers
                .set(`Authorization`, `Bearer ${this.localStorageService.data.get("Session").access_token}`)
                .set(`cl-company-id`, `${this.localStorageService.get(LocalStorageVariables.SelectedCompany)?.Id ?? -1}`);

            if(!request.url.includes(`Quotations`) && !request.url.includes(`Orders`))
            {
                let headers = clonedRequest.headers.set('Content-Type', 'application/json');
                clonedRequest = clonedRequest.clone({headers});
            }

            clonedRequest = request.clone({headers});
            
            return next.handle(clonedRequest);
        }
        
        // If not have internet connection, check if should request the SQL Lite database
        if (request.headers.has("cl-offline-function-to-run")) 
        {
            let offlineModeIsAllowed: boolean = 
                !(this.localStorageService.get(LocalStorageVariables.MobileAppConfiguration) as IMobileAppConfiguration).OnlineOnly;
            
            if(offlineModeIsAllowed)
            {
                let offlineFunctionToExecute: string = request.headers.get("cl-offline-function-to-run");
                
                return from(this.RepositoryInvoker(offlineFunctionToExecute, request.params));
            }

            return next.handle(clonedRequest);
        }

        return next.handle(clonedRequest);
    }

    /**
     * Runs the specified function of the repository service to get information from SQL Lite database
     * @param _functionToRaise Name of the repository service mapped function
     * @param _params Request parameters
     * @constructor
     */
    async RepositoryInvoker(_functionToRaise: string, _params: HttpParams): Promise<HttpResponse<ICLResponse<any>>> 
    {
        const isValidCompany = await this.ValidateSynchronizedCompany();
        
        let Data: ICLResponse<any>;
        
        if(isValidCompany){
            const data = await this.repositoryService.FunctionInvoker(_functionToRaise, _params);

            Data = {
                Message: !data ? this.commonService.Translate("No se encontraron registros", "No records found") : '',
                Data: data
            };
        }else{
            Data = {
                Message: this.commonService.Translate("No es posible continuar offline debido a que la compañía actual seleccionada no ha sido soncronizada", "It is not possible to continue offline because the current company selected has not been synchronized"),
                Data: null
            };
        }
        
        return of(new HttpResponse({ status: 500, body: Data })).toPromise();
    }

    /**
     * Validates if the selected company is the same as the synchronized company
     * @constructor
     */
    async ValidateSynchronizedCompany(){
        const selectedCompany = this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany;
        const synchronizedCompany : ICompanyInformation = await this.repositoryCompany.GetCompanyInformation();
        
        return (selectedCompany?.Id == synchronizedCompany?.CompanyId);
    }

}
