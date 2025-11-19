import { IBaseReponse } from "../responses/response";
export interface IGroupCodeModel {
    Code: number;
    Name: string;
}
export interface CardGroupsResponse extends IBaseReponse
{
    cardGroupsList: IGroupCodeModel[];
}