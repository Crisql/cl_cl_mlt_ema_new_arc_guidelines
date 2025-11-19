export interface IBlanketAgreements {
  AbsID:number ;
  CardCode :string;
  BpType :string;
  StartDate :Date;
  EndDate :Date;
  TerminationDate? :Date;
  Description :string;
  Type:string;
  PayMethod:string;
  Status:string;
  Lines:BlanketAgreementDetail[];
  Method:string;
}


export interface BlanketAgreementDetail {
  AbsID :number;
  ItemCode:string;
  ItemGroup:number;
  UnitPrice :number;
  Currency:string;
  PlanQty:number;
  Discount:number;
}
