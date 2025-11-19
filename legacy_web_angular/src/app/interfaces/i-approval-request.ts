export interface IApprovalRequest {
  Code: number;
  ApprovalTemplatesID: number;
  ObjectType: string;
  IsDraft: string;
  ObjectEntry: number;
  Status: string;
  Remarks: string;
  DecisionRemarks: string;
  CurrentStage: number;
  OriginatorID: number;
  CreationDate: string;
  CreationTime: string;
  DraftEntry: number;
  DraftType: string;
  //Variable usada para verificar si es simulada o de SAP
  ApprovedType: string;
  ApprovalRequestLines: IApprovalRequestLine[];
  ApprovalRequestDecisions: IApprovalRequestDecision[];
}


export interface IApprovalRequestLine
{
  StageCode: number;
  UserID: number;
  Status: string;
  Remarks: string;
  UpdateDate: string;
  UpdateTime: string;
  CreationDate: string;
  CreationTime: string;
}

export interface IApprovalRequestDecision
{
  Status: string;
  Remarks: string;
}
