import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewRouteRoutingModule } from './new-route-routing.module';
import { NewRouteComponent } from './new-route.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {AgmCoreModule} from "@agm/core";
import { CustomerLocationsModalComponent } from './customer-locations-modal/customer-locations-modal.component';
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";


@NgModule({
  declarations: [
    NewRouteComponent,
    CustomerLocationsModalComponent
  ],
    imports: [
        CommonModule,
        NewRouteRoutingModule,
        SharedModule,
        TableModule
    ],
  providers: [
    {
      provide: 'LinkerService',
      useExisting: LinkerService
    }
  ]
})
export class NewRouteModule { }
