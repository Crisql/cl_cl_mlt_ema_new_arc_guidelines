import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SearchInventoryTransfersRoutingModule} from './search-inventory-transfers-routing.module';
import {SearchInventoryTransfersComponent} from './search-inventory-transfers.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {SharedModule} from "@app/shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {RptmngMenuService} from "@clavisco/rptmng-menu";
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    SearchInventoryTransfersComponent
  ],
  imports: [
    CommonModule,
    SearchInventoryTransfersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    TableModule,
    MatTooltipModule
  ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class SearchInventoryTransfersModule {
}
