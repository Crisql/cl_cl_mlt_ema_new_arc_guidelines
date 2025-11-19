import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusinessPartnerMasterDataPage } from './business-partner-master-data.page';

const routes: Routes = [
  {
    path: '',
    component: BusinessPartnerMasterDataPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusinessPartnerMasterDataPageRoutingModule {}
