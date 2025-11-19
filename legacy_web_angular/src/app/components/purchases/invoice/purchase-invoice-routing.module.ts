import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {PurchaseInvoiceComponent} from '@Component/purchases/invoice/purchase-invoice.component';
import {PurchaseInvoiceResolver} from "@app/resolvers/purchase-invoice.resolver";

export const routes: Routes = [
  {
    path: '',
    component: PurchaseInvoiceComponent,
    resolve: {resolvedData: PurchaseInvoiceResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseInvoiceRoutingModule {
}
