import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CancelPaymentRoutingModule } from './cancel-payment-routing.module';
import { CancelPaymentComponent } from './cancel-payment.component';
import {SharedModule} from "../../../shared/shared.module";
import {LinkerService} from "@clavisco/linker";
import {OverlayService} from "@clavisco/overlay";
import {TableModule} from "@clavisco/table";
import {DetailPaymentComponent} from "./detail-payment/detail-payment.component";


@NgModule({
  declarations: [
    CancelPaymentComponent,
    DetailPaymentComponent
  ],
  imports: [
    CommonModule,
    CancelPaymentRoutingModule,
    SharedModule,
    TableModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    },
    {
      provide: 'OverlayService',
      useExisting: OverlayService
    }
  ]
})
export class CancelPaymentModule { }
