import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {InventoryOutputRoutingModule} from './inventory-output-routing.module';
import {InventoryOutputComponent} from './inventory-output.component';
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {SalesDocumentModule} from "@Component/sales/document/sales-document.module";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    InventoryOutputComponent
  ],
    imports: [
        CommonModule,
        InventoryOutputRoutingModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule,
        SalesDocumentModule,
        DynamicsUdfsPresentationModule
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class InventoryOutputModule {
}
