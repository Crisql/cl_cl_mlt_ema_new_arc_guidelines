import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { NewRouteComponent } from './new-route.component';
import {NewRouteResolver} from "@app/resolvers/new-route.resolver";

export const routes: Routes = [
  {
    path: '',
    component: NewRouteComponent,
    resolve: {resolvedData: NewRouteResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewRouteRoutingModule { }
