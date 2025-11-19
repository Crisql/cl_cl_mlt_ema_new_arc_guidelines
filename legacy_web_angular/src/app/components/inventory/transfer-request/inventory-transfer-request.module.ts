import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryTransferRequestRoutingModule } from './inventory-transfer-request-routing.module';
import { InventoryTransferRequestComponent } from './inventory-transfer-request.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {DynamicsUdfsPresentationModule} from "@clavisco/dynamics-udfs-presentation";


@NgModule({
  declarations: [
    InventoryTransferRequestComponent
  ],
    imports: [
        CommonModule,
        InventoryTransferRequestRoutingModule,
        ReactiveFormsModule,
        SharedModule,
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
export class InventoryTransferRequestModule { }
