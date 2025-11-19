import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {IncomingPaymentComponent} from './incoming-payment.component';
import {PaymentReceivedResolver} from "../../../resolvers/payment-received.resolver";

export const routes: Routes = [
  {
    path: '',
    component: IncomingPaymentComponent,
    resolve: {resolvedData: PaymentReceivedResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomingPaymentsRoutingModule {
}
