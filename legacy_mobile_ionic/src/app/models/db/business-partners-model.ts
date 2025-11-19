export interface BusinessPartnersModel {
  CardCode: string;
  CardName: string;
  Currency: string;
  ShipToDef: string;
  TaxCode: string;
  CreditLine: string;
  Balance: string;
  Phone1: string;
  Cellular: string;
  E_mail: string;
  Discount: number;
  PriceListNum: number;
  PayTermsGrpCode: number;
  GroupCode: number;
  U_MaxDiscBP: number;
  U_Lat: string;
  U_Lng: string;
  ContactPerson: string;
  TypeIdentification?: string;
  U_TipoIdentificacion: string;
  LicTradNum: string;
  U_provincia: string;
  U_canton: string;
  U_distrito: string;
  U_barrio: string;
  U_direccion: string;
  SubTipo: string;
  CashCustomer: boolean;
  HeaderDiscount: number;
  OTCXCondition: string;
  EmailAddress: string;
}

export interface BusinessPartnerMinified {
  CardCode: string;
  CardName: string;
}