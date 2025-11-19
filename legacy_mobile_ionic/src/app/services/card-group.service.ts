import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";
import { LocalStorageService } from "./local-storage.service";
import {CardGroupsResponse, IGroupCodeModel} from "src/app/models/db/groupCode-model";
import {ICLResponse} from "../models/responses/response";

@Injectable({
  providedIn: "root",
})
export class CardGroupService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  GetCardGroup(): Observable<ICLResponse<IGroupCodeModel[]>> {
    const URL = `${this.localStorageService.data.get("ApiURL")}api/BusinessPartnerGroups`
    return this.http.get<ICLResponse<IGroupCodeModel[]>>(URL);
  }
}
