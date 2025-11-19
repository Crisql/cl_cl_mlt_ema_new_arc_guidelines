import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { PrintVoidCardsComponent } from './print-void-cards.component';
import {PrintVoidCardResolver} from "@app/resolvers/print-void-card.resolver";

export const routes: Routes = [
  {
    path: '',
    component: PrintVoidCardsComponent,
    resolve: { resolvedData: PrintVoidCardResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintVoidCardsRoutingModule { }
