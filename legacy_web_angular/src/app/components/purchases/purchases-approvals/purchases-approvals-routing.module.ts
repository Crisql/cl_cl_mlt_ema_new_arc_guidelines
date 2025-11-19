import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from "@angular/router";
import {PurchasesApprovalsComponent} from "@Component/purchases/purchases-approvals/purchases-approvals.component";
import {PurchasesApprovalDocsResolver} from "@app/resolvers/purchases-approval-docs.resolver";

export const routes: Routes = [
  {
    path: '',
    component: PurchasesApprovalsComponent,
    resolve: {resolvedData: PurchasesApprovalDocsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasesApprovalsRoutingModule { }
