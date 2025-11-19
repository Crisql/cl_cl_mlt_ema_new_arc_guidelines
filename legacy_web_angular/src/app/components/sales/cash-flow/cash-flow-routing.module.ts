import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CashFlowComponent} from './cash-flow.component';
import {CashFlowResolver} from "@app/resolvers/cash-flow.resolver";

export const routes: Routes = [
  {
    path: '',
    component: CashFlowComponent,
    resolve: {resolvedData: CashFlowResolver}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashFlowRoutingModule {
}
