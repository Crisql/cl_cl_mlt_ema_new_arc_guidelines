import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { OutgoingPaymentComponent } from './outgoing-payment.component';
import {PaymentEffectedResolver} from "@app/resolvers/payment-effected.resolver";

export const routes: Routes = [
  {
    path: '',
    component: OutgoingPaymentComponent,
    resolve: {resolvedData: PaymentEffectedResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OutgoingPaymentRoutingModule { }
