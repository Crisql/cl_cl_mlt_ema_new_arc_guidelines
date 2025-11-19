import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import {SalesDocumentComponent} from "./sales-document.component";
import {SalesDocumentResolver} from "../../../resolvers/sales-document.resolver";

export const routes: Routes = [
  {
    path: '',
    component: SalesDocumentComponent,
    resolve: {resolvedData: SalesDocumentResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesDocumentRoutingModule { }
