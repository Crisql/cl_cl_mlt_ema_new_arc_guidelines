import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConstants, LogEvent } from "src/app/common";
import { Email, Parameter, Report } from "src/app/models";
import { CommonService } from "./common.service";
import { LocalStorageService } from "./local-storage.service";
import { LogManagerService } from "./log-manager.service";
import { PermissionService } from "./permission.service";

@Injectable({
  providedIn: "root",
})
export class RptManagerService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
    , private logManagerService: LogManagerService
    , private commonService: CommonService
  ) { }

  GetReports() {
    const headers = new HttpHeaders({
      "Content-Type": "application/json"
    });

    return this.http.get<any>(
      `${this.localStorageService.GetReportManagerURL()
      }api/Reports/GetReports?companyKey=0&appKey=${+this.localStorageService.get(
        "KeyReportManager"
      )}`,
      { headers }
    );
  }

  GetParameters(reportId: number) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.get<any>(
      `${this.localStorageService.GetReportManagerURL()}api/Parameter/GetParameters?reportId=${reportId}`,
      { headers }
    );
  }

  PrintReport(parameters: Parameter[], reportId: number) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post<any>(
      `${this.localStorageService.GetReportManagerURL()}api/Reports/PrintReport?reportId=${reportId}`,
      parameters,
      { headers }
    );
  }

  GetReport(reportId: number) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.get<any>(
      `${this.localStorageService.GetReportManagerURL()}api/Reports/GetReport?reportId=${reportId}`,
      { headers }
    );
  }

  SendEmail(emailInfo: Email, reportId: number) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post<any>(
      `${this.localStorageService.GetReportManagerURL()}api/Reports/SendEmail?reportId=${reportId}`,
      emailInfo,
      { headers }
    );
  }

  AddReportsToMenu(_reports: Report[], _defaultMenuOption: any) {
    _reports.forEach((report, index) => {
      try 
      {
        this.AddReportToMenu(report, _defaultMenuOption, index);
      }
      catch (error) {
        const DESCRIPTION = this.commonService.Translate(`No se pudo agregar el reporte: `, `Can't add report: `) + report.DisplayName + ' - ' + error?.toString();
        this.logManagerService.Log(LogEvent.ERROR, DESCRIPTION, '/ReportManagerComponent');
      }
    });
  }

  private TargetMenuOption(layoutConfig: any, menu: any[]) {
    if (!layoutConfig || !menu) return null;

    let targetNode = menu.find((x) => x.Id == layoutConfig.Id);

    if (layoutConfig.GoesTo && targetNode)
      this.TargetMenuOption(layoutConfig.GoesTo, targetNode.Sons);
    else return targetNode;
  }

  private AddReportToMenu(report: Report, menuOption: any, index: number) {
    if (!menuOption) return;
    if (!menuOption.Sons) menuOption.Sons = [];

    let reportIndex= menuOption.Sons.findIndex(x => x.Name === report.DisplayName);

    if(reportIndex >= 0) menuOption.Sons.splice(reportIndex, 1);

    menuOption.Sons.push({
      Name: report.DisplayName,
      Id: 48 + index,
      Icon: "clvs-reports",
      Sons: [],
      Url: 1,
      Page: `print-report/${report.Id}`,
      Perm: "",
    });
  }
}
