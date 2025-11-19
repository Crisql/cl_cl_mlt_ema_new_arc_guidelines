import {IMenuNode} from "@clavisco/menu";

export interface IMenu {//extends IMenuNode {
  Key: string;
  Description: string;
  Route: string;
  Icon: string;
  Visible: boolean;
  Nodes: IMenu[];
  NamePermission: string;
  Category: string;
}
