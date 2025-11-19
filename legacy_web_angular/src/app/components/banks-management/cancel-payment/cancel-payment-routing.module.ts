import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { CancelPaymentComponent } from './cancel-payment.component';
import {CancelPaymentResolver} from "@app/resolvers/cancel-payment.resolver";



export const routes: Routes = [
  {
    path: '',
    component: CancelPaymentComponent,
    resolve: {resolvedData: CancelPaymentResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CancelPaymentRoutingModule { }
