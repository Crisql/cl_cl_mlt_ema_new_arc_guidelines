import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from "@angular/router";
import {ApprovalsComponent} from "@Component/sales/approvals/approvals.component";
import {SearchDocsResolver} from "@app/resolvers/search-docs.resolver";
import {ApprovalDocsResolver} from "@app/resolvers/approval-docs.resolver";

export const routes: Routes = [
  {
    path: '',
    component: ApprovalsComponent,
    resolve: {resolvedData: ApprovalDocsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalsRoutingModule { }
