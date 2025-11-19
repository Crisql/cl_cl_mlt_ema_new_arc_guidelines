import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {CashClosingComponent} from './cash-closing.component';
import {CashClosingResolver} from "../../../resolvers/cash-closing.resolver";
import {CashClosingSearchResolver} from "../../../resolvers/cash-closing-search.resolver";

export const routes: Routes = [
  {
    path: '',
    component: CashClosingComponent,
    resolve: {resolvedData: CashClosingResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'search',
    component: CashClosingComponent,
    resolve: {resolvedSearchData: CashClosingSearchResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashClosingRoutingModule {
}
