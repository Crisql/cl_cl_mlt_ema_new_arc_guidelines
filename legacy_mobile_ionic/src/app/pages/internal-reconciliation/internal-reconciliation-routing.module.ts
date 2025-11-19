import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternalReconciliationPage } from './internal-reconciliation.page';

const routes: Routes = [
  {
    path: '',
    component: InternalReconciliationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternalReconciliationPageRoutingModule {}
