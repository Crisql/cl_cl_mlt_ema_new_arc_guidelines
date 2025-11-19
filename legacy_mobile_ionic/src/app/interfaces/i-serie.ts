export interface ISeries {
    Id: number;
    UserAssingId: number;
    CompanyId: number;
    NoSerie: number;
    DocumentType: number;
    SerieType: number;
    SerieDescription: string;
    IsSerial: boolean;
    CreatedDate: Date;
    CreatedBy: string
    UpdateDate: Date;
    UpdatedBy: string;
    FESerie?: IFESerie;
}


export interface IFESerie {
    Id: number;
  /** Name assigned to the series */
  SerieName: string;

  /** Number of the BranchOffice */
  BranchOffice: number;

  /** Number of the terminal */
  Terminal: number;

  /** Next number of the series */
  NextNumber: number;

  /** Id of the series per user to which it relates */
  SeriesByUserId: number;
}

export interface ISerialType {
    IsSerial: boolean;
}