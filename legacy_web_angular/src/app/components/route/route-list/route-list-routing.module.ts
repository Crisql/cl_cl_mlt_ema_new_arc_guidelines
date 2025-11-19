import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { RouteListComponent } from './route-list.component';
import {RouteListResolver} from "@app/resolvers/route-list.resolver";
import {RouteAssignmentResolver} from "@app/resolvers/route-assignment.resolver";
import {RouteAssignmentComponent} from "@Component/route/route-list/route-assignment/route-assignment.component";

export const routes: Routes = [
  {
    path: '',
    component: RouteListComponent,
    resolve: {resolvedData: RouteListResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RouteListRoutingModule { }
