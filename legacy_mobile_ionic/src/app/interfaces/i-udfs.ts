import {IBaseEntity} from "../models/db/companys";


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
    MappedValues: IUdfInvoke[];
    HeaderId: number;
    LinesId: number;
    DescriptionLines: string;
    Value: string;

    /**
     * Property used for synchronization
     */
    IsForDevelopment: boolean;
}

export interface IUdfTransfer extends IBaseEntity {
    CompanyId: number;
    TableId: string;
    Udf: IUdfContext[];
}


/**
 * Represent the tables to retrieve UDFs
 */
export interface IUdfCategory {
    /**
     * SAP Table name
     */
    Name: string;
    /**
     * SAP Table description
     */
    Description: string;
    /**
     * Represent the name of the unique identifier property of the table
     */
    Key: string;
    /**
     * Represent the name of the unique identifier property of the lines table
     */
    KeyLine: string;
    /**
     * SAP Lines table
     */
    LineCategory: string;
}

/**
 * Represent the model of the values of an UDFs
 */
export interface IUdfInvoke {
    /**
     * The value of the UDF
     */
    Value: string;
    /**
     * The display name of the value
     */
    Description: string;
}

/**
 * Represent a UDF used internally by the application
 */
export interface IUdfDevelopment {
    /**
     * The key of the UDF
     */
    Key: string;
    /**
     * The name of the UDF
     */
    Name: string;
    /**
     * Type of the UDF value. Like String, Int32...
     */
    FieldType:string;
    /**
     * The table where this UDF are
     */
    Tables: string;
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
    DocEntry: number;
    LineNum: number;
    CardCode: string;
    ItemCode: string;
    TypeDocument: string;
}
