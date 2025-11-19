import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import {ApiResponse, PermissionsSelectedModel, PermissionsSelectedResponse} from "../models";
import { LocalStorageService } from "./local-storage.service";
import {ICLResponse} from "../models/responses/response";
import { Observable } from 'rxjs';
import {IPermission} from "../models/db/permissions";

@Injectable({
  providedIn: "root",
})
export class PermissionService {
  Permissions: PermissionsSelectedModel[] = [];
  
  constructor(
    public http: HttpClient,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService
  ) {}

  /**
   * Retrieves all user permissions
   * @constructor
   */
  GetPermissionsByUserMobile(): Observable<ICLResponse<IPermission[]>> 
  {
    return this.http.get<ICLResponse<IPermission[]>>('api/PermissionUser', { 
      headers: new HttpHeaders().set("cl-offline-function-to-run", 'GetPermissions')
    });
  }
}
