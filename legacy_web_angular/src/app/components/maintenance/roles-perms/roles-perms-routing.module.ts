import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {RolUserResolver} from 'src/app/resolvers/rol-user.resolver';
import {RoleResolver} from 'src/app/resolvers/role.resolver';
import {RolesPermsResolver} from 'src/app/resolvers/roles-perms.resolver';
import {RolesPermsComponent} from './roles-perms.component';
import {PermissionsResolver} from "@app/resolvers/permissions.resolver";

export const routes: Routes = [
  {
    path: '',
    component: RolesPermsComponent, resolve: {resolvedDataUser: RolUserResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'permission',
    component: RolesPermsComponent,
    resolve: {resolvedPermissions: PermissionsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'perms-by-rol',
    component: RolesPermsComponent, resolve: {resolvedDataPermsRol: RolesPermsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'roles',
    component: RolesPermsComponent, resolve: {resolvedData: RoleResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesPermsRoutingModule {
}
