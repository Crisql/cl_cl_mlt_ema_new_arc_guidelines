import { IBaseEntity } from "./i-base-entity";

export interface IRole extends IBaseEntity {
    Name: String;
    Description: String;
}
export interface IPermission extends IRole{
    PermissionType: number | string;
}

export interface IPermissionbyUser {
  Name:  string;
}
