import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InternalReconciliationComponent} from './internal-reconciliation.component';
import {SharedModule} from "../../../shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {OverlayService} from "@clavisco/overlay";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";
import {FlexModule} from "@angular/flex-layout";
import {
  InternalReconciliationRoutingModule
} from "@Component/banks-management/internal-reconciliation/internal-reconciliation-routing.module";


@NgModule({
  declarations: [
    InternalReconciliationComponent
  ],
  imports: [
    CommonModule,
    InternalReconciliationRoutingModule,
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
export class InternalReconciliationModule { }

