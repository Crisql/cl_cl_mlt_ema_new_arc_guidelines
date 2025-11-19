import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusinessPartnerLocationsPage } from './business-partner-locations.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessPartnerLocationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessPartnerLocationsPageRoutingModule {}
