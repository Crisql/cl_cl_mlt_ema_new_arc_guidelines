import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentSearchPage } from './payment-search.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentSearchPageRoutingModule {}
