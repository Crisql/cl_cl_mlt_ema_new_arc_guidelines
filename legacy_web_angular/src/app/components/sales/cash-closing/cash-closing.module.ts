import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CashClosingRoutingModule} from './cash-closing-routing.module';
import {CashClosingComponent} from './cash-closing.component';
import {MatTabsModule} from "@angular/material/tabs";
import {SharedModule} from "../../../shared/shared.module";
import {TableModule} from "@clavisco/table";
import {PdfViewerModule} from 'ng2-pdf-viewer';
import {SendEmailComponent} from "./sendEmail/send-email.component";


@NgModule({
  declarations: [
    CashClosingComponent,
    SendEmailComponent
  ],
  imports: [
    CommonModule,
    CashClosingRoutingModule,
    MatTabsModule,
    SharedModule,
    TableModule,
    PdfViewerModule
  ]
})
export class CashClosingModule {
}
