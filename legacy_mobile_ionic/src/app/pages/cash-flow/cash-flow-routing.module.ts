import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashFlowPage } from './cash-flow.page';

const routes: Routes = [
  {
    path: '',
    component: CashFlowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashFlowRoutingPageModule {}
