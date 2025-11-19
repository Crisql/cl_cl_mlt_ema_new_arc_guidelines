import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LocalPrinterComponent} from "@Component/local-printer/local-printer.component";
import {LocalPrinterRoutingModule} from "@Component/local-printer/local-printer-routing.module";


@NgModule({
  declarations: [
    LocalPrinterComponent
  ],
  imports: [
    CommonModule,
    LocalPrinterRoutingModule,
    SharedModule,
    TableModule
  ]
})
export class LocalPrinterModule { }
