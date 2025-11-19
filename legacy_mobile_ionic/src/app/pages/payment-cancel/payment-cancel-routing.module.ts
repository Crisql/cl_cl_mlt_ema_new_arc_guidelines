import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentCancelPage } from './payment-cancel.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentCancelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentCancelPageRoutingModule {}
