import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs/internal/Observable";
import { map } from "rxjs/operators";
import { AccountModel, ApiResponse, IBaseReponse } from "src/app/models";
import { LocalStorageService } from "./local-storage.service";
import {IAccount} from "../models/i-account";
import {ICLResponse} from "../models/responses/response";
import {IBusinessPartner} from "../models/i-business-partner";
import {LocalStorageVariables} from "../common/enum";
import {IUserAssign} from "../models/db/user-model";

@Injectable({
  providedIn: "root",
})
export class AccountService {
  constructor(
    private http: HttpClient,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService
  ) {}

  /**
   * Retrieves all accounts
   * @constructor
   */
  GetAccounts(): Observable<ICLResponse<IAccount[]>> 
  {
    const store = this.localStorageService.get(LocalStorageVariables.UserAssignment) as IUserAssign;
    
    return this.http.get<ICLResponse<IAccount[]>>('api/Accounts', {
      headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetAccounts'),
      params: {
        Store: store?.WhsCode ?? ''
      }
    });
  }
  
  ChangePass(Email: string, Password: string) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    const credentials = {
      Email,
      Password,
    };

    return this.http.post<IBaseReponse>(
      `${this.localStorageService.data.get("ApiURL")}api/Account/RecoverPswd`,
      credentials,
      { headers }
    );
  }

  SendVerificationCode(email: string) {
    const userEmail = {
      word: email,
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post(
      `${this.localStorageService.data.get(
        "ApiURL"
      )}api/Account/SendVerificationCode?lang=${
        this.translateService.currentLang
      }`,
      userEmail,
      { headers }
    );
  }

  VerifyCode(Email: string, Password: string) {
    let user = {
      Email,
      Password,
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post(
      `${this.localStorageService.data.get(
        "ApiURL"
      )}api/Account/VerifyCode?lang=${this.translateService.currentLang}`,
      user,
      { headers }
    );
  }

  RecoverPassMobile(Email: string, Password: string) {
    let info = {
      Email,
      Password,
    };
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });
    return this.http.post(
      `${this.localStorageService.data.get(
        "ApiURL"
      )}api/Account/RecoverPswdMobile?lang=${
        this.translateService.currentLang
      }`,
      info,
      { headers }
    );
  }
}
