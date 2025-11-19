import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: 'new',
    loadChildren: () => import('./new-route/new-route.module').then(m => m.NewRouteModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'list',
    loadChildren: () => import('./route-list/route-list.module').then(m => m.RouteListModule),
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RouteRoutingModule { }
