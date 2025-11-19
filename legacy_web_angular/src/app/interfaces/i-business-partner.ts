import {IBusinessPartnersFields} from "../interfaces/i-settings";
import {IUdf} from "@app/interfaces/i-udf";

/**
 *  Represents model to business partner
 */
export interface IBusinessPartner {

  /**
   * Represent business partner code
   */
  CardCode: string;

  /**
   * Represent business partner name
   */
  CardName: string;

  /**
   * Represent type of business partner
   */
  CardType: string;

  /**
   * Represents identification number of the business partner
   */
  FederalTaxID: string;

  /**
   * Represent business partner's email
   */
  EmailAddress: string;

  /**
   * Bill to default address
   */
  Address: string;

  /**
   * Represent business partner number
   */
  Phone1: string;

  /**
   * Represent business partner's serie
   */
  Series: number;

  /**
   * Represent business partner's  currency
   */
  Currency: string;

  /**
   * Represents the business partner's payment terms code
   */
  PayTermsGrpCode: number;

  /**
   * Represent business partner's price list
   */
  PriceListNum: number;

  /**
   * Represent business partner's sales person code
   */
  SalesPersonCode: number;

  /**
   * Represent cash business partner
   */
  CashCustomer: boolean;

  /**
   * Represent typeahead format
   */
  TypeAheadFormat: string;

  /**
   * Represent fields configurables of view business partner
   */
  ConfigurableFields: IBusinessPartnersFields[];

  /**
   * Represents whether company uses addresses
   */
  IsCompanyDirection: boolean;

  /**
   * Represents province of the business partner
   */
  Provincia: string;

  /**
   * Represents canton of the business partner
   */
  Canton: string;

  /**
   * Represents distrito of the business partner
   */
  Distrito: string;

  /**
   * Represents barrio of the business partner
   */
  Barrio: string;

  /**
   * Represents direccion of the business partner
   */
  Direccion: string;

  /**
   * Represents business partner group code
   */
  GroupCode: number;

  /**
   * Represents limit of the commitment
   */
  MaxCommitment: number;

  /**
   *  Represent parent summary type
   */
  FatherType: string;

  /**
   * Represent business partner summary
   */
  FatherCard: string;

  /**
   * Represents status of the business partner
   */
  Frozen: string;

  /**
   * Represent business partner discount
   */
  DiscountPercent: number;

  /**
   * Represents business partner address list
   */
  BPAddresses: IBPAddresses[];

  /**
   * Ship to default address
   */
  ShipToDefault: string;

  /**
   * Bill to default address
   */
  BilltoDefault: string;

  /**
   * Represent user-defined fields
   */
  Udfs: IUdf[]

  /**
   * Represents the date of the business partner created
   */
  CreateDate: string;

  /**
   * Unique identifier of the attachment
   */
  AttachmentEntry: number | null | undefined;
}

export interface IBusinessPartnerLocation {
  AddressLineNum: number;
  Address: string;
  Latitude: string;
  Longitude: string;
  IsDefault: boolean;
  OtherSigns: string;
  AddressLineId: string;
  AddressType: number;
}

export interface IBPAddresses {
  Id: number;
  AddressName: string;
  Street: string;
  Block: string;
  ZipCode: string;
  City: string;
  County: string;
  Country: string;
  State: string;
  AddressType: string;
  AddressName2: string;
  AddressName3: string;
  BPCode: string;
  GlobalLocationNumber: string;
  StreetNo: string;
  BuildingFloorRoom: string;
  RowNum: number;
  ConfigurableFields: IBusinessPartnersFields[];
  InDB: boolean;
  RowColor: string;
  IsDefault: boolean;
}

export interface IAddressType {
  Code: string;
  Name: string;
}

export interface IBusinessPartnerGroup {
  Code: number;
  Name: string;
}

export interface IBusinessPartnerCurrecies {
  Code: number;
  Description: string;
  IsDefault: boolean;
}

export interface ISocioComercial {
  Code: number;
  Description: string;
  IsDefault: boolean;
}

/**
 * Represent the line model of the SAP attachment
 */
export interface IAttachments2Line {
  /**
   * Local identifier
   */
  Id: number;
  /**
   * The unique identifier of the attachment
   */
  AbsoluteEntry: number;
  /**
   * The line number of the attachment
   */
  LineNum: number;
  /**
   * The physical path where the attachment file is stored
   */
  SourcePath: string;
  /**
   * Name of the attachment file
   */
  FileName: string;
  /**
   * The file extension of the attachment
   */
  FileExtension: string;
  /**
   * Last modified date of the attachment
   */
  AttachmentDate: string;
  /**
   * Indicates if should override the attachment file
   */
  Override: string;
  /**
   * Description about attachment file
   */
  FreeText: string;
}

export interface IAttachments2 {
  CardCode: string;
  AbsoluteEntry: number;
  Attachments2_Lines: IAttachments2Line[];
}

export interface IBPProperties {
  Id: number;
  GroupCode: string;
  GroupName: string;
  Value: string;
  IsActive: boolean;
}

export interface IPatchProperties {
  CardCode: string;
  PropertiesList: IBPProperties[];
}

export interface IBPProperty {
  Properties1: string;
  Properties2: string;
  Properties3: string;
  Properties4: string;
  Properties5: string;
  Properties6: string;
  Properties7: string;
  Properties8: string;
  Properties9: string;
  Properties10: string;
  Properties11: string;
  Properties12: string;
  Properties13: string;
  Properties14: string;
  Properties15: string;
  Properties16: string;
  Properties17: string;
  Properties18: string;
  Properties19: string;
  Properties20: string;
  Properties21: string;
  Properties22: string;
  Properties23: string;
  Properties24: string;
  Properties25: string;
  Properties26: string;
  Properties27: string;
  Properties28: string;
  Properties29: string;
  Properties30: string;
  Properties31: string;
  Properties32: string;
  Properties33: string;
  Properties34: string;
  Properties35: string;
  Properties36: string;
  Properties37: string;
  Properties38: string;
  Properties39: string;
  Properties40: string;
  Properties41: string;
  Properties42: string;
  Properties43: string;
  Properties44: string;
  Properties45: string;
  Properties46: string;
  Properties47: string;
  Properties48: string;
  Properties49: string;
  Properties50: string;
  Properties51: string;
  Properties52: string;
  Properties53: string;
  Properties54: string;
  Properties55: string;
  Properties56: string;
  Properties57: string;
  Properties58: string;
  Properties59: string;
  Properties60: string;
  Properties61: string;
  Properties62: string;
  Properties63: string;
  Properties64: string;
}



/**
 *  Represents model to activate business partner
 */
export interface IActivateBusinessPartner {

  /**
   * Represent business partner code
   */
  CardCode: string;

  /**
   * Activate BusinessPartner
   */
  Valid: string;
}
