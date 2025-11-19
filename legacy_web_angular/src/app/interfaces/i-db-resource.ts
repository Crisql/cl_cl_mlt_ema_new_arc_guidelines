import { IBaseEntity } from "./i-base-entity";

export interface IDBResource extends IBaseEntity
{
    Code: string;
    Description: string;
    DBObject: string;
    QueryString: string;
    PageSize: number;
    Type: string;
}

export interface IDBResourceType
{
    Description: string;
    Type: string;
}

export interface IDBResourceWithCompany extends IDBResource
{
  CompanyId: number;
}
