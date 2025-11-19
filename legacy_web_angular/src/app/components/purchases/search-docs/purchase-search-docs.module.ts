import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseSearchDocsRoutingModule } from './purchase-search-docs-routing.module';
import { PurchaseSearchDocsComponent } from './purchase-search-docs.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../../shared/shared.module";
import {TableModule} from "@clavisco/table";
import {LinkerService} from "@clavisco/linker";
import {RptmngMenuService} from "@clavisco/rptmng-menu";
import {MatTooltip, MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    PurchaseSearchDocsComponent
  ],
    imports: [
        CommonModule,
        PurchaseSearchDocsRoutingModule,
        ReactiveFormsModule,
        SharedModule,
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
export class PurchaseSearchDocsModule { }
