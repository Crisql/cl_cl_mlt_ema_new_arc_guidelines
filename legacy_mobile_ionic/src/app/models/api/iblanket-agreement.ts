import { IBlanketAgreementLine } from "..";

export interface IBlanketAgreement {
  AbsID: number;
  CardCode: string;
  StartDate: Date;
  EndDate: Date;
  TerminationDate: Date;
  Description: string;
  Type: string;
  PayMethod: string;
  Lines: IBlanketAgreementLine[];
}
