export interface ISerie {
  Name: string;//Serie Description
  Id: number;//es propio de sql lite
  DocType: number;//tipo de documento DocumentType
  Serie: number;//no serie
  FESerieId?: number;
  CompanyId?: number;
  Type: number;//SerieType
  Share: boolean;//siempre true
  GenerationType: number;//automatico o manual  --ISerial
  NextNumber: number;//no se usa
  Active: number;
  FESerie?: FESerie;
}

export interface FESerie {
  Id: number;
  Name: string;
  Sucursal: number;
  Terminal: number;
  DocType: string;
  NextNumber: number;
  Active: boolean;
}
