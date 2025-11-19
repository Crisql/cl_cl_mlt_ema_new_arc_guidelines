import {NgModule} from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {
  InternalReconciliationComponent
} from "@Component/banks-management/internal-reconciliation/internal-reconciliation.component";
import {InternalReconciliationResolver} from "@app/resolvers/internal-reconciliation.resolver";

export const routes: Routes = [
  {
    path: '',
    component: InternalReconciliationComponent,
    resolve: {resolvedData: InternalReconciliationResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InternalReconciliationRoutingModule {
}
