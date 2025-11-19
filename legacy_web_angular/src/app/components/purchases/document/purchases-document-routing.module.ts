import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {PurchasesDocumentComponent} from "./purchases-document.component";
import {PurchasesDocumentResolver} from "../../../resolvers/purchases-document.resolver";

export const routes: Routes = [
  {
    path: '',
    component: PurchasesDocumentComponent,
    resolve: {resolvedData: PurchasesDocumentResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
    return !future.queryParamMap.keys.length;
  }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasesDocumentRoutingModule { }
