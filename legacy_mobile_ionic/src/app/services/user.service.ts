import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, AppConstants, UsersResponse } from 'src/app/models';
import { LocalStorageService } from './local-storage.service';
import { IUserAssign } from "../models/db/user-model";
import { ICLResponse } from "../models/responses/response";
import { LocalStorageVariables } from "../common/enum";
import { ICompany } from "../models/db/companys";
import { IUserToken } from "../models/db/user-token";
import { IUser } from "../models/i-user";
import { ICashDeskclosing } from '../interfaces/i-cash-closing';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService) { }

  GetUsers(): Observable<ICLResponse<IUser[]>> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const URL = `${this.localStorageService.data.get('ApiURL')}api/Mobile/Users`

    return this.http.get<ICLResponse<IUser[]>>(URL, { headers });
  }

  GetCashDeskClousingUsers(_user: string, _from: string, _to: string): Observable<ICLResponse<ICashDeskclosing[]>> {
    const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/CashClosings?user=${_user}&dateFrom=${_from}&dateTo=${_to}`;
    return this.http.get<ICLResponse<ICashDeskclosing[]>>(URL);
  }

  GetUserAssign(): Observable<ICLResponse<IUserAssign>> {
    const userId = (this.localStorageService.get(LocalStorageVariables.Session) as IUserToken).UserId;
    const companyId = (this.localStorageService.get(LocalStorageVariables.SelectedCompany) as ICompany).Id;
    const URL = `${this.localStorageService.data.get('ApiURL')}api/Assigns?UserId=${userId}&CompanyId=${companyId}`;
    return this.http.get<ICLResponse<IUserAssign>>(URL);
  }

  GetCompanies(): Observable<ICLResponse<ICompany[]>> {
    let userId = (this.localStorageService.get(LocalStorageVariables.Session) as IUserToken).UserId;
    const URL = `${this.localStorageService.data.get("ApiURL")}api/Users/${userId}/Companies`;
    return this.http.get<ICLResponse<ICompany[]>>(URL);
  }
}
