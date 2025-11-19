import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CashFlowRoutingPageModule } from "./cash-flow-routing.module";

import { CashFlowPage } from "./cash-flow.page";
import { TranslateModule } from "@ngx-translate/core";
import {ScannerModule} from "../../components/scanner/scanner.module";

@NgModule({
  imports: [
    CommonModule,
    CashFlowRoutingPageModule,
    TranslateModule,
    IonicModule,
    ScannerModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [CashFlowPage],
})
export class CashFlowPageModule {}
