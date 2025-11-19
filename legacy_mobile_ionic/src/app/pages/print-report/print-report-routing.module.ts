import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrintReportPage } from './print-report.page';

const routes: Routes = [
  {
    path: '',
    component: PrintReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrintReportPageRoutingModule {}
