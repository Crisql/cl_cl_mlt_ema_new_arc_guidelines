import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import {HttpClient} from "@angular/common/http";
import {TranslateService} from "@ngx-translate/core";
import {CommonService} from "./common.service";
import {ICLResponse} from "../models/responses/response";
import {UpcomingExchangeRate} from "../models/db/i-exchange.rate";
import {IMenuMobile} from "../interfaces/i-menu";
import {StructuresService} from "./structures.service";

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private localStorageService: LocalStorageService,
              private http: HttpClient,
              private translateService: TranslateService,
              private commonService: CommonService,
              private sharedService: StructuresService) {}
  
  GetUpcomingMenu(_language : string):  Observable<ICLResponse<IMenuMobile[]>>
  {
    return this.http.get<ICLResponse<IMenuMobile[]>>('api/Menu/GetMobile',{
      params: { language: _language.toUpperCase()}
    });
  }
  /**
   * Triggers the loading of the menu for a specified language.
   *
   * @param _language - The language code for which the menu should be loaded.
   *                    It should be a string representing the language, e.g., 'en', 'es'.
   */
  triggerLoadMenu(_language: string): void {
    this.sharedService.triggerLoadMenu(_language);
  }
}
