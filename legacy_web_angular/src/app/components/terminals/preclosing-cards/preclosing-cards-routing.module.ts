import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { PreclosingCardsComponent } from './preclosing-cards.component';
import {PreClosingCardsResolver} from "@app/resolvers/pre-closing-cards.resolver";

export const routes: Routes = [
  {
    path: '',
    component: PreclosingCardsComponent,
    resolve: {resolvedData: PreClosingCardsResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreclosingCardsRoutingModule { }
