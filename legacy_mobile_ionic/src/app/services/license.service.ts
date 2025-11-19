import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ICLResponse } from "../models/responses/response";
import { ILicenseUser } from "../interfaces/i-license-user";
import { LocalStorageService } from "./local-storage.service";
import { LocalStorageVariables } from "../common/enum";



@Injectable({
    providedIn: 'root'
})
export class LiceenseUserService {

    constructor(private http: HttpClient, private localStorageService: LocalStorageService) { }

    /**
     * This method is used to get licenses by user
     * @returns 
     */
    GetLicenseUser(): Observable<ICLResponse<ILicenseUser[]>> {
        const url: string = this.localStorageService.get(LocalStorageVariables.ApiURL);
        return this.http.get<ICLResponse<ILicenseUser[]>>(`${url}api/Licenses/GetLicenseUser`);
    }
}