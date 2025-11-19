import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReceivedPaymentPage } from './received-payment.page';

const routes: Routes = [
  {
    path: '',
    component: ReceivedPaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReceivedPaymentPageRoutingModule {}
