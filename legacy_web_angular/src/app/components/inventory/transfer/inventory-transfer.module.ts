import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InventoryTransferRoutingModule} from './inventory-transfer-routing.module';
import {InventoryTransferComponent} from './inventory-transfer.component';
import {SharedModule} from "@app/shared/shared.module";
import {LinkerService} from "@clavisco/linker";
import {ReactiveFormsModule} from "@angular/forms";
import {TableModule} from "@clavisco/table";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    InventoryTransferComponent
  ],
    imports: [
        CommonModule,
        InventoryTransferRoutingModule,
        SharedModule,
        ReactiveFormsModule,
        TableModule,
        DynamicsUdfsPresentationModule
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class InventoryTransferModule {
}
