import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountPaymentPage } from './account-payment.page';

const routes: Routes = [
  {
    path: '',
    component: AccountPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountPaymentPageRoutingModule {}
