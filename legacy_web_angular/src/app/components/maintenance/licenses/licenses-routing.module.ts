import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { LicenseResolver } from 'src/app/resolvers/license.resolver';
import { LicensesComponent } from './licenses.component';
import {AuthGuard} from "@app/guards/auth.guard";

export const routes: Routes = [
  {
    path: '',
    component: LicensesComponent,
    resolve: {resolvedData: LicenseResolver},
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    },

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LicensesRoutingModule { }
