import { NgModule } from '@angular/core';
import {ActivatedRouteSnapshot, RouterModule, Routes} from '@angular/router';
import { TerminalsComponent } from './terminals.component';
import { TerminalsResolver } from 'src/app/resolvers/terminals.resolver';
import {TerminalsByUsersResolver} from "../../../resolvers/terminals-by-users.resolver";

export const routes: Routes = [
  {
    path: '',
    component: TerminalsComponent,
    resolve: { resolveTerminalsData: TerminalsResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  },
  {
    path: 'terms-by-users',
    component: TerminalsComponent,
    resolve: { resolveTerminalsByUsersData: TerminalsByUsersResolver },
    runGuardsAndResolvers: (curr: ActivatedRouteSnapshot, future: ActivatedRouteSnapshot) => {
      return !future.queryParamMap.keys.length;
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminalsRoutingModule { }
