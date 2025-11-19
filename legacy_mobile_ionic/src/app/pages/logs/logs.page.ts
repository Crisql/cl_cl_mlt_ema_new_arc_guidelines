import { Component, OnInit } from '@angular/core';
import { ILogMobile, ILogSetting } from 'src/app/models';
import {LocalStorageService, LogManagerService, Repository} from 'src/app/services';
import {LogEvent, AlertType, LocalStorageVariables, SettingCodes} from '../../common/enum';
import { Network } from '@ionic-native/network/ngx';
import { CommonService } from '../../services/common.service';
import { CompanyService } from '../../services/company.service';
import {ICompany} from "../../models/db/companys";
import {from, of} from "rxjs";
import {catchError, concatMap, filter, finalize, map, switchMap, toArray} from "rxjs/operators";
import {ILogEvent} from "../../interfaces/i-log-events";
import {SettingsService} from "../../services/settings.service";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LogsPage implements OnInit {
  logs: ILogMobile[];

  constructor(
    private logManagerService: LogManagerService,
    private repositoryLog: Repository.Log,
    public network: Network,
    private commonService: CommonService,
    private companyService: CompanyService,
    private localStorageService: LocalStorageService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.repositoryLog.GetLogs().then(logs => {
      this.logs = logs.sort((a,b) => (new Date(b.Date).getTime() + b.Id) - (new Date(a.Date).getTime() + a.Id));
    }).catch(error => {
      this.logManagerService.Log(LogEvent.ERROR, error)
    })
  }

  GetLogEvent(log: ILogMobile): string {
    switch(log.Event){
      case LogEvent.INFO:
        return "INFO";
      case LogEvent.SUCCESS:
        return "SUCCESS";
      case LogEvent.WARNING:
        return "WARNING";
      case LogEvent.ERROR:
        return "ERROR";
      default:
        return ""
    }
  }

  GetLogIcon(log: ILogMobile): string {
    switch(log.Event){
      case LogEvent.INFO:
        return "clvs-alert-info";
      case LogEvent.SUCCESS:
        return "clvs-alert-success";
      case LogEvent.WARNING:
        return "clvs-alert-warning";
      case LogEvent.ERROR:
        return "clvs-alert-error";
      default:
        return ""
    }
  }

/**
 * Send all the application logs to the backend to store them in the database.
 * @constructor
 */
  async SyncLogsMobile(): Promise<void> {
    let loader = await this.commonService.Loader("Sincronizando eventos", "Sync events");
    
    loader.present();
    
    this.repositoryLog.GetUnsyncLogs()
      .then(next => {
        let unsyncLogs: ILogMobile[] = next;
        
        if(unsyncLogs && unsyncLogs.length)
        {
          this.settingsService.GetSettingByCode(SettingCodes.EventViewer)
              .pipe(
                  map(callback => {
                    let company: ICompany = this.localStorageService.get(LocalStorageVariables.SelectedCompany);
                    
                    let logSettings: ILogSetting[] = JSON.parse(callback.Data.Json || '');
                    
                    let logSetting = logSettings?.find(x => x.CompanyId === company?.Id);
                    
                    unsyncLogs = unsyncLogs
                        .filter(x => (logSetting?.Information && x.Event == LogEvent.INFO) || 
                            (logSetting?.Success && x.Event == LogEvent.SUCCESS) || 
                            (logSetting?.Warning && x.Event == LogEvent.WARNING) || 
                            (logSetting?.Error && x.Event == LogEvent.ERROR)
                    );
    
                    return unsyncLogs;
                  }),
                  filter(callback => callback && callback.length > 0),
                  switchMap(callback => this.logManagerService.StoreLogs(callback.map(element => {
                          return {
                              Event: element.Event,
                              View: element.View,
                              Detail: element.Detail,
                              DocumentKey: element.DocumentKey
                          } as ILogEvent
                      }))
                      .pipe(
                          map(response => callback)
                      )
                  ),
                  finalize(() => loader.dismiss())
          ).subscribe({
              next: (callback) => {
                  if (callback && callback.length) 
                  {
                      unsyncLogs.forEach(log => {
                          log.SyncStatus = 1;
                          this.repositoryLog.UpdateLogMobile(log)
                              .catch(error => {
                                  this.commonService.alert(AlertType.ERROR, error);
                              });
                      });
                      
                      this.commonService.Alert(AlertType.SUCCESS, 'Eventos sincronizados', 'Events sync');
                  }
              }, error: (error) => {
                  this.commonService.alert(AlertType.ERROR, error);
              }
          });
        } 
        else 
        {
          loader.dismiss();
          
          this.commonService.Alert(AlertType.SUCCESS, 'No hay eventos para sincronizar', 'No events to sync');
        }
      })
      .catch(error => {
        loader.dismiss();
        this.commonService.alert(AlertType.ERROR, error);
      });
  }
}
