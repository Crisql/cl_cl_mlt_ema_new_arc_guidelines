import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteDestinationsPage } from './route-destinations.page';

const routes: Routes = [
  {
    path: '',
    component: RouteDestinationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteDestinationsPageRoutingModule {}
