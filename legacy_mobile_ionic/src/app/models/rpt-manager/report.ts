import { ReportParameter } from "./report-parameter";

export interface Report {
  Id: number;
  Name: string;
  DisplayName: string;
  Actve: boolean;
  LayoutConfig?: string;
  ReportUserId: number;
  ApplicationId: number;
}

export interface Report2 extends Report {
  Parameters: ReportParameter[];
}
