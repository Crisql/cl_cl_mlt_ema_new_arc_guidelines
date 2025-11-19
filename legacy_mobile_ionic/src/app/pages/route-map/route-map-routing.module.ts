import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteMapPage } from './route-map.page';

const routes: Routes = [
  {
    path: '',
    component: RouteMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteMapPageRoutingModule {}
