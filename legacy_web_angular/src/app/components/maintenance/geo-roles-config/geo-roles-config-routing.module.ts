import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {GeoRolesConfigComponent} from "@Component/maintenance/geo-roles-config/geo-roles-config.component";
import {GeoRolesUserResolver} from "@app/resolvers/geo-roles-user.resolver";
import {GeoConfigsResolver} from "@app/resolvers/geo-configs.resolver";
import {GeoRolesConfigsResolver} from "@app/resolvers/geo-roles-configs.resolver";
import {GeoRolesResolver} from "@app/resolvers/geo-roles.resolver";

export const routes: Routes = [
  {
    path: '',
    component: GeoRolesConfigComponent, resolve: { resolvedDataGeoRolesUser: GeoRolesUserResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'geo-configs-by-geo-role',
    component: GeoRolesConfigComponent, resolve: { resolvedDataGeoConfigsByGeoRole: GeoRolesConfigsResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'geo-roles',
    component: GeoRolesConfigComponent, resolve: { resolvedDataGeoRoles: GeoRolesResolver },
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
export class GeoRolesConfigRoutingModule { }
