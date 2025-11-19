import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {CreditMemoComponent} from './credit-memo.component';
import {SalesDocumentResolver} from "../../../resolvers/sales-document.resolver";
import {CreditMemoResolver} from "../../../resolvers/credit-memo.resolver";

export const routes: Routes = [
  {
    path: '',
    component: CreditMemoComponent,
    resolve: {resolvedData: CreditMemoResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditMemoRoutingModule {
}
