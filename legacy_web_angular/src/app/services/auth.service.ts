import { Injectable } from '@angular/core';
import {IPermissionbyUser} from "@app/interfaces/i-roles";
import {StorageKey} from "@app/enums/e-storage-keys";
import {Repository} from "@clavisco/core";
import {IMenu} from "@app/interfaces/i-menu";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  Permissions = Repository.Behavior.GetStorageObject<IPermissionbyUser[]>(StorageKey.Permissions) as IPermissionbyUser[];
  Menu = Repository.Behavior.GetStorageObject<IMenu[]>(StorageKey.Menu) as IMenu[];

  HasPermission(_permission: string): boolean {
    return this.Permissions.some((p) => p.Name === _permission);
  }

  RouteValid(_route: string): IMenu | undefined {
    let menuNodes = this.Menu.reduce((acc, val) => acc.concat([val, ...val.Nodes]), [] as IMenu[]);

    return menuNodes.find((p) => p.Route != '' && _route.includes(p.Route));
  }

}
