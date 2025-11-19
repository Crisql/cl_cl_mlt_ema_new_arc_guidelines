import {IBaseEntity} from "./i-base-entity";

export interface IUdf {
  Name: string;
  FieldType: string;
  Value: string;
}

export interface IUdfContext {
  TableId: string;
  Name: string;
  Description: string;
  FieldType: string;
  Values: string;
  DataSource: string;
  TargetToOverride: string;
  PostTransactionObject: string;
  IsActive: boolean;
  IsRequired: boolean;
  IsRendered: boolean;
  IsTypehead: boolean;
  FieldID: number;
  MappedValues: UdfInvoke[];
  HeaderId: number;
  LinesId: number;
  DescriptionLines: string;
  Value: string;
}

export interface IUdfTransfer extends IBaseEntity {
  CompanyId: number;
  TableId: string;
  Udf: IUdfContext[];
}


export interface IUdfCategory {
  Name: string;
  Description: string;
  Key: string;
  KeyLine: string;

}

export interface UdfInvoke {
  Value: string;
  Description: string;
  IsActive: boolean;

}

export interface IUdfDevelopment {
  Key: string;
  Name: string;
  FieldType:string;
}

export interface UdfSource {
  CompanyId: number;
  TableId: string;
  Key: string;
  Value: string;
  Udf: IUdfContext[];
}

export interface UdfSourceLine extends UdfSource{
  Index: string,
  ValueLine: string
}

export interface IFilterKeyUdf {
  /**
   * DocEntry of the document to get udf data
   */
  DocEntry: number;
  /**
   * Line num of the document to get udf data
   */
  LineNum: number;
  /**
   * Card Code of the Partner assign the document
   */
  CardCode: string;

  /**
   * Item code to get data
   */
  ItemCode: string;

  /**
   * Document type to get udf data
   */
  TypeDocument: string;

  /**
   * Draft type to get fields configure
   */
  DraftType: string;
}

/**
 * Represent udf group model
 */
export interface IUdfGroup {
  Name: string;
  Description: string;
  IsActive: boolean;
}
