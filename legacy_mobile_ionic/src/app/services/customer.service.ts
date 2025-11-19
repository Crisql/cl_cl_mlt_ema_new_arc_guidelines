import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {LocalStorageService} from "./local-storage.service";

import {BusinessPartnerMinified, BusinessPartnersModel, IBlanketAgreement,} from "src/app/models";
import {Observable, of} from "rxjs";
import {ICLResponse} from "src/app/models/responses/response";
import {DatePipe} from "@angular/common";
import {IBusinessPartner} from "../models/i-business-partner";
import {ChangeElement, LocalStorageVariables} from "../common/enum";
import {IBpAddress} from "../interfaces/i-bp-address";
import {IBusinessPartners} from "../interfaces/i-business-partners";
import {IChangedInformation} from "../models/i-changed-information";
import {IUserAssign} from "../models/db/user-model";

@Injectable({
    providedIn: "root",
})
export class CustomerService {

    private readonly CONTROLLER = 'api/BusinessPartners';

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private datePipe: DatePipe
    ) {
    }

    /**
     * Send a request to retrieves all customer information
     * @param _syncDate The last time when the customers was synchronized
     * @constructor
     */
    GetCustomers(_syncDate: string | Date = new Date(0)): Observable<ICLResponse<IBusinessPartner[]>> 
    {
        const userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);
        
        return this.http.get<ICLResponse<IBusinessPartner[]>>('api/Mobile/BusinessPartners', {
            params: {
                SlpCode: userAssignment.SlpCode.toString(),
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Send a request to retrieves the count of customers to synchronized
     * @param _syncDate Last synchronization date
     * @constructor
     */
    GetCustomersCount(_syncDate?: string): Observable<ICLResponse<IChangedInformation>>
    {
        if(!_syncDate)
        {
            return of({
                Data: {
                    Type: ChangeElement.BusinessPartners,
                    Count: 1
                }
            } as ICLResponse<IChangedInformation>);
        }
        
        const userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment);

        return this.http.get<ICLResponse<IChangedInformation>>('api/Mobile/BusinessPartners/Count', {
            params: {
                SlpCode: userAssignment.SlpCode.toString(),
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Obtiene solamente el CardCode y CardName de los clientes
     * @returns Lista de clientes minificados
     */
    GetMinifiedCustomer(): Observable<ICLResponse<BusinessPartnerMinified[]>> {
        const userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment) as IUserAssign;
        
        return this.http.get<ICLResponse<BusinessPartnerMinified[]>>('api/BusinessPartners', {
            params: {
                SlpCode: userAssignment.SlpCode
            },
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetMinifiedCustomers')
        })
    }

    CreateCustomer(_customer: IBusinessPartners): Observable<ICLResponse<IBusinessPartners>> {
        const URL = `${this.localStorageService.data.get('ApiURL')}api/BusinessPartners`
        return this.http.post<ICLResponse<IBusinessPartners>>(URL, _customer);
    }
    UpdateCustomer(_customer: IBusinessPartners): Observable<ICLResponse<IBusinessPartners>> {
        const URL = `${this.localStorageService.data.get('ApiURL')}api/BusinessPartners`
        return this.http.patch<ICLResponse<IBusinessPartners>>(URL, _customer);
    }

    /**
     * Send a request to retrieves all blanket agreements
     * @param _syncDate The last time when the device synchronize the blanket agreements
     * @constructor
     */
    GetBlanketAgreement(_syncDate: string | Date = new Date(0)): Observable<ICLResponse<IBlanketAgreement[]>> 
    {
        return this.http.get<ICLResponse<IBlanketAgreement[]>>('api/Mobile/BlanketAgreements', {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetBlanketAgreements'),
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Send a request to retrieves the count of all blanket agreements that was modified
     * @param _syncDate The last time when the device synchronize the blanket agreements
     * @constructor
     */
    GetBlanketAgreementCount(_syncDate: string): Observable<ICLResponse<IChangedInformation>>
    {
        if(!_syncDate)
        {
            return of({
                Data: {
                    Type: ChangeElement.Agreements,
                    Count: 1
                }
            } as ICLResponse<IChangedInformation>);
        }
        
        return this.http.get<ICLResponse<IChangedInformation>>('api/Mobile/BlanketAgreements/Count', {
            params: {
                LastUpdate: this.datePipe.transform(_syncDate, 'yyyy-MM-dd HH:mm:ss')
            }
        });
    }

    /**
     * Obtiene un socio de negocios por medio de su codigo de socio
     * @param _cardCode Codigo de socio de negocios que se quiere obtener informacion
     * @returns Un socio de negocios
     */
    GetCustomer(_cardCode: string): Observable<ICLResponse<BusinessPartnersModel>> {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/BusinessPartners?CardCode=${_cardCode}`;
        return this.http.get<ICLResponse<BusinessPartnersModel>>(URL);
    }

    /**
     * Send a request to retrieve the information of a customer
     * @param _cardCode The customer code to retrieve information
     * @constructor
     */
    GetBp(_cardCode: string): Observable<ICLResponse<IBusinessPartners>> {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/BusinessPartners`;
        return this.http.get<ICLResponse<IBusinessPartners>>(URL, {
            headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetCustomer'),
            params: {
                CardCode: _cardCode
            }
        });
    }

    /**
     * This method is used to get Addresses
     * @param _cardCode Business partner code
     * @param _page number page
     * @param _pageSize records by page
     * @returns 
     */
    GetAddress(_cardCode: string, _page: number = 0, _pageSize: number = 5): Observable<ICLResponse<IBpAddress[]>> {
        const headers = new HttpHeaders({
            'Cl-Sl-Pagination-Page': `${_page}`,
            'Cl-Sl-Pagination-Page-Size': `${_pageSize}`
        });
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/BusinessPartners/GetBPAddresses?CardCode=${_cardCode}&Pattern=`;
        return this.http.get<ICLResponse<IBpAddress[]>>(URL, { headers });
    }

    /**
     * This method is used to create bp address
     * @param _bpAddress models address list
     * @constructor
     */
    CreateBPAddress(_bpAddress: IBusinessPartners): Observable<ICLResponse<IBusinessPartners>> {
        const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/BusinessPartners/CreateBPAddress`;
        return this.http.patch<ICLResponse<IBusinessPartners>>(URL, _bpAddress);
    }


    /**
     * Method to obtain business partners according to filter
     * @param _value - Value to find business partner matches
     * @constructor
     */
    GetbyFilter<T>(_value: string = '', _page: number, _pageSize: number): Observable<ICLResponse<T>> {

        const userAssignment = this.localStorageService.get(LocalStorageVariables.UserAssignment) as IUserAssign;

        const headers = new HttpHeaders({
          'Cl-Sl-Pagination-Page': `${_page}`,
          'Cl-Sl-Pagination-Page-Size': `${_pageSize}`,
          "cl-offline-function-to-run": 'GetMinifiedCustomers'
        });

        return this.http.get<ICLResponse<T>>(`${this.CONTROLLER}/GetbyFilter`, {
            params: {
                FilterBusinessPartner: _value?.toUpperCase(),
                SlpCode: userAssignment.SlpCode      
            },
            headers: headers
        });
    }

}
