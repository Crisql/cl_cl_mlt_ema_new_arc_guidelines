import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { FrequenciesComponent } from './frequencies.component';
import {FrequenciesResolver} from "@app/resolvers/frequencies.resolver";

export const routes: Routes = [
  {
    path: '',
    component: FrequenciesComponent,
    resolve: {resolvedData: FrequenciesResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrequenciesRoutingModule { }
