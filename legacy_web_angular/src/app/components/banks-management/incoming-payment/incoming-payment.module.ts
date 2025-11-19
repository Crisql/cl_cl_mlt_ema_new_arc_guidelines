import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncomingPaymentsRoutingModule } from './incoming-payment-routing.module';
import { IncomingPaymentComponent } from './incoming-payment.component';
import {SharedModule} from "../../../shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {OverlayService} from "@clavisco/overlay";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import {FlexModule} from "@angular/flex-layout";


@NgModule({
  declarations: [
    IncomingPaymentComponent,
    ReconciliationComponent
  ],
    imports: [
        CommonModule,
        IncomingPaymentsRoutingModule,
        SharedModule,
        TableModule,
        DynamicsUdfsPresentationModule,
        FlexModule
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
export class IncomingPaymentsModule { }
