import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LocalPrinterComponent} from "@Component/local-printer/local-printer.component";
import {LocalPrinterResolver} from "@app/resolvers/local-printer.resolver";

export const routes: Routes = [
  {
    path: '',
    component: LocalPrinterComponent,
    resolve: {resolvedData: LocalPrinterResolver}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocalPrinterRoutingModule { }
