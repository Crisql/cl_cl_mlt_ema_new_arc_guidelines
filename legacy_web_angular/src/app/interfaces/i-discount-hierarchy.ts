import {Structures} from "@clavisco/core";
export interface IDiscountHierarchy extends Structures.Interfaces.IBaseEntity
{
  Type: number;
  Hierarchy: number;
  Description: string;
  CompanyId: number;
}
