export interface ITerminals {
  Id: number;
  CreatedDate: string;
  CreatedBy: string;
  UpdateDate: string | null;
  UpdatedBy: string;
  IsActive: boolean;
  TerminalCode: string;
  Description: string;
  Currency: string;
  Password: string;
  QuickPayAmount: number;
  Assigned: boolean;
  Default: boolean;
}

export interface IPPTerminalUser {
  UserId: number;
  CompanyId: number;
  TerminalDefaultCOL: number;
  TerminalDefaultUSD: number;
  TerminalsByUser: ITerminalsByUser[];
}

export interface ITerminalsByUser {
  UserId: number;
  TerminalId: number;
  CompanyId: number;
  IsDefault: boolean;
}

export interface IterminalView extends ITerminals {
  Asigned: boolean;
}

export interface IPinpadTerminal extends ITerminals {
  TerminalId: string;
  UserName: string;
  Password: string;
  Status: boolean;
  Currency: string;
  QuickPayAmount: number;
  Description: string;
}
