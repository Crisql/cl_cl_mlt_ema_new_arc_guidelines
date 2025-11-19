import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { PurchaseSearchDocsComponent } from './purchase-search-docs.component';
import {PurchaseSearchDocsResolver} from "../../../resolvers/purchase-search-docs.resolver";

export const routes: Routes = [
  {
    path: '',
    component: PurchaseSearchDocsComponent,
    resolve: {resolvedData: PurchaseSearchDocsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseSearchDocsRoutingModule { }
