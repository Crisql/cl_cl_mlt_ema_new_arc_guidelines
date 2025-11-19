import { Injectable } from '@angular/core';
import { LogEvent } from '../common';
import { Repository } from './repository.service';
import { ILogMobile } from '../models/db/i-log-mobile';
import { LocalStorageService } from './local-storage.service';
import { UserToken } from '../models/db/user-token';
import { Router } from '@angular/router';
import {IBaseReponse, ICLResponse} from '../models/responses/response';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { formatDate } from '@angular/common';
import {LocalStorageVariables, LogTransactionType} from '../common/enum';
import { Network } from '@ionic-native/network/ngx';
import {ILogEvent} from "../interfaces/i-log-events";

@Injectable({
  providedIn: 'root'
})
export class LogManagerService {

  constructor(
    private repositoryLog: Repository.Log,
    private localStorageService: LocalStorageService,
    private router: Router,
    private http: HttpClient,
    private network: Network
  ) {}

  Log(_event: LogEvent.INFO | LogEvent.SUCCESS | LogEvent.WARNING | LogEvent.ERROR, _detail: string, _view: string = '', _documentKey: string = '', _userSign: number = -1): void{
    
    let userToken: UserToken = this.localStorageService.get('Session');

    let transactionType: string = this.network.type === "none" ? LogTransactionType[0] : LogTransactionType[1];

    let log: ILogMobile = { 
      Id: -1,
      View: `${this.router.url}${_view}`, 
      Event: _event, 
      Detail: _detail,
      Date: formatDate(new Date(), 'yyyy-MM-dd h:mm:ss.SSS a', 'en'),
      User: userToken?.UserName,
      SyncStatus: 0,
      DocumentKey: _documentKey,
      TransactionType: transactionType,
      UserSign: _userSign
    };
    this.repositoryLog.AddLogMobile(log);
  }

  StoreLogs(logs: ILogEvent[]): Observable<ICLResponse<ILogEvent[]>> {
    const URL = `${this.localStorageService.get(LocalStorageVariables.ApiURL)}api/LogEvents/saveList`;
    return this.http.post<ICLResponse<ILogEvent[]>>(URL, logs);
  }
}
