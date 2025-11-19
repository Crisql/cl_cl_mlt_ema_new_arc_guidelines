import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { TranslateModule } from "@ngx-translate/core";

import { PrintReportPageRoutingModule } from "./print-report-routing.module";

import { PrintReportPage } from "./print-report.page";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    PrintReportPageRoutingModule,
    TranslateModule,
  ],
  declarations: [PrintReportPage],
  providers: [],
})
export class PrintReportPageModule {}
